<script setup lang="ts">

import {computed} from "vue";

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
    }>(),
    {
      title: null,
      rowHeaders: false,
      columnHeaders: true,
      columns: () => []
    });

const visibleItems = computed(() => {
  const start = props.rowStart || 0;
  const end = Math.min(start + (props.rowLimit || props.data.length), props.data.length);
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
  let start = props.columnStart || 0;
  if (props.rowHeaders) {
    start += 1;
  }

  const end = Math.min(start + (props.columnLimit || props.columns.length), props.columns.length);
  let items = [];

  if (props.rowHeaders) {
    items.push(props.columns[0])
  }

  for (let i = start; i < end; i++) {
    items.push(props.columns[i])
  }

  return items;
});
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
    <tr v-for="item in visibleItems">
      <td v-for="[index, value] in visibleColumns.entries()" :class="{row_header: props.rowHeaders && index === 0}">
        {{ item.data[value.field] }}
      </td>
    </tr>
    </tbody>
  </table>
</template>

<style scoped>
table {
  border-collapse: collapse;
  margin: .5rem;
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
}

tr:nth-child(even) {
}

tr:nth-child(odd) {
  background-color: var(--accent_color);
}

tbody.highlight_row > tr:hover {
  background-color: var(--highlight_color);
}

tbody.highlight_cell td:hover {
  background-color: var(--highlight_color);
}
</style>