// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod compile;
mod context;

use crate::compile::extract_annotation_parts;
use crate::context::ViewerContext;
use garnish_lang_annotations_collector::{Collector, Sink, TokenBlock};
use garnish_lang_simple_data::{symbol_value, SimpleGarnishData};
use garnish_lang_compiler::{
    build_with_data, lex, parse, InstructionMetadata, LexerToken, ParseResult, TokenType,
};
use garnish_lang_runtime::runtime_impls::SimpleGarnishRuntime;
use garnish_lang_traits::{GarnishData, GarnishRuntime};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::ops::Deref;
use std::sync::Mutex;
use garnish_lang_utilities::{complex_expression_data_format, format_char_list, simple_expression_data_format};

#[derive(Serialize, Deserialize, Debug, Clone)]
struct BuildInfo {
    all_lexer_tokens: Vec<LexerToken>,
    source_tokens: HashMap<String, Vec<LexerToken>>,
    context: ViewerContext,
    runtime_data: SimpleGarnishData,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct ExpressionBuildInfo {
    source: String,
    name: String,
    start: usize,
    text: String,
    tokens: Vec<LexerToken>,
    parse_result: ParseResult,
    instruction_metadata: Vec<InstructionMetadata>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct SourceInfo {
    name: String,
    text: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct ExecutionInfo {
    context: ViewerContext,
    runtime: SimpleGarnishRuntime<SimpleGarnishData>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct FormattedData {
    simple: String,
    detailed: String,
}

struct AppState {
    base_build: Mutex<Option<BuildInfo>>,
    current_execution: Mutex<Option<ExecutionInfo>>,
}

#[tauri::command]
fn build(name: Option<&str>, input: Option<&str>) -> Result<BuildInfo, String> {
    match (name, input) {
        (Some(name), Some(input)) => build_input(name, input),
        _ => Err("Name and input required".to_string()),
    }
}

fn build_input(name: &str, input: &str) -> Result<BuildInfo, String> {
    let mut runtime = SimpleGarnishRuntime::new(SimpleGarnishData::new());
    let mut context = ViewerContext::new();

    let source_tokens = build_input_with_context(name, input, &mut runtime, &mut context)?;

    let mut sources = HashMap::new();
    sources.insert(name.to_string(), source_tokens.clone());

    Ok(BuildInfo {
        all_lexer_tokens: source_tokens,
        source_tokens: sources,
        runtime_data: runtime.get_data().clone(),
        context,
    })
}

fn build_input_with_context(
    name: &str,
    input: &str,
    runtime: &mut SimpleGarnishRuntime<SimpleGarnishData>,
    context: &mut ViewerContext,
) -> Result<Vec<LexerToken>, String> {
    let collector: Collector =
        Collector::new(vec![Sink::new("@Def").until_token(TokenType::Subexpression)]);

    let tokens = lex(&input)?;
    let blocks: Vec<TokenBlock> = collector.collect_tokens(&tokens)?;

    let (root_blocks, annotation_blocks): (Vec<TokenBlock>, Vec<TokenBlock>) = blocks
        .into_iter()
        .partition(|b| b.annotation_text().is_empty());

    let mut def_metadata =
        handle_def_annotations(annotation_blocks, runtime, context, &name.to_string())?;

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
        source: name.to_string(),
        name: name.to_string(),
        start: index,
        text: source,
        tokens: root_tokens.clone(),
        parse_result: parsed,
        instruction_metadata: instruction_data,
    };

    context.metadata_mut().push(root_metadata);

    runtime
        .get_data_mut()
        .get_data_mut()
        .insert_expression(index, symbol_value(&name));
    context.insert_expression(name, index);

    Ok(tokens)
}

fn handle_def_annotations(
    blocks: Vec<TokenBlock>,
    runtime: &mut SimpleGarnishRuntime<SimpleGarnishData>,
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
                    println!("{}", s);
                    continue;
                }
                Ok(v) => v,
            };

        builds.push(ExpressionBuildInfo {
            source: name.clone(),
            name: annotation_parts.name_token.get_text().clone(),
            start: expression_index,
            text: source,
            tokens: Vec::from(annotation_parts.expression),
            parse_result: parsed,
            instruction_metadata: instruction_data,
        });

        println!("Found method: {}", name);
        runtime.get_data_mut().get_data_mut().insert_expression(
            expression_index,
            symbol_value(&annotation_parts.name_token.get_text()),
        );
        context.insert_expression(annotation_parts.name_token.get_text(), expression_index);
    }

    Ok(builds)
}

fn build_and_get_parameters(
    tokens: &[LexerToken],
    runtime: &mut SimpleGarnishRuntime<SimpleGarnishData>,
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

#[tauri::command]
fn initialize_execution(
    sources: Vec<SourceInfo>,
    state: tauri::State<AppState>,
) -> Result<BuildInfo, String> {
    let mut source_tokens = HashMap::new();
    let mut runtime = SimpleGarnishRuntime::new(SimpleGarnishData::new());
    let mut context = ViewerContext::new();

    for source in sources {
        source_tokens.insert(
            source.name.clone(),
            build_input_with_context(&source.name, &source.text, &mut runtime, &mut context)?,
        );
    }

    let exec_info = ExecutionInfo {
        context: context.clone(),
        runtime: runtime.clone(),
    };

    let info = BuildInfo {
        source_tokens,
        all_lexer_tokens: vec![],
        runtime_data: runtime.get_data().clone(),
        context: context.clone(),
    };

    *state.base_build.lock().unwrap() = Some(info.clone());
    *state.current_execution.lock().unwrap() = Some(exec_info);

    Ok(info)
}

#[tauri::command]
fn get_execution_build(state: tauri::State<AppState>) -> Option<BuildInfo> {
    state.base_build.lock().unwrap().clone()
}

#[tauri::command]
fn start_execution(
    expression_name: String,
    input_expression: String,
    state: tauri::State<AppState>,
) -> Result<ExecutionInfo, String> {
    match state
        .current_execution
        .lock()
        .or(Err("Could not lock base build.".to_string()))?
        .as_mut()
    {
        Some(build) => {
            let start_instruction = build
                .context
                .get_expression_index(&expression_name)
                .and_then(|index| build.runtime.get_data().get_jump_point(index))
                .ok_or(format!("Expression \"{}\" not found.", expression_name))?;

            build.runtime
                .get_data_mut()
                .set_instruction_cursor(start_instruction)?;

            build.runtime
                .get_data_mut()
                .push_value_stack(0)?;

            Ok(build.clone())
        }
        None => Err("Create base build by calling initialize_execution first.".to_string()),
    }
}

#[tauri::command]
fn continue_execution(state: tauri::State<AppState>) -> Result<ExecutionInfo, String> {
    state
        .current_execution
        .lock()
        .or(Err("Could not lock base build.".to_string()))?
        .as_mut()
        .map(|exec| {
            let mut context = exec.context.clone();

            match exec.runtime.execute_current_instruction(Some(&mut context)) {
                Err(e) => Err(e.to_string()),
                Ok(_info) => Ok(ExecutionInfo {
                    context,
                    runtime: exec.runtime.clone(),
                }),
            }
        })
        .unwrap_or(Err(
            "No current execution. Call start_execution first.".to_string()
        ))
}

#[tauri::command]
fn format_value(addr: usize, state: tauri::State<AppState>) -> Result<FormattedData, String> {
    Ok(state
        .current_execution
        .lock()
        .or(Err("Could not lock base build.".to_string()))?
        .as_ref()
        .map(|exec| {
            let simple = simple_expression_data_format(addr, exec.runtime.get_data(), &exec.context, 0);
            let detailed = complex_expression_data_format(addr, exec.runtime.get_data(), &exec.context);

            FormattedData { simple, detailed }
        })
        .unwrap_or(FormattedData {
            simple: "[Could not format]".to_string(),
            detailed: "[Could not format]".to_string(),
        }))
}

fn main() {
    tauri::Builder::default()
        .manage(AppState {
            base_build: Mutex::new(None),
            current_execution: Mutex::new(None),
        })
        .invoke_handler(tauri::generate_handler![
            build,
            initialize_execution,
            get_execution_build,
            start_execution,
            continue_execution,
            format_value,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
