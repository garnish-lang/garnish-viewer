<script setup lang="ts">

const props = withDefaults(
    defineProps<{
      title?: string,
      data: any[],
      rowHeaders?: boolean,
      columnHeaders?: boolean,
      columns?: { field?: string, label?: string }[],
    }>(),
    {
      title: null,
      rowHeaders: false,
      columnHeaders: true,
      columns: () => []
    });
</script>

<template>
  <table>
    <thead>
    <tr v-if="props.title">
      <th :colspan="props.columns.length">{{ props.title }}</th>
    </tr>
    <tr v-if="props.columns.length > 0 && props.columnHeaders">
      <td v-for="col in props.columns">{{ col.label || "" }}</td>
    </tr>
    </thead>
    <tbody>
    <tr v-for="item in props.data">
      <td v-for="[index, value] in props.columns.entries()" :class="{row_header: props.rowHeaders && index === 0}">
        {{ item[value.field] }}
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