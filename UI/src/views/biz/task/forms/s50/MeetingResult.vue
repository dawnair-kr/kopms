<template>
  <v-form ref="form">

    <v-sheet rounded="lg" class="pa-4 mb-3 form-card">
      <div class="form-section-header mb-3">
        <div class="d-flex align-center" style="gap: 8px;">
          <div class="section-bar" />
          <span>사업개발심사회의 결과</span>
        </div>
      </div>

      <!-- 요약정보 -->
      <v-row no-gutters class="mb-4">
        <v-col>
          <div class="field-item">
            <span class="field-label required">요약정보</span>
            <v-textarea
              v-model="modelValue.bizInfo.resultSummary"
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

      <!-- 회의결과 -->
      <v-row no-gutters class="mb-4">
        <v-col>
          <div class="field-item">
            <span class="field-label required">회의결과</span>
            <v-textarea
              v-model="modelValue.bizInfo.convResult"
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

      <!-- 평가내역 -->
      <v-row no-gutters class="mb-4">
        <v-col>
          <div class="field-item">
            <span class="field-label">평가내역</span>
            <div class="text-body-2 text-grey">— 준비 중 —</div>
          </div>
        </v-col>
      </v-row>

      <!-- 첨부파일 -->
      <v-row no-gutters class="mb-4">
        <v-col>
          <div class="field-item">
            <span class="field-label">첨부파일</span>
            <div class="text-body-2 text-grey">— 준비 중 —</div>
          </div>
        </v-col>
      </v-row>

      <!-- 관련파일 -->
      <v-row no-gutters class="mb-4">
        <v-col>
          <div class="field-item">
            <span class="field-label">관련파일</span>
            <div class="d-flex align-center ga-1">
              <v-text-field density="compact" hide-details variant="outlined" style="width: 180px; flex-shrink: 0" :readonly="isCompleted" :disabled="isCompleted">
                <template #prepend-inner><span class="form-unit">검색키워드</span></template>
              </v-text-field>
              <v-text-field density="compact" hide-details variant="outlined" readonly :disabled="isCompleted">
                <template #prepend-inner><span class="form-unit">파일</span></template>
              </v-text-field>
              <v-btn v-if="!isCompleted" size="small" variant="outlined">찾아보기</v-btn>
              <v-btn v-if="!isCompleted" size="small" prepend-icon="mdi-plus" color="primary">추가</v-btn>
              <v-btn v-if="!isCompleted" size="small" prepend-icon="mdi-minus" color="error">삭제</v-btn>
            </div>
          </div>
        </v-col>
      </v-row>

      <!-- 결재정보 -->
      <v-row no-gutters class="mb-4">
        <v-col>
          <div class="field-item">
            <span class="field-label">결재정보</span>
            <div class="text-body-2 text-grey">— 준비 중 —</div>
          </div>
        </v-col>
      </v-row>

      <!-- 저장/결재 -->
      <v-row v-if="!isCompleted" no-gutters class="d-flex justify-end mt-3">
        <div class="d-flex ga-1">
          <v-btn variant="flat" text="저장" @click="handleSave" />
          <v-btn variant="flat" text="결재" />
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

const emit = defineEmits(['save']);
const form = ref(null);

const handleSave = async () => {
  const { valid } = await form.value.validate();
  if (!valid) return;
  emit('save');
};
</script>
