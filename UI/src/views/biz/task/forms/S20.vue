<template>

  <!-- 메인 컨텐츠 영역 -->
  <div class="mx-2 flex-grow-1">

    <!-- 탭 버튼 영역 (입수정보 분석 / 사업정보 기초분석 / 상대국 평가) -->
    <!-- readonly: false 강제 지정 — 탭 버튼은 isCompleted 여부와 무관하게 항상 클릭 가능 -->
    <v-defaults-provider :defaults="{ global: { readonly: false } }">
      <div class="d-flex my-2 ga-1">
        <v-btn
          v-for="btn in filteredTabs"
          :key="btn.key"
          variant="flat"
          :class="{ 'is-active': activeTab === btn.key }"
          @click="activeTab = btn.key"
        >
          {{ btn.title }}
        </v-btn>
      </div>
    </v-defaults-provider>

    <!-- 입수정보 분석 -->
    <!-- ref: handleSave에서 validate() 호출용 -->
    <InfoAnalysis
      ref="infoAnalysisRef"
      v-show="activeTab === 'info'"
      :biz-id="bizId"
      v-model="model"
    />

    <!-- 사업정보 기초분석 -->
    <BasicAnalysis
      v-show="activeTab === 'basic'"
      :biz-id="bizId"
      v-model="model"
    />

    <!-- 상대국 평가 (nationCode가 KR이면 탭 자체가 숨겨짐) -->
    <CountryEval
      v-show="activeTab === 'country'"
      :biz-id="bizId"
      v-model="model"
    />

    <!-- 저장 버튼 (완료 상태에서는 숨김) -->
    <v-row no-gutters class="d-flex justify-end align-center flex-grow-0">
      <div class="d-flex ga-1 mb-2">
        <v-btn v-if="!isCompleted" variant="flat" text="저장" @click="handleSave"/>
      </div>
    </v-row>

  </div>
  <!-- 메인 컨텐츠 영역 끝 -->

</template>

<script setup>
// ============================================================
// [1] Vue / 플러그인 임포트
// ============================================================
import { ref, computed, inject } from 'vue';
import { useBizBreadcrumb } from '@/composables/useBizBreadcrumb.js';

// ============================================================
// [2] 자식 컴포넌트 임포트
// ============================================================
import InfoAnalysis from './s20/InfoAnalysis.vue';     // 입수정보 분석
import BasicAnalysis from './s20/BasicAnalysis.vue';   // 사업정보 기초분석
import CountryEval from './s20/CountryEval.vue';       // 상대국 평가

// ============================================================
// [3] Props / Emits / Model
// ============================================================
const props = defineProps({ bizId: { type: String } });
const emit = defineEmits(['save']);
const model = defineModel();

// ============================================================
// [4] 읽기전용 상태 (부모 TaskDetail에서 주입)
// ============================================================
// isCompleted: 현재 태스크가 이미 완료(Y) 상태이면 true → 저장 버튼 숨김
const isCompleted = inject('isCompleted', false);

// ============================================================
// [5] 브레드크럼
// ============================================================
useBizBreadcrumb('입수정보분석');

// ============================================================
// [6] 탭 상태
// ============================================================
const activeTab = ref('info');

const tabButtons = [
  { title: '입수정보 분석',    key: 'info' },
  { title: '사업정보 기초분석', key: 'basic' },
  { title: '상대국 평가',      key: 'country' },
];

// 국내 사업(nationCode === 'KR')이면 상대국 평가 탭 제외
const filteredTabs = computed(() => {
  return tabButtons.filter(btn => {
    if (model.value?.nationCode === 'KR' && btn.key === 'country') return false;
    return true;
  });
});

// ============================================================
// [7] 폼 유효성 검증 / 저장
// ============================================================
const infoAnalysisRef = ref(null);

// 입수정보 분석 유효성 검증 통과 시 부모에게 save 이벤트 전달
const handleSave = async () => {
  if (!await infoAnalysisRef.value?.validate()) return;
  emit('save');
};
</script>

<style scoped lang="scss">
</style>
