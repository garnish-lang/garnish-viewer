import type {BuildInfo} from "./garnish_types";

export const mockBuildData = () : BuildInfo => {
    return {
        all_lexer_tokens: [
            {
                column: 0,
                row: 0,
                text: "@Def",
                token_type: "Annotation"
            },
            {
                column: 4,
                row: 0,
                text: " ",
                token_type: "Whitespace"
            },
            {
                column: 5,
                row: 0,
                text: "add_5",
                token_type: "Identifier"
            },
            {
                column: 10,
                row: 0,
                text: " ",
                token_type: "Whitespace"
            },
            {
                column: 11,
                row: 0,
                text: "$",
                token_type: "Value"
            },
            {
                column: 12,
                row: 0,
                text: " ",
                token_type: "Whitespace"
            },
            {
                column: 13,
                row: 0,
                text: "+",
                token_type: "PlusSign"
            },
            {
                column: 14,
                row: 0,
                text: " ",
                token_type: "Whitespace"
            },
            {
                column: 15,
                row: 0,
                text: "5",
                token_type: "Number"
            },
            {
                column: 16,
                row: 0,
                text: "\n\n",
                token_type: "Subexpression"
            },
            {
                column: 0,
                row: 2,
                text: "add_5",
                token_type: "Identifier"
            },
            {
                column: 5,
                row: 2,
                text: " ",
                token_type: "Whitespace"
            },
            {
                column: 6,
                row: 2,
                text: "~",
                token_type: "Apply"
            },
            {
                column: 7,
                row: 2,
                text: " ",
                token_type: "Whitespace"
            },
            {
                column: 8,
                row: 2,
                text: "10",
                token_type: "Number"
            },
            {
                column: 10,
                row: 2,
                text: "\n\n",
                token_type: "Subexpression"
            },
            {
                column: 0,
                row: 4,
                text: "10",
                token_type: "Number"
            },
            {
                column: 2,
                row: 4,
                text: " ",
                token_type: "Whitespace"
            },
            {
                column: 3,
                row: 4,
                text: "$",
                token_type: "Value"
            },
            {
                column: 4,
                row: 4,
                text: " ",
                token_type: "Whitespace"
            },
            {
                column: 5,
                row: 4,
                text: "20",
                token_type: "Number"
            }
        ],
        context: {
            build_metadata: [
                {
                    instruction_metadata: [
                        {
                            parse_node_index: 0
                        },
                        {
                            parse_node_index: 2
                        },
                        {
                            parse_node_index: 1
                        },
                        {
                            parse_node_index: null
                        }
                    ],
                    name: "add_5",
                    parse_result: {
                        nodes: [
                            {
                                definition: "Value",
                                left: null,
                                lex_token: {
                                    column: 11,
                                    row: 0,
                                    text: "$",
                                    token_type: "Value"
                                },
                                parent: 1,
                                right: null,
                                secondary_definition: "Value"
                            },
                            {
                                definition: "Addition",
                                left: 0,
                                lex_token: {
                                    column: 13,
                                    row: 0,
                                    text: "+",
                                    token_type: "PlusSign"
                                },
                                parent: null,
                                right: 2,
                                secondary_definition: "BinaryLeftToRight"
                            },
                            {
                                definition: "Number",
                                left: null,
                                lex_token: {
                                    column: 15,
                                    row: 0,
                                    text: "5",
                                    token_type: "Number"
                                },
                                parent: 1,
                                right: null,
                                secondary_definition: "Value"
                            }
                        ],
                        root: 1
                    },
                    start: 0,
                    text: " add_5 $ + 5\n\n",
                    tokens: [
                        {
                            column: 10,
                            row: 0,
                            text: " ",
                            token_type: "Whitespace"
                        },
                        {
                            column: 11,
                            row: 0,
                            text: "$",
                            token_type: "Value"
                        },
                        {
                            column: 12,
                            row: 0,
                            text: " ",
                            token_type: "Whitespace"
                        },
                        {
                            column: 13,
                            row: 0,
                            text: "+",
                            token_type: "PlusSign"
                        },
                        {
                            column: 14,
                            row: 0,
                            text: " ",
                            token_type: "Whitespace"
                        },
                        {
                            column: 15,
                            row: 0,
                            text: "5",
                            token_type: "Number"
                        },
                        {
                            column: 16,
                            row: 0,
                            text: "\n\n",
                            token_type: "Subexpression"
                        }
                    ]
                },
                {
                    instruction_metadata: [
                        {
                            parse_node_index: 0
                        },
                        {
                            parse_node_index: 2
                        },
                        {
                            parse_node_index: 1
                        },
                        {
                            parse_node_index: 3
                        },
                        {
                            parse_node_index: 4
                        },
                        {
                            parse_node_index: 6
                        },
                        {
                            parse_node_index: 8
                        },
                        {
                            parse_node_index: 7
                        },
                        {
                            parse_node_index: null
                        }
                    ],
                    name: "default",
                    parse_result: {
                        nodes: [
                            {
                                definition: "Identifier",
                                left: null,
                                lex_token: {
                                    column: 0,
                                    row: 2,
                                    text: "add_5",
                                    token_type: "Identifier"
                                },
                                parent: 1,
                                right: null,
                                secondary_definition: "Identifier"
                            },
                            {
                                definition: "Apply",
                                left: 0,
                                lex_token: {
                                    column: 6,
                                    row: 2,
                                    text: "~",
                                    token_type: "Apply"
                                },
                                parent: 3,
                                right: 2,
                                secondary_definition: "BinaryLeftToRight"
                            },
                            {
                                definition: "Number",
                                left: null,
                                lex_token: {
                                    column: 8,
                                    row: 2,
                                    text: "10",
                                    token_type: "Number"
                                },
                                parent: 1,
                                right: null,
                                secondary_definition: "Value"
                            },
                            {
                                definition: "Subexpression",
                                left: 1,
                                lex_token: {
                                    column: 10,
                                    row: 2,
                                    text: "\n\n",
                                    token_type: "Subexpression"
                                },
                                parent: null,
                                right: 7,
                                secondary_definition: "Subexpression"
                            },
                            {
                                definition: "Number",
                                left: null,
                                lex_token: {
                                    column: 0,
                                    row: 4,
                                    text: "10",
                                    token_type: "Number"
                                },
                                parent: 5,
                                right: null,
                                secondary_definition: "Value"
                            },
                            {
                                definition: "List",
                                left: 4,
                                lex_token: {
                                    column: 2,
                                    row: 4,
                                    text: " ",
                                    token_type: "Whitespace"
                                },
                                parent: 7,
                                right: 6,
                                secondary_definition: "StartGrouping"
                            },
                            {
                                definition: "Value",
                                left: null,
                                lex_token: {
                                    column: 3,
                                    row: 4,
                                    text: "$",
                                    token_type: "Value"
                                },
                                parent: 5,
                                right: null,
                                secondary_definition: "Value"
                            },
                            {
                                definition: "List",
                                left: 5,
                                lex_token: {
                                    column: 4,
                                    row: 4,
                                    text: " ",
                                    token_type: "Whitespace"
                                },
                                parent: 3,
                                right: 8,
                                secondary_definition: "StartGrouping"
                            },
                            {
                                definition: "Number",
                                left: null,
                                lex_token: {
                                    column: 5,
                                    row: 4,
                                    text: "20",
                                    token_type: "Number"
                                },
                                parent: 7,
                                right: null,
                                secondary_definition: "Value"
                            }
                        ],
                        root: 3
                    },
                    start: 1,
                    text: "add_5 ~ 10\n\n10 $ 20",
                    tokens: [
                        {
                            column: 0,
                            row: 2,
                            text: "add_5",
                            token_type: "Identifier"
                        },
                        {
                            column: 5,
                            row: 2,
                            text: " ",
                            token_type: "Whitespace"
                        },
                        {
                            column: 6,
                            row: 2,
                            text: "~",
                            token_type: "Apply"
                        },
                        {
                            column: 7,
                            row: 2,
                            text: " ",
                            token_type: "Whitespace"
                        },
                        {
                            column: 8,
                            row: 2,
                            text: "10",
                            token_type: "Number"
                        },
                        {
                            column: 10,
                            row: 2,
                            text: "\n\n",
                            token_type: "Subexpression"
                        },
                        {
                            column: 0,
                            row: 4,
                            text: "10",
                            token_type: "Number"
                        },
                        {
                            column: 2,
                            row: 4,
                            text: " ",
                            token_type: "Whitespace"
                        },
                        {
                            column: 3,
                            row: 4,
                            text: "$",
                            token_type: "Value"
                        },
                        {
                            column: 4,
                            row: 4,
                            text: " ",
                            token_type: "Whitespace"
                        },
                        {
                            column: 5,
                            row: 4,
                            text: "20",
                            token_type: "Number"
                        }
                    ]
                }
            ],
            expression_map: {
                add_5: 0,
                "default": 1
            }
        },
        runtime_data: {
            cache: {
                "1379263090586030638": 4,
                "5274581534537122063": 3,
                "6810289471860379156": 6,
                "7781920703478541721": 5
            },
            current_byte_list: null,
            current_char_list: null,
            current_list: null,
            data: {
                expression_to_symbol: {
                    "0": 17554556502867952000,
                    "1": 5672283188265106000
                },
                external_to_symbol: {},
                list: [
                    "Unit",
                    "False",
                    "True",
                    {
                        Number: {
                            Integer: 5
                        }
                    },
                    {
                        Symbol: 17554556502867952000
                    },
                    {
                        Number: {
                            Integer: 10
                        }
                    },
                    {
                        Number: {
                            Integer: 20
                        }
                    }
                ],
                symbol_to_name: {
                    "17554556502867951497": "add_5"
                }
            },
            end_of_constant_data: 0,
            expression_table: [
                0,
                4
            ],
            instruction_cursor: 0,
            instructions: [
                {
                    data: null,
                    instruction: "PutValue"
                },
                {
                    data: 3,
                    instruction: "Put"
                },
                {
                    data: null,
                    instruction: "Add"
                },
                {
                    data: null,
                    instruction: "EndExpression"
                },
                {
                    data: 4,
                    instruction: "Resolve"
                },
                {
                    data: 5,
                    instruction: "Put"
                },
                {
                    data: null,
                    instruction: "Apply"
                },
                {
                    data: null,
                    instruction: "UpdateValue"
                },
                {
                    data: 5,
                    instruction: "Put"
                },
                {
                    data: null,
                    instruction: "PutValue"
                },
                {
                    data: 6,
                    instruction: "Put"
                },
                {
                    data: 3,
                    instruction: "MakeList"
                },
                {
                    data: null,
                    instruction: "EndExpression"
                }
            ],
            jump_path: [],
            max_char_list_depth: 1000,
            register: [],
            values: []
        }
    }
}