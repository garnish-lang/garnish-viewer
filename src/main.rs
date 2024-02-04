// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod context;

use garnish_annotations_collector::{Collector, Sink, TokenBlock};
use garnish_data::SimpleRuntimeData;
use garnish_lang_compiler::{build_with_data, InstructionMetadata, LexerToken, parse, ParseNode, ParseResult, TokenType};
use garnish_lang_runtime::runtime_impls::SimpleGarnishRuntime;
use garnish_traits::{EmptyContext, ExpressionDataType, GarnishLangRuntimeData, GarnishLangRuntimeState, GarnishRuntime};
use garnish_utils::BuildMetadata;
use log::{debug, error, warn};
use serde::{Deserialize, Serialize};
use crate::context::ViewerContext;

#[derive(Serialize, Deserialize, Debug)]
struct BuildInfo {
    tokens: Vec<LexerToken>,
    parse_nodes: Vec<ParseNode>,
    instruction_metadata: Vec<InstructionMetadata>,
}

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn build(name: &str, input: &str) -> String {
    match build_input(name, input) {
        Ok(s) => s,
        Err(e) => e,
    }
}

fn build_input(name: &str, input: &str) -> Result<String, String> {

    let mut runtime = SimpleGarnishRuntime::new(SimpleRuntimeData::new());
    let mut context = ViewerContext::new();

    let collector: Collector = Collector::new(vec![
        Sink::new("@Method").until_token(TokenType::Subexpression),
        Sink::new("@Def").until_token(TokenType::Subexpression),
    ]);

    let blocks: Vec<TokenBlock> = collector.collect_tokens(&input)?;

    let (root_blocks, annotation_blocks): (Vec<TokenBlock>, Vec<TokenBlock>) = blocks
        .into_iter()
        .partition(|b| b.annotation_text().is_empty());

    let (method_blocks, def_blocks): (Vec<_>, Vec<_>) = annotation_blocks
        .into_iter()
        .partition(|b| b.annotation_text() == &"@Method".to_string());

    let mut method_metadata = handle_method_annotations(
        method_blocks,
        &mut runtime,
        &mut context,
        &name,
    )?;

    context.metadata_mut().append(&mut method_metadata);

    let mut def_metadata =
        handle_def_annotations(def_blocks, &mut runtime, &mut context, &name.to_string())?;

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
        debug!("No root script found in script. Skipping.");
        return Err("Failed".to_string());
    }

    let index = runtime.get_data().get_jump_table_len();
    let instruction_data = build_with_data(
        parsed.get_root(),
        parsed.get_nodes().clone(),
        runtime.get_data_mut(),
    )?;
    let execution_start = match runtime.get_data().get_jump_point(index) {
        Some(i) => i,
        None => Err(format!("No jump point found after building {:?}", name))?,
    };

    let root_metadata = BuildMetadata::new(
        format!("{}", name),
        source,
        execution_start,
        root_tokens,
        parsed,
        instruction_data,
    );

    context.metadata_mut().push(root_metadata);

    context.insert_expression(name, index);

    Ok(String::new())
}

fn handle_def_annotations(
    blocks: Vec<TokenBlock>,
    runtime: &mut SimpleGarnishRuntime<SimpleRuntimeData>,
    context: &mut ViewerContext,
    name: &String,
) -> Result<Vec<BuildMetadata<SimpleRuntimeData>>, String> {
    let mut builds = vec![];

    for def in blocks {
        let source = def
            .tokens()
            .iter()
            .map(|token| token.get_text().clone())
            .collect::<Vec<String>>()
            .join("");

        let (parsed, instruction_data, name, start) =
            match build_and_get_parameters(def.tokens(), runtime, name) {
                Err(s) => {
                    error!("{}", s);
                    continue;
                }
                Ok(v) => v,
            };

        builds.push(BuildMetadata::new(
            format!("{}", name),
            source,
            start,
            def.tokens_owned(),
            parsed,
            instruction_data,
        ));

        debug!("Found method: {}", name);
        context.insert_expression(name, start);
    }

    Ok(builds)
}

fn handle_method_annotations(
    blocks: Vec<TokenBlock>,
    runtime: &mut SimpleGarnishRuntime<SimpleRuntimeData>,
    context: &mut ViewerContext,
    name: &str,
) -> Result<Vec<BuildMetadata<SimpleRuntimeData>>, String> {
    let mut builds = vec![];

    for method in blocks {
        let source = method
            .tokens()
            .iter()
            .map(|token| token.get_text().clone())
            .collect::<Vec<String>>()
            .join("");
        let (parsed, instruction_data, name, jump_index) =
            match build_and_get_parameters(method.tokens(), runtime, name) {
                Err(_) => continue,
                Ok(v) => v,
            };

        // http method expressions use direct jump point instead of jump table reference that is stored in the Expression data type
        let start = match runtime.get_data().get_jump_point(jump_index) {
            None => {
                error!(
                    "Jump table reference not found. Searching for {}",
                    jump_index
                );
                return Err("Expression value not found in jump table".into());
            }
            Some(s) => s,
        };

        builds.push(BuildMetadata::new(
            format!("{}", name),
            source,
            start,
            method.tokens_owned(),
            parsed,
            instruction_data,
        ));

        let route = format!("{}@{}", name, name);
        context.insert_expression(route.clone(), jump_index);
    }

    Ok(builds)
}

fn build_and_get_parameters(
    tokens: &Vec<LexerToken>,
    runtime: &mut SimpleGarnishRuntime<SimpleRuntimeData>,
    name: &str,
) -> Result<(ParseResult, Vec<InstructionMetadata>, String, usize), String> {
    let parsed = parse(tokens)?;
    if parsed.get_nodes().is_empty() {
        warn!("Empty method annotation in {:?}", &name);
        return Err("Empty annotation".into());
    }

    let index = runtime.get_data().get_jump_table_len();
    let instruction_data = build_with_data(
        parsed.get_root(),
        parsed.get_nodes().clone(),
        runtime.get_data_mut(),
    )?;
    let execution_start = match runtime.get_data().get_jump_point(index) {
        Some(i) => i,
        None => Err(format!("No jump point found after building {:?}", &name))?,
    };

    // executing from this start should result in list with annotation parameters
    match runtime
        .get_data_mut()
        .set_instruction_cursor(execution_start)
    {
        Err(e) => {
            error!(
                "Failed to set instructor cursor during annotation build: {:?}",
                e
            );
            return Err("Couldn't set cursor".into());
        }
        Ok(()) => (),
    }

    loop {
        match runtime.execute_current_instruction::<EmptyContext>(None) {
            Err(e) => {
                error!("Failure during annotation execution: {:?}", e);
                continue;
            }
            Ok(data) => match data.get_state() {
                GarnishLangRuntimeState::Running => (),
                GarnishLangRuntimeState::End => break,
            },
        }
    }

    let value_ref = match runtime.get_data().get_current_value() {
        None => {
            error!("No value after annotation execution. Expected value of type List.");
            return Err("No value after execution".into());
        }
        Some(v) => v,
    };

    let (name, start) =
        get_name_expression_annotation_parameters(runtime, value_ref).or(Err(String::new()))?;

    Ok((parsed, instruction_data, name, start))
}

fn get_name_expression_annotation_parameters(
    runtime: &mut SimpleGarnishRuntime<SimpleRuntimeData>,
    value_ref: usize,
) -> Result<(String, usize), ()> {
    match runtime.get_data().get_data_type(value_ref) {
        Err(_) => {
            error!("Failed to retrieve value data type after annotation execution.");
            Err(())
        }
        Ok(t) => match t {
            ExpressionDataType::List => {
                // check for 2 values in list
                let method_name = match runtime.get_data().get_list_item(value_ref, 0.into()) {
                    Err(e) => {
                        error!(
                            "Failed to retrieve list item 0 for annotation list value. {:?}",
                            e
                        );
                        return Err(());
                    }
                    Ok(v) => match runtime.get_data().get_data_type(v) {
                        Err(_) => {
                            error!("Failed to retrieve value data type for annotation list value.");
                            return Err(());
                        }
                        Ok(t) => match t {
                            ExpressionDataType::Symbol => {
                                match runtime.get_data().get_symbol(v) {
                                    Err(_) => {
                                        error!("No data found for annotation list value item 0");
                                        return Err(());
                                    }
                                    Ok(s) => match runtime.get_data().get_symbols().get(&s) {
                                        None => {
                                            error!("Symbol with value {} not found in data symbol table", s);
                                            return Err(());
                                        }
                                        Some(s) => s.clone(),
                                    },
                                }
                            }
                            ExpressionDataType::CharList => {
                                match runtime.get_data().get_data().get(v) {
                                    None => {
                                        error!("No data found for annotation list value item 0");
                                        return Err(());
                                    }
                                    Some(s) => match s.as_char_list() {
                                        Err(e) => {
                                            error!("Value stored in Character List slot {} could not be cast to Character List. {:?}", v, e);
                                            return Err(());
                                        }
                                        Ok(s) => s,
                                    },
                                }
                            }
                            _ => {
                                error!("Expected Character List or Symbol type as first parameter in annotation list value");
                                return Err(());
                            }
                        },
                    },
                };

                let execution_start = match runtime.get_data().get_list_item(value_ref, 1.into()) {
                    Err(e) => {
                        error!(
                            "Failed to retrieve list item 1 for annotation list value. {:?}",
                            e
                        );
                        return Err(());
                    }
                    Ok(v) => match runtime.get_data().get_data_type(v) {
                        Err(_) => {
                            error!("Failed to retrieve value data type for annotation list value.");
                            return Err(());
                        }
                        Ok(t) => match t {
                            ExpressionDataType::Expression => {
                                match runtime.get_data().get_expression(v) {
                                    Err(_) => {
                                        error!("No data found for annotation list value item 0");
                                        return Err(());
                                    }
                                    Ok(s) => s,
                                }
                            }
                            _ => {
                                error!("Expected Expression type as second parameter in annotation list value");
                                return Err(());
                            }
                        },
                    },
                };

                Ok((method_name, execution_start))
            }
            t => {
                warn!(
                    "Expected List data type after annotation execution. Found {:?}",
                    t
                );
                Err(())
            }
        },
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet, build])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
