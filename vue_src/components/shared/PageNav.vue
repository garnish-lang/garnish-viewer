<script setup lang="ts">
import {computed} from "vue";

const props = withDefaults(defineProps<{
  title?: string,
  pageCount: number,
}>(), {
  title: null,
  pageCount: 0
});

const pageWindow = computed(() => {
  let pages = [];
  for (let i = 0; i < props.pageCount; i++) {
    pages.push(i);
  }

  return pages;
})
</script>

<template>
<nav>
  <h6 v-if="title">
    {{ props.title }}
  </h6>
  <ol>
    <li v-for="p in pageWindow">
      {{ p }}
    </li>
  </ol>
</nav>
</template>

<style scoped>
ol {
  list-style: none;
  display: flex;
}

ol > li {
  flex-grow: 1;
  flex-basis: 0;
  padding: .5rem .5rem;
  background-color: var(--edit_color);
  text-align: center;
  margin-right: .5rem;
}

ol > li:last-child {
  margin-right: 0;
}
</style>