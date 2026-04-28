<template>
  <v-form ref="form">

    <!-- 요약정보 -->
    <v-sheet rounded="lg" class="pa-4 mb-3 form-card">
      <div class="form-section-header mb-3">
        <div class="d-flex align-center" style="gap: 8px;">
          <div class="section-bar" />
          <span>요약정보</span>
        </div>
      </div>
      <div class="field-item">
        <span class="field-label required">요약정보</span>
        <v-textarea
          v-model="modelValue.bizInfo.infoSummary"
          variant="outlined"
          density="compact"
          rows="4"
          no-resize
          hide-details="auto"
          :readonly="isCompleted"
          :disabled="isCompleted"
          :rules="isCompleted ? [] : [v => !!v || '필수입력항목 입니다.']"
        />
      </div>
    </v-sheet>

    <!-- 기초분석 평가점수 -->
    <v-sheet rounded="lg" class="pa-4 mb-3 form-card">
      <div class="form-section-header mb-3">
        <div class="d-flex align-center" style="gap: 8px;">
          <div class="section-bar" />
          <span>기초분석 평가점수</span>
        </div>
      </div>
      <v-row no-gutters class="ga-6 mb-4">
        <v-col>
          <div class="field-item">
            <span class="field-label">환산점수</span>
            <v-text-field
              v-model="modelValue.bizInfo.basicTotalSum"
              variant="outlined"
              density="compact"
              hide-details
              :readonly="isCompleted"
              :disabled="isCompleted"
            />
          </div>
        </v-col>
        <v-col style="visibility: hidden;" aria-hidden="true"/>
        <v-col style="visibility: hidden;" aria-hidden="true"/>
        <v-col style="visibility: hidden;" aria-hidden="true"/>
      </v-row>
      <v-row no-gutters class="ga-6 mb-4">
        <v-col>
          <div class="field-item">
            <span class="field-label">사업신뢰도 획득점수</span>
            <v-text-field
              v-model="modelValue.bizInfo.trustScore"
              variant="outlined"
              density="compact"
              hide-details
              :readonly="isCompleted"
              :disabled="isCompleted"
            />
          </div>
        </v-col>
        <v-col>
          <div class="field-item">
            <span class="field-label">사업신뢰도 평가총점</span>
            <v-text-field
              v-model="modelValue.bizInfo.trustScoreSum"
              variant="outlined"
              density="compact"
              hide-details
              :readonly="isCompleted"
              :disabled="isCompleted"
            />
          </div>
        </v-col>
        <v-col style="visibility: hidden;" aria-hidden="true"/>
        <v-col style="visibility: hidden;" aria-hidden="true"/>
      </v-row>
      <v-row no-gutters class="ga-6">
        <v-col>
          <div class="field-item">
            <span class="field-label">수주가능성 획득점수</span>
            <v-text-field
              v-model="modelValue.bizInfo.possScore"
              variant="outlined"
              density="compact"
              hide-details
              :readonly="isCompleted"
              :disabled="isCompleted"
            />
          </div>
        </v-col>
        <v-col>
          <div class="field-item">
            <span class="field-label">수주가능성 평가총점</span>
            <v-text-field
              v-model="modelValue.bizInfo.possScoreSum"
              variant="outlined"
              density="compact"
              hide-details
              :readonly="isCompleted"
              :disabled="isCompleted"
            />
          </div>
        </v-col>
        <v-col style="visibility: hidden;" aria-hidden="true"/>
        <v-col style="visibility: hidden;" aria-hidden="true"/>
      </v-row>
    </v-sheet>

    <!-- 사업대상국 종합평가 -->
    <v-sheet rounded="lg" class="pa-4 mb-3 form-card">
      <div class="form-section-header mb-3">
        <div class="d-flex align-center" style="gap: 8px;">
          <div class="section-bar" />
          <span>사업대상국 종합평가</span>
        </div>
      </div>
      <v-row no-gutters class="ga-6 mb-4">
        <v-col>
          <div class="field-item">
            <span class="field-label">평가등급</span>
            <v-text-field
              v-model="modelValue.bizInfo.totalSelect"
              variant="outlined"
              density="compact"
              hide-details
              :readonly="isCompleted"
              :disabled="isCompleted"
            />
          </div>
        </v-col>
        <v-col style="visibility: hidden;" aria-hidden="true"/>
        <v-col style="visibility: hidden;" aria-hidden="true"/>
        <v-col style="visibility: hidden;" aria-hidden="true"/>
      </v-row>
      <div class="field-item">
        <span class="field-label">종합의견</span>
        <v-textarea
          v-model="modelValue.bizInfo.totalTxt"
          variant="outlined"
          density="compact"
          rows="3"
          no-resize
          hide-details
          :readonly="isCompleted"
          :disabled="isCompleted"
        />
      </div>
    </v-sheet>

    <!-- 기초분석 결과 -->
    <v-sheet rounded="lg" class="pa-4 mb-3 form-card">
      <div class="form-section-header mb-3">
        <div class="d-flex align-center" style="gap: 8px;">
          <div class="section-bar" />
          <span>기초분석 결과</span>
        </div>
      </div>
      <div class="field-item">
        <span class="field-label">결과 내용</span>
        <v-textarea
          v-model="modelValue.bizInfo.basicResult"
          variant="outlined"
          density="compact"
          rows="4"
          no-resize
          hide-details
          :readonly="isCompleted"
          :disabled="isCompleted"
        />
      </div>
    </v-sheet>

    <!-- 관련 파일 -->
    <v-sheet rounded="lg" class="pa-4 mb-3 form-card">
      <div class="form-section-header mb-3">
        <div class="d-flex align-center" style="gap: 8px;">
          <div class="section-bar" />
          <span>관련 파일</span>
        </div>
      </div>
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
    </v-sheet>

  </v-form>
</template>

<script setup>
// ============================================================
// [1] Vue 임포트
// ============================================================
import { ref, inject } from 'vue';

// ============================================================
// [2] Props / Emits
// ============================================================
defineProps({
  bizId: String,
  modelValue: Object,
});

// ============================================================
// [3] 읽기전용 상태 (부모 TaskDetail에서 주입)
// ============================================================
// isCompleted: 현재 태스크가 이미 완료(Y) 상태이면 true → 입력 비활성화
const isCompleted = inject('isCompleted', false);

// ============================================================
// [4] 폼 유효성 검증 (부모 S20.vue에서 validate() 호출)
// ============================================================
const form = ref(null);
const validate = async () => {
  const { valid } = await form.value.validate();
  return valid;
};
defineExpose({ validate });
</script>

<style scoped lang="scss">
// 전역 공통: .form-card, .form-section-header, .section-bar, .field-item, .field-label → settings.scss
</style>
