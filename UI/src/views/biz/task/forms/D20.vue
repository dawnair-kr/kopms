<template>
  <v-form ref="form" class="mx-2 flex-grow-1">

    <v-sheet rounded="lg" class="pa-4 mt-2 mb-3 form-card">
      <div class="form-section-header mb-3">
        <div class="d-flex align-center" style="gap: 8px;">
          <div class="section-bar" />
          <span>입찰서/제안서 작성</span>
        </div>
      </div>

      <!-- 단계요약 -->
      <v-row no-gutters class="mb-4">
        <v-col>
          <div class="field-item">
            <span class="field-label required">단계요약</span>
            <v-textarea
              v-model="model.bizInfo.d2Summary"
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
import { useBizBreadcrumb } from '@/composables/useBizBreadcrumb.js';

const props = defineProps({ bizId: { type: String } });
const emit = defineEmits(['save']);
const isCompleted = inject('isCompleted', false);
const model = defineModel();
const form = ref(null);

useBizBreadcrumb('입찰서/제의서관리');

const handleSave = async () => {
  const { valid } = await form.value.validate();
  if (!valid) return;
  emit('save');
};
</script>
