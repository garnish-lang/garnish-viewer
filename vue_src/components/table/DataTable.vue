<script setup lang="ts">

import {computed, ref} from "vue";
import {clamp} from "../../utils/math";

const props = withDefaults(
    defineProps<{
      title?: string,
      data: any[],
      rowHeaders?: boolean,
      columnHeaders?: boolean,
      columns?: { field?: string, label?: string }[],
      rowLimit?: number,
      rowStart?: number,
      columnLimit?: number,
      columnStart?: number,
      rowScroll?: boolean,
      columnScroll?: boolean,
    }>(),
    {
      rowLimit: null,
      rowScroll: false,
      columnLimit: null,
      columnScroll: false,
      rowStart: 0,
      columnStart: 0,
      title: null,
      rowHeaders: false,
      columnHeaders: true,
      columns: () => []
    });

const currentScrollRow = ref(0);
const currentScrollCol = ref(0);

const trueRowLimit = computed(() => props.rowLimit || props.data.length || 0);
const trueColumnLimit = computed(() => props.columnLimit || props.columns.length || 0);

const visibleItems = computed(() => {
  let start = (props.rowStart || 0)  + currentScrollRow.value;
  const maxStart = Math.max(props.data.length - trueRowLimit.value, 0);
  start = clamp(start, 0, maxStart);

  const end = Math.min(start + trueRowLimit.value, props.data.length);
  let items = [];

  for (let i = start; i < end; i++) {
    items.push({
      index: i,
      data: props.data[i]
    })
  }

  return items;
});

const visibleColumns = computed(() => {
  let scrollableColumns = props.rowHeaders ? props.columns.slice(1) : props.columns;

  let start = (props.columnStart || 0) + currentScrollCol.value;
  let maxStart = Math.max(scrollableColumns.length - trueColumnLimit.value, 0);
  start = clamp(start, 0, maxStart);

  const end = Math.min(start + trueColumnLimit.value, scrollableColumns.length);
  let items = [];

  if (props.rowHeaders) {
    items.push(props.columns[0])
  }

  for (let i = start; i < end; i++) {
    items.push(scrollableColumns[i])
  }

  return items;
});

function handleScroll(e: WheelEvent) {
  e.preventDefault();
  let up = e.deltaY < 0;

  if (e.shiftKey && props.columnScroll) {
    let scrollMin = -props.columnStart;
    let scrollMax = props.columns.length - (props.columnStart + trueColumnLimit.value);
    if (props.rowHeaders) {
      scrollMax -= 1;
    }

    if (up) {
      currentScrollCol.value = Math.max(currentScrollCol.value - 1, scrollMin);
    } else {
      currentScrollCol.value = Math.min(currentScrollCol.value + 1, scrollMax);
    }
  } else if (props.rowScroll) {
    let scrollMin = -props.rowStart;
    let scrollMax = props.data.length - (props.rowStart + trueRowLimit.value);

    if (up) {
      currentScrollRow.value = Math.max(currentScrollRow.value - 1, scrollMin);
    } else {
      currentScrollRow.value = Math.min(currentScrollRow.value + 1, scrollMax);
    }
  }
}
</script>

<template>
  <table>
    <thead>
    <tr v-if="props.title">
      <th :colspan="props.columns.length">{{ props.title }}</th>
    </tr>
    <tr v-if="props.columns.length > 0 && props.columnHeaders">
      <td v-for="col in visibleColumns">{{ col.label || "" }}</td>
    </tr>
    </thead>
    <tbody>
    <tr v-for="item in visibleItems" @wheel="handleScroll" :class="{odd: item.index % 2 === 1, even: item.index % 2 === 0}">
      <td v-for="[index, value] in visibleColumns.entries()"
          :class="{row_header: props.rowHeaders && index === 0}">
        {{ item.data[value.field] }}
      </td>
    </tr>
    </tbody>
  </table>
</template>

<style scoped>
table {
  border-collapse: collapse;
  border: .25rem solid var(--edit_color);
}

thead {
  text-align: center;
}

thead > tr > td {
  background-color: var(--edit_color);
  padding-bottom: .5rem;
}

th {
  background-color: var(--back_color);
}

td.row_header {
  font-weight: normal;
  background-color: var(--edit_color);
}

tr, td, th {
  border: none;
}

td, th {
  padding: .4rem .5rem;
  overflow: hidden;
  text-overflow: ellipsis;
}

tr.even {
  background-color: var(--accent_color);
}

tr.odd {
  background-color: var(--back_color);
}

tbody.highlight_row > tr:hover {
  background-color: var(--highlight_color);
}

tbody.highlight_cell td:hover {
  background-color: var(--highlight_color);
}
</style>