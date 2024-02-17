use garnish_lang_compiler::{LexerToken, TokenType};

#[derive(Debug, Eq, PartialEq)]
pub struct AnnotationParts<'a> {
    pub name_token: &'a LexerToken,
    pub expression: &'a [LexerToken],
}

pub fn extract_annotation_parts(tokens: &Vec<LexerToken>) -> Result<AnnotationParts, String> {
    let (index, name_token) = tokens
        .iter()
        .enumerate()
        .find(|(_i, t)| t.get_token_type() != TokenType::Whitespace)
        .ok_or("No name found for annotation")?;

    if name_token.get_token_type() != TokenType::Identifier {
        return Err("Invalid name for annotation".to_string());
    }

    let expression = &tokens[(index + 1)..];

    if expression.is_empty() {
        return Err("No tokens in expression".to_string());
    }

    let mut first = expression
        .iter()
        .enumerate()
        .find(|(_i, v)| {
            ![TokenType::Whitespace, TokenType::StartExpression].contains(&v.get_token_type())
        })
        .map(|(i, _v)| i)
        .unwrap_or(0);

    let mut last = expression
        .iter()
        .enumerate()
        .rfind(|(_i, v)| {
            ![TokenType::Whitespace, TokenType::EndExpression].contains(&v.get_token_type())
        })
        .map(|(i, _v)| i + 1)
        .unwrap_or(expression.len());

    Ok(AnnotationParts {
        name_token,
        expression: &expression[first..last],
    })
}

#[cfg(test)]
mod annotations {
    use crate::compile::extract_annotation_parts;
    use garnish_lang_compiler::{LexerToken, TokenType};

    #[test]
    fn empty_gives_error() {
        let tokens = vec![];

        assert_eq!(
            extract_annotation_parts(&tokens),
            Err("No name found for annotation".to_string())
        );
    }

    #[test]
    fn no_expression_gives_error() {
        let tokens = vec![LexerToken::new(
            "expr".to_string(),
            TokenType::Identifier,
            0,
            0,
        )];

        assert_eq!(
            extract_annotation_parts(&tokens),
            Err("No tokens in expression".to_string())
        );
    }

    #[test]
    fn extract_parts_number_name() {
        let tokens = vec![
            LexerToken::new("5".to_string(), TokenType::Number, 0, 0),
            LexerToken::new("5".to_string(), TokenType::Number, 0, 0),
            LexerToken::new("+".to_string(), TokenType::PlusSign, 0, 0),
            LexerToken::new("5".to_string(), TokenType::Number, 0, 0),
        ];

        assert_eq!(
            extract_annotation_parts(&tokens),
            Err("Invalid name for annotation".to_string())
        );
    }

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
    fn extract_parts_strips_whitespace_and_braces() {
        let tokens = vec![
            LexerToken::new(" ".to_string(), TokenType::Whitespace, 0, 0),
            LexerToken::new("expr".to_string(), TokenType::Identifier, 0, 0),
            LexerToken::new(" ".to_string(), TokenType::Whitespace, 0, 0),
            LexerToken::new("{".to_string(), TokenType::StartExpression, 0, 0),
            LexerToken::new(" ".to_string(), TokenType::Whitespace, 0, 0),
            LexerToken::new("5".to_string(), TokenType::Number, 0, 0),
            LexerToken::new(" ".to_string(), TokenType::Whitespace, 0, 0),
            LexerToken::new("+".to_string(), TokenType::PlusSign, 0, 0),
            LexerToken::new(" ".to_string(), TokenType::Whitespace, 0, 0),
            LexerToken::new("5".to_string(), TokenType::Number, 0, 0),
            LexerToken::new(" ".to_string(), TokenType::Whitespace, 0, 0),
            LexerToken::new("}".to_string(), TokenType::EndExpression, 0, 0),
        ];

        let parts = extract_annotation_parts(&tokens).unwrap();

        assert_eq!(parts.name_token.get_text(), "expr");
        assert_eq!(parts.name_token.get_token_type(), TokenType::Identifier);
        assert_eq!(parts.expression.len(), 5);

        assert_eq!(parts.expression.get(0).unwrap().get_text(), "5");
        assert_eq!(
            parts.expression.get(0).unwrap().get_token_type(),
            TokenType::Number
        );
        assert_eq!(parts.expression.get(1).unwrap().get_text(), " ");
        assert_eq!(
            parts.expression.get(1).unwrap().get_token_type(),
            TokenType::Whitespace
        );
        assert_eq!(parts.expression.get(2).unwrap().get_text(), "+");
        assert_eq!(
            parts.expression.get(2).unwrap().get_token_type(),
            TokenType::PlusSign
        );
        assert_eq!(parts.expression.get(3).unwrap().get_text(), " ");
        assert_eq!(
            parts.expression.get(3).unwrap().get_token_type(),
            TokenType::Whitespace
        );
        assert_eq!(parts.expression.get(4).unwrap().get_text(), "5");
        assert_eq!(
            parts.expression.get(4).unwrap().get_token_type(),
            TokenType::Number
        );
    }
}
