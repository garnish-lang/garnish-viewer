<script setup lang="ts">

import {useGarnishStore} from "../stores/garnish";
import {computed, ref} from "vue";
import DataTable from "./shared/DataTable.vue";
import {clamp} from "../utils/math";
import {TableHighlightType} from "../stories/types";
import {exists} from "../utils/general";
import PageNav from "./shared/PageNav.vue";

type InstructionRow = {
  addr: number,
  instruction: string,
  data: number | null,
  startOf: string,
}

const store = useGarnishStore();
const selectedExpression = ref("");
const expressionInput = ref("");
const selectedDataAddress = ref<number | null>(null);
const selectedInstruction = ref<InstructionRow | null>(null);

const executionRecordDetailsVisible = computed(() => store.executionFrames.length > 0);

const selectedData = computed(() => {
  console.log('computing', selectedDataAddress.value);
  if (exists(selectedDataAddress.value)) {
    return store.formattedDataCache[selectedDataAddress.value]?.detailed || "[No formatted data available]";
  }

  return "[No Data Selected]";
});

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
      if (exists(store.executionBuild?.runtime_data.data.list[addr])) {
        row[j] = store.formattedDataCache[addr]?.simple || "[No formatted data available]";
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
    store.executionBuild?.runtime_data.current_char_list || ""
);

const currentByteList = computed(() =>
    store.executionBuild?.runtime_data.current_byte_list?.join(", ") || ""
);

const currentList = computed(() =>
    store.executionBuild?.runtime_data.current_list || [[], []]
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
  let columns = [
    {
      field: "index",
      label: "Index",
    },
    {
      field: "address",
      label: "Address",
    },
    {
      field: "value",
      label: "Value",
    }
  ];


  let rows = [];

  if (store.executionBuild) {
    for (let i = 0; i < store.executionBuild.runtime_data.register.length; i++) {
      let addr = store.executionBuild.runtime_data.register[i];
      rows.push({
        index: i,
        address: addr,
        value: store.formattedDataCache[addr]?.simple || "[No formatted data available]"
      })
    }
  }

  return {
    columns,
    data: rows
  }
});

const values = computed(() => {
  let columns = [
    {
      field: "index",
      label: "Index",
    },
    {
      field: "address",
      label: "Address",
    },
    {
      field: "value",
      label: "Value",
    }
  ];


  let rows = [];

  if (store.executionBuild) {
    for (let i = 0; i < store.executionBuild.runtime_data.values.length; i++) {
      let addr = store.executionBuild.runtime_data.values[i];
      rows.push({
        index: i,
        address: addr,
        value: store.formattedDataCache[addr]?.simple || "[No formatted data available]"
      })
    }
  }

  return {
    columns,
    data: rows
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

function dataSelection(row, field) {
  let addr = row.index * 10 + parseInt(field);
  selectedDataAddress.value = addr;
  store.formatValue(addr);
}

function valueRegisterSelection(row, field) {
  selectedDataAddress.value = row.data.address;
  store.formatValue(row.data.address);
}

function instructionSelection(row) {
  selectedInstruction.value = row.data;
}

function recordAndExecute() {
  store.executeAndRecord(selectedExpression.value, expressionInput.value);
}

function updateExecutionFrame(index) {
  store.setExecutionFrameAsBuild(index);
}

function updateToNextExecutionFrame() {
  if (store.currentExecutionFrame < store.executionFrames.length - 1) {
    store.setExecutionFrameAsBuild(store.currentExecutionFrame + 1);
  }
}

function updateToPreviousExecutionFrame() {
  if (store.currentExecutionFrame > 0) {
    store.setExecutionFrameAsBuild(store.currentExecutionFrame - 1);
  }
}

function updateToStartExecutionFrame() {
  store.setExecutionFrameAsBuild(0);
}

function updateToEndExecutionFrame() {
  if (store.executionFrames.length > 0) {
    store.setExecutionFrameAsBuild(store.executionFrames.length - 1);
  }
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
        <button @click="recordAndExecute" :disabled="!canStart" v-if="!store.currentlyExecuting">Execute & Record
        </button>
        <button @click="continueExecution" :disabled="store.requestedExecution" v-if="store.currentlyExecuting">
          Continue
        </button>
      </nav>
      <section class="recording_details" v-if="executionRecordDetailsVisible">
        <PageNav :page-count="store.executionFrames.length"
                 :show-to-start="true"
                 :show-to-end="true"
                 :limit="20"
                 :selected="store.currentExecutionFrame"
                 @next-clicked="updateToNextExecutionFrame"
                 @previous-clicked="updateToPreviousExecutionFrame"
                 @to-start="updateToStartExecutionFrame"
                 @to-end="updateToEndExecutionFrame"
                 @item-clicked="updateExecutionFrame"/>
      </section>
      <p class="data_preview">
        {{ selectedData || "&nbsp;" }}
      </p>
      <section class="execution_details">
        <section>
          <DataTable title="Jump Table"
                     :columns="jumpTable.columns"
                     :column-headers="false"
                     :column-limit="10"
                     :row-headers="true"
                     :data="jumpTable.data"/>

          <DataTable title="Jump Path"
                     :columns="jumpPath.columns"
                     :column-headers="false"
                     :column-limit="10"
                     :row-headers="true"
                     :data="jumpPath.data"/>
        </section>
        <section>
          <DataTable title="Values"
                     :columns="values.columns"
                     :column-limit="10"
                     :row-headers="true"
                     :reverse-rows="true"
                     :data="values.data"
                     :highlight-type="TableHighlightType.Row"
                     @selection="valueRegisterSelection"/>
        </section>

        <section>
          <DataTable title="Registers"
                     :columns="registers.columns"
                     :column-limit="10"
                     :row-headers="true"
                     :reverse-rows="true"
                     :data="registers.data"
                     :highlight-type="TableHighlightType.Row"
                     @selection="valueRegisterSelection"/>
        </section>
      </section>
    </section>
    <section class="lower_section">
      <section class="instruction_table">
        <p class="data_preview">
          <span v-if="!selectedInstruction">&nbsp;</span>
          <span v-if="selectedInstruction">
            {{ selectedInstruction!.addr }}
            {{ selectedInstruction!.instruction ? ` - ${selectedInstruction.instruction}` : "" }}
            {{ selectedInstruction!.data ? ` - ${selectedInstruction.data}` : "" }}
            {{ selectedInstruction!.startOf ? ` - ${selectedInstruction.startOf}` : "" }}
          </span>
        </p>

        <DataTable title="Instruction Cursor"
                   :columns="[{field: 'value', label: ''}]"
                   :column-headers="false"
                   :data="[{'value': instructionCursor}]"/>

        <DataTable title="Instructions"
                   :data="instructions"
                   :highlight-type="TableHighlightType.Row"
                   :selected="instructionCursor"
                   :columns="instructionColumns"
                   :row-headers="true"
                   :row-start="instructionStart"
                   :row-limit="instructionLimit"
                   :row-scroll="true"
                   @selection="instructionSelection"/>
      </section>
      <section class="data_table">
        <DataTable title="Data"
                   :data="dataRows"
                   :highlight-type="TableHighlightType.Cell"
                   :row-headers="true"
                   :row-limit="20"
                   :columns="columns"
                   @selection="dataSelection"/>
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

.recording_details > nav {
  margin: .5rem;
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

.execution_details > section:last-child {
  flex-grow: 1;
  flex-basis: 0;
  margin-right: .5rem;
}

.execution_details table {
  table-layout: fixed;
  width: 100%;
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

.data_preview {
  background-color: var(--edit_color);
  margin: .5rem;
  padding: .5rem;
}

</style>