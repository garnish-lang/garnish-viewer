
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

export type ViewerContext = {
    expression_map: {[key: string]: number},
    build_metadata: ExpressionBuildInfo[],
}

export type GarnishData = {
    expression_to_symbol: { [key: string]: number };
    symbol_to_name: {[key: string]: number};
    external_to_symbol: {[key: string]: number};
    list: (any | { Number: { Integer: number } })[]
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
    cache: {[key: string]: number},
    max_char_list_depth: number,
}

export type ExpressionBuildInfo = {
    name: string,
    start: number,
    text: string,
    tokens: LexerToken[],
    parse_result: ParseResult,
    instruction_metadata: InstructionMetadata[],
}

export type BuildInfo = {
    all_lexer_tokens: LexerToken[],
    context: ViewerContext,
    runtime_data: RuntimeData,
}

type info = {
    context: {
        build_metadata: [{
            name: string;
            start: number;
            tokens: [{ column: number; row: number; text: string; token_type: string }, {
                column: number;
                row: number;
                text: string;
                token_type: string
            }, { column: number; row: number; text: string; token_type: string }, {
                column: number;
                row: number;
                text: string;
                token_type: string
            }, { column: number; row: number; text: string; token_type: string }];
            text: string;
            instruction_metadata: [{ parse_node_index: number }, { parse_node_index: number }, {
                parse_node_index: number
            }, { parse_node_index: null }];
            parse_result: {
                nodes: [{
                    parent: number;
                    left: null;
                    definition: string;
                    right: null;
                    lex_token: { column: number; row: number; text: string; token_type: string };
                    secondary_definition: string
                }, {
                    parent: null;
                    left: number;
                    definition: string;
                    right: number;
                    lex_token: { column: number; row: number; text: string; token_type: string };
                    secondary_definition: string
                }, {
                    parent: number;
                    left: null;
                    definition: string;
                    right: null;
                    lex_token: { column: number; row: number; text: string; token_type: string };
                    secondary_definition: string
                }];
                root: number
            }
        }]; expression_map: { default: number }
    };
    all_lexer_tokens: [{ column: number; row: number; text: string; token_type: string }, {
        column: number;
        row: number;
        text: string;
        token_type: string
    }, { column: number; row: number; text: string; token_type: string }, {
        column: number;
        row: number;
        text: string;
        token_type: string
    }, { column: number; row: number; text: string; token_type: string }]
}