<script setup lang="ts">

import {useGarnishStore} from "../stores/garnish";
import {computed} from "vue";

const store = useGarnishStore();

const instructions = computed(() => store.builds[store.activeSource] ? store.builds[store.activeSource].runtime_data.instructions : []);

function getExpressionName(addr: number) {
  if (!store.builds[store.activeSource]) {
    return "";
  }

  let data = store.builds[store.activeSource].runtime_data;

  let index = data.expression_table.indexOf(addr);

  if (index === -1) {
    return "";
  }

  let build = store.builds[store.activeSource].context.build_metadata.find((item) => item.start === index);

  if (!build) {
    return "";
  }

  return build.name;
}

</script>

<template>
  <section>
    <table class="instructionTable">
      <thead>
      <tr>
        <td>Address</td>
        <td>Instruction</td>
        <td>Data</td>
        <td>Start Of</td>
      </tr>
      </thead>
      <tbody>
      <tr v-for="(instruction, index) in instructions">
        <td>{{ index }}</td>
        <td>{{ instruction.instruction }}</td>
        <td>{{ instruction.data ? instruction.data : "" }}</td>
        <td>{{ getExpressionName(index) }}</td>
      </tr>
      </tbody>
    </table>
  </section>
</template>

<style scoped>


</style>