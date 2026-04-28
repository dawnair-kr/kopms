<template>
    <div class="dialog-layout">
      <dialog-child v-bind="$attrs" ref="dialog" />
    </div>
  </template>
  
  <script setup>
  import { ref } from "vue";

  const dialog = ref(null);
  </script>