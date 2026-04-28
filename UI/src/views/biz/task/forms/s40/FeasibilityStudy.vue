<template>
  <v-form ref="form">

    <v-sheet rounded="lg" class="pa-4 mb-3 form-card">
      <div class="form-section-header mb-3">
        <div class="d-flex align-center" style="gap: 8px;">
          <div class="section-bar" />
          <span>사업타당성기초조사</span>
        </div>
      </div>

      <!-- 요약정보 -->
      <v-row no-gutters class="mb-4">
        <v-col>
          <div class="field-item">
            <span class="field-label required">요약정보</span>
            <v-textarea
              v-model="modelValue.bizInfo.bizReason"
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

      <!-- 사업성평가 점수 -->
      <v-row no-gutters class="ga-6 mb-4">
        <v-col>
          <div class="field-item">
            <span class="field-label required">환산점수</span>
            <BrNumberField
              v-model="modelValue.bizInfo.bizScore"
              allow-decimal
              variant="outlined"
              density="compact"
              hide-details="auto"
              :rules="isCompleted ? [] : [v => v != null && v !== '' || '필수입력항목 입니다.']"
              :readonly="isCompleted"
              :disabled="isCompleted"
            />
          </div>
        </v-col>
        <v-col>
          <div class="field-item">
            <span class="field-label required">획득점수</span>
            <BrNumberField
              v-model="modelValue.bizInfo.bizCheckScore"
              allow-decimal
              variant="outlined"
              density="compact"
              hide-details="auto"
              :rules="isCompleted ? [] : [v => v != null && v !== '' || '필수입력항목 입니다.']"
              :readonly="isCompleted"
              :disabled="isCompleted"
            />
          </div>
        </v-col>
        <v-col>
          <div class="field-item">
            <span class="field-label required">평가총점</span>
            <BrNumberField
              v-model="modelValue.bizInfo.bizRatioScore"
              allow-decimal
              variant="outlined"
              density="compact"
              hide-details="auto"
              :rules="isCompleted ? [] : [v => v != null && v !== '' || '필수입력항목 입니다.']"
              :readonly="isCompleted"
              :disabled="isCompleted"
            />
          </div>
        </v-col>
        <v-col style="visibility: hidden;" aria-hidden="true" />
      </v-row>

      <!-- 사전경제성평가 -->
      <v-row no-gutters class="mb-4">
        <v-col>
          <div class="field-item">
            <span class="field-label required">사전경제성평가</span>
            <span>사전경제성평가 준비중</span>
          </div>
        </v-col>
      </v-row>

      <!-- 평가결과 -->
      <v-row no-gutters class="mb-4">
        <v-col>
          <div class="field-item">
            <span class="field-label">평가 결과</span>
            <v-textarea
              v-model="modelValue.bizInfo.appraisalResult"
              variant="outlined"
              density="compact"
              rows="3"
              no-resize
              hide-details="auto"
              :readonly="isCompleted"
              :disabled="isCompleted"
            />
          </div>
        </v-col>
      </v-row>

      <!-- 첨부파일 -->
      <v-row no-gutters class="mb-4">
        <v-col>
          <div class="field-item">
            <span class="field-label">첨부파일</span>
            <div class="d-flex align-center ga-1">
              <v-text-field density="compact" hide-details variant="outlined">
                <template #prepend-inner><span class="form-unit">검색키워드</span></template>
              </v-text-field>
              <v-text-field density="compact" hide-details variant="outlined" readonly>
                <template #prepend-inner><span class="form-unit">파일</span></template>
              </v-text-field>
              <v-btn v-if="!isCompleted" size="small" variant="outlined">찾아보기</v-btn>
              <v-btn v-if="!isCompleted" size="small" prepend-icon="mdi-plus" color="primary">추가</v-btn>
              <v-btn v-if="!isCompleted" size="small" prepend-icon="mdi-minus" color="error">삭제</v-btn>
            </div>
          </div>
        </v-col>
      </v-row>

      <!-- 관련파일 -->
      <v-row no-gutters class="mb-4">
        <v-col>
          <div class="field-item">
            <span class="field-label">관련파일</span>
            <div class="d-flex align-center ga-1">
              <v-text-field density="compact" hide-details variant="outlined">
                <template #prepend-inner><span class="form-unit">검색키워드</span></template>
              </v-text-field>
              <v-text-field density="compact" hide-details variant="outlined" readonly>
                <template #prepend-inner><span class="form-unit">파일</span></template>
              </v-text-field>
              <v-btn v-if="!isCompleted" size="small" variant="outlined">찾아보기</v-btn>
              <v-btn v-if="!isCompleted" size="small" prepend-icon="mdi-plus" color="primary">추가</v-btn>
              <v-btn v-if="!isCompleted" size="small" prepend-icon="mdi-minus" color="error">삭제</v-btn>
            </div>
          </div>
        </v-col>
      </v-row>

      <!-- 저장 -->
      <v-row v-if="!isCompleted" no-gutters class="d-flex justify-end mt-3">
        <div class="d-flex ga-1">
          <v-btn variant="flat" text="저장" @click="handleSave" />
        </div>
      </v-row>
    </v-sheet>

  </v-form>
</template>

<script setup>
import { ref, inject } from 'vue';
import BrNumberField from '@/components/BrNumberField.jsx';

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
