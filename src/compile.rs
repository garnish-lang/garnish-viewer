use garnish_lang_compiler::{LexerToken, TokenType};

pub struct AnnotationParts<'a> {
    name_token: &'a LexerToken,
    expression: &'a [LexerToken],
}

fn extract_annotation_parts(tokens: &Vec<LexerToken>) -> Result<AnnotationParts, String> {
    let (index, name_token) = tokens
        .iter()
        .enumerate()
        .find(|(_i, t)| t.get_token_type() != TokenType::Whitespace)
        .ok_or("No name found for annotation")?;

    let expression = &tokens[(index + 1)..];

    Ok(AnnotationParts {
        name_token,
        expression,
    })
}

#[cfg(test)]
mod tests {
    use crate::compile::extract_annotation_parts;
    use garnish_lang_compiler::{LexerToken, TokenType};

    #[test]
    fn extract_parts_successful() {
        let tokens = vec![
            LexerToken::new("expr".to_string(), TokenType::Identifier, 0, 0),
            LexerToken::new("5".to_string(), TokenType::Number, 0, 0),
            LexerToken::new("+".to_string(), TokenType::PlusSign, 0, 0),
            LexerToken::new("5".to_string(), TokenType::Number, 0, 0),
        ];

        let parts = extract_annotation_parts(&tokens).unwrap();

        assert_eq!(parts.name_token.get_text(), "expr");
        assert_eq!(parts.name_token.get_token_type(), TokenType::Identifier);
        assert_eq!(parts.expression.len(), 3);
        assert_eq!(parts.expression.get(0).unwrap().get_text(), "5");
        assert_eq!(
            parts.expression.get(0).unwrap().get_token_type(),
            TokenType::Number
        );
        assert_eq!(parts.expression.get(1).unwrap().get_text(), "+");
        assert_eq!(
            parts.expression.get(1).unwrap().get_token_type(),
            TokenType::PlusSign
        );
        assert_eq!(parts.expression.get(2).unwrap().get_text(), "5");
        assert_eq!(
            parts.expression.get(2).unwrap().get_token_type(),
            TokenType::Number
        );
    }

    #[test]
    fn extract_parts_successful_with_spaces() {
        let tokens = vec![
            LexerToken::new(" ".to_string(), TokenType::Whitespace, 0, 0),
            LexerToken::new("expr".to_string(), TokenType::Identifier, 0, 0),
            LexerToken::new(" ".to_string(), TokenType::Whitespace, 0, 0),
            LexerToken::new("5".to_string(), TokenType::Number, 0, 0),
            LexerToken::new(" ".to_string(), TokenType::Whitespace, 0, 0),
            LexerToken::new("+".to_string(), TokenType::PlusSign, 0, 0),
            LexerToken::new(" ".to_string(), TokenType::Whitespace, 0, 0),
            LexerToken::new("5".to_string(), TokenType::Number, 0, 0),
            LexerToken::new(" ".to_string(), TokenType::Whitespace, 0, 0),
        ];

        let parts = extract_annotation_parts(&tokens).unwrap();

        assert_eq!(parts.name_token.get_text(), "expr");
        assert_eq!(parts.name_token.get_token_type(), TokenType::Identifier);
        assert_eq!(parts.expression.len(), 7);
        assert_eq!(parts.expression.get(0).unwrap().get_text(), " ");
        assert_eq!(
            parts.expression.get(0).unwrap().get_token_type(),
            TokenType::Whitespace
        );
        assert_eq!(parts.expression.get(1).unwrap().get_text(), "5");
        assert_eq!(
            parts.expression.get(1).unwrap().get_token_type(),
            TokenType::Number
        );
        assert_eq!(parts.expression.get(2).unwrap().get_text(), " ");
        assert_eq!(
            parts.expression.get(2).unwrap().get_token_type(),
            TokenType::Whitespace
        );
        assert_eq!(parts.expression.get(3).unwrap().get_text(), "+");
        assert_eq!(
            parts.expression.get(3).unwrap().get_token_type(),
            TokenType::PlusSign
        );
        assert_eq!(parts.expression.get(4).unwrap().get_text(), " ");
        assert_eq!(
            parts.expression.get(4).unwrap().get_token_type(),
            TokenType::Whitespace
        );
        assert_eq!(parts.expression.get(5).unwrap().get_text(), "5");
        assert_eq!(
            parts.expression.get(5).unwrap().get_token_type(),
            TokenType::Number
        );
        assert_eq!(parts.expression.get(6).unwrap().get_text(), " ");
        assert_eq!(
            parts.expression.get(6).unwrap().get_token_type(),
            TokenType::Whitespace
        );
    }
}
