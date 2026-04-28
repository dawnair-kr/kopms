<template>
  <v-form ref="form">

    <!-- 사업정보검토회의 결과 -->
    <v-sheet rounded="lg" class="pa-4 mb-3 form-card">
      <div class="form-section-header mb-3">
        <div class="d-flex align-center" style="gap: 8px;">
          <div class="section-bar" />
          <span>사업정보검토회의 결과</span>
        </div>
      </div>

      <!-- 정보공개 여부 -->
      <v-row no-gutters class="ga-6 mb-4">
        <v-col>
          <div class="field-item">
            <div class="d-flex align-center ga-2">
              <span class="field-label required">정보공개 여부</span>
              <span v-if="infoDisclosureError" class="field-error-msg">필수입력항목 입니다.</span>
            </div>
            <v-btn-toggle
              v-model="modelValue.bizInfo.infoDisclosure"
              mandatory
              density="compact"
              :disabled="isCompleted"
              :class="['toggle-group', { 'toggle-group--error': infoDisclosureError }]"
            >
              <v-btn value="Y" variant="text" class="toggle-btn">공개 (전사공개)</v-btn>
              <v-btn value="N" variant="text" class="toggle-btn">비공개 (관련자공개)</v-btn>
            </v-btn-toggle>
          </div>
        </v-col>
        <v-col style="visibility: hidden;" aria-hidden="true" />
        <v-col style="visibility: hidden;" aria-hidden="true" />
        <v-col style="visibility: hidden;" aria-hidden="true" />
      </v-row>

      <!-- 요약정보 -->
      <v-row no-gutters class="mb-4">
        <v-col>
          <div class="field-item">
            <span class="field-label required">요약정보</span>
            <v-textarea
              v-model="modelValue.bizInfo.bizResultSummary"
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
              v-model="modelValue.bizInfo.bizConResult"
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

      <!-- PM -->
      <v-row no-gutters class="ga-6 mb-4">
        <v-col>
          <div class="field-item">
            <span class="field-label">PM</span>
            <EmpSearchField
              v-model="modelValue.bizInfo.pmEmpno"
              :display-name="modelValue.bizInfo.pmName"
              variant="outlined"
              density="compact"
              :disabled="isCompleted"
              @select="e => modelValue.bizInfo.pmName = e.empName"
            />
          </div>
        </v-col>
        <v-col style="visibility: hidden;" aria-hidden="true" />
        <v-col style="visibility: hidden;" aria-hidden="true" />
        <v-col style="visibility: hidden;" aria-hidden="true" />
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

      <!-- 결재정보 -->
      <v-row no-gutters class="mb-4">
        <v-col>
          <div class="field-item">
            <span class="field-label">결재정보</span>
            <div class="text-body-2 text-grey">— 준비 중 —</div>
          </div>
        </v-col>
      </v-row>

      <!-- 저장 -->
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
import { ref, watch, inject } from 'vue';
import EmpSearchField from '@/components/EmpSearchField.vue';

const isCompleted = inject('isCompleted', false);

const props = defineProps({
  bizId: String,
  modelValue: Object,
});

const emit = defineEmits(['save']);
const form = ref(null);
const infoDisclosureError = ref(false);

watch(() => props.modelValue?.bizInfo?.infoDisclosure, (val) => {
  if (val) infoDisclosureError.value = false;
});

const handleSave = async () => {
  infoDisclosureError.value = !props.modelValue?.bizInfo?.infoDisclosure;
  const { valid } = await form.value.validate();
  if (!valid || infoDisclosureError.value) return;
  emit('save');
};
</script>

