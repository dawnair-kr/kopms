<template>
  <v-container class="main-page-wrapper" style="overflow-y: auto;">
    <v-defaults-provider :defaults="{ global: { readonly: isCompleted } }">
      <v-form class="flex-grow-1">
        <component
          :is="currentComponent"
          v-if="currentComponent"
          :biz-id="bizId"
          v-model="pageData"
          :task-code="taskCode"
          @save="saveData"
          @fetch-version="v => getBizData(false, v)"
        />
        <div v-else class="pa-4">
          존재하지 않는 태스크입니다. ({{ taskCode }})
        </div>
      </v-form>
      <v-row v-if="hasActionButtons" no-gutters class="d-flex justify-end pa-2 align-center flex-grow-0 bg-blue-lighten-4">
        <div class="d-flex ga-1">
          <v-btn v-if="taskCode === 'S10' && !isCompleted" variant="flat" text="삭제" @click="deleteData"/>
          <v-btn v-if="taskCode !== 'S10' && !isCompleted" variant="flat" text="생략" @click="skipStep"/>
          <v-btn v-if="showCloseBtn" variant="flat" text="종결" @click="closeStep"/>
          <v-btn v-if="taskCode !== 'S10' && showHoldBtn" variant="flat" text="유보" @click="holdStep"/>
          <v-btn v-if="isCurrentStep" variant="flat" :text="taskCode == 'D70' ? '완료' : '진행'" @click="nextStep"/>
        </div>
      </v-row>
    </v-defaults-provider>
  </v-container>
</template>

<script setup>
// ============================================================
// [1] Vue / 플러그인 임포트
// ============================================================
import { ref, computed, watch, defineAsyncComponent, getCurrentInstance, provide } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/store/user.js';
import { useSelectMenuStore } from '@/store/selectMenuStore.js';
import { useDialog } from '@/plugins/dialogHelp';
import { cloneDeep, isEqual } from 'lodash';

// ============================================================
// [2] 스토어 / 글로벌 도구
// ============================================================
const { proxy } = getCurrentInstance();   // $br_trans 등 글로벌 메서드 접근용
const route = useRoute();
const router = useRouter();
const dialog = useDialog();               // confirm / message 다이얼로그
const userStore = useUserStore();
const userInfo = userStore.getUserInfo(); // 로그인 사용자 정보 (작성자, 부서 등)
const selectMenuStore = useSelectMenuStore();

// 메뉴 menuNo → 사업구분 areaCode 매핑 (BizList와 동일 기준)
const AREA_CODE_MAP = {
  '2200': 'RE',  // 재생에너지
  '3200': 'NE',  // 신에너지
  '4200': 'OB',  // 해외사업
};

// ============================================================
// [3] 라우트 파라미터 / 상태 데이터
// ============================================================
const taskCode = computed(() => route.params.taskCode); // 현재 태스크 코드 (S10, D30 등)
const bizId = computed(() => route.query.bizId);        // 수정 모드: 기존 사업 ID (없으면 신규)
const menuCode = computed(() => selectMenuStore.selectMenuInfo?.menuCode); // 메뉴코드 (MASTER_NO 채번 prefix)

const pageData = ref({ bizInfo: {} }); // 폼에 바인딩되는 편집용 데이터
const dbData = ref({ bizInfo: {} });   // DB 저장 직후 스냅샷 (nextStep 필수 필드 검증에 사용)
const dataLoaded = ref(false);         // 데이터 로딩 완료 여부 (로딩 중 버튼 행 표시 방지)

// ============================================================
// [4] 읽기전용 상태 (자식 컴포넌트에 provide)
// ============================================================
// 자식 폼 전체 비활성화 조건:
// 1. 신규 등록(bizId 없음): 항상 편집 가능
// 2. 사업 자체가 종결(3)/완료(10) 상태인 경우: 전체 readonly
// 3. 현재 단계(proStep)가 이 화면의 taskCode와 다른 경우: readonly (과거/미래 단계)
// 4. 현재 단계이지만 이미 완료/생략/종결(Y/S/T)된 경우: readonly

// 사업 전체 종결/완료 여부 (proState 3: 종결, 10: 완료)
const isBizClosed = computed(() =>
  ['3', '10'].includes(String(pageData.value?.proState))
);
provide('isBizClosed', isBizClosed);

const isCompleted = computed(() => {
  if (!bizId.value) return false;
  if (isBizClosed.value) return true;
  if (dataLoaded.value && pageData.value?.proStep !== taskCode.value) return true;
  return dbData.value?.proSteps?.some(
    s => typeof s === 'object' &&
    s.taskCode === taskCode.value &&
    (s.taskStatus === 'Y' || s.taskStatus === 'S' || s.taskStatus === 'T'))
    ?? false;
});
provide('isCompleted', isCompleted);

// ============================================================
// [4-1] 버튼 visible 조건
// ============================================================
// proState 코드표 (TABLE: BIZ_MASTER)
//   '1'  진행    : 정상 진행 상태, 모든 액션 버튼 활성
//   '2'  유보    : 진행 보류 상태, 유보 버튼만 숨김 (재-유보 방지)
//   '3'  종결    : 사업 종결 상태, 버튼 행 전체 숨김
//   '10' 완료    : 사업 최종 완료 상태, 버튼 행 전체 숨김
//
// taskStatus 코드표 (TABLE: BIZ_PORTAL)
//   'Y'  작성완료 : 해당 단계 완료 → 읽기전용, 진행/생략/유보/종결 버튼 숨김
//   'S'  생략     : 해당 단계 생략 → 읽기전용
//   'T'  종결     : 해당 단계 종결 처리됨 → 읽기전용
//   'N'  미작성   : 작성 가능 상태
//   'H'  유보     : 유보 상태, 종결 가능
//   null 해당없음 : 선택되지 않은 절차 (포털에서 접근 불가)

// 현재 단계(proStep)가 화면의 taskCode와 일치할 때만 true
// → false이면 과거/미래 단계 조회 화면이므로 액션 버튼 불필요
const isCurrentStep = computed(() => pageData.value?.proStep === taskCode.value);

// 버튼 행(생략/유보/종결/진행) 표시 여부
//   - 데이터 로딩 완료 후에만 표시 (로딩 중 깜빡임 방지)
//   - 현재 단계(isCurrentStep)일 때만 표시
//   - proState '3'(종결) / '10'(완료) 상태에서는 더 이상 액션 불필요하므로 숨김
const hasActionButtons = computed(() =>
  dataLoaded.value &&
  isCurrentStep.value &&
  pageData.value?.proState !== '3' &&
  pageData.value?.proState !== '10'
);

// 종결 버튼 표시 여부
//   - S10(사업등록) 화면: isCompleted(taskStatus Y/S/T)가 아닐 때만 표시
//     → S10은 proStep과 무관하게 항상 접근 가능하므로 별도 조건 사용
//   - 그 외 단계: proState가 완료('10')가 아니고 현재 단계일 때 표시
//     → proState '3'(종결) 조건은 hasActionButtons에서 행 자체를 숨기므로 여기선 생략
const showCloseBtn = computed(() =>
  taskCode.value === 'S10'
    ? !isCompleted.value
    : pageData.value?.proState !== '10' && isCurrentStep.value
);

// 유보 버튼 표시 여부
//   - isCompleted(taskStatus Y/S/T)이면 이미 처리된 단계이므로 숨김
//   - proState '2'(유보) 상태에서는 이미 유보 처리됐으므로 재-유보 방지를 위해 숨김
const showHoldBtn = computed(() => !isCompleted.value && pageData.value?.proState !== '2');

// ============================================================
// [5] 데이터 조회 (getBizData)
// ============================================================
const getBizData = (silent = false, version = null) => {
  console.log('getBizData called'); // ← 이거 추가
  if (!bizId.value || !taskCode.value) {
    // 신규 등록: 로그인 사용자 정보로 초기 구조 설정
    pageData.value = {
      deptNo:      userInfo.deptno,
      deptName:    userInfo?.deptName || '',
      posName:     userInfo?.posName || '',
      writerName:  userInfo?.name || '',
      proState:    '1',
      proSteps:    [taskCode.value],
      areaCode:    AREA_CODE_MAP[selectMenuStore.selectMenuInfo?.menuNo] ?? '',
      bizInfo:     {},
      consortium:  [],
    };
    return;
  }

  // 수정 모드: 서버에서 사업 데이터 로드
  const inputData = {
    masterNo:    bizId.value,
    currentStep: taskCode.value,
    ...(version != null && { version }),
  };

  proxy.$br_trans([{
    url: '/kopms-api/biz/getBizData',
    method: 'post',
    data: inputData,
    isWait: !silent,  // silent 모드: 저장/처리 후 재조회 시 로딩 오버레이 생략
  }], (url, code, msg, data) => {
    if (code < 0) return;
    console.log("data :::: ", data);
    pageData.value = cloneDeep({
      ...data,
      bizInfo: data?.bizInfo ?? {},
      // 버전 조회 시 응답에 versionList가 없으므로 기존 값 유지
      ...(version != null && { versionList: pageData.value?.versionList }),
    });
    // dbData는 폼 편집에 영향받지 않는 저장 스냅샷 (pageData와 참조 완전 분리)
    // 버전 조회 시에는 dbData를 갱신하지 않음 (변경 감지 기준점 유지)
    if (version == null) {
      dbData.value = cloneDeep({ ...data, bizInfo: data?.bizInfo ?? {} });
    }
    dataLoaded.value = true;
    console.log("pageData.value :::: ", pageData.value);
  });
};

// ============================================================
// [6] 데이터 저장 (saveData)
// ============================================================

// null / undefined / "" 동일 취급, 모든 값이 null인 배열 항목(빈 레코드) 제거
const normalize = (v) => {
  if (v === null || v === undefined || v === '') return null;
  if (Array.isArray(v)) {
    return v
      .map(normalize)
      .filter(item =>
        !(item !== null && typeof item === 'object' && !Array.isArray(item) &&
          Object.values(item).every(val => val === null))
      );
  }
  if (typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, val]) => [k, normalize(val)]));
  return v;
};

// S10 화면에서만 히스토리 비교 (다른 화면은 bizInfo를 공유하지만 S10 전용 히스토리 테이블만 존재)
const isS10 = computed(() => taskCode.value?.startsWith('S10'));
const isBizChanged = computed(() => isS10.value && !isEqual(normalize(dbData.value.bizInfo),    normalize(pageData.value.bizInfo)));
const isConChanged = computed(() => isS10.value && !isEqual(normalize(dbData.value.consortium), normalize(pageData.value.consortium)));

const saveData = () => {
  const inputData = {
    ...pageData.value,
    currentStep: taskCode.value,
    menuCode: menuCode.value,
    ...(isS10.value && {
      oldBizInfo: dbData.value.bizInfo,
      oldConsortium: dbData.value.consortium || [],
      bizHistoryFlag: isBizChanged.value ? 'Y' : 'N',
      conHistoryFlag: isConChanged.value ? 'Y' : 'N',
    }),
  };

  console.log("inputData :::: ", inputData);

  proxy.$br_trans([{
    url: '/kopms-api/biz/setBizData',
    method: 'post',
    data: inputData,
  }], (url, code, msg, data) => {
    if (code < 0) return;
    dialog.message.success('저장되었습니다.');

    // 신규 등록: 반환된 masterNo로 URL 교체 후 재조회 (router.replace는 비동기)
    if (!bizId.value && data?.masterNo) {
      router.replace({
        name: 'TaskDetail',
        params: { taskCode: taskCode.value },
        query: { bizId: data.masterNo },
      }).then(() => getBizData(true));
      return;
    }

    getBizData(true);
  });
};

// ============================================================
// [6-1] 데이터 삭제 (deleteData)
// ============================================================
const deleteData = async () => {

  const inputData = {
    masterNo: bizId.value
  };

  const confirmed = await dialog.confirm({ title: '삭제', text: '삭제하시겠습니까?' });
  if (!confirmed) return;

  proxy.$br_trans([{
    url: '/kopms-api/biz/deleteBizData',
    method: 'post',
    data: inputData,
  }], (_url, code) => {
    if (code < 0) return;
    dialog.message.success('삭제되었습니다.');
    router.replace({ name: 'BizList' });
  });
};

// ============================================================
// [7] 단계 진행 (nextStep) - 필수 필드 검증 + setBizStep 호출
// ============================================================

// 각 태스크별 '진행' 버튼 클릭 전 DB 저장 필수 필드 목록
// top: pageData 최상위 필드, info: pageData.bizInfo 하위 필드
const REQUIRED_FIELDS_MAP = {
  S10: { top: ['bizTitle', 'bizSection', 'bizType', 'investType'], info: ['bizDate'] },
  S20: { info: ['infoSummary'] },
  S30: { info: ['bizSummary', 'bizResultSummary', 'bizConResult', 'proSummary'] },
  S40: { info: ['bizReason', 'bizScore'] },
  S50: { info: ['selectSummary', 'resultSummary', 'convResult', 'selectContents'] },
  D10: { info: ['bizSummary', 'tfSummary'] },
  D20: { info: ['d2Summary'] },
  D30: { info: ['riskSummary', 'riskContents', 'riskResultSummary', 'riskSum', 'standardRate'] },
  D35: { info: ['riskManagerSummary', 'managerResultSummary', 'managerAppResult'] },
  D40: { info: ['tenderSummary', 'submitSummary'] },
  D50: { info: ['managerSummary', 'successSummary', 'successResult'] },
  D60: { info: ['managerSummary', 'submitSummary'] },
  D70: { info: ['contractSummary'] },
};

// 미완료(Y, S 제외) 단계 목록에서 다음 단계 코드 반환
const getNextTaskCode = () => {
  const steps = (dbData.value.proSteps || []).filter(s => s.taskStatus !== 'Y' && s.taskStatus !== 'S');
  const currentIndex = steps.findIndex(s => s.taskCode === pageData.value.proStep);
  return steps[currentIndex + 1]?.taskCode ?? null;
};

const nextStep = async () => {
  // 1. 필수 필드가 DB에 저장됐는지 확인 (dbData 기준)
  const requiredSpec = REQUIRED_FIELDS_MAP[taskCode.value];
  if (requiredSpec) {
    const topMissing  = (requiredSpec.top  || []).some(f => !dbData.value[f]);
    const infoMissing = (requiredSpec.info || []).some(f => !dbData.value?.bizInfo?.[f]);
    if (topMissing || infoMissing) {
      dialog.message.warning('필수 입력 항목을 저장한 후 진행해주세요.');
      return;
    }
  }

  // 2. 다음 단계 코드 추출 (D70 제외 — 최종 단계는 nextTaskCode 불필요)
  const currentStep = pageData.value.proStep;
  const nextTaskCode = getNextTaskCode();

  if (taskCode.value !== 'D70' && !nextTaskCode) {
    dialog.message.warning('다음 단계가 없거나 진행 단계가 선택되지 않았습니다.\n절차 정보를 저장한 뒤 다시 시도해주세요.', { timeout: 4000 });
    return;
  }

  // 3. 사용자 진행/완료 확인 다이얼로그
  const label = taskCode.value === 'D70' ? '완료' : '진행';
  const confirmed = await dialog.confirm({ title: label, text: `${label}하시겠습니까?` });
  if (!confirmed) return;

  // 4-A. D70(최종 단계): proState를 '10'(완료)으로 변경
  if (taskCode.value === 'D70') {
    proxy.$br_trans([{
      url: '/kopms-api/biz/setBizStep',
      method: 'post',
      data: {
        masterNo:   bizId.value,
        proStep:    currentStep,
        proState:   '10',       // 전체 사업 완료 상태
        taskCode:   currentStep,
        taskType:   '109',
        taskStatus: 'Y',
      },
    }], (_url, code) => {
      if (code < 0) return;
      dialog.message.success('완료되었습니다.');
      getBizData(true);
    });
    return;
  }

  // 4-B. 일반 진행: 현재 단계 완료 처리 후 다음 태스크 화면으로 이동
  proxy.$br_trans([{
    url: '/kopms-api/biz/setBizStep',
    method: 'post',
    data: {
      masterNo:   bizId.value,
      proStep:    nextTaskCode, // 다음 단계로 proStep 변경
      proState:   '1',
      taskCode:   currentStep,
      taskType:   '109',
      taskStatus: 'Y',          // 현재 단계 완료 마킹
    },
  }], (_url, code) => {
    if (code < 0) return;
    router.push({
      name: 'TaskDetail',
      params: { taskCode: nextTaskCode },
      query: { bizId: bizId.value },
    }).catch(err => console.error('router.push 오류:', err));
  });
};

// ============================================================
// [7-1] 생략 - 현재 단계를 건너뛰고 다음 단계로 이동 (proState 유지 '1')
// ============================================================
const skipStep = async () => {
  const nextTaskCode = getNextTaskCode();
  if (!nextTaskCode) {
    dialog.message.warning('다음 단계가 없습니다.');
    return;
  }

  const confirmed = await dialog.confirm({ title: '생략', text: '현재 단계를 생략하시겠습니까?' });
  if (!confirmed) return;

  proxy.$br_trans([{
    url: '/kopms-api/biz/setBizStep',
    method: 'post',
    data: {
      masterNo:   bizId.value,
      proStep:    nextTaskCode,           // 다음 단계로 이동
      proState:   '1',                    // 진행 유지
      taskCode:   pageData.value.proStep,
      taskType:   '109',
      taskStatus: 'S',                    // ※ 생략 코드 - Skip
    },
  }], (_url, code) => {
    if (code < 0) return;
    router.push({
      name:   'TaskDetail',
      params: { taskCode: nextTaskCode },
      query:  { bizId: bizId.value },
    }).catch(err => console.error('router.push 오류:', err));
  });
};

// ============================================================
// [7-2] 유보 - 현재 단계 유지, 사업 상태를 '2'(유보)로 변경
// ============================================================
const holdStep = async () => {
  const confirmed = await dialog.confirm({ title: '유보', text: '유보 처리하시겠습니까?' });
  if (!confirmed) return;

  proxy.$br_trans([{
    url: '/kopms-api/biz/setBizStep',
    method: 'post',
    data: {
      masterNo:   bizId.value,
      proStep:    pageData.value.proStep, // 단계 이동 없음
      proState:   '2',                    // 유보
      taskCode:   pageData.value.proStep,
      taskType:   '109',
      taskStatus: 'H',                    // ※ 유보 코드 - Hold
    },
  }], (_url, code) => {
    if (code < 0) return;
    dialog.message.success('유보 처리되었습니다.');
    getBizData(true);
  });
};

// ============================================================
// [7-3] 종결 - 현재 단계 유지, 사업 상태를 '3'(종결)로 변경
// ============================================================
const closeStep = async () => {
  const confirmed = await dialog.confirm({ title: '종결', text: '종결 처리하시겠습니까?' });
  if (!confirmed) return;

  // 미진행(N) 또는 유보(H) 상태인 나머지 절차 일괄 종결 처리 (현재 단계는 taskCode로 별도 처리)
  const remainingSteps = (dbData.value.proSteps || [])
    .filter(s => typeof s === 'object' && (s.taskStatus === 'N' || s.taskStatus === 'H') && s.taskCode !== pageData.value.proStep)
    .map(s => s.taskCode);

  proxy.$br_trans([{
    url: '/kopms-api/biz/setBizStep',
    method: 'post',
    data: {
      masterNo:       bizId.value,
      proStep:        pageData.value.proStep, // 단계 이동 없음
      proState:       '3',                    // 종결
      taskCode:       pageData.value.proStep,
      taskType:       '109',
      taskStatus:     'T',                    // ※ 종결 코드 - Terminate
      remainingSteps,                         // 나머지 N 상태 절차 일괄 종결
    },
  }], (_url, code) => {
    if (code < 0) return;
    dialog.message.success('종결 처리되었습니다.');
    getBizData(true);
  });
};

// ============================================================
// [8] 태스크 컴포넌트 레지스트리
// ============================================================
// taskCode → 해당 폼 컴포넌트 매핑 (새 태스크 추가 시 여기에만 한 줄 추가)
const taskComponents = {
  // 사업발굴
  S10: defineAsyncComponent(() => import('./forms/S10.vue')),
  S20: defineAsyncComponent(() => import('./forms/S20.vue')),
  S30: defineAsyncComponent(() => import('./forms/S30.vue')),
  S40: defineAsyncComponent(() => import('./forms/S40.vue')),
  S50: defineAsyncComponent(() => import('./forms/S50.vue')),
  // 사업개발
  D10: defineAsyncComponent(() => import('./forms/D10.vue')),
  D20: defineAsyncComponent(() => import('./forms/D20.vue')),
  D30: defineAsyncComponent(() => import('./forms/D30.vue')),
  D35: defineAsyncComponent(() => import('./forms/D35.vue')),
  D40: defineAsyncComponent(() => import('./forms/D40.vue')),
  D50: defineAsyncComponent(() => import('./forms/D50.vue')),
  D60: defineAsyncComponent(() => import('./forms/D60.vue')),
  D70: defineAsyncComponent(() => import('./forms/D70.vue')),
};

// taskCode가 바뀌면 자동으로 해당 컴포넌트로 교체 (없으면 null → template의 v-else 표시)
const currentComponent = computed(() => taskComponents[taskCode.value] ?? null);

// ============================================================
// [9] 생명주기
// ============================================================
// taskCode 변경 시(라우터 이동) 데이터 초기화 후 재조회 (immediate: true로 onMounted 대체)
watch(taskCode, () => {
  dataLoaded.value = false;
  pageData.value = { bizInfo: {} };
  getBizData();
}, { immediate: true });

// S10 신규 등록 시 breadcrumb 설정
const MENU_NO_TO_AREA_NAME = {
  '2200': '재생에너지사업',
  '3200': '신에너지사업',
  '4200': '해외사업',
};

const syncBreadcrumb = () => {
  if (taskCode.value !== 'S10' || bizId.value) return;
  if (!selectMenuStore.selectMenuInfo) return;
  const basePath = MENU_NO_TO_AREA_NAME[selectMenuStore.selectMenuInfo?.menuNo] ?? '';
  selectMenuStore.setMenuName('사업정보등록');
  selectMenuStore.setMenuPath(basePath ? `${basePath} > 사업정보등록` : '사업정보등록');
  selectMenuStore.setMenuIcon('mdi-file-document-plus-outline');
};

watch(
  [() => selectMenuStore.selectMenuInfo, taskCode, bizId],
  syncBreadcrumb,
  { immediate: true }
);
</script>
