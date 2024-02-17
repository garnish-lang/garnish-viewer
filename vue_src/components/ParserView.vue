<script setup lang="ts">
import 'zingchart/es6';
import 'zingchart/modules-es6/zingchart-tree.min.js';
import ZingChartVue from "zingchart-vue";
import {useGarnishStore} from "../stores/garnish";
import {computed, ref} from "vue";
import DataTable from "./table/DataTable.vue";

const store = useGarnishStore();
const view = ref<"table" | "chart">("table");
const builds = computed(() => store.executionBuild?.context.build_metadata || []);
const nodeColumns = [
  {
    field: "index",
    label: "Index",
  },
  {
    field: "definition",
    label: "Definition",
  },
  {
    field: "parent",
    label: "Parent",
  },
  {
    field: "left",
    label: "Left",
  },
  {
    field: "right",
    label: "Right",
  }
];

function makeNodeTable(build) {
  let nodes = [];

  for (const [i, n] of build.parse_result.nodes.entries()) {
    nodes.push({
      index: i.toString(),
      ...n
    })
  }

  return nodes;
}

function makeChartNodes(build) {
  let nodes = [];

  for (const [i, n] of build.parse_result.nodes.entries()) {
    nodes.push({
      id: i.toString(),
      name: n.definition,
      parent: n.parent ? n.parent.toString() : "",
    })
  }

  return nodes;
}

function makeChartConfig() {
  return {
    type: 'tree',
    backgroundColor: '#2b2d30',
    options: {
      aspect: 'tree-down',
      orgChart: true,
      packingFactor: 1,
      node: {
        height: '65px',
        label: {
          color: '#fff',
          fontSize: '16px'
        },
        hoverState: {
          visible: false
        },
      },
      'node[cls-rshifted]': {
        offsetX: '25px'
      },
      'node[cls-lshifted]': {
        offsetX: '-25px'
      },
      'node[cls-bblack]': {
        backgroundColor: '#000',
        width: '120px'
      },
      'node[cls-borange]': {
        backgroundColor: '#F6931D',
        width: '80px'
      },
      'node[cls-bred]': {
        backgroundColor: '#C00000',
        width: '80px'
      },
      'node[cls-blightblue]': {
        backgroundColor: '#00B9C2',
        width: '80px'
      },
      'node[cls-bblue]': {
        backgroundColor: '#00408F',
        width: '80px'
      },
      'node[cls-bgreen]': {
        backgroundColor: '#70AD47',
        width: '80px'
      }
    },
    plotarea: {
      margin: '20px 20x 20x 0'
    }
  };
}

</script>

<template>
  <section class="root">
    <section v-if="view === 'table'" class="parseTables">
      <DataTable v-for="build in builds"
                 :title="build.name"
                 :columns="nodeColumns"
                 :data="makeNodeTable(build)"/>
    </section>
    <section v-if="view === 'chart'">
      <section v-for="build in builds" class="graph_container">
        <h4>{{ build.name }}</h4>
        <div>
          <ZingChartVue :data="makeChartConfig()" :series="makeChartNodes(build)"/>
        </div>
      </section>
    </section>
  </section>
</template>

<style scoped>
section.root {
  flex-direction: column;
  flex-grow: 1;
  flex-basis: 0;
  overflow-x: scroll;
}

.graph_container {
  height: 50%;
  margin: .25rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  flex-basis: 0;
}

.graph_container > div {
  flex-grow: 1;
  flex-basis: 0;
}

.parseTables {
  margin: .5rem;
}

.parseTables > table {
  margin-bottom: .5rem;
}
</style>