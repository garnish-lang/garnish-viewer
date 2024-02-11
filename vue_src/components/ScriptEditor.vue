<script setup lang="ts">
import {ref} from "vue";
import {useGarnishStore} from "../stores/garnish";

const store = useGarnishStore();
const props = defineProps<{
  sourceIndex: number
}>();

const source = ref("");

function handleKeyDown(e: KeyboardEvent) {
  let ele: HTMLTextAreaElement = e.target as HTMLTextAreaElement;
  if (e.key === "Tab") {
    e.preventDefault();
    let start = ele.selectionStart;
    let end = ele.selectionEnd;

    // set textarea value to: text before caret + tab + text after caret
    source.value = source.value.substring(0, start) +
        " ".repeat(store.config.tabSize) + source.value.substring(end);

    // put caret at right position again
    ele.selectionStart =
        ele.selectionEnd = start + store.config.tabSize;

    handleInput(e);
  }
}

function handleInput(e: Event) {
  store.updateSource(props.sourceIndex, source.value);
}

function build() {
  store.buildSource(props.sourceIndex);
}
</script>

<template>
  <section>
    <aside>
      <button id="buildBtn" @click="build">Build</button>
      <button id="saveBtn" class="">Save</button>
    </aside>
    <textarea v-model="source" @keydown="handleKeyDown" @input="handleInput"></textarea>
  </section>
</template>

<style scoped>
section {
  display: flex;
  flex-direction: row;
  flex-grow: 1;
}

aside {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

button {
  flex-grow: 1;
}

textarea {
  flex-grow: 1;
  resize: none;
  font-family: Monospaced, monospace;
}
</style>