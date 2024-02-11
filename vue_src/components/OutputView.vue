<script setup lang="ts">

import LexerView from "./LexerView.vue";
import ParserView from "./ParserView.vue";
import BuildView from "./BuildView.vue";
import {useGarnishStore} from "../stores/garnish";

const store = useGarnishStore();

</script>

<template>
  <nav>
    <button @click="store.setLexActive()">Lexer Tokens</button>
    <button @click="store.setParseActive()">Parse Result</button>
    <button @click="store.setBuildActive()">Build Info</button>
  </nav>
  <section class="tabs">
    <section class="tab_container" v-if="store.activeOutputTab === 'lex'">
      <LexerView/>
    </section>
    <section class="tab_container" v-if="store.activeOutputTab === 'parse'">
      <ParserView/>
    </section>
    <section class="tab_container" v-if="store.activeOutputTab === 'build'">
      <BuildView/>
    </section>
  </section>
</template>

<style scoped>

.tabs {
  display: flex;
  flex-grow: 1;
  flex-basis: 0;
}

.tab_container {
  display: flex;
  flex-grow: 1;
  flex-basis: 0;
}

</style>