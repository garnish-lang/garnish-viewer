<script setup lang="ts">

import LexerView from "./LexerView.vue";
import ParserView from "./ParserView.vue";
import BuildView from "./BuildView.vue";
</script>

<template>
  <nav>
    <button id="lexBtn">Lexer Tokens</button>
    <button id="parseBtn">Parse Result</button>
    <button id="buildOutputBtn">Build Info</button>
  </nav>
  <section class="flex_parent flex_child">
    <section id="lexerTokensContainer" class="flex_parent flex_child">
      <LexerView/>
    </section>
    <section id="parserResultContainer" class="flex_child flex_column scrollable">
      <ParserView/>
    </section>
    <section id="buildOutputContainer">
      <BuildView/>
    </section>
  </section>
</template>

<style scoped>

</style>