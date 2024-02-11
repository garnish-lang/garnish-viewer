<script setup lang="ts">
import 'zingchart/es6';
import 'zingchart/modules-es6/zingchart-tree.min.js';
import ZingChartVue from "zingchart-vue";
import {useGarnishStore} from "../stores/garnish";
import {computed} from "vue";

const store = useGarnishStore();
const builds = computed(() => store.builds[store.activeSource] ? store.builds[store.activeSource].context.build_metadata : []);

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
  <section v-for="build in builds" class="flex_parent flex_column size_50 flex_child container">
    <h4 class="parse_name">Name</h4>
    <div class="graph_container flex_child">
      <ZingChartVue :data="makeChartConfig()" :series="makeChartNodes(build)"/>
    </div>
  </section>
</template>

<style scoped>

</style>