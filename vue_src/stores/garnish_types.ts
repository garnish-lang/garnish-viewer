export type BuildInfo = {
    all_lexer_tokens: LexerToken[],
    context: ViewerContext,
    runtime_data: RuntimeData,
}

export type ViewerContext = {
    expression_map: { [key: string]: number },
    build_metadata: ExpressionBuildInfo[],
}

export type ExpressionBuildInfo = {
    name: string,
    start: number,
    text: string,
    tokens: LexerToken[],
    parse_result: ParseResult,
    instruction_metadata: InstructionMetadata[],
}

export type RuntimeData = {
    register: number[],
    data: GarnishData,
    end_of_constant_data: number,
    values: number[],
    instructions: InstructionData[],
    instruction_cursor: number,
    expression_table: number[],
    jump_path: number[],
    current_list: [number[], number[]] | null,
    current_char_list: string | null,
    current_byte_list: [] | null,
    cache: { [key: string]: number },
    max_char_list_depth: number,
}

export type GarnishData = {
    // keys are numbers in Rust
    // converted to string for JS
    expression_to_symbol: { [key: string]: number };
    symbol_to_name: { [key: string]: string };
    external_to_symbol: { [key: string]: number };
    list: (any | { Number: { Integer: number } })[]
}

export type LexerToken = {
    text: string,
    token_type: string,
    row: number,
    column: number
}

export type ParseNode = {
    definition: string,
    secondary_definition: string,
    parent: number | null,
    left: number | null,
    right: number | null,
    lex_token: LexerToken,
}

export type ParseResult = {
    root: number,
    nodes: ParseNode[],
}

export type InstructionData = {
    instruction: string,
    data: number | null,
}

export type InstructionMetadata = {
    parse_node_index: number | null,
}