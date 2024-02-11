<script setup lang="ts">

import {useGarnishStore} from "../stores/garnish";
import {computed} from "vue";
import type {LexerToken} from "../stores/garnish_types";

const store = useGarnishStore();
const activeTokens = computed(() => store.builds[store.activeSource] ? store.builds[store.activeSource].all_lexer_tokens : []);

function makeText(token: LexerToken):string {
  if (token.token_type === "Whitespace" || token.token_type === "Subexpression") {
    let s = [];
    for (let c of token.text) {
      if (c === " ") {
        s.push("⎵");
      } else if (c === "\n") {
        s.push("↵");
      }
    }
    return s.join("");
  } else {
    return token.text;
  }
}

</script>

<template>
  <section id="lexerTokenList" class="container flex_parent flex_child flex_wrap">
    <span v-for="token in activeTokens" class="lexer_token" :title="token.token_type">{{ makeText(token) }}</span>
  </section>
</template>

<style scoped>

</style>