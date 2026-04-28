<template>
  <!-- 메인 컨텐츠 영역 -->
  <div class="mx-2 mt-2 flex-grow-1">

    <!-- 사업타당성 검증위원회 -->
    <v-form ref="formRisk">
      <v-sheet rounded="lg" class="pa-4 mb-3 form-card">
        <div class="form-section-header mb-3">
          <div class="d-flex align-center" style="gap: 8px;">
            <div class="section-bar" />
            <span>사업타당성 검증위원회</span>
          </div>
        </div>

        <!-- 위원구성 -->
        <div class="field-item mb-4">
          <span class="field-label required">위원구성</span>
          <v-textarea
            v-model="model.bizInfo.riskSummary"
            variant="outlined"
            density="compact"
            rows="3"
            no-resize
            hide-details="auto"
            :readonly="isCompleted"
            :rules="isCompleted ? [] : [v => !!v || '필수입력항목 입니다.']"
          />
        </div>

        <!-- 심의자료 요약 -->
        <div class="field-item mb-4">
          <span class="field-label required">심의자료 요약</span>
          <v-textarea
            v-model="model.bizInfo.riskContents"
            variant="outlined"
            density="compact"
            rows="3"
            no-resize
            hide-details="auto"
            :readonly="isCompleted"
            :rules="isCompleted ? [] : [v => !!v || '필수입력항목 입니다.']"
          />
        </div>

        <!-- 심의자료 업로드 -->
        <div class="field-item mb-4">
          <span class="field-label">심의자료 업로드</span>
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
            <v-btn variant="flat" text="저장" @click="handleSaveRisk"/>
          </div>
        </v-row>

      </v-sheet>
    </v-form>

    <!-- 리스크평가결과 -->
    <v-form ref="formResult">
      <v-sheet rounded="lg" class="pa-4 mb-3 form-card">
        <div class="form-section-header mb-3">
          <div class="d-flex align-center" style="gap: 8px;">
            <div class="section-bar" />
            <span>리스크평가결과</span>
          </div>
        </div>

        <!-- 요약정보 -->
        <div class="field-item mb-4">
          <span class="field-label required">요약정보</span>
          <v-textarea
            v-model="model.bizInfo.riskResultSummary"
            variant="outlined"
            density="compact"
            rows="3"
            no-resize
            hide-details="auto"
            :readonly="isCompleted"
            :rules="isCompleted ? [] : [v => !!v || '필수입력항목 입니다.']"
          />
        </div>

        <!-- 리스크평가 (추후 구현) -->
        <div class="field-item mb-4">
          <span class="field-label">리스크평가</span>
        </div>

        <!-- 리스크점수 / 기준수익률 -->
        <v-row no-gutters class="ga-6 mb-4">
          <v-col>
            <div class="field-item">
              <span class="field-label required">리스크점수</span>
              <BrNumberField
                v-model="model.bizInfo.riskSum"
                hide-details="auto"
                :readonly="isCompleted"
                :rules="isCompleted ? [] : [v => !!v || '필수입력항목 입니다.']"
              />
            </div>
          </v-col>
          <v-col>
            <div class="field-item">
              <!-- 기준수익률 라벨 + 참고파일 다운로드 링크 -->
              <div class="d-flex align-center ga-2">
                <span class="field-label required">기준수익률</span>
                <span class="text-blue text-caption font-weight-bold" style="cursor: pointer;">
                  기준수익률산출절차.hwp
                  <v-icon size="x-small" icon="mdi-content-save"/>
                </span>
              </div>
              <BrNumberField
                v-model="model.bizInfo.standardRate"
                allow-decimal
                hide-details="auto"
                :readonly="isCompleted"
                :rules="isCompleted ? [] : [v => !!v || '필수입력항목 입니다.']"
              />
            </div>
          </v-col>
          <v-col style="visibility: hidden;" aria-hidden="true"/>
          <v-col style="visibility: hidden;" aria-hidden="true"/>
        </v-row>

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
            <v-btn variant="flat" text="저장" @click="handleSaveResult"/>
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
// [2] 자식 컴포넌트 임포트
// ============================================================
import BrNumberField from '@/components/BrNumberField.jsx'; // 숫자 입력

// ============================================================
// [3] Props / Emits / Model
// ============================================================
const props = defineProps({
  bizId: { type: String },  // 수정 모드: 기존 사업 ID (없으면 신규 등록)
});
const emit = defineEmits(['save']);
const model = defineModel();

// ============================================================
// [5] 읽기전용 / 잠금 상태 (부모 TaskDetail에서 주입)
// ============================================================
// isCompleted: 현재 태스크가 이미 완료(Y) 상태이면 true
const isCompleted = inject('isCompleted', false);

// ============================================================
// [6] 폼 유효성 검증 / 저장
// ============================================================
const formRisk = ref(null);
const formResult = ref(null);

const handleSaveRisk = async () => {
  const { valid } = await formRisk.value.validate();
  if (!valid) return;
  saveSection('risk');
};
const handleSaveResult = async () => {
  const { valid } = await formResult.value.validate();
  if (!valid) return;
  saveSection('result');
};

const RISK_FIELDS = [
  'riskSummary', 'riskMethod', 'riskContents',
  'riskRegiDate', 'riskUpdateDate', 'riskFinishDate', 'riskState',
  'attachFileSeq1', 'mikepState1', 'approvalLink1',
];
const RESULT_FIELDS = [
  'riskResultSummary', 'riskSum', 'standardRate', 'riskMeetResult',
  'attachFileSeq2', 'resultRegiDate', 'resultUpdateDate', 'resultFinishDate',
  'riskCheckMethod', 'resultState', 'meetingTime', 'meetingPlace',
  'mikepState2', 'approvalLink2',
];
const ALL_FIELDS = [...RISK_FIELDS, ...RESULT_FIELDS];

const saveSection = (section, overrides = {}) => {
  const fieldMap = { risk: RISK_FIELDS, result: RESULT_FIELDS };
  const activeFields = fieldMap[section];

  const bizInfoPayload = {
    ...ALL_FIELDS.reduce((acc, key) => {
      acc[key] = activeFields.includes(key) ? model.value.bizInfo[key] : null;
      return acc;
    }, {}),
    bizOmitReason: null,
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
useBizBreadcrumb('입찰참여결정 - 리스크평가');
</script>
