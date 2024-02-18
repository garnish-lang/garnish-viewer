<script setup lang="ts">

import {useGarnishStore} from "../stores/garnish";
import {computed, ref} from "vue";
import {formatData} from "../utils/garnish_display";
import {it} from "vitest";
import DataTable from "./table/DataTable.vue";
import {clamp} from "../utils/math";

const store = useGarnishStore();
const selectedExpression = ref("");
const expressionInput = ref("");

const canStart = computed(() => selectedExpression.value !== "" && !store.requestedExecution);

const instructionLimit = 20;
const instructionStart = computed(() =>
    clamp((store.executionBuild?.runtime_data.instruction_cursor || 0) - instructionLimit / 2,
        0,
        store.executionBuild?.runtime_data.instructions.length || 0)
);

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
    store.executionBuild?.runtime_data.instruction_cursor || 0
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

const jumpTable = computed(() => {
  let columns = [{
    field: "row",
    label: '',
  }];

  let indexRow = {row: "Index"};
  let addressRow = {row: "Address"};

  if (store.executionBuild) {
    for (let i = 0; i < store.executionBuild.runtime_data.expression_table.length; i++) {
      columns.push({
        field: `${i}`,
        label: `${i}`
      });

      indexRow[`${i}`] = i;
      addressRow[`${i}`] = store.executionBuild.runtime_data.expression_table[i];
    }
  }

  return {
    columns,
    data: [indexRow, addressRow]
  }
});

const jumpPath = computed(() => {
  let columns = [{
    field: "row",
    label: '',
  }];

  let addressRow = {row: "Address"};

  if (store.executionBuild) {
    for (let i = 0; i < store.executionBuild.runtime_data.jump_path.length; i++) {
      columns.push({
        field: `${i}`,
        label: `${i}`
      });

      addressRow[`${i}`] = store.executionBuild.runtime_data.jump_path[i];
    }
  }

  return {
    columns,
    data: [addressRow]
  }
});

const registers = computed(() => {
  let columns = [{
    field: "row",
    label: '',
  }];

  let addressRow = {row: "Address"};

  if (store.executionBuild) {
    for (let i = 0; i < store.executionBuild.runtime_data.register.length; i++) {
      columns.push({
        field: `${i}`,
        label: `${i}`
      });

      addressRow[`${i}`] = store.executionBuild.runtime_data.register[i];
    }
  }

  return {
    columns,
    data: [addressRow]
  }
});

const values = computed(() => {
  let columns = [{
    field: "row",
    label: '',
  }];

  let addressRow = {row: "Address"};

  if (store.executionBuild) {
    for (let i = 0; i < store.executionBuild.runtime_data.values.length; i++) {
      columns.push({
        field: `${i}`,
        label: `${i}`
      });

      addressRow[`${i}`] = store.executionBuild.runtime_data.values[i];
    }
  }

  return {
    columns,
    data: [addressRow]
  }
});

const currentListInfo = computed(() => {
  let columnCount = Math.max(currentList.value[0].length, currentList.value[1].length);
  let columns = [{
    field: 'row',
    label: '',
  }];
  for (let i = 0; i < columnCount; i++) {
    columns.push({
      field: `${i}`,
      label: `${i}`
    });
  }

  let itemRow = {row: "Items"};
  for (let i = 0; i < currentList.value[0]; i++) {
    itemRow[`${i}`] = currentList.value[0][i];
  }

  let associationRow = {row: "Associations"};
  for (let i = 0; i < currentList.value[0]; i++) {
    associationRow[`${i}`] = currentList.value[1][i];
  }

  return {
    columns,
    data: [itemRow, associationRow]
  }
});

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

          <DataTable title="Current Character List"
                     :columns="[{field: 'value', label: ''}]"
                     :column-headers="false"
                     :data="[{'value': currentCharacterList || '&nbsp;'}]"/>

          <DataTable title="Current Byte List"
                     :columns="[{field: 'value', label: ''}]"
                     :column-headers="false"
                     :data="[{'value': currentByteList || '&nbsp;'}]"/>

          <DataTable title="Current List"
                     :columns="currentListInfo.columns"
                     :column-headers="false"
                     :row-headers="true"
                     :data="currentListInfo.data"/>

          <DataTable title="Jump Table"
                     :columns="jumpTable.columns"
                     :column-headers="false"
                     :row-headers="true"
                     :data="jumpTable.data"/>

          <DataTable title="Jump Path"
                     :columns="jumpPath.columns"
                     :column-headers="false"
                     :row-headers="true"
                     :data="jumpPath.data"/>
        </section>
      </section>
    </section>
    <section class="lower_section">
      <section class="instruction_table">
        <DataTable title="Instruction Cursor"
                   :columns="[{field: 'value', label: ''}]"
                   :column-headers="false"
                   :data="[{'value': instructionCursor}]"/>

        <DataTable title="Instructions"
                   :data="instructions"
                   :selected="instructionCursor"
                   :columns="instructionColumns"
                   :row-headers="true"
                   :row-start="instructionStart"
                   :row-limit="instructionLimit"
                   :row-scroll="true"/>
      </section>
      <section class="data_table">

        <DataTable title="Values"
                   :columns="values.columns"
                   :column-headers="false"
                   :column-limit="10"
                   :row-headers="true"
                   :data="values.data"/>

        <DataTable title="Registers"
                   :columns="registers.columns"
                   :column-headers="false"
                   :column-limit="10"
                   :row-headers="true"
                   :data="registers.data"/>

        <DataTable title="Data"
                   :data="dataRows"
                   :row-headers="true"
                   :row-limit="20"
                   :columns="columns"/>
      </section>
    </section>
  </section>
</template>

<style scoped>

table {
  margin-bottom: .5rem;
}

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
  margin-left: .5rem;
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