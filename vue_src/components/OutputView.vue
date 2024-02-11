<script setup lang="ts">

import LexerView from "./LexerView.vue";
import ParserView from "./ParserView.vue";
import BuildView from "./BuildView.vue";
import {useGarnishStore} from "../stores/garnish";

const store = useGarnishStore();

</script>

<template>
  <nav>
    <button id="lexBtn" @click="store.setLexActive()">Lexer Tokens</button>
    <button id="parseBtn" @click="store.setParseActive()">Parse Result</button>
    <button id="buildOutputBtn" @click="store.setBuildActive()">Build Info</button>
  </nav>
  <section class="flex_parent flex_child">
    <section id="lexerTokensContainer" class="flex_parent flex_child" v-if="store.activeOutputTab === 'lex'">
      <LexerView/>
    </section>
    <section id="parserResultContainer" class="flex_child flex_column scrollable"  v-if="store.activeOutputTab === 'parse'">
      <ParserView/>
    </section>
    <section id="buildOutputContainer"  v-if="store.activeOutputTab === 'build'">
      <BuildView/>
    </section>
  </section>
</template>

<style scoped>

</style>