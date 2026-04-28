<template>
  <v-app full-height style="background-color: #f1f3f8;">

    <!-- <v-layout class="rounded rounded-md" style="display: inline-block;"> -->
    <v-layout class="rounded rounded-md" style="display: flow;">
      <!-- <router-view /> -->
      <default-view />
    </v-layout>
    <!-- <v-footer color="#424242" class="d-flex flex-column" style="max-height: 50px;">
      <v-row no-gutters justify="center" align="center">
        <v-col>
          <v-icon icon="mdi-map-marker-outline" size="x-small"></v-icon>
          <span class="text-subtitle-2 ml-1">주식회사 브렌 | 서울시 영등포구 영등포로150, A동 1210호(당산동1가, 생각공장당산)</span>
          <v-icon icon="mdi-phone" size="x-small" class="ml-5"></v-icon>
          <span class="text-subtitle-2 ml-1">+02 6952 9168</span>
          <v-icon icon="mdi-email-outline" size="x-small" class="ml-5"></v-icon>
          <span class="text-subtitle-2 ml-1">info@bren.kr</span>
        </v-col>
      </v-row>
    </v-footer> -->
  </v-app>
</template>

<script setup>
import DefaultView from './LoginView.vue';
</script>

<script>
  export default {
    mounted () {
      
    },
  }
</script>

<style lang="scss">
/*   */
</style>
