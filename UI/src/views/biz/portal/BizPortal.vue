<template no-gutters>

  <v-container class="main-page-wrapper">

    <!-- 포털 바디 (헤더 + 카드 영역 통합) -->
    <div class="portal-body flex-grow-1 d-flex flex-column">

      <!-- 헤더: 타이틀 + 버튼 + 정렬 -->
      <div class="d-flex flex-column portal-toolbar pa-2">
        <div class="d-flex align-center toolbar-actions">
          <span class="portal-title">{{ bizInfoData.bizTitle }}</span>
          <!-- 범례 툴팁 아이콘 -->
          <span class="legend-tooltip-wrapper">
            <v-btn
              icon
              variant="text"
              size="x-small"
              :class="['legend-help-btn', { 'legend-help-btn--active': showLegend }]"
              @click="showLegend = !showLegend"
            >
              <v-icon size="22">mdi-help-circle-outline</v-icon>
            </v-btn>
            <div :class="['legend-tooltip-content', { 'legend-pinned': showLegend }]">
              <div class="legend-tooltip-title">진행상태</div>
              <div class="legend-chips-row">
                <div class="legend-mini-card legend-todo"><v-icon size="14">mdi-minus-circle-outline</v-icon><span>미작성</span></div>
                <div class="legend-mini-card legend-current"><v-icon size="14">mdi-progress-clock</v-icon><span>작성중</span></div>
                <div class="legend-mini-card legend-done"><v-icon size="14">mdi-check-circle</v-icon><span>작성완료</span></div>
                <div class="legend-mini-card legend-hold"><v-icon size="14">mdi-pause-circle</v-icon><span>유보</span></div>
                <div class="legend-mini-card legend-skip"><v-icon size="14">mdi-debug-step-over</v-icon><span>생략</span></div>
                <div class="legend-mini-card legend-closed"><v-icon size="14">mdi-close-circle</v-icon><span>종결</span></div>
              </div>
            </div>
          </span>
          <v-spacer />
          <v-btn
            class="mr-4"
            variant="flat"
            size="small"
            @click="openTaskCode"
          >
            TASK코드 관리
          </v-btn>
          <div class="d-flex align-center ga-1">
            <span class="toolbar-label mr-1">정렬기준</span>
            <v-btn-toggle v-model="sortType" mandatory density="compact" class="toggle-group">
              <v-btn value="start" variant="text" class="toggle-btn">시작일자</v-btn>
              <v-btn value="end" variant="text" class="toggle-btn">종료일자</v-btn>
            </v-btn-toggle>
          </div>
        </div>
      </div>

      <!-- 카테고리별 컬럼 영역 -->
      <v-row no-gutters class="flex-grow-1 pa-2 ga-2 portal-columns">

        <v-col
          v-for="category in categories"
          :key="category.name"
          class="category-col"
        >
        <!-- 카테고리 헤더 (1레벨) -->
        <div class="category-header">
          <span class="category-header-text">{{ category.name }}</span>
        </div>

        <!-- 태스크 카드 목록 -->
        <div class="d-flex flex-column pa-2 ga-2 task-list-scroll">
          <!-- 빈 컬럼 안내 -->
          <div v-if="category.tasks.length === 0" class="empty-column">
            <v-icon size="32" color="#cbd5e0">mdi-clipboard-text-off-outline</v-icon>
            <span>등록된 태스크가 없습니다</span>
          </div>

          <template v-for="task in category.tasks" :key="task.taskCode">

            <!-- 일반 카드 / 차수관리 자식 카드 공통 렌더링 함수용 컴포넌트 -->
            <div
              v-if="task.templateYn !== 'Y'"
              class="task-card"
              :class="getTaskClass(task)"
              @click="goTask(task, category.name)"
              @mousemove="isBlockedTask(task) && onMouseMove($event, getTaskTooltip(task))"
              @mouseleave="isBlockedTask(task) && hideMouseTooltip()"
            >
              <div class="task-title d-flex align-center justify-space-between ga-1">
                <div class="d-flex align-center ga-1">
                  <v-icon size="16" class="task-status-icon">{{ getTaskIcon(task) }}</v-icon>
                  <span>{{ task.taskName }}</span>
                </div>
                <span v-if="isCloseBadge(task)" class="close-badge">종결됨</span>
                <span v-else-if="isCurrentBadge(task)" class="current-badge" :style="currentBadgeStyle">{{ currentBadgeText }}</span>
              </div>
              <div v-if="task.prfStartDate || task.prfEndDate" class="task-dates">
                <span>{{ task.prfStartDate }}</span>
                <span>{{ task.prfEndDate }}</span>
              </div>
            </div>

            <!-- 차수관리 부모 + 자식 그룹 컨테이너 -->
            <template v-else>
              <v-expansion-panels
                v-model="expandedParents[task.taskType + '_' + task.taskCode]"
                class="task-parent-group"
                flat
              >
                <v-expansion-panel :value="true">
                  <!-- 부모 헤더 -->
                  <v-expansion-panel-title class="task-parent" hide-actions>
                    <div class="d-flex align-center ga-1 flex-grow-1 min-width-0">
                      <v-icon size="16" class="parent-chevron">
                        {{ expandedParents[task.taskType + '_' + task.taskCode] ? 'mdi-chevron-down' : 'mdi-chevron-right' }}
                      </v-icon>
                      <span>{{ task.taskName }}</span>
                      <span v-if="task._children.length > 0" class="parent-count-chip">{{ task._children.length }}</span>
                    </div>
                    <v-btn icon size="x-small" variant="flat" class="parent-add-btn" @click.stop="addChildTask(task, category.name)">
                      <v-icon size="16">mdi-plus</v-icon>
                    </v-btn>
                  </v-expansion-panel-title>

                  <!-- 자식 카드 목록 (애니메이션 펼침) -->
                  <v-expansion-panel-text class="task-children-list-wrap">
                    <div class="task-children-list">
                      <!-- 자식 없음 안내 -->
                      <div v-if="task._children.length === 0" class="task-children-empty">
                        <v-icon size="14" color="#aaa">mdi-information-outline</v-icon>
                        <span>등록된 차수가 없습니다</span>
                      </div>
                      <div
                        v-for="child in task._children"
                        :key="child.taskCode"
                        class="task-card task-child"
                        :class="getTaskClass(child)"
                        @click="goTask(child, category.name)"
                        @mousemove="isBlockedTask(child) && onMouseMove($event, getTaskTooltip(child))"
                        @mouseleave="isBlockedTask(child) && hideMouseTooltip()"
                      >
                        <div class="task-title d-flex align-center justify-space-between ga-1">
                          <div class="d-flex align-center ga-1">
                            <v-icon size="16" class="task-status-icon">{{ getTaskIcon(child) }}</v-icon>
                            <span>{{ child.taskName }}</span>
                          </div>
                          <div class="d-flex align-center ga-1">
                            <span v-if="isCloseBadge(child)" class="close-badge">종결됨</span>
                            <span v-else-if="isCurrentBadge(child)" class="current-badge" :style="currentBadgeStyle">{{ currentBadgeText }}</span>
                            <v-btn
                              v-if="isDeletableChild(child)"
                              icon size="x-small" variant="text"
                              class="child-delete-btn"
                              @click.stop="confirmDeleteChildTask(child)"
                            >
                              <v-icon size="14">mdi-trash-can-outline</v-icon>
                            </v-btn>
                          </div>
                        </div>
                        <div v-if="child.prfStartDate || child.prfEndDate" class="task-dates">
                          <span>{{ child.prfStartDate }}</span>
                          <span>{{ child.prfEndDate }}</span>
                        </div>
                      </div>
                    </div>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </template>

          </template>
        </div>
      </v-col>

      </v-row>

    </div>

  </v-container>

  <!-- 마우스 커서 추적 툴팁: fixed 포지션으로 커서 옆에 표시 (생략/종결 카드 hover 시) -->
  <div v-if="mouseTooltip.show" class="mouse-tooltip" :style="{ top: mouseTooltip.y + 'px', left: mouseTooltip.x + 'px' }">
    {{ mouseTooltip.text }}
  </div>

  <!-- 사이드 패널 오버레이 -->
  <div v-if="isPanelOpen" class="side-panel-overlay" @click="closePanel" />

  <!-- 사이드 패널: 용역/인허가/주민상생/SPC 태스크 디테일 -->
  <transition name="slide-panel">
    <div v-if="isPanelOpen && selectedTask" class="side-panel">
      <!-- 패널 헤더 -->
      <div class="side-panel-header">
        <v-btn icon variant="text" size="small" @click="closePanel">
          <v-icon size="28">mdi-chevron-right</v-icon>
        </v-btn>
        <span class="side-panel-code">{{ selectedCategory }}</span>

        <span class="side-panel-title">{{ selectedTask.taskName }}</span>
        <v-btn
          v-if="isDeletableChild(selectedTask)"
          text="삭제"
          class="panel-delete-btn"
          @click="confirmDeleteChildTask(selectedTask)"
        />
        <v-btn variant="tonal" text="완료" :disabled="isCompleted" @click="completeTaskData(selectedTask)"/>
        <v-btn variant="flat" text="저장" :disabled="isCompleted" @click="saveTaskData(selectedTask)"/>
      </div>

      <!-- 패널 바디 -->
      <div class="side-panel-body">
        <v-alert
          v-if="validationErrors.length"
          type="error"
          variant="tonal"
          density="compact"
          class="mb-3"
          closable
          @click:close="validationErrors = []"
        >
          <div class="text-body-2 font-weight-bold mb-1">필수 항목을 입력해주세요</div>
          <ul class="pl-4">
            <li v-for="err in validationErrors" :key="err">{{ err }}</li>
          </ul>
        </v-alert>
        <component :is="panelComponent" :task="selectedTask" v-model="taskData" />
      </div>
    </div>
  </transition>

</template>

<script setup>
// ============================================================
// [1] Vue / 플러그인 임포트
// ============================================================
import { ref, computed, provide, onMounted, onUnmounted, getCurrentInstance, nextTick } from 'vue';
import { useSelectMenuStore } from '@/store/selectMenuStore.js';
import { useRoute, useRouter } from 'vue-router';
import taskCode from "@/popups/biz/TaskCode.vue";
import PanelService from './panels/PanelService.vue';
import PanelLicense from './panels/PanelLicense.vue';
import PanelPublicTask from './panels/PanelPublicTask.vue';
import PanelSpc from './panels/PanelSpc.vue';

// ============================================================
// [2] 스토어 / 글로벌 도구
// ============================================================
const { proxy } = getCurrentInstance();           // $br_trans, $dialog 등 글로벌 메서드 접근용
const selectMenuStore = useSelectMenuStore();     // 브레드크럼/선택메뉴 정보 업데이트용
const route = useRoute();
const router = useRouter();

// ============================================================
// [3] 상태 데이터
// ============================================================
const bizId = route.query.bizId;    // URL 쿼리에서 추출 — 없으면 신규 등록 화면에서 진입한 케이스
const bizInfoData = ref({});        // API 응답 전체 (bizTitle, proStep, proState, proSteps 등 포함)
const sortType = ref('start');      // 정렬기준: 'start'(시작일자) | 'end'(종료일자)
const showLegend = ref(false);      // 범례 토글
const isPanelOpen = ref(false);     // 사이드 패널 열림 상태
const selectedTask = ref(null);     // 사이드 패널에 표시할 태스크
const selectedCategory = ref('');   // 사이드 패널에 표시할 카테고리명
const taskData = ref({});           // 사이드 TASK 패널 폼 데이터
const validationErrors = ref([]);   // 필수입력 오류 목록
const originalSnapshot = ref('');   // dirty 감지용 스냅샷
const expandedParents = ref({});    // 차수관리 부모 task 펼침 상태 { taskCode: boolean }


// contracts의 _startMenu/_endMenu 등 UI 상태 필드를 제외하고 JSON 직렬화
const getDataSnapshot = (data) => {
  const clone = JSON.parse(JSON.stringify(data));
  if (clone.contracts) {
    clone.contracts = clone.contracts.map(({ _startMenu, _endMenu, ...rest }) => rest);
  }
  return JSON.stringify(clone);
};

const isDirty = computed(() =>
  isPanelOpen.value && getDataSnapshot(taskData.value) !== originalSnapshot.value
);

// 사업 전체 종결(3)/완료(10) 여부 → 패널 저장/완료 버튼 비활성 + 패널 입력 readonly
const isBizClosed = computed(() =>
  ['3', '10'].includes(String(bizInfoData.value?.proState))
);

// 완료 상태: 패널 내 모든 입력 필드 readonly 처리 (taskStatus Y 또는 사업 종결/완료)
const isCompleted = computed(() =>
  isBizClosed.value || selectedTask.value?.taskStatus === 'Y'
);
provide('isCompleted', isCompleted);

// 카테고리명 → 패널 컴포넌트 매핑
const PANEL_MAP = {
  '용역': PanelService,
  '인허가': PanelLicense,
  'SPC': PanelSpc,
  '주민상생': PanelPublicTask
};
const panelComponent = computed(() => PANEL_MAP[selectedCategory.value] || null);


// ── 마우스 추적 툴팁 상태 ─────────────────────────────────
// 생략(S)/종결(T) 카드 hover 시 커서 옆에 안내 텍스트 표시
const mouseTooltip = ref({ show: false, x: 0, y: 0, text: '' });

const onMouseMove = (e, text = '') => {
  mouseTooltip.value = { show: true, x: e.clientX + 7, y: e.clientY + 7, text };
};
const hideMouseTooltip = () => {
  mouseTooltip.value.show = false;
};

// ============================================================
// [4] 카테고리 정의 (BIZ_TYPE_MAP / CATEGORY_ORDER)
// ============================================================
// bizType 코드 → 카테고리 메타 매핑
//   dataKey: bizInfoData 응답 내 배열 필드명
//   sortable: true이면 prfStartDate/prfEndDate 기준 정렬 적용 (사업발굴/개발은 고정 순서)
const BIZ_TYPE_MAP = {
  '109S': { name: '사업발굴', dataKey: 'proSteps',   sortable: false },
  '109D': { name: '사업개발', dataKey: 'proSteps',   sortable: false },
  '180':  { name: '용역',     dataKey: 'service',    sortable: true  },
  '181':  { name: '인허가',   dataKey: 'license',    sortable: true  },
  '182':  { name: 'SPC',     dataKey: 'spc',        sortable: true  },
  '183':  { name: '주민상생', dataKey: 'publicTask', sortable: true  },
};

// 카테고리 컬럼 표시 순서 (왼쪽 → 오른쪽)
const CATEGORY_ORDER = ['109S', '109D', '180', '181', '182', '183'];

// ============================================================
// [5] 카테고리 + 태스크 목록 계산 (categories)
// ============================================================
// proSteps 배열을 109S(사업발굴, taskCode S*)와 109D(사업개발, taskCode D*)로 분리
// sortable 카테고리는 sortType(start/end) 기준으로 prfDate 정렬 적용
const categories = computed(() => {
  return CATEGORY_ORDER.map(code => {
    const { name, dataKey, sortable } = BIZ_TYPE_MAP[code];

    // allPortalChildren: C(미선택) 포함 전체 자식 목록 — BizPortal 표시용
    const allChildren = (bizInfoData.value.allPortalChildren || []).filter(t => String(t.taskType) === String(code.replace('109S','109').replace('109D','109')));
    const selectedArray = bizInfoData.value[dataKey] || [];
    // 선택된 것(selectedArray) + 미선택 자식(allChildren 중 selectedArray에 없는 것) 합산
    const selectedCodes = new Set(selectedArray.map(t => t.taskCode));
    // C(미선택) 상태는 포털에 표시하지 않음 — TaskInfo에서 선택 저장 후에만 표시
    const unselectedChildren = allChildren.filter(t => !selectedCodes.has(t.taskCode) && t.taskStatus !== 'C');
    const mergedArray = [...selectedArray, ...unselectedChildren];

    let sourceItems;
    if (code === '109S') {
      // 사업발굴: taskCode가 'S'로 시작하는 절차만 추출
      sourceItems = mergedArray.filter(t => t.taskCode?.startsWith('S'));
    } else if (code === '109D') {
      // 사업개발: taskCode가 'D'로 시작하는 절차만 추출
      sourceItems = mergedArray.filter(t => t.taskCode?.startsWith('D'));
    } else {
      sourceItems = mergedArray;
    }

    // 부모 task: templateYn='Y' (차수관리 템플릿 원본)
    // 자식 task: templateCode가 있는 task (차수관리로 생성된 파생 task)
    // 일반 task: 나머지
    const parents  = sourceItems.filter(t => t.templateYn === 'Y');
    const children = sourceItems.filter(t => t.templateCode);
    const normals  = sourceItems.filter(t => t.templateYn !== 'Y' && !t.templateCode);

    // 날짜 정렬 (sortable 카테고리만) — null은 맨 뒤
    const sortByDate = (arr) => arr.slice().sort((a, b) => {
      const dateA = sortType.value === 'start' ? a.prfStartDate : a.prfEndDate;
      const dateB = sortType.value === 'start' ? b.prfStartDate : b.prfEndDate;
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;
      return dateA.localeCompare(dateB);
    });

    // 부모 task에 자식 배열 attach
    // _children: 표시용(C 제외), 단 addChildTask 차수 계산은 allChildren(C 포함) 기준
    const parentItems = (sortable ? sortByDate(parents) : parents).map(p => ({
      ...p,
      _children: sortable
        ? sortByDate(children.filter(c => c.templateCode === p.taskCode))
        : children.filter(c => c.templateCode === p.taskCode),
      _allChildren: allChildren.filter(c => c.templateCode === p.taskCode),
    }));

    const normalItems = sortable ? sortByDate(normals) : normals;

    // 렌더링 순서: 부모(+자식) task → 일반 task
    return { name, tasks: [...parentItems, ...normalItems] };
  });
});

// ============================================================
// [6] 태스크 카드 상태 (getTaskClass / badge / tooltip)
// ============================================================

// taskStatus 코드표 (BIZ_PORTAL.TASK_STATUS)
//   'Y' 작성완료 → task-done    (초록)
//   'W' 작성중   → task-current (파랑)  ← 용역/인허가/SPC/주민상생 저장 시 자동 세팅
//   'N' 미작성   → task-todo    (빨강)  / 109타입 현재 단계면 task-current 추가 (파랑)
//   'S' 생략     → task-skip    (회색 점선, cursor:not-allowed)
//   'T' 종결     → task-closed  (회색, cursor:not-allowed)
//   'H' 유보     → task-hold    (노랑)
//   'C' 미선택   → (선택 해제 상태, 포탈에 등록되지 않음)

// 109타입 현재 진행 단계 여부 (완료/종결 제외)
const isCurrentStep = (task) =>
  task.taskCode === bizInfoData.value.proStep &&
  bizInfoData.value.proState !== '10' &&
  bizInfoData.value.proState !== '3';

const getTaskClass = (task) => ({
  'task-done':    task.taskStatus === 'Y',
  'task-current': task.taskStatus === 'W' || isCurrentStep(task),
  'task-todo':    task.taskStatus === 'N',
  'task-skip':    task.taskStatus === 'S',
  'task-closed':  task.taskStatus === 'T',
  'task-hold':    task.taskStatus === 'H',
  'task-panel':   ['180', '181', '182', '183'].includes(task.taskType),
});

// taskStatus 코드 → 아이콘 매핑
const TASK_ICON_MAP = {
  'Y': 'mdi-check-circle',
  'W': 'mdi-progress-clock',
  'N': 'mdi-minus-circle-outline',
  'S': 'mdi-debug-step-over',
  'T': 'mdi-close-circle',
  'H': 'mdi-pause-circle',
};
const getTaskIcon = (task) => {
  if (task.taskStatus === 'H' || task.taskStatus === 'T' || task.taskStatus === 'S') {
    return TASK_ICON_MAP[task.taskStatus];
  }
  if (task.taskStatus === 'W' || isCurrentStep(task)) return 'mdi-progress-clock';
  return TASK_ICON_MAP[task.taskStatus] || 'mdi-minus-circle-outline';
};

// 생략(S)/종결(T) 카드: 클릭 이동 차단 + hover 툴팁 활성화
const isBlockedTask = (task) => task.taskStatus === 'S' || task.taskStatus === 'T';

const getTaskTooltip = (task) => {
  if (task.taskStatus === 'S') return '생략된 절차입니다';
  if (task.taskStatus === 'T') return '종결된 절차입니다';
  return '';
};

// ── 카드 뱃지 ─────────────────────────────────────────────
// 종결됨 뱃지: 현재 진행 단계이면서 사업 전체가 종결('3')된 경우
const isCloseBadge = (task) =>
  task.taskCode === bizInfoData.value.proStep &&
  bizInfoData.value.proState === '3';

// 작성중/유보 뱃지: 현재 진행 단계이면서 완료/종결이 아닌 경우
const isCurrentBadge = (task) => isCurrentStep(task);

// proState '2'(유보)이면 '유보' 텍스트 + 노랑 배경, 그 외는 '작성중' + 기본(보라)
const currentBadgeText = computed(() =>
  bizInfoData.value.proState === '2' ? '유보' : '작성중'
);
const currentBadgeStyle = computed(() =>
  bizInfoData.value.proState === '2' ? { background: '#C69320' } : {}
);

// ============================================================
// [7] 태스크 카드 클릭 이동 (goTask)
// ============================================================
// 생략(S)/종결(T) 상태는 이동 불가 (isBlockedTask에서 차단)
// 사업발굴(S*)/사업개발(D*) → TaskDetail 페이지 이동
// 나머지 카테고리 → 사이드 패널 오픈
const goTask = (task, categoryName) => {
  if (isBlockedTask(task)) return;

  // 사업발굴/사업개발: 기존 페이지 이동
  if (task.taskCode?.startsWith('S') || task.taskCode?.startsWith('D')) {
    router.push({
      name: 'TaskDetail',
      params: { taskCode: task.taskCode },
      query: { bizId: bizId },
    });
    return;
  }

  // 차수관리 부모 task: 패널 오픈 없음 (버튼으로만 조작)
  if (task.templateYn === 'Y') return;

  // 용역/인허가/주민상생/SPC: 사이드 패널 오픈
  selectedTask.value = task;
  selectedCategory.value = categoryName;
  taskData.value = inittaskData(categoryName);
  originalSnapshot.value = '';
  isPanelOpen.value = true;
  getTaskData(task);
};


// 새 차수 생성 (부모 카드의 [+] 버튼)
const addChildTask = (task, categoryName) => {
  // 차수 계산은 C(미선택) 포함 전체 기준 — _allChildren 사용
  const existingChildren = task._allChildren || task._children || [];
  // 삭제된 차수가 있을 경우 length 기준이 아닌 기존 이름에서 최대 번호 파싱
  const maxOrder = existingChildren.reduce((max, c) => {
    const match = c.taskName?.match(/^제(\d+)차/);
    return match ? Math.max(max, parseInt(match[1])) : max;
  }, existingChildren.length);
  const nextOrder = maxOrder + 1;
  const newTaskName = `제${nextOrder}차 ${task.taskName}`;

  const statusDot = (status) => {
    if (status === 'Y') return '<span style="color:#22c55e;font-size:10px">●</span>';
    if (status === 'W') return '<span style="color:#4472c4;font-size:10px">●</span>';
    return '<span style="color:#cbd5e1;font-size:10px">●</span>';
  };

  const childLines = existingChildren.map(c =>
    c.taskStatus !== 'C'
      ? `&nbsp;&nbsp;${statusDot(c.taskStatus)} <strong>${c.taskName}</strong>`
      : `&nbsp;&nbsp;${statusDot(c.taskStatus)} ${c.taskName}`
  ).join('<br>');

  const listStyle = existingChildren.length > 8
    ? 'max-height:180px;overflow-y:auto;margin:4px 0 12px;padding-right:4px;'
    : 'margin:4px 0 12px;';
  const existingSection = existingChildren.length > 0
    ? `기존 차수:<div style="${listStyle}">${childLines}</div>`
    : '';

  proxy.$dialog.confirm({
    title: `${task.taskName} 추가`,
    text: `${existingSection}<strong>${newTaskName}</strong>을(를) 추가하시겠습니까?`,
    actions: {
      false: { text: '취소' },
      true:  { text: '추가', color: 'primary' },
    },
  }).then((confirmed) => {
    if (!confirmed) return;
    proxy.$br_trans([{
      url: '/kopms-api/biz/addChildTask',
      method: 'post',
      data: { masterNo: bizId, taskType: task.taskType, templateCode: task.taskCode },
    }], (_url, code, _msg, data) => {
      if (code < 0) return;
      expandedParents.value[task.taskType + '_' + task.taskCode] = 'open';
      getBizInfoData();
      if (data.newTask) goTask(data.newTask, categoryName);
    });
  });
};

// 사이드 패널 닫기 (dirty 체크 포함)
const closePanel = () => {
  if (isDirty.value) {
    proxy.$dialog.confirm({
      title: '저장하지 않고 닫기',
      text: '입력 중인 내용이 저장되지 않습니다. 닫으시겠습니까?',
      actions: {
        true:  { text: '닫기', color: 'error' },
        false: '취소',
      },
    }).then(res => {
      if (res) forceClosePanel();
    });
    return;
  }
  forceClosePanel();
};

const forceClosePanel = () => {
  isPanelOpen.value = false;
  selectedTask.value = null;
  taskData.value = {};
  validationErrors.value = [];
  originalSnapshot.value = '';
};

// 패널 데이터 초기화 (카테고리별 구조)
const inittaskData = (categoryName) => {
  switch (categoryName) {
    case '용역':      return { serviceInfo: {}, contracts: [] };
    case '인허가':    return { licenseInfo: {} };
    case 'SPC':       return { spcInfo: {} };
    case '주민상생':  return { publicTaskInfo: {} };
    default:          return {};
  }
};

// 패널 TASK 데이터 조회
const getTaskData = (task) => {

  const inputData = {
    masterNo: bizId,
    taskType: task.taskType,
    taskCode: task.taskCode,
  };

  proxy.$br_trans([{
    url: '/kopms-api/biz/getTaskData',
    method: 'post',
    data: inputData,
  }], (url, code, msg, data) => {

    if (code < 0) return;

    const newContract = () => ({
      mikepDocNo: '', contractor: '', conAmt: '',
      svcStart: '', svcEnd: '', conNo: '',
      _startMenu: false, _endMenu: false,
    });

    switch (task.taskType) {
      case '180': { // 용역
        const conList = (data.taskSVCCON || []).map(c => ({
          ...c, _startMenu: false, _endMenu: false,
        }));
        taskData.value = {
          serviceInfo: data.taskSVC || {},
          contracts: conList.length ? conList : [newContract()],
        };
        break;
      }
      case '181': // 인허가
        taskData.value = { licenseInfo: data.taskLIC || {} };
        break;
      case '182': // SPC
        taskData.value = { spcInfo: data.taskSPC || {} };
        break;
      case '183': // 주민상생
        taskData.value = { publicTaskInfo: data.taskCSV || {} };
        break;
    }
    originalSnapshot.value = getDataSnapshot(taskData.value);
  });
};

// 패널 필수입력 검증
const validateTaskData = (taskType, data) => {
  const errors = [];
  const isEmpty = (v) => v === null || v === undefined || String(v).trim() === '';

  switch (taskType) {
    case '180': {
      const s = data.serviceInfo || {};
      if (isEmpty(s.svcDays))    errors.push('용역기간');
      if (isEmpty(s.conMth))     errors.push('계약방식');
      if (isEmpty(s.evaluation)) errors.push('평가방법');
      if (isEmpty(s.evcTec) || isEmpty(s.evcPrc)) errors.push('평가기준');
      (data.contracts || []).forEach((c, i) => {
        const seq = data.contracts.length > 1 ? ` ${i + 1}번` : '';
        if (isEmpty(c.mikepDocNo)) errors.push(`계약체결${seq} 문서번호`);
        if (isEmpty(c.svcStart))   errors.push(`계약체결${seq} 용역시작일`);
        if (isEmpty(c.svcEnd))     errors.push(`계약체결${seq} 용역완료일`);
      });
      break;
    }
    case '181': {
      const l = data.licenseInfo || {};
      if (isEmpty(l.licOrg))     errors.push('승인기관');
      if (isEmpty(l.mikepDocNo)) errors.push('문서번호');
      if (isEmpty(l.licDate))    errors.push('등록일자');
      break;
    }
    case '182': {
      if (isEmpty((data.spcInfo || {}).effectiveDate)) errors.push('시행일자');
      break;
    }
    case '183': {
      if (isEmpty((data.publicTaskInfo || {}).effectiveDate)) errors.push('시행일자');
      break;
    }
  }
  return errors;
};

// 패널 TASK 데이터 저장 / 완료 처리 (complete=true이면 completeYn:'Y' 추가 후 확인창)
const saveTaskData = (task, complete = false) => {
  const errors = validateTaskData(task.taskType, taskData.value);
  if (errors.length) {
    validationErrors.value = errors;
    return;
  }
  validationErrors.value = [];

  const doSave = () => {
    proxy.$br_trans([{
      url: '/kopms-api/biz/setTaskData',
      method: 'post',
      data: {
        masterNo: bizId,
        taskType: task.taskType,
        taskCode: task.taskCode,
        taskName: task.taskName,
        ...(complete ? { completeYn: 'Y' } : {}),
        ...taskData.value,
      },
    }], (_url, code) => {
      if (code < 0) return;
      proxy.$dialog.message.success(complete ? '완료 처리되었습니다.' : '저장되었습니다.');
      if (complete) task.taskStatus = 'Y'; // 즉시 반영 (카드 색상 + isCompleted)
      getTaskData(task);
      getBizInfoData();
    });
  };

  if (complete) {
    proxy.$dialog.confirm({
      title: '완료 처리',
      text: '작성을 완료하시겠습니까? 완료 후에는 수정이 불가합니다.',
      actions: {
        true:  { text: '완료', color: 'primary' },
        false: '취소',
      },
    }).then(res => { if (res) doSave(); });
  } else {
    doSave();
  }
};

const completeTaskData = (task) => saveTaskData(task, true);

// ============================================================
// [8] 사업 데이터 조회 (getBizInfoData)
// ============================================================
// getBizData API: bizTitle, proStep, proState, proSteps(절차 배열),
//                 service, license, publicTask, spc 등 포털 표시에 필요한 전체 데이터 반환
const getBizInfoData = (onComplete = null) => {
  proxy.$br_trans([{
    url: "/kopms-api/biz/getBizData",
    method: "post",
    data: { masterNo: bizId },
  }], (url, code, msg, data) => {
    if (code < 0) return;
    bizInfoData.value = data;

    // 브레드크럼: [사업구분] > [사업명] > 사업진행포털
    if (selectMenuStore) {
      const anchorSegments = (selectMenuStore.menuAnchorPath || '').split(' > ');
      const areaName = anchorSegments[0] || '';
      const title = data.bizTitle || '';
      const myPath = [areaName, title, '사업진행포털'].filter(Boolean).join(' > ');
      const taskBasePath = [areaName, title].filter(Boolean).join(' > ');
      selectMenuStore.setMenuName('사업진행포털');
      selectMenuStore.setMenuPath(myPath);
      selectMenuStore.setPortalBasePath(taskBasePath);
      selectMenuStore.setHighlightSegment(title);
    }

    // 선택된 자식(taskStatus !== 'C')이 있는 부모만 자동 펼침
    const allChildren = data.allPortalChildren || [];
    allChildren.forEach(c => {
      if (c.taskStatus !== 'C') {
        const key = c.taskType + '_' + c.templateCode;
        expandedParents.value[key] = true;
      }
    });

    if (onComplete) nextTick(onComplete);
  });
};


// ============================================================
// [9] 자식 task 삭제 (isDeletableChild / confirmDeleteChildTask)
// ============================================================

// 삭제 가능 조건: templateCode 있음(자식 task) + 미작성(N) 또는 작성중(W)
const isDeletableChild = (task) =>
  !!task?.templateCode && (task.taskStatus === 'N' || task.taskStatus === 'W' || task.taskStatus === 'C');

const confirmDeleteChildTask = (task) => {
  proxy.$dialog.confirm({
    title: '태스크 삭제',
    text: `"${task.taskName}"을(를) 삭제하시겠습니까?<br>저장된 데이터도 함께 삭제됩니다.`,
    actions: {
      false: { text: '취소' },
      true:  { text: '삭제', color: 'error' },
    },
  }).then((confirmed) => {
    if (!confirmed) return;

    proxy.$br_trans([{
      url: '/kopms-api/biz/deleteChildTask',
      method: 'post',
      data: {
        masterNo:   bizId,
        taskType:   task.taskType,
        taskCode:   task.taskCode,
        taskStatus: task.taskStatus,
      },
    }], (_url, code, _msg, _data) => {
      if (code < 0) return;
      proxy.$dialog.message.success('삭제되었습니다.');
      // 패널이 삭제된 task를 보고 있으면 닫기
      if (selectedTask.value?.taskCode === task.taskCode) forceClosePanel();
      getBizInfoData(() => {
        // 자식이 없어진 부모는 자동으로 접기
        categories.value.forEach(cat => {
          cat.tasks.forEach(t => {
            if (t.templateYn === 'Y' && t._children.length === 0) {
              expandedParents.value[t.taskType + '_' + t.taskCode] = undefined;
            }
          });
        });
      });
    });
  });
};

// ============================================================
// [10] TASK코드 관리 팝업 (openTaskCode)
// ============================================================
// 팝업 닫은 후 getBizInfoData 재호출: 태스크 추가/수정 결과를 카드에 즉시 반영
const openTaskCode = async () => {
  const dialogWidth = 1200;

  await proxy.$dialog.showAndWait(
    { taskCode },
    {
      width: dialogWidth,
      minWidth: dialogWidth,
    }
  );

  getBizInfoData();
};

// ============================================================
// [11] 생명주기
// ============================================================
// ESC 키로 패널 닫기
const onEscKey = (e) => {
  if (e.key === 'Escape' && isPanelOpen.value) {
    closePanel();
  }
};

onMounted(() => {
  // bizId가 있을 때만 데이터 조회 (없으면 사업 등록 전 미리보기 케이스)
  if (bizId) {
    getBizInfoData();
  }

  // ESC 키 이벤트 등록
  document.addEventListener('keydown', onEscKey);
});

onUnmounted(() => {
  document.removeEventListener('keydown', onEscKey);
});
</script>

<style lang="scss" scoped>
/* ── 헤더 툴바 ── */
.portal-toolbar {
  border-bottom: 1px solid #cbd5e0;
}
.portal-title {
  font-size: 22px;
  font-weight: 800;
  color: rgb(var(--v-theme-primary));
}
.toolbar-label {
  font-weight: 600;
  white-space: nowrap;
}
.toolbar-actions {
  background: #f1f5f9;
  border-radius: 8px;
  padding: 12px;
}

/* ── 포털 바디 ── */
.portal-body {
  position: relative;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
  min-height: 0;
}

/* 카드 컬럼 영역 */
.portal-columns {
  flex-wrap: nowrap !important;
  align-items: stretch;
  overflow: hidden;
}

/* ── 카테고리 컬럼 ── */
.category-col {
  min-width: 160px;
  display: flex;
  flex-direction: column;
  min-height: 0;
  border-radius: 8px;
  overflow: hidden;
  background: #edf2f7;
}

/* 1레벨 헤더 */
.category-header {
  background: transparent;
  border: none;
  border-radius: 0;
  text-align: left;
  padding: 10px 12px;
  font-weight: 700;
  color: #334155;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.category-header-text {
  position: relative;
  display: inline-block;
}
.category-header-text::after {
  content: '';
  display: block;
  margin-top: 4px;
  width: 100%;
  height: 4px;
  background: #1e3a5f;
  border-radius: 20px;
}

/* ── 태스크 카드 ── */
.task-card {
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 10px 12px;
  min-height: 60px;
  font-size: 14px;
  line-height: 1.4;
  position: relative;
  transition: box-shadow 0.2s, transform 0.15s;
  cursor: pointer;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}
.task-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
  transform: translateY(-2px);
}

/* 차수관리 그룹 컨테이너 */
.task-parent-group {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);

  /* v-expansion-panel 기본 여백/그림자 초기화 */
  :deep(.v-expansion-panel) {
    border-radius: 8px !important;
    box-shadow: none !important;
    border: none !important;
  }
  :deep(.v-expansion-panel--active) {
    border: none !important;
  }
  :deep(.v-expansion-panel-title--active) {
    border: none !important;
    background: #ffffff !important;
  }
  :deep(.v-expansion-panel-text__wrapper) {
    padding: 0 !important;
  }
}

/* 차수관리 부모 헤더 */
.task-parent {
  background: #ffffff;
  color: #334155;
  padding: 10px 12px !important;
  min-height: 60px !important;
  font-size: 14px;
  font-weight: 600;
  transition: background 0.15s;
  &:hover { background: #dde6f0; }
  span { color: #1e3a5f !important; }
}
.parent-chevron {
  color: #1e3a5f !important;
}
.parent-count-chip {
  background: rgba(30, 58, 95, 0.12);
  color: #1e3a5f;
  font-size: 10px;
  font-weight: 700;
  border-radius: 10px;
  padding: 1px 7px;
  line-height: 1.6;
  flex-shrink: 0;
}

/* 자식 카드 목록 영역 */
.task-children-list-wrap {
  background: #f1f5f9;
}
.task-children-list {
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* 자식 없음 안내 */
.task-children-empty {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 4px;
  color: #aaa;
  font-size: 12px;
}

/* 차수관리 자식 카드 */
.task-child {
  border-left: 3px solid #93c5fd;
}

/* 자식 카드 휴지통 버튼: 기본 숨김 → hover 시 표시 */
.child-delete-btn {
  opacity: 0;
  transition: opacity 0.15s;
  color: #ef4444 !important;
}
.task-child:hover .child-delete-btn {
  opacity: 1;
}

/* 패널 삭제 버튼 */
.panel-delete-btn {
  color: #ef4444 !important;
}

/* taskStatus 코드별 상태 — 아이콘 + 제목 색상 */
.task-done   { .task-status-icon { color: #16A34A; } .task-title span { color: #16A34A; } }
.task-todo   { .task-status-icon { color: #F87171; } .task-title span { color: #F87171; } opacity: 0.9; }
.task-skip   { border: 1.5px dashed #9CA3AF; .task-status-icon { color: #9CA3AF; } .task-title span { color: #9CA3AF; } cursor: not-allowed; opacity: 0.7; }
.task-closed { .task-status-icon { color: #6B7280; } .task-title span { color: #9CA3AF; } .task-title .close-badge { color: #ffffff; } cursor: not-allowed; opacity: 0.7; }
.task-hold   { .task-status-icon { color: #EAB308; } .task-title span { color: #EAB308; } .task-title .current-badge { color: #ffffff; } }

/* 현재 진행 단계: 연한 파란 배경 + 파란 테두리 */
.task-current {
  opacity: 1 !important;
  background: #eff6ff !important;
  border: 2px solid #3B82F6 !important;
  padding: 9px 11px; /* border 1px→2px 보정 */
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
  .task-status-icon { color: #3B82F6; }
  .task-title span { color: #3B82F6; }
  .task-title .current-badge { color: #ffffff !important; }
}
/* 유보 + 현재 진행 단계: 유보 색상 우선 */
.task-current.task-hold {
  background: #fffbeb !important;
  border: 2px solid #EAB308 !important;
  box-shadow: 0 2px 8px rgba(234, 179, 8, 0.2);
  .task-status-icon { color: #EAB308 !important; }
  .task-title span { color: #EAB308 !important; }
  .task-title .current-badge { color: #ffffff !important; }
}

/* 용역/인허가/SPC/주민상생 패널형 태스크: 테두리/배경 없음, shadow·hover만 적용 */
.task-panel {
  border: none !important;
  background: #ffffff !important;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  &:hover {
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
    transform: translateY(-2px);
  }
}

/* 종결됨 뱃지 */
.close-badge {
  font-size: 10px;
  background: #e53e3e;
  color: #ffffff;
  border-radius: 10px;
  padding: 1px 7px;
  font-weight: bold;
  white-space: nowrap;
  flex-shrink: 0;
}

/* 작성중/유보 뱃지 (proState '2'이면 노랑 배경 오버라이드 — currentBadgeStyle로 인라인 적용) */
.current-badge {
  font-size: 10px;
  background: #6366F1;
  color: #ffffff;
  border-radius: 10px;
  padding: 1px 7px;
  font-weight: bold;
  white-space: nowrap;
  flex-shrink: 0;
}

.task-title {
  font-weight: 500;
}

.task-dates {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  font-weight: bold;
  opacity: 0.85;
  margin-top: 4px;
}

/* ── 태스크 목록 스크롤 영역 ── */
.task-list-scroll {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  scrollbar-width: none;          /* Firefox */
  -ms-overflow-style: none;       /* IE/Edge */
  &::-webkit-scrollbar { display: none; }  /* Chrome/Safari */
}

/* ── 빈 컬럼 안내 ── */
.empty-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 32px 8px;
  color: #a0aec0;
  font-size: 0.8rem;
}

/* ── 범례 툴팁 ── */
.legend-tooltip-wrapper {
  position: relative;
  margin-left: 6px;
  vertical-align: middle;
}
.legend-help-btn {
  color: #94a3b8 !important;
  transition: color 0.15s, background-color 0.15s;
}
.legend-help-btn--active {
  color: rgb(var(--v-theme-primary)) !important;
  background-color: rgba(var(--v-theme-primary), 0.1) !important;
}
.legend-tooltip-content {
  display: none;
  position: absolute;
  top: 50%;
  left: calc(100% + 8px);
  transform: translateY(-50%);
  z-index: 10;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 10px 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
  gap: 8px;
  flex-direction: column;
  white-space: nowrap;
}
.legend-tooltip-title {
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  letter-spacing: 0.05em;
}
.legend-chips-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 6px;
}
/* hover 또는 토글(pinned)일 때 표시 */
.legend-tooltip-wrapper:hover .legend-tooltip-content,
.legend-tooltip-content.legend-pinned {
  display: flex;
}

/* ── 범례: 미니카드 ── */
.legend-mini-card {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 4px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  font-size: 12px;
  font-weight: 600;
  color: #334155;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}
.legend-todo    { border-color: #F87171; color: #F87171; .v-icon { color: #F87171; } }
.legend-current { border-color: #3B82F6; color: #3B82F6; .v-icon { color: #3B82F6; } }
.legend-done    { border-color: #16A34A; color: #16A34A; .v-icon { color: #16A34A; } }
.legend-hold    { border-color: #EAB308; color: #EAB308; .v-icon { color: #EAB308; } }
.legend-skip    { border: 1.5px dashed #9CA3AF; color: #9CA3AF; .v-icon { color: #9CA3AF; } }
.legend-closed  { border-color: #9CA3AF; color: #9CA3AF; .v-icon { color: #9CA3AF; } }

/* ── 사이드 패널 오버레이 ── */
.side-panel-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  z-index: 99;
}

/* ── 사이드 패널 ── */
.side-panel {
  position: fixed;
  top: 48px;
  right: 0;
  width: clamp(520px, 40%, 720px);
  height: calc(100vh - 48px);
  background: #ffffff;
  border-radius: 12px 0 0 12px;
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.15);
  z-index: 100;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 패널 슬라이드 트랜지션 */
.slide-panel-enter-active,
.slide-panel-leave-active {
  transition: transform 0.3s ease;
}
.slide-panel-enter-from,
.slide-panel-leave-to {
  transform: translateX(100%);
}

.side-panel-header {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 12px;
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;
}
.side-panel-title {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  flex: 1;
}
.side-panel-code {
  font-size: 15px;
  font-weight: 700;
  color: #334155;
  background: #edf2f7;
  border-radius: 6px;
  padding: 1px 8px 2px;
}

.side-panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

/* ── 마우스 추적 툴팁 ── */
/* fixed + pointer-events:none으로 다른 요소 hover 방해 없이 커서 옆에 플로팅 */
.mouse-tooltip {
  position: fixed;
  background: rgba(0, 0, 0, 0.75);
  color: #fff;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  pointer-events: none;
  z-index: 9999;
  white-space: nowrap;
}


</style>
