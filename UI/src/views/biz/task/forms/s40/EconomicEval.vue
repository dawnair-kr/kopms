<template>
  <v-sheet rounded="lg" class="pa-4 mb-3 form-card">
    <div class="form-section-header mb-3">
      <div class="d-flex align-center" style="gap: 8px;">
        <div class="section-bar" />
        <span>사전경제성평가</span>
      </div>
    </div>

    <div class="text-body-2 text-grey">— 준비 중 —</div>
  </v-sheet>
</template>

<script setup>
defineProps({
  bizId: String,
  modelValue: Object,
});
</script>
