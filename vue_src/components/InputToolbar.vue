<script setup lang="ts">

</script>

<template>
  <div>
    <label>
      <input id="nameInput" type="text" placeholder="File name">
    </label>
    <button id="openBtn">Open</button>
    <button id="newBtn">New</button>
  </div>
</template>

<style scoped>
div {
  display: flex;
}

label {
  flex-grow: 3;
}

input {
  flex-grow: 1;
  width: 100%;
  height: 100%;
}
</style>