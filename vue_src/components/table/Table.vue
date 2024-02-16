<script setup lang="ts">



</script>

<template>
  <table>
    <thead>
    <tr>
      <th :colspan="4">Data</th>
    </tr>
    <tr>
      <td>&mdash;</td>
      <td>Column 1</td>
      <td>Column 2</td>
      <td>Column 3</td>
    </tr>
    </thead>
    <tbody>
    <tr>
      <th>Row 1</th>
      <td>Cell 1</td>
      <td>Cell 2</td>
      <td>Cell 3</td>
    </tr>
    <tr>
      <th>Row 2</th>
      <td>Cell 1</td>
      <td>Cell 2</td>
      <td>Cell 3</td>
    </tr>
    <tr>
      <th>Row 3</th>
      <td>Cell 1</td>
      <td>Cell 2</td>
      <td>Cell 3</td>
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

tbody th {
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