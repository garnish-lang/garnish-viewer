<script setup lang="ts">

import {useGarnishStore} from "../stores/garnish";
import {computed, ref} from "vue";
import {formatData} from "../utils/garnish_display";
import {it} from "vitest";
import DataTable from "./table/DataTable.vue";

const store = useGarnishStore();
const selectedExpression = ref("");
const expressionInput = ref("");

const canStart = computed(() => selectedExpression.value !== "" && !store.requestedExecution);

const instructions = computed(() => {
  if (!store.executionBuild) {
    return [];
  }

  let instructions = [];
  for (let i = 0; i < store.executionBuild.runtime_data.instructions.length; i++) {
    const item = store.executionBuild.runtime_data.instructions[i];
    instructions.push({
      addr: i,
      instruction: item.instruction,
      data: item.data,
      startOf: getExpressionName(i)
    });
  }

  return instructions
});

const instructionColumns = [
  {
    field: "addr",
    label: "Address"
  },
  {
    field: "instruction",
    label: "Instruction"
  },
  {
    field: "data",
    label: "Data",
  },
  {
    field: "startOf",
    label: "Start Of"
  }
];

const dataRows = computed(() => {
  const data = store.executionBuild ? store.executionBuild.runtime_data.data.list : [];
  const totalRows = Math.ceil(data.length / store.config.buildDataRowWidth);

  const rows = [];
  for (let i = 0; i < totalRows; i++) {
    const row = {
      row: `${i * 10}`
    };

    for (let j = 0; j < store.config.buildDataRowWidth; j++) {
      const addr = i * store.config.buildDataRowWidth + j;
      if (data[addr]) {
        row[j] = formatData(store.executionBuild!, addr);
      } else {
        row[j] = "";
      }
    }

    rows.push(row);
  }

  console.log(rows);
  return rows;
});

const columns = computed(() => {
  let columns = [{
    field: "row",
    label: "—"
  }];
  for (let i = 0; i < 10; i++) {
    columns.push({
      field: `${i}`,
      label: `${i}`
    })
  }

  return columns
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

function buildExecution() {
  store.initializeExecution();
}

function startExecution() {
  store.startExecution(selectedExpression.value, expressionInput.value);
}

function continueExecution() {
  store.continueExecution();
}

</script>

<template>
  <section class="root">
    <section class="execution_options">
      <nav>
        <button @click="buildExecution">Build</button>
        <select v-model="selectedExpression">
          <option value="">Select Expression</option>
          <option v-for="name in availableExpressions" :value="name">{{ name }}</option>
        </select>
        <textarea v-model="expressionInput">

        </textarea>
        <button @click="startExecution" :disabled="!canStart" v-if="!store.currentlyExecuting">Start</button>
        <button @click="continueExecution" :disabled="store.requestedExecution" v-if="store.currentlyExecuting">
          Continue
        </button>
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
              <th>Address</th>
              <td v-for="item in values">{{ item }}</td>
            </tr>
            </tbody>
          </table>
        </section>
      </section>
    </section>
    <section class="lower_section">
      <section class="instruction_table">
        <DataTable title="Instructions"
                   :data="instructions"
                   :columns="instructionColumns"
                   :row-headers="true"
                   :row-limit="20"
                   :row-scroll="true"/>
      </section>
      <section class="data_table">
        <DataTable title="Data"
                   :data="dataRows"
                   :row-headers="true"
                   :columns="columns"/>
      </section>
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

.lower_section {
  display: flex;
}

.lower_section > section {
  flex-basis: 0;
  margin: .5rem;
}

.lower_section > section:first-child {
  margin-right: 0;
}

.lower_section table {
  table-layout: fixed;
  width: 100%;
}

.lower_section > .instruction_table {
  flex-grow: 1;
}

.lower_section > .data_table {
  flex-grow: 2;
}

</style>