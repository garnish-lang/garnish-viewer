<script setup lang="ts">

import {useGarnishStore} from "../stores/garnish";
import {computed} from "vue";
import {formatData} from "../utils/garnish_display";

const store = useGarnishStore();

const instructions = computed(() => store.builds[store.activeSource] ? store.builds[store.activeSource].runtime_data.instructions : []);
const dataRows = computed(() => {
  const data = store.builds[store.activeSource] ? store.builds[store.activeSource].runtime_data.data.list : [];
  const totalRows = Math.ceil(data.length / store.config.buildDataRowWidth);

  const rows = [];
  for (let i = 0; i < totalRows; i++) {
    const row = [];

    for (let j = 0; j < store.config.buildDataRowWidth; j++) {
      const addr = i * store.config.buildDataRowWidth + j;
      if (data[addr]) {
        row.push({
          addr,
          data: formatData(store.builds[store.activeSource], addr)
        });
      } else {
        row.push({
          addr,
          data: ""
        });
      }
    }

    rows.push(row);
  }

  return rows;
})

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
    <table>
      <thead>
      <tr>
        <td>Address</td>
        <td>Instruction</td>
        <td>Data</td>
        <td>Start Of</td>
      </tr>
      </thead>
      <tbody class="highlight_row">
      <tr v-for="(instruction, index) in instructions">
        <td>{{ index }}</td>
        <td>{{ instruction.instruction }}</td>
        <td>{{ instruction.data ? instruction.data : "" }}</td>
        <td>{{ getExpressionName(index) }}</td>
      </tr>
      </tbody>
    </table>
    <table class="data">
      <thead>
      <tr>
        <td>Data</td>
        <td v-for="n in store.config.buildDataRowWidth">{{ n - 1 }}</td>
      </tr>
      </thead>
      <tbody class="highlight_cell">
      <tr v-for="(row, index) in dataRows">
        <td>{{ index * store.config.buildDataRowWidth }}</td>
        <td v-for="item in row">{{ item.data }}</td>
      </tr>
      </tbody>
    </table>
  </section>
</template>

<style scoped>

section {
  display: flex;
  align-content: start;
  align-items: start;
}

table {
  flex-grow: 0;
}

.data {
  table-layout: fixed;
  width: 100%;
  margin-left: 0;
}

.data tr {
  text-align: center;
}

</style>