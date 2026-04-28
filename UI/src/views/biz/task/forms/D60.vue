<template>
  <!-- 메인 컨텐츠 영역 -->
  <div class="mx-2 mt-2 flex-grow-1">

    <!-- 이사회승인 -->
    <v-form ref="formManager">
      <v-sheet rounded="lg" class="pa-4 mb-3 form-card">
        <div class="form-section-header mb-3">
          <div class="d-flex align-center" style="gap: 8px;">
            <div class="section-bar" />
            <span>이사회승인</span>
          </div>
        </div>

        <!-- 요약정보 -->
        <div class="field-item mb-4">
          <span class="field-label required">요약정보</span>
          <v-textarea
            v-model="model.bizInfo.managerSummary"
            variant="outlined"
            density="compact"
            rows="3"
            no-resize
            hide-details="auto"
            :readonly="isCompleted"
            :rules="isCompleted ? [] : [v => !!v || '필수입력항목 입니다.']"
          />
        </div>

        <!-- 관련파일 -->
        <div class="field-item mb-4">
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

        <!-- 저장/결재 버튼 -->
        <v-row v-if="!isCompleted" no-gutters class="d-flex justify-end align-center flex-grow-0">
          <div class="d-flex ga-1">
            <v-btn variant="flat" text="저장" @click="handleSaveManager"/>
            <v-btn variant="flat" text="결재"/>
          </div>
        </v-row>

      </v-sheet>
    </v-form>

    <!-- 법인설립및재원조달 -->
    <v-form ref="formSubmit">
      <v-sheet rounded="lg" class="pa-4 mb-3 form-card">
        <div class="form-section-header mb-3">
          <div class="d-flex align-center" style="gap: 8px;">
            <div class="section-bar" />
            <span>법인설립및재원조달</span>
          </div>
        </div>

        <!-- 요약정보 -->
        <div class="field-item mb-4">
          <span class="field-label required">요약정보</span>
          <v-textarea
            v-model="model.bizInfo.submitSummary"
            variant="outlined"
            density="compact"
            rows="3"
            no-resize
            hide-details="auto"
            :readonly="isCompleted"
            :rules="isCompleted ? [] : [v => !!v || '필수입력항목 입니다.']"
          />
        </div>

        <!-- 관련파일 -->
        <div class="field-item mb-4">
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

        <!-- 저장 버튼 -->
        <v-row v-if="!isCompleted" no-gutters class="d-flex justify-end align-center flex-grow-0">
          <div class="d-flex ga-1">
            <v-btn variant="flat" text="저장" @click="handleSaveSubmit"/>
          </div>
        </v-row>

      </v-sheet>
    </v-form>

  </div>
  <!-- 메인 컨텐츠 영역 끝 -->
</template>

<script setup>
// ============================================================
// [1] Vue / 플러그인 임포트
// ============================================================
import { ref, inject } from 'vue';
import { useBizBreadcrumb } from '@/composables/useBizBreadcrumb';

// ============================================================
// [3] Props / Emits / Model
// ============================================================
const props = defineProps({
  bizId: { type: String },
});
const emit = defineEmits(['save']);
const model = defineModel();

// ============================================================
// [5] 읽기전용 / 잠금 상태 (부모 TaskDetail에서 주입)
// ============================================================
const isCompleted = inject('isCompleted', false);

// ============================================================
// [6] 폼 유효성 검증 / 저장
// ============================================================
const formManager = ref(null);
const formSubmit = ref(null);

const handleSaveManager = async () => {
  const { valid } = await formManager.value.validate();
  if (!valid) return;
  saveSection('manager');
};
const handleSaveSubmit = async () => {
  const { valid } = await formSubmit.value.validate();
  if (!valid) return;
  saveSection('submit');
};

const MANAGER_FIELDS = [
  'managerSummary',
  'attachFileSeq1',
  'approvalLink',
  'managerRegiDate',
  'managerUpdateDate',
  'managerFinishDate',
  'managerState',
];
const SUBMIT_FIELDS = [
  'submitSummary',
  'attachFileSeq2',
  'submitRegiDate',
  'submitUpdateDate',
  'submitFinishDate',
  'submitState',
];
const ALL_FIELDS = [...MANAGER_FIELDS, ...SUBMIT_FIELDS];

const saveSection = (section, overrides = {}) => {
  const fieldMap = { manager: MANAGER_FIELDS, submit: SUBMIT_FIELDS };
  const activeFields = fieldMap[section];

  const bizInfoPayload = {
    ...ALL_FIELDS.reduce((acc, key) => {
      acc[key] = activeFields.includes(key) ? model.value.bizInfo[key] : null;
      return acc;
    }, {}),
    proState: null,
    bizOmitReason: null,
    mikepState1: null,
    approvalLink1: null,
    resultFinishDate: null,
    mikepDelState: null,
    approvalDelLink: null,
    mikepDocNo: null,
    ...overrides,
  };

  emit('save', { bizInfo: bizInfoPayload });
};

// ============================================================
// [9] 생명주기
// ============================================================
useBizBreadcrumb('법인설립및재원조달');
</script>
