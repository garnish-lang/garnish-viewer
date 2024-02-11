<script setup lang="ts">
import InputToolbar from "./components/InputToolbar.vue";
import ScriptEditor from "./components/ScriptEditor.vue";
import OutputView from "./components/OutputView.vue";

function buildScript(source: String) {
  console.log(source);
}
</script>

<template>
  <section class="root">
    <section>
      <section>
        <InputToolbar/>
      </section>
      <section class="sources">
        <ScriptEditor :source-index="0" @build-press="buildScript"/>
      </section>
    </section>
    <section>
        <OutputView/>
    </section>
  </section>
  <footer>
    <p>Status</p>
  </footer>
</template>

<style scoped>
.root {
  display: flex;
  flex-grow: 1;
}

.root > section {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  flex-basis: 0;
}

.sources {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

footer {
  padding: .5rem 1rem;
}
</style>
