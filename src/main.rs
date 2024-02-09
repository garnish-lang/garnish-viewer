// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod context;
mod compile;

use garnish_annotations_collector::{Collector, Sink, TokenBlock};
use garnish_data::{SimpleRuntimeData, symbol_value};
use garnish_lang_compiler::{build_with_data, InstructionMetadata, lex, LexerToken, parse, ParseResult, TokenType};
use garnish_lang_runtime::runtime_impls::SimpleGarnishRuntime;
use garnish_traits::{GarnishLangRuntimeData, GarnishRuntime};
use log::{debug, error};
use serde::{Deserialize, Serialize};
use crate::compile::extract_annotation_parts;
use crate::context::ViewerContext;

#[derive(Serialize, Deserialize, Debug)]
struct BuildInfo {
    all_lexer_tokens: Vec<LexerToken>,
    context: ViewerContext,
    runtime_data: SimpleRuntimeData,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct ExpressionBuildInfo {
    start: usize,
    text: String,
    tokens: Vec<LexerToken>,
    parse_result: ParseResult,
    instruction_metadata: Vec<InstructionMetadata>,
}

#[tauri::command]
fn build(name: Option<&str>, input: Option<&str>) -> Result<BuildInfo, String> {
    match (name, input) {
        (Some(name), Some(input)) => build_input(name, input),
        _ => Err("Name and input required".to_string())
    }
}

fn build_input(name: &str, input: &str) -> Result<BuildInfo, String> {

    let mut runtime = SimpleGarnishRuntime::new(SimpleRuntimeData::new());
    let mut context = ViewerContext::new();

    let collector: Collector = Collector::new(vec![
        Sink::new("@Def").until_token(TokenType::Subexpression),
    ]);

    let tokens = lex(&input)?;
    let blocks: Vec<TokenBlock> = collector.collect_tokens(&tokens)?;

    let (root_blocks, annotation_blocks): (Vec<TokenBlock>, Vec<TokenBlock>) = blocks
        .into_iter()
        .partition(|b| b.annotation_text().is_empty());

    let mut def_metadata =
        handle_def_annotations(annotation_blocks, &mut runtime, &mut context, &name.to_string())?;

    context.metadata_mut().append(&mut def_metadata);

    let root_tokens = root_blocks
        .into_iter()
        .flat_map(|b| b.tokens_owned())
        .collect::<Vec<LexerToken>>();

    let source = root_tokens
        .iter()
        .map(|token| token.get_text().clone())
        .collect::<Vec<String>>()
        .join("");

    let parsed = parse(&root_tokens)?;
    if parsed.get_nodes().is_empty() {
        return Err("No node exist after parse".to_string());
    }

    let index = runtime.get_data().get_jump_table_len();
    let instruction_data = build_with_data(
        parsed.get_root(),
        parsed.get_nodes().clone(),
        runtime.get_data_mut(),
    )?;

    let root_metadata = ExpressionBuildInfo {
        start: index,
        text: source,
        tokens: root_tokens.clone(),
        parse_result: parsed,
        instruction_metadata: instruction_data,
    };

    context.metadata_mut().push(root_metadata);

    runtime.get_data_mut().get_data_mut().insert_expression(index, symbol_value(&name));
    context.insert_expression(name, index);

    Ok(BuildInfo {
        all_lexer_tokens: tokens,
        runtime_data: runtime.get_data().clone(),
        context,
    })
}

fn handle_def_annotations(
    blocks: Vec<TokenBlock>,
    runtime: &mut SimpleGarnishRuntime<SimpleRuntimeData>,
    context: &mut ViewerContext,
    name: &String,
) -> Result<Vec<ExpressionBuildInfo>, String> {
    let mut builds = vec![];

    for def in blocks {
        let source = def
            .tokens()
            .iter()
            .map(|token| token.get_text().clone())
            .collect::<Vec<String>>()
            .join("");

        let annotation_parts = match extract_annotation_parts(def.tokens()) {
            Ok(p) => p,
            Err(e) => {
                println!("Annotation Error: {:?}", e);
                continue;
            }
        };

        let (parsed, instruction_data, expression_index) =
            match build_and_get_parameters(annotation_parts.expression, runtime) {
                Err(s) => {
                    error!("{}", s);
                    continue;
                }
                Ok(v) => v,
            };

        builds.push(ExpressionBuildInfo {
            start: expression_index,
            text: source,
            tokens: def.tokens().clone(),
            parse_result: parsed,
            instruction_metadata: instruction_data

        });

        debug!("Found method: {}", name);
        runtime.get_data_mut().get_data_mut().insert_expression(expression_index, symbol_value(&annotation_parts.name_token.get_text()));
        context.insert_expression(annotation_parts.name_token.get_text(), expression_index);
    }

    Ok(builds)
}

fn build_and_get_parameters(
    tokens: &[LexerToken],
    runtime: &mut SimpleGarnishRuntime<SimpleRuntimeData>,
) -> Result<(ParseResult, Vec<InstructionMetadata>, usize), String> {
    let parsed = parse(&Vec::from(tokens))?;
    if parsed.get_nodes().is_empty() {
        return Err("Empty annotation".into());
    }

    let index = runtime.get_data().get_jump_table_len();
    let instruction_data = build_with_data(
        parsed.get_root(),
        parsed.get_nodes().clone(),
        runtime.get_data_mut(),
    )?;

    Ok((parsed, instruction_data, index))
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![build])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
