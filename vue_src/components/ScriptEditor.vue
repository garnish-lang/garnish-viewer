<script setup lang="ts">
import {ref} from "vue";
import {useGarnishStore} from "../stores/garnish";

const emit = defineEmits(["buildPress"]);
const store = useGarnishStore();
const props = defineProps<{
  index: number
}>();

const sourceArea = ref<HTMLTextAreaElement | null>(null);

let config = {
  tabSize: 2,
}

function handleKeyDown(e: KeyboardEvent) {
  let ele: HTMLTextAreaElement = e.target as HTMLTextAreaElement;
  if (e.key === "Tab") {
    e.preventDefault();
    let start = ele.selectionStart;
    let end = ele.selectionEnd;

    // set textarea value to: text before caret + tab + text after caret
    ele.value = ele.value.substring(0, start) +
        " ".repeat(config.tabSize) + ele.value.substring(end);

    // put caret at right position again
    ele.selectionStart =
        ele.selectionEnd = start + config.tabSize;
  }
}

function build() {
  store.buildSource(sourceArea.value!.value);
}
</script>

<template>
  <section>
    <aside>
      <button id="buildBtn" @click="build">Build</button>
      <button id="saveBtn" class="">Save</button>
    </aside>
    <textarea ref="sourceArea" @keydown="handleKeyDown"></textarea>
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