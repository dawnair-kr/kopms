<template no-gutters>
  <v-main style="max-height: 100vh; overflow-y: auto;">
    <!-- <v-row v-if="viewSystemNotice" no-gutters align="center" justify="center" class="system-notice">
      <v-col align="center">
        <v-banner lines="one" :stacked="false" height="50" bg-color="#f1f3f8">
          <template v-slot:prepend>
            <v-icon color="red" icon="mdi-bell-badge-outline"></v-icon>
          </template>

          <template v-slot:text>
            <span class="text-subtitle-2 font-weight-bold">Smart Invoice에 오신 것을 환영합니다.</span>
          </template>

          <template v-slot:actions>
            <v-btn color="black" variant="text" density="comfortable" icon="mdi-close-circle-outline" size="large"
              @click="toggleNotice"></v-btn>
          </template>
        </v-banner>
      </v-col>
    </v-row> -->

    <v-row no-gutters>
      <v-col>
        <router-view />
      </v-col>
    </v-row>
  </v-main>
</template>

<script setup>

import { ref } from 'vue'
import { useAppStore } from '@/store/app.js';
const appStore = useAppStore();
const viewSystemNotice = ref(true);
viewSystemNotice.value = appStore.viewSystemNotice;

const toggleNotice = () => {
  viewSystemNotice.value = false;
  appStore.viewSystemNotice = false;
};
</script>

<script>

export default {
  components: {

  },
  data() {
    return {
    }
  },
  methods: {
  }
}
</script>

<style lang="scss">
.system-notice {
  .v-banner {

    .v-btn--size-large {
      --v-btn-height: 30px;
    }

    .v-banner__prepend {
      margin-inline-end: 10px;
      margin-top: 4px;
    }
  }
}
</style>