<script setup lang="ts">
import {computed} from "vue";
import {exists} from "../../utils/general";
import {clamp} from "../../utils/math";

defineEmits(["toEnd", "toStart", "previousClicked", "nextClicked", "itemClicked"]);

const props = withDefaults(defineProps<{
  pageCount: number,
  limit?: number,
  selected?: number,
  showToStart?: boolean,
  showToEnd?: boolean,
}>(), {
  pageCount: 0,
  selected: 0,
  showToStart: false,
  showToEnd: false,
});

const truePageLimit = computed(() => props.limit || props.pageCount);
const maxVisibleStart = computed(() => truePageLimit.value >= props.pageCount ? 0 : props.pageCount - truePageLimit.value);
const visibleStart = computed(() => clamp(props.selected - (truePageLimit.value/2), 0, maxVisibleStart.value));
const visibleEnd = computed(() => Math.min(visibleStart.value + truePageLimit.value, props.pageCount));

const previousVisible = computed(() => exists(props.limit));
const previousEnabled = computed(() => visibleStart.value > 0);
const nextVisible = computed(() => exists(props.limit));
const nextEnabled = computed(() => visibleEnd.value < props.pageCount);

const pageWindow = computed(() => {
  let pages = [];
  for (let i = visibleStart.value; i < visibleEnd.value; i++) {
    pages.push(i);
  }

  return pages;
})

</script>

<template>
<nav>
  <ol>
    <li v-if="showToStart"
        :class="{disabled: !previousEnabled}"
        @click="$emit('toStart')">
      <span>⮜⮜</span>
    </li>
    <li v-if="previousVisible"
        :class="{disabled: !previousEnabled}"
        @click="$emit('previousClicked')">
      <span>⮜</span>
    </li>
    <li v-for="p in pageWindow" @click="$emit('itemClicked', p)">
      <span>{{ p }}</span>
    </li>
    <li v-if="nextVisible"
        :class="{disabled: !nextEnabled}"
        @click="$emit('nextClicked')">
      <span>⮞</span>
    </li>
    <li v-if="nextVisible"
        :class="{disabled: !nextEnabled}"
        @click="$emit('toEnd')">
      <span>⮞⮞</span>
    </li>
  </ol>
</nav>
</template>

<style scoped>
h6 {
  margin-bottom: 1rem;
}
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
  display: flex;
  justify-content: center;
  align-items: center;
}

ol > li:hover {
  background-color: var(--highlight_color);
}

ol > li:active {
  background-color: var(--active_color);
}

ol > li.disabled {
  background-color: var(--accent_color);
}

ol > li > span {
  flex-grow: 1;
}

ol > li:last-child {
  margin-right: 0;
}
</style>