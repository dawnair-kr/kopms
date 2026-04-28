<template>
  <v-form ref="form">

    <!-- 사업적합평가 -->
    <v-sheet rounded="lg" class="pa-4 mb-3 form-card">
      <div class="form-section-header mb-3">
        <div class="d-flex align-center" style="gap: 8px;">
          <div class="section-bar" />
          <span>사업적합평가</span>
        </div>
      </div>

      <!-- 평가의견 -->
      <v-row no-gutters class="mb-4">
        <v-col>
          <div class="field-item">
            <span class="field-label required">평가의견</span>
            <v-textarea
              v-model="modelValue.bizInfo.proSummary"
              variant="outlined"
              density="compact"
              rows="3"
              no-resize
              hide-details="auto"
              :rules="isCompleted ? [] : [v => !!v || '필수입력항목 입니다.']"
              :readonly="isCompleted"
              :disabled="isCompleted"
            />
          </div>
        </v-col>
      </v-row>

      <!-- 평가결과 -->
      <v-row no-gutters class="ga-6 mb-2">
        <v-col>
          <div class="field-item">
            <span class="field-label">평가결과</span>
            <v-btn-toggle
              v-model="modelValue.bizInfo.riskChekMethod"
              mandatory
              density="compact"
              :disabled="isCompleted"
              class="toggle-group"
            >
              <v-btn value="Y" variant="text" class="toggle-btn">적합</v-btn>
              <v-btn value="N" variant="text" class="toggle-btn">부적합</v-btn>
            </v-btn-toggle>
          </div>
        </v-col>
        <v-col style="visibility: hidden;" aria-hidden="true" />
        <v-col style="visibility: hidden;" aria-hidden="true" />
        <v-col style="visibility: hidden;" aria-hidden="true" />
      </v-row>

      <!-- 저장 -->
      <v-row v-if="!isCompleted" no-gutters class="d-flex justify-end mt-3">
        <div class="d-flex ga-1">
          <v-btn variant="flat" text="임시저장" @click="handleSave" />
          <v-btn variant="flat" prepend-icon="mdi-check-bold" text="확정" @click="handleConfirm" />
        </div>
      </v-row>
    </v-sheet>

  </v-form>
</template>

<script setup>
import { ref, inject } from 'vue';

const isCompleted = inject('isCompleted', false);

defineProps({
  bizId: String,
  modelValue: Object,
});

const emit = defineEmits(['save', 'confirm']);
const form = ref(null);

const handleSave = async () => {
  const { valid } = await form.value.validate();
  if (!valid) return;
  emit('save');
};

const handleConfirm = async () => {
  const { valid } = await form.value.validate();
  if (!valid) return;
  emit('confirm');
};
</script>
