<script setup lang="ts">
import InputToolbar from "./components/InputToolbar.vue";
import ScriptEditor from "./components/ScriptEditor.vue";
import OutputView from "./components/OutputView.vue";

function buildScript(source: String) {
  console.log(source);
}
</script>

<template>
  <section class="main">
    <section class="flex_parent flex_column flex_child">
      <section class="">
        <InputToolbar/>
      </section>
      <section class="sources">
        <ScriptEditor :index="0" @build-press="buildScript"/>
      </section>
    </section>
    <section class="flex_column flex_parent flex_child">
        <OutputView/>
    </section>
  </section>
  <footer class="status_bar">
    <p id="statusBar">Status</p>
  </footer>
</template>

<style scoped>

</style>
