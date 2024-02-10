<script setup lang="ts">
import InputToolbar from "./components/InputToolbar.vue";
import ScriptEditor from "./components/ScriptEditor.vue";
import TabView from "./components/TabView.vue";

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
        <ScriptEditor @build-press="buildScript"/>
      </section>
    </section>
    <section class="flex_column flex_parent flex_child">
        <TabView/>
    </section>
  </section>
  <footer class="status_bar">
    <p id="statusBar">Status</p>
  </footer>
</template>

<style scoped>

</style>
