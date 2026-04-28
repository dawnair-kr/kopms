<template>
  <!-- 메인 컨텐츠 영역 -->
  <div class="mx-2 mt-2 flex-grow-1">

    <!-- 계약체결 -->
    <v-form ref="form">
      <v-sheet rounded="lg" class="pa-4 mb-3 form-card">
        <div class="form-section-header mb-3">
          <div class="d-flex align-center" style="gap: 8px;">
            <div class="section-bar" />
            <span>계약체결</span>
          </div>
        </div>

        <!-- 요약정보 -->
        <div class="field-item mb-4">
          <span class="field-label required">요약정보</span>
          <v-textarea
            v-model="model.bizInfo.contractSummary"
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
            <v-btn variant="flat" text="저장" @click="handleSave"/>
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
import { ref, inject, getCurrentInstance } from 'vue';
import { useBizBreadcrumb } from '@/composables/useBizBreadcrumb';
import { useDialog } from '@/plugins/dialogHelp';

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
const form = ref(null);
const { proxy } = getCurrentInstance();
const dialog = useDialog();

const handleSave = async () => {
  const { valid } = await form.value.validate();
  if (!valid) return;
  emit('save');
};

const goNext = () => {
  const currentStep = savedData.value.proStep;
  const inputData = {
    masterNo: props.bizId,
    proStep: currentStep,
    proState: '10',
    taskCode: currentStep,
    taskType: '109',
    taskStatus: 'Y',
  };

  proxy.$br_trans([{
    url: '/kopms-api/biz/setBizStep',
    method: 'post',
    data: inputData,
  }], (_url, code) => {
    if (code < 0) return;
    dialog.message.success('완료되었습니다.');
  });
};

// ============================================================
// [9] 생명주기
// ============================================================
useBizBreadcrumb('계약체결');
</script>
