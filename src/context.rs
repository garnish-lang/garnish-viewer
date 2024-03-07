use garnish_lang::simple::{DataError, SimpleGarnishData};
use garnish_lang::{GarnishContext, GarnishData, RuntimeError};
use garnish_lang_utilities::{DataInfoProvider};
use std::collections::HashMap;
use serde::{Deserialize, Serialize};
use crate::ExpressionBuildInfo;

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct ViewerContext {
    expression_map: HashMap<String, usize>,
    build_metadata: Vec<ExpressionBuildInfo>,
}

impl ViewerContext {
    pub fn new() -> Self {
        Self {
            expression_map: HashMap::new(),
            build_metadata: vec![],
        }
    }

    pub fn insert_expression<T: Into<String>>(&mut self, name: T, table_index: usize) {
        self.expression_map.insert(name.into(), table_index);
    }

    // pub fn metadata(&self) -> &Vec<ExpressionBuildInfo> {
    //     &self.build_metadata
    // }

    pub fn metadata_mut(&mut self) -> &mut Vec<ExpressionBuildInfo> {
        &mut self.build_metadata
    }

    pub fn get_expression_index(&self, name: &str) -> Option<usize> {
        self.expression_map.get(name).cloned()
    }
}

impl GarnishContext<SimpleGarnishData> for ViewerContext {
    fn resolve(
        &mut self,
        symbol: u64,
        data: &mut SimpleGarnishData,
    ) -> Result<bool, RuntimeError<DataError>> {
        match data.get_symbols().get(&symbol) {
            None => Ok(false),
            Some(s) => match self.expression_map.get(s) {
                None => Ok(false),
                Some(i) => {
                    data.add_expression(*i)
                        .and_then(|i| data.push_register(i))?;
                    Ok(true)
                }
            },
        }
    }
}

impl DataInfoProvider<SimpleGarnishData> for ViewerContext {
    fn get_symbol_name(&self, sym: u64, data: &SimpleGarnishData) -> Option<String> {
        data.get_data().get_symbol(sym).cloned()
    }

    fn get_address_name(&self, addr: usize, data: &SimpleGarnishData) -> Option<String> {
        self.expression_map
            .iter()
            .map(|(k, v)| (k, data.get_jump_point(*v)))
            .filter(|p| p.1.is_some())
            .map(|p| (p.0, p.1.unwrap()))
            .find(|p| p.1 == addr)
            .and_then(|p| Some(p.0))
            .cloned()
    }
    fn format_symbol_data(
        &self,
        sym: u64,
        data: &SimpleGarnishData,
    ) -> Option<String> {
        data.get_data().get_symbol(sym).and_then(|sym_name| {
            self.expression_map
                .get(sym_name)
                .and_then(|p| match data.get_jump_point(*p) {
                    None => Some(format!("Symbol resolves to expression: {} @ [no jump table index {}]", sym_name, p)),
                    Some(point) => Some(format!("Symbol resolves to expression: {} @ {}", sym_name, point)),
                })
        })
    }
}
