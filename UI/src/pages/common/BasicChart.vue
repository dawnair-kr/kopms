<template>
  <v-card border rounded="md" class="basic-chart my-1 px-2 py-2 pb-0">
    <template v-slot:title>
      <v-row no-gutters justify="center" align="start">
        <v-col align="left">
          <span class="text-subtitle-1 text-black font-weight-bold ml-4">{{ titleText }}</span>
        </v-col>
      </v-row>
      <v-spacer style="height: 5px;" />
      <v-divider class="border-opacity-50"></v-divider>
    </template>

    <template v-slot:text>
      <v-row no-gutters justify="center" align="center" class="my-5">
        <v-col :style="`height: ${heights}px;`">
          <v-chart :option="option" theme="ovilia-green" autoresize :loading="loading"
            :loadingOptions="loadingOptions" />
        </v-col>
      </v-row>
    </template>
  </v-card>
</template>

<script setup>
import VChart from '@/components/BrEChart.jsx';
</script>


<script>

import { shallowRef } from 'vue';


export default {
  props: {
    heights: {
      type: String,
      default: "400"
    },
    option: {
      type: Object,
      default: {}
    },
    titleText: {
      type: String,
      default: ""
    },

  },
  components: {

  },
  watch: {
  },
  computed: {
  },
  methods: {
  },
  data() {
    return {
      loading: shallowRef(false),
      loadingOptions: {
        text: "Loading…",
        color: "#4ea397",
        maskColor: "rgba(255, 255, 255, 0.4)"
      }
    }
  }
}
</script>

<style lang="scss">
.basic-chart {

  .v-card-item {
    padding-bottom: 0px
  }
}
</style>