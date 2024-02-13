<script setup lang="ts">

import {useGarnishStore} from "../stores/garnish";
import {computed, ref} from "vue";
import {formatData} from "../utils/garnish_display";
import {it} from "vitest";

const store = useGarnishStore();
const selectedExpression = ref("");

const instructions = computed(() => store.executionBuild ? store.executionBuild.runtime_data.instructions : []);
const dataRows = computed(() => {
  const data = store.executionBuild ? store.executionBuild.runtime_data.data.list : [];
  const totalRows = Math.ceil(data.length / store.config.buildDataRowWidth);

  const rows = [];
  for (let i = 0; i < totalRows; i++) {
    const row = [];

    for (let j = 0; j < store.config.buildDataRowWidth; j++) {
      const addr = i * store.config.buildDataRowWidth + j;
      if (data[addr]) {
        row.push({
          addr,
          data: formatData(store.executionBuild!, addr)
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
});

const availableExpressions = computed(() =>
    store.executionBuild ? store.executionBuild.context.build_metadata.map((build) => build.name) : []
);

const instructionCursor = computed(() =>
    store.executionBuild ? store.executionBuild.runtime_data.instruction_cursor : 0
);

const currentCharacterList = computed(() =>
    store.executionBuild ? store.executionBuild.runtime_data.current_char_list || "" : ""
);

const currentByteList = computed(() =>
    store.executionBuild ?
        store.executionBuild.runtime_data.current_byte_list ? store.executionBuild.runtime_data.current_byte_list.join(", ") : ""
        : ""
);

const currentList = computed(() =>
    store.executionBuild ? store.executionBuild.runtime_data.current_list || [[], []] : [[], []]
);

const jumpTable = computed(() =>
    store.executionBuild ? store.executionBuild.runtime_data.expression_table : []
);

const jumpPath = computed(() =>
    store.executionBuild ? store.executionBuild.runtime_data.jump_path : []
);

const registers = computed(() =>
    store.executionBuild ? store.executionBuild.runtime_data.register : []
);

const values = computed(() =>
    store.executionBuild ? store.executionBuild.runtime_data.values : []
);

function getExpressionName(addr: number) {
  if (!store.executionBuild) {
    return "";
  }

  let data = store.executionBuild.runtime_data;

  let index = data.expression_table.indexOf(addr);

  if (index === -1) {
    return "";
  }

  let build = store.executionBuild.context.build_metadata.find((item) => item.start === index);

  if (!build) {
    return "";
  }

  return build.name;
}

function initExecution() {
  store.initializeExecution();
}

</script>

<template>
  <section class="root">
    <section class="execution_options">
      <nav>
        <button @click="initExecution">Initialize</button>
        <select v-model="selectedExpression">
          <option value="">Select Expression</option>
          <option v-for="name in availableExpressions" :value="name">{{ name }}</option>
        </select>
        <textarea>

        </textarea>
      </nav>
      <section class="execution_details">
        <section>
          <table class="instruction">
            <thead>
            <tr>
              <th>Instruction Cursor</th>
            </tr>
            </thead>
            <tbody>
            <tr>
              <td>{{ instructionCursor }}</td>
            </tr>
            </tbody>
          </table>
          <table class="character_list">
            <thead>
            <tr>
              <th colspan="1">Current Character List</th>
            </tr>
            </thead>
            <tbody>
            <tr>
              <td>{{ currentCharacterList }}</td>
            </tr>
            </tbody>
          </table>
          <table class="byte_list">
            <thead>
            <tr>
              <th colspan="1">Current Byte List</th>
            </tr>
            </thead>
            <tbody>
            <tr>
              <td>{{ currentByteList }}</td>
            </tr>
            </tbody>
          </table>
          <table class="current_list">
            <thead>
            <tr>
              <th colspan="4">Current List</th>
            </tr>
            </thead>
            <tbody>
            <tr>
              <th>Items</th>
              <td v-for="item in currentList[0]">{{ item }}</td>
            </tr>
            <tr>
              <th>Associations</th>
              <td v-for="item in currentList[1]">{{ item }}</td>
            </tr>
            </tbody>
          </table>

          <table class="jump_table">
            <thead>
            <tr>
              <th colspan="4">Jump Table</th>
            </tr>
            </thead>
            <tbody>
            <tr>
              <th>Index</th>
              <td v-for="n in jumpTable.length">{{ n - 1 }}</td>
            </tr>
            <tr>
              <th>Address</th>
              <td v-for="item in jumpTable">{{ item }}</td>
            </tr>
            </tbody>
          </table>

          <table class="jump_path">
            <thead>
            <tr>
              <th colspan="4">Jump path</th>
            </tr>
            </thead>
            <tbody>
            <tr>
              <th>Index</th>
              <td v-for="n in jumpPath.length">{{ n - 1 }}</td>
            </tr>
            <tr>
              <th>Address</th>
              <td v-for="item in jumpPath">{{ item }}</td>
            </tr>
            </tbody>
          </table>

          <table class="register_table">
            <thead>
            <tr>
              <th colspan="4">Registers</th>
            </tr>
            </thead>
            <tbody>
            <tr>
              <th>Index</th>
              <td v-for="n in registers.length">{{ n - 1 }}</td>
            </tr>
            <tr>
              <th>Address</th>
              <td v-for="item in registers">{{ item }}</td>
            </tr>
            </tbody>
          </table>

          <table class="value_table">
            <thead>
            <tr>
              <th colspan="4">Values</th>
            </tr>
            </thead>
            <tbody>
            <tr>
              <th>Index</th>
              <td v-for="n in values.length">{{ n - 1 }}</td>
            </tr>
            <tr>
              <th>Address</th>
              <td v-for="item in values">{{ item }}</td>
            </tr>
            </tbody>
          </table>
        </section>
      </section>
    </section>
    <section>
      <table>
        <thead>
        <tr>
          <th colspan="4">Instructions</th>
        </tr>
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
          <th :colspan="store.config.buildDataRowWidth">Data</th>
        </tr>
        <tr>
          <td>&mdash;</td>
          <td v-for="n in store.config.buildDataRowWidth">{{ n - 1 }}</td>
        </tr>
        </thead>
        <tbody class="highlight_cell">
        <tr v-for="(row, index) in dataRows">
          <th>{{ index * store.config.buildDataRowWidth }}</th>
          <td v-for="item in row">{{ item.data }}</td>
        </tr>
        </tbody>
      </table>
    </section>
  </section>
</template>

<style scoped>

.root {
  display: flex;
  flex-direction: column;
}

.root > section {
  flex-grow: 1;
  display: flex;
  align-content: start;
  flex-basis: 0;
}

.root > section:nth-child(2) {
  align-items: start;
}

.execution_options {
  display: flex;
  flex-direction: column;
}

.execution_options > nav {
  flex-grow: 0;
  flex-basis: 0;
}

.execution_details {
  display: flex;
  flex-grow: 1;
  flex-basis: 0;
  flex-direction: row;
}

.execution_details > section {
  flex-grow: 1;
  flex-basis: 0;
}

.execution_details > section:nth-child(2) {
  display: flex;
  flex-direction: row;
  align-content: start;
  align-items: start;
}

.execution_details td {
  text-align: center;
}

.execution_details > section:nth-child(2) > table:not(:first-child) {
  margin-left: 0;
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