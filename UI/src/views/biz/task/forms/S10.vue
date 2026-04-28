<template>
    <!-- 메인 컨텐츠 영역 -->
    <!-- isBizClosed: 사업 종결(3)/완료(10) 시 보조 섹션(InfoProvider/Order/Consortium/ProgressStatus) 전체 readonly -->
    <v-defaults-provider :defaults="{ global: { readonly: isBizClosed } }">
      <div class="mx-2 flex-grow-1">

        <!-- 기본정보 영역-->
        <v-defaults-provider :defaults="{ global: { readonly: isCompleted } }">
          <BasicInfo
            ref="basicInfoRef"
            v-model="model"
            :codes="codes"
            :readonly="isCompleted"
            :version-list="versionList"
            v-model:selected-version="selectedVersion"
            class="mt-2"
          />
        </v-defaults-provider>

        <!-- Task 선택 영역 -->
        <TaskInfo v-model="model" :locked-steps="lockedProStepCodes" :locked-field-steps="lockedFieldTaskCodes" :biz-id="bizId"/>

        <!-- 사업개요 -->
        <ProjectOverview ref="projectOverviewRef" v-model="model" :codes="codes" :readonly="isCompleted"/>

        <!-- 사업 담당자 지정 -->
        <BizManager v-model="model" :readonly="isCompleted"/>

        <!-- 사업정보 입수경로 -->
        <v-expand-transition>
          <InfoProvider v-if="showStates.showIp" v-model="model" :readonly="isBizClosed" @collapse="showStates.showIp = false"/>
        </v-expand-transition>

        <!-- 발주처 -->
        <v-expand-transition>
          <Order v-if="showStates.showOrder" v-model="model" :readonly="isBizClosed" @collapse="showStates.showOrder = false"/>
        </v-expand-transition>

        <!-- 컨소시엄 -->
        <v-expand-transition>
          <Consortium v-if="showStates.showCon" v-model="model" :readonly="isBizClosed" @collapse="showStates.showCon = false"/>
        </v-expand-transition>

        <!-- 협약현황 -->
        <v-expand-transition>
          <ProgressStatus v-if="showStates.showPs" v-model="model" :readonly="isBizClosed" @collapse="showStates.showPs = false"/>
        </v-expand-transition>

        <!-- 접힌 섹션 카드 행 -->
        <v-row v-if="collapsedSections.length > 0" no-gutters class="ga-3 mb-2">
          <v-col v-for="btn in collapsedSections" :key="btn.key">
            <div class="section-collapse-card" @click="showStates[btn.key] = true">
              <div class="section-bar" />
              <span>{{ btn.title }}</span>
              <v-icon class="ml-auto" size="18">mdi-chevron-down</v-icon>
            </div>
          </v-col>
        </v-row>

        <!-- 변경내용 (수정 모드에서만 표시) -->
        <v-sheet v-if="bizId" rounded="lg" class="pa-4 mb-3 form-card">
          <div class="form-section-header mb-3">
            <div class="d-flex align-center" style="gap: 8px;">
              <div class="section-bar" />
              <span>변경내용</span>
            </div>
          </div>
          <v-textarea
            v-model="model.bizReason"
            variant="outlined"
            density="compact"
            rows="3"
            no-resize
            hide-details
          />
        </v-sheet>

        <!-- 푸터 영역 -->
        <v-row v-if="!isBizClosed" no-gutters class="d-flex my-2 justify-end align-center flex-grow-0">
          <div class="d-flex ga-1">
            <v-btn variant="flat" text="저장" :disabled="selectedVersion !== null" @click="handleSave"/>
            <v-btn variant="flat" text="결재" :disabled="selectedVersion !== null"/>
          </div>
        </v-row>
        <!-- 푸터 영역 끝 -->

      </div>
    </v-defaults-provider>
    <!-- 메인 컨텐츠 영역 끝 -->
</template>

<script setup>
// ============================================================
// [1] Vue / 플러그인 임포트
// ============================================================
import { ref, computed, watch, onMounted, getCurrentInstance, inject } from 'vue';
import { useSelectMenuStore } from '@/store/selectMenuStore.js';
import { useCommonCode } from '@/composables/useCommonCode';

// ============================================================
// [2] 자식 컴포넌트 임포트
// ============================================================
import BasicInfo from './s10/BasicInfo.vue';       // 기본정보
import TaskInfo from './s10/TaskInfo.vue';           // Task 선택
import InfoProvider from './s10/InfoProvider.vue';   // 사업정보 입수경로
import ProjectOverview from './s10/ProjectOverview.vue'; // 사업개요
import Order from './s10/Order.vue';                 // 발주처
import Consortium from './s10/Consortium.vue';       // 컨소시엄
import ProgressStatus from './s10/ProgressStatus.vue'; // 협약현황
import BizManager from './s10/BizManager.vue';         // 사업 담당자 지정

// ============================================================
// [3] Props / Emits / Model
// ============================================================
const model = defineModel();
const emit = defineEmits(['save', 'fetch-version']);

const props = defineProps({
  bizId: { type: String },    // 수정 모드: 기존 사업 ID (없으면 신규 등록)
  taskCode: { type: String }, // 현재 진행 중인 태스크 코드
});
const bizId = computed(() => props.bizId);

// ============================================================
// [4] 스토어 / 글로벌 도구
// ============================================================
const { proxy } = getCurrentInstance();
const selectMenuStore = useSelectMenuStore();
const codes = ref({});  // 공통코드 맵 (101~109 등)
const { loadCodes } = useCommonCode();

// ============================================================
// [5] 읽기전용 / 잠금 상태 (부모 TaskDetail에서 주입)
// ============================================================
// isCompleted: 현재 태스크가 이미 완료(Y) 상태이면 true
const isCompleted = inject('isCompleted');
// isBizClosed: 사업 전체가 종결(3)/완료(10) 상태이면 true → 보조 섹션 전체 readonly에 사용
const isBizClosed = inject('isBizClosed');

// lockedProStepCodes: 완료된 proStep 코드 목록 → TaskInfo에서 해당 단계 체크박스를 비활성화
// watch에서 proSteps를 string 배열로 변환하기 전에 원본 object 배열을 별도 보존
const originalProSteps = ref([]);
const lockedProStepCodes = computed(() =>
  originalProSteps.value
    .filter(s => typeof s === 'object' && ['W', 'Y', 'S', 'T', 'H'].includes(s.taskStatus))
    .map(s => s.taskCode)
);

// lockedFieldTaskCodes: 작성중(W)/완료(Y) 상태인 fieldColumns task 코드 목록 → TaskInfo에서 선택 해제 비활성화
const originalFieldTasks = ref([]);
const lockedFieldTaskCodes = computed(() =>
  originalFieldTasks.value
    .filter(s => typeof s === 'object' && ['W', 'Y'].includes(s.taskStatus))
    .map(s => s.taskCode)
);

// ============================================================
// [6] 폼 유효성 검증 / 저장
// ============================================================
const basicInfoRef = ref(null);
const projectOverviewRef = ref(null);

// 기본정보·사업개요 유효성 검증 통과 시 부모에게 save 이벤트 전달
const handleSave = async () => {
  if (!await basicInfoRef.value?.validate()) return;
  if (!await projectOverviewRef.value?.validate()) return;
  emit('save');
};

// ============================================================
// [7] 토글 섹션 (사업정보 입수경로 / 발주처 / 컨소시엄 / 협약현황)
// ============================================================
// 버튼 목록 – key는 showStates의 키와 1:1 대응
const toggleButtons = [
  { title: '사업정보 입수경로', key: 'showIp' },
  { title: '발주처',           key: 'showOrder' },
  { title: '컨소시엄',         key: 'showCon' },
  { title: '협약현황',         key: 'showPs' },
];

// 각 섹션의 펼침/접힘 상태
const showStates = ref({
  showIp:    false,
  showOrder: false,
  showCon:   false,
  showPs:    false,
});

// 접힌 섹션 목록 (카드 행에 표시)
const collapsedSections = computed(() => toggleButtons.filter(btn => !showStates.value[btn.key]));

// ============================================================
// [9] 버전 선택 드롭다운
// ============================================================
const selectedVersion = ref(null);
const versionList = computed(() => {
  const list = model.value?.versionList || [];
  return [
    { text: '현재', value: null },
    ...list.map(v => ({ text: `Ver. ${v.version}`, value: v.version })),
  ];
});
watch(selectedVersion, (v) => emit('fetch-version', v));

// ============================================================
// [10] 데이터 변환 Watch
// ============================================================
// 부모(TaskDetail)에서 내려오는 raw pageData의 proSteps 등이
// object array 형태일 경우 string array(코드 목록)로 변환
watch(model, (newVal) => {
  if (!newVal || Object.keys(newVal).filter(k => k !== 'bizInfo').length === 0) return;

  const toCodeList = (arr) => arr?.map(s => s.taskCode) ?? [];

  if (newVal.proSteps?.[0] && typeof newVal.proSteps[0] === 'object') {
    originalProSteps.value = newVal.proSteps;
    originalFieldTasks.value = [
      ...(newVal.service    || []),
      ...(newVal.license    || []),
      ...(newVal.publicTask || []),
      ...(newVal.spc        || []),
    ].filter(s => typeof s === 'object');
    model.value = {
      ...newVal,
      proSteps:   toCodeList(newVal.proSteps),
      service:    toCodeList(newVal.service),
      license:    toCodeList(newVal.license),
      publicTask: toCodeList(newVal.publicTask),
      spc:        toCodeList(newVal.spc),
    };

    // 데이터가 있는 섹션 자동 펼침
    const bi = newVal.bizInfo || {};
    showStates.value = {
      showIp:    (bi.informants?.length   > 0),
      showOrder: (bi.order?.length        > 0),
      showCon:   (newVal.consortium?.some(c =>
        c?.companyName || c?.ceoName || c?.comAddr || c?.comHomepage ||
        c?.comTel || c?.comHp || c?.comFax || c?.bizField || c?.bizStake
      )),
      showPs:    !!(bi.pactSelect || bi.teaserSelect || bi.loiSelect || bi.caSelect),
    };
  }
}, { immediate: true });

// ============================================================
// [11] 생명주기
// ============================================================
onMounted(async () => {
  // 공통코드(101~109 등) 로드
  const groupCodes = await loadCodes(['101','102','103','104','105','106','107','108','109','140','186', '187']);
  if (groupCodes['109']) {
    groupCodes['109'] = groupCodes['109'].filter(t => !['D80', 'D90'].includes(t.codeValue));
  }
  codes.value = groupCodes;

  // 브레드크럼 업데이트
  if (selectMenuStore) {
    const MENU_NO_TO_AREA = {
      '2200': '재생에너지사업',
      '3200': '신에너지사업',
      '4200': '해외사업',
    };
    const menuNo = selectMenuStore.selectMenuInfo?.menuNo;
    const areaName = MENU_NO_TO_AREA[menuNo];

    if (!props.bizId && areaName) {
      selectMenuStore.setMenuName('사업정보등록');
      selectMenuStore.setMenuPath(`${areaName} > 사업정보등록`);
    } else {
      const basePath = selectMenuStore.portalBasePath || areaName || '';
      selectMenuStore.setMenuName('사업정보입수');
      selectMenuStore.setMenuPath(basePath ? `${basePath} > 사업정보입수` : '사업정보입수');
    }
  }
});
</script>

<style scoped lang="scss">
.section-collapse-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 0 0 1px #cfd8dc, 0 0 8px 2px rgba(176, 190, 197, 0.5);
  font-size: 1rem;
  font-weight: 700;
  color: #1a237e;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.15s, box-shadow 0.15s;

  &:hover {
    background-color: #eef2ff;
    box-shadow: 0 0 0 1.5px #90a4d4, 0 0 10px 3px rgba(144, 164, 212, 0.4);

    .v-icon {
      color: #1565c0;
    }
  }

  .v-icon {
    color: #90a4ae;
    transition: color 0.15s;
  }
}
</style>
