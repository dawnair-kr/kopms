<template>
  <div class="section-header">
    <span class="section-title">TASK 선택</span>
  </div>

  <!-- TASK 미리보기 -->
  <v-row no-gutters class="flex-grow-1 mb-2 ga-2">

    <!-- 사업발굴 -->
    <v-col class="task-category-col">
      <div class="task-category-box">
        <div class="task-category-header">
          <span class="task-category-title">사업발굴</span>
          <v-spacer />
          <span v-if="!isBizClosed" class="task-select-all" @click="toggleAllS">
            {{ isAllSChecked ? '전체 해제' : '전체 선택' }}
          </span>
        </div>
        <div class="task-category-scroll" :style="colScrollStyle">
          <v-card
            v-for="item in listS109" :key="item.taskCode"
            :class="['task-item-card d-flex align-center px-2 ma-2', {
              selected: sSteps.includes(item.taskCode) && !lockedSteps.includes(item.taskCode),
              'selected-locked': sSteps.includes(item.taskCode) && lockedSteps.includes(item.taskCode),
              'item-locked': lockedSteps.includes(item.taskCode),
              'biz-closed': isBizClosed,
            }]"
            elevation="4"
            @click="toggleSStep(item.taskCode)"
          >
            <v-icon
              :color="sSteps.includes(item.taskCode) ? 'white' : '#bdbdbd'"
              size="20" class="mr-2"
            >{{ sSteps.includes(item.taskCode) ? 'mdi-check-circle' : 'mdi-circle-outline' }}</v-icon>
            <span class="task-item-name">{{ item.taskName }}</span>
          </v-card>
        </div>
      </div>
    </v-col>

    <!-- 사업개발 (기준 컬럼) -->
    <v-col class="task-category-col">
      <div class="task-category-box">
        <div class="task-category-header">
          <span class="task-category-title">사업개발</span>
          <v-spacer />
          <span v-if="!isBizClosed" class="task-select-all" @click="toggleAllD">
            {{ isAllDChecked ? '전체 해제' : '전체 선택' }}
          </span>
        </div>
        <div class="task-category-scroll" ref="referenceScrollRef">
          <v-card
            v-for="item in listD109" :key="item.taskCode"
            :class="['task-item-card d-flex align-center px-2 ma-2', {
              selected: dSteps.includes(item.taskCode) && !lockedSteps.includes(item.taskCode),
              'selected-locked': dSteps.includes(item.taskCode) && lockedSteps.includes(item.taskCode),
              'item-locked': lockedSteps.includes(item.taskCode),
              'biz-closed': isBizClosed,
            }]"
            elevation="4"
            @click="toggleDStep(item.taskCode)"
          >
            <v-icon
              :color="dSteps.includes(item.taskCode) ? 'white' : '#bdbdbd'"
              size="20" class="mr-2"
            >{{ dSteps.includes(item.taskCode) ? 'mdi-check-circle' : 'mdi-circle-outline' }}</v-icon>
            <span class="task-item-name">{{ item.taskName }}</span>
          </v-card>
        </div>
      </div>
    </v-col>

    <!-- 용역 / 인허가 / 주민상생 / SPC -->
    <v-col v-for="col in fieldColumns" :key="col.field" class="task-category-col">
      <div class="task-category-box">
        <div class="task-category-header">
          <span class="task-category-title">{{ col.title }}</span>
          <v-spacer />
          <span v-if="!isBizClosed" class="task-select-all" @click="toggleAllField(col.field, getTasksForBizType(col.group))">
            {{ isAllFieldChecked(col.field, getTasksForBizType(col.group)) ? '전체 해제' : '전체 선택' }}
          </span>
        </div>
        <div class="task-category-scroll" :style="colScrollStyle">
          <template v-for="item in groupedFieldItems[col.group]" :key="item.taskCode">

            <!-- 차수관리 부모 task (templateYn='Y') -->
            <template v-if="item._children !== null">

              <!-- 자식 없음: 일반 TASK처럼 선택 가능 -->
              <div
                v-if="item._children.length === 0"
                :class="['task-parent-wrapper ma-2', { 'parent-selected': localData[col.field].includes(item.taskCode), 'biz-closed': isBizClosed }]"
              >
                <div
                  class="task-parent-header d-flex align-center px-2"
                  @click="toggleField(item.taskCode, col.field)"
                >
                  <v-icon
                    :color="localData[col.field].includes(item.taskCode) ? 'white' : '#bdbdbd'"
                    size="20" class="mr-2"
                  >{{ localData[col.field].includes(item.taskCode) ? 'mdi-check-circle' : 'mdi-circle-outline' }}</v-icon>
                  <span class="task-item-name">{{ item.taskName }}</span>
                  <span class="child-count-chip ml-1">{{ `${countSelectedChildren(item, col.field)}/${item._children.length}` }}</span>
                </div>
              </div>

              <!-- 자식 있음: expand/collapse + 전체선택 -->
              <div
                v-else
                :class="['task-parent-wrapper ma-2', { 'parent-selected': isAnyChildSelected(item, col.field) && !expandedParents[col.group + '_' + item.taskCode] }]"
              >
                <!-- 부모 헤더 -->
                <div
                  class="task-parent-header d-flex align-center px-2"
                  @click="toggleExpandParent(col.group + '_' + item.taskCode)"
                >
                  <span class="task-item-name">{{ item.taskName }}</span>
                  <span class="child-count-chip ml-1">
                    {{ `${countSelectedChildren(item, col.field)}/${item._children.length}` }}
                  </span>
                  <v-spacer />
                  <span
                    v-if="!isBizClosed"
                    class="task-select-all ml-2"
                    @click.stop="toggleAllChildren(item, col.field)"
                  >
                    {{ isAllChildrenSelected(item, col.field) ? '전체 해제' : '전체 선택' }}
                  </span>
                </div>
                <!-- 자식 카드 목록 -->
                <div v-if="expandedParents[col.group + '_' + item.taskCode]" class="task-parent-children px-2 pb-2">
                  <div
                    v-for="child in item._children"
                    :key="child.taskCode"
                    :class="['task-child-inner d-flex align-center px-2', {
                      'child-selected':        localData[col.field].includes(child.taskCode) && !props.lockedFieldSteps.includes(child.taskCode),
                      'child-selected-locked': localData[col.field].includes(child.taskCode) && props.lockedFieldSteps.includes(child.taskCode),
                      'item-locked':           props.lockedFieldSteps.includes(child.taskCode),
                      'biz-closed':            isBizClosed,
                    }]"
                    @click.stop="toggleField(child.taskCode, col.field)"
                  >
                    <v-icon
                      :color="localData[col.field].includes(child.taskCode) ? 'white' : '#bdbdbd'"
                      size="16" class="mr-2"
                    >{{ localData[col.field].includes(child.taskCode) ? 'mdi-check-circle' : 'mdi-circle-outline' }}</v-icon>
                    <span class="task-item-name">{{ child.taskName }}</span>
                  </div>
                </div>
              </div>

            </template>

            <!-- 일반 task -->
            <v-card
              v-else
              :class="['task-item-card d-flex align-center px-2 ma-2', {
                selected:          localData[col.field].includes(item.taskCode) && !props.lockedFieldSteps.includes(item.taskCode),
                'selected-locked': localData[col.field].includes(item.taskCode) && props.lockedFieldSteps.includes(item.taskCode),
                'item-locked':     props.lockedFieldSteps.includes(item.taskCode),
                'biz-closed':      isBizClosed,
              }]"
              elevation="4"
              @click="toggleField(item.taskCode, col.field)"
            >
              <v-icon
                :color="localData[col.field].includes(item.taskCode) ? 'white' : '#bdbdbd'"
                size="20" class="mr-2"
              >{{ localData[col.field].includes(item.taskCode) ? 'mdi-check-circle' : 'mdi-circle-outline' }}</v-icon>
              <span class="task-item-name">{{ item.taskName }}</span>
            </v-card>

          </template>
        </div>
      </div>
    </v-col>

  </v-row>

  <!-- 선택 결과 요약 -->
  <v-card class="section-header" flat @click="showSummary = !showSummary">
    <span class="section-title">선택된 항목</span>
    <v-icon class="ml-auto" :icon="showSummary ? 'mdi-chevron-up' : 'mdi-chevron-down'" size="18" />
  </v-card>

  <v-expand-transition>
    <div v-show="showSummary" class="task-summary-panel mb-2">
      <div v-if="totalCheckedCount === 0" class="task-empty-state">
        선택된 항목이 없습니다. 상단에서 항목을 선택해주세요.
      </div>
      <template v-else>
        <div v-for="group in summaryGroups" :key="group.title" class="task-group">
          <div class="task-group-header mb-1">
            <span class="task-group-bar" />
            <span class="task-group-title">{{ group.title }}</span>
            <span class="task-group-count">{{ group.items.length }}개</span>
          </div>
          <div class="task-chip-list mb-2">
            <transition-group name="task-chip">
              <span
                v-for="item in group.items" :key="item.taskCode"
                class="task-chip"
                @click.stop="group.toggle(item.taskCode)"
              >
                {{ item.taskName }}
                <span v-if="!isBizClosed && !props.lockedSteps.includes(item.taskCode) && !props.lockedFieldSteps.includes(item.taskCode)" class="task-chip-remove">✕</span>
              </span>
            </transition-group>
          </div>
        </div>
        <div class="task-summary-footer">
          <span v-if="!isBizClosed" class="task-reset-btn" @click.stop="resetAll">전체 초기화</span>
        </div>
      </template>
    </div>
  </v-expand-transition>

</template>

<script setup>
// ============================================================
// [1] Vue / 플러그인 임포트
// ============================================================
import { ref, computed, watch, onMounted, nextTick, getCurrentInstance, inject } from 'vue';

// ============================================================
// [2] Props / Emits / Inject
// ============================================================
const { proxy } = getCurrentInstance(); // $br_trans 등 글로벌 메서드 접근용

// 사업 전체 종결(3)/완료(10) 여부 → 모든 선택/해제 차단 (expand/collapse는 허용)
const isBizClosed = inject('isBizClosed', ref(false));

const props = defineProps({
  modelValue:       { type: Object, required: true },
  lockedSteps:      { type: Array,  default: () => [] }, // 완료된 proStep 코드 목록 → 해당 항목 클릭 비활성화
  lockedFieldSteps: { type: Array,  default: () => [] }, // W/Y 상태인 fieldColumns task 코드 목록 → 선택 해제 비활성화
  bizId:            { type: String, default: null },      // 수정 모드: 기존 사업 ID (없으면 신규 등록)
});

const emit = defineEmits(['update:modelValue']);

// ============================================================
// [3] 참조 높이 측정 (사업개발 컬럼 기준)
// ============================================================
// 사업개발 컬럼의 실제 높이를 측정해 나머지 컬럼의 max/minHeight에 적용
// → 컬럼별 아이템 수가 달라도 높이를 동일하게 맞춤
const referenceScrollRef = ref(null); // 사업개발 task-category-scroll DOM 참조
const referenceHeight = ref(0);       // 측정된 기준 높이 (px)

// 모든 컬럼에 공통 적용되는 인라인 스크롤 스타일
const colScrollStyle = computed(() =>
  referenceHeight.value > 0
    ? { minHeight: referenceHeight.value + 'px', maxHeight: referenceHeight.value + 'px', overflowY: 'auto' }
    : {}
);

// ============================================================
// [4] 데이터 로드 (태스크 목록 API)
// ============================================================
// bizType(109, 180~183)별로 그룹핑하여 taskCodes에 저장 (BIZ_TASK 전역 부모 task)
const taskCodes = ref({});

// 해당 사업에 등록된 자식 task (BIZ_PORTAL 기준, per-business)
const portalChildren = ref({});

// BIZ_TASK 부모 + BIZ_PORTAL 자식을 합친 전체 목록 반환
const getTasksForBizType = (bizType) => [
  ...(taskCodes.value[bizType] || []),
  ...(portalChildren.value[bizType] || []),
];

onMounted(() => {
  // 전역 부모 task 조회 (자식 제외)
  proxy.$br_trans([{
    url: "/kopms-api/biz/taskList",
    method: "post",
    data: { excludeChildren: true },
  }], (url, code, msg, data) => {
    if (code < 0) return;
    const list = data.taskList || [];
    taskCodes.value = list.reduce((acc, task) => {
      if (!acc[task.bizType]) acc[task.bizType] = [];
      acc[task.bizType].push(task);
      return acc;
    }, {});
  });

  // 해당 사업 자식 task 조회 (BIZ_PORTAL 기준)
  if (props.bizId) {
    proxy.$br_trans([{
      url: "/kopms-api/biz/getBizData",
      method: "post",
      data: { masterNo: props.bizId },
    }], (_url, code, _msg, data) => {
      if (code < 0) return;
      // allPortalChildren: C(미선택) 포함 전체 자식 task 목록
      const children = data.allPortalChildren || [];
      const result = {};
      children.forEach(t => {
        const bizType = t.taskType;
        if (!result[bizType]) result[bizType] = [];
        result[bizType].push(t);
      });
      portalChildren.value = result;

      // 선택된 자식(taskStatus !== 'C')이 있는 부모만 자동 펼침
      children.forEach(c => {
        if (c.taskStatus !== 'C') {
          const key = c.taskType + '_' + c.templateCode;
          expandedParents.value[key] = true;
        }
      });
    });
  }
});

// ============================================================
// [5] 공통 유틸
// ============================================================
// object(task) 또는 string(code) 모두 처리 → taskCode 문자열 반환
const toCode = (item) => typeof item === 'object' ? item.taskCode : item;

// 단일 필드 업데이트 emit 헬퍼
const updateField = (fieldName, value) => {
  emit('update:modelValue', { ...props.modelValue, [fieldName]: value });
};


// ============================================================
// [5-1] 필드 컬럼 그룹 데이터 (부모-자식 구조)
// ============================================================
// templateYn='Y'인 부모 task에 _children 배열을 붙여 반환
// templateCode가 있는 task는 자식으로 부모 아래 포함되며 top-level에서 제외됨
// taskCodes / portalChildren 변경 시에만 재계산 (매 렌더링 재계산 방지)
const groupedFieldItems = computed(() => {
  const build = (bizType) => {
    const list = getTasksForBizType(bizType);
    const childMap = {};
    list.filter(t => t.templateCode).forEach(c => {
      if (!childMap[c.templateCode]) childMap[c.templateCode] = [];
      childMap[c.templateCode].push(c);
    });
    return list
      .filter(t => !t.templateCode)
      .map(t => ({
        ...t,
        _children: t.templateYn === 'Y' ? (childMap[t.taskCode] || []) : null,
      }))
      .sort((a, b) => {
        if (a._children !== null && b._children === null) return -1;
        if (a._children === null && b._children !== null) return 1;
        return 0;
      });
  };
  return { '180': build('180'), '181': build('181'), '182': build('182'), '183': build('183') };
});

// 부모 task 펼침/접기 상태
const expandedParents = ref({});

// 저장 후 재조회 시 allPortalChildren 변경 감지 → portalChildren + expandedParents 재계산
watch(() => props.modelValue?.allPortalChildren, (children) => {
  if (!children) return;
  const result = {};
  children.forEach(t => {
    if (!result[t.taskType]) result[t.taskType] = [];
    result[t.taskType].push(t);
  });
  portalChildren.value = result;

  // 부모별 초기화 후 non-C 자식 있으면 열기
  const parentKeys = new Set(children.map(c => c.taskType + '_' + c.templateCode));
  parentKeys.forEach(key => { expandedParents.value[key] = false; });
  children.forEach(c => {
    if (c.taskStatus !== 'C') {
      expandedParents.value[c.taskType + '_' + c.templateCode] = true;
    }
  });
});

// 부모 헤더 클릭: 펼침/접기만
const toggleExpandParent = (taskCode) => {
  expandedParents.value[taskCode] = !expandedParents.value[taskCode];
};

// 자식 중 하나라도 선택되었는지 (부모 selected 판단용)
const isAnyChildSelected = (item, fieldName) => {
  const current = localData.value[fieldName] || [];
  return (item._children || []).some(c => current.includes(c.taskCode));
};

// 선택된 자식 수
const countSelectedChildren = (item, fieldName) => {
  const current = localData.value[fieldName] || [];
  return (item._children || []).filter(c => current.includes(c.taskCode)).length;
};

// 자식 전체 선택 여부
const isAllChildrenSelected = (item, fieldName) => {
  const children = item._children || [];
  if (children.length === 0) return false;
  const current = localData.value[fieldName] || [];
  return children.every(c => current.includes(c.taskCode));
};

// 자식 전체 선택/해제
const toggleAllChildren = (item, fieldName) => {
  if (isBizClosed.value) return;
  const current = localData.value[fieldName] || [];
  const childCodes = (item._children || []).map(c => c.taskCode);
  if (isAllChildrenSelected(item, fieldName)) {
    // 전체 해제: 자식 + 부모 모두 제거
    updateField(fieldName, current.filter(c => !childCodes.includes(c) && c !== item.taskCode));
  } else {
    // 자식 전체 선택 시 부모도 함께 포함
    const merged = [...new Set([...current, item.taskCode, ...childCodes])];
    updateField(fieldName, merged);
    expandedParents.value[getBizTypeByField(fieldName) + '_' + item.taskCode] = true;
  }
};

// ============================================================
// [6] 로컬 데이터 / 컬럼 설정
// ============================================================
// 용역·인허가·주민상생·SPC 필드를 taskCode 문자열 배열로 정규화
const localData = computed(() => {
  const result = {
    service:    (props.modelValue.service    || []).map(toCode),
    license:    (props.modelValue.license    || []).map(toCode),
    spc:        (props.modelValue.spc        || []).map(toCode),
    publicTask: (props.modelValue.publicTask || []).map(toCode),
  };
  return result;
});

// 용역~SPC 4개 컬럼 설정 (title: 헤더 표시명, field: modelValue 키, group: API bizType 코드)
const fieldColumns = [
  { title: '용역',    field: 'service',    group: '180' },
  { title: '인허가',  field: 'license',    group: '181' },
  { title: 'SPC',    field: 'spc',        group: '182' },
  { title: '주민상생',field: 'publicTask', group: '183' },
];

// ============================================================
// [7] 사내절차 (사업발굴 S* / 사업개발 D*)
// ============================================================
// proSteps 배열에서 S로 시작하는 코드(사업발굴)만 분리한 writable computed
// set 시 D* 코드는 유지한 채 S* 코드만 교체
const sSteps = computed({
  get: () => (props.modelValue.proSteps || []).map(toCode).filter(c => c?.startsWith('S')),
  set: (val) => {
    const others = (props.modelValue.proSteps || []).map(toCode).filter(c => !c?.startsWith('S'));
    emit('update:modelValue', { ...props.modelValue, proSteps: [...others, ...val] });
  },
});

// proSteps 배열에서 D로 시작하는 코드(사업개발)만 분리한 writable computed
// set 시 S* 코드는 유지한 채 D* 코드만 교체
const dSteps = computed({
  get: () => (props.modelValue.proSteps || []).map(toCode).filter(c => c?.startsWith('D')),
  set: (val) => {
    const others = (props.modelValue.proSteps || []).map(toCode).filter(c => !c?.startsWith('D'));
    emit('update:modelValue', { ...props.modelValue, proSteps: [...others, ...val] });
  },
});

const listS109 = computed(() => (taskCodes.value['109'] || []).filter(t => t.taskCode?.startsWith('S')));
const listD109 = computed(() => (taskCodes.value['109'] || []).filter(t => t.taskCode?.startsWith('D')));

// 사업개발 목록 로드 후 DOM 높이 측정 → 기준 높이(referenceHeight) 갱신
watch(listD109, async (val) => {
  if (val.length === 0) return;
  await nextTick();
  if (referenceScrollRef.value) {
    referenceHeight.value = referenceScrollRef.value.scrollHeight;
  }
});

// ============================================================
// [8] 항목 토글
// ============================================================
// 사업발굴 단일 항목 토글 (lockedSteps에 포함된 코드는 무시)
const toggleSStep = (taskCode) => {
  if (isBizClosed.value) return;
  if (props.lockedSteps.includes(taskCode)) return;
  sSteps.value = sSteps.value.includes(taskCode)
    ? sSteps.value.filter(c => c !== taskCode)
    : [...sSteps.value, taskCode];
};

// 사업개발 단일 항목 토글 (lockedSteps에 포함된 코드는 무시)
const toggleDStep = (taskCode) => {
  if (isBizClosed.value) return;
  if (props.lockedSteps.includes(taskCode)) return;
  dSteps.value = dSteps.value.includes(taskCode)
    ? dSteps.value.filter(c => c !== taskCode)
    : [...dSteps.value, taskCode];
};

// 용역/인허가/주민상생/SPC 단일 항목 토글
// fieldName에 해당하는 bizType 코드를 역조회
const getBizTypeByField = (fieldName) => {
  const col = fieldColumns.find(c => c.field === fieldName);
  return col?.group ?? null;
};

// taskCode의 부모 taskCode를 반환 (자식이 아니면 null)
const getParentCode = (taskCode, fieldName) => {
  const bizType = getBizTypeByField(fieldName);
  if (!bizType) return null;
  const task = getTasksForBizType(bizType).find(t => t.taskCode === taskCode);
  return task?.templateCode ?? null;
};

const toggleField = (taskCode, fieldName) => {
  if (isBizClosed.value) return;
  const bizType = getBizTypeByField(fieldName);
  const task = getTasksForBizType(bizType)?.find(t => t.taskCode === taskCode);
  // 부모 task(templateYn='Y')는 locked 체크 제외 (자식을 통해 자동 관리됨)
  if (task?.templateYn !== 'Y' && props.lockedFieldSteps.includes(taskCode)) return;
  const current = (localData.value[fieldName] || []);
  if (current.includes(taskCode)) {
    // 선택 해제: 해당 코드 제거
    let updated = current.filter(c => c !== taskCode);

    // 자식이면: 형제 자식이 모두 해제됐을 경우 부모도 함께 해제
    const parentCode = getParentCode(taskCode, fieldName);
    if (parentCode) {
      const bizType = getBizTypeByField(fieldName);
      const siblings = getTasksForBizType(bizType).filter(t => t.templateCode === parentCode);
      const hasRemainingChild = siblings.some(s => s.taskCode !== taskCode && updated.includes(s.taskCode));
      if (!hasRemainingChild) {
        // 포탈에 자식이 등록된 부모는 자식 전체 해제 시에도 유지
        const hasPortalChildren = (portalChildren.value[bizType] || [])
          .some(t => t.templateCode === parentCode);
        if (!hasPortalChildren) {
          updated = updated.filter(c => c !== parentCode);
        }
      }
    }

    updateField(fieldName, updated);
  } else {
    // 선택: 자식이면 부모도 함께 추가
    const parentCode = getParentCode(taskCode, fieldName);
    const toAdd = parentCode && !current.includes(parentCode)
      ? [parentCode, taskCode]
      : [taskCode];
    updateField(fieldName, [...current, ...toAdd]);
  }
};

// ============================================================
// [9] 전체 선택 / 해제
// ============================================================
// 사업발굴: 전체 선택 여부 / 전체 토글 (lockedSteps는 해제 시에도 유지)
const isAllSChecked = computed(() =>
  listS109.value.length > 0 && listS109.value.every(t => sSteps.value.includes(t.taskCode))
);
const toggleAllS = () => {
  if (isBizClosed.value) return;
  if (isAllSChecked.value) {
    sSteps.value = sSteps.value.filter(c => props.lockedSteps.includes(c));
  } else {
    const allCodes = listS109.value.map(t => t.taskCode);
    sSteps.value = [...new Set([...sSteps.value, ...allCodes])];
  }
};

// 사업개발: 전체 선택 여부 / 전체 토글 (lockedSteps는 해제 시에도 유지)
const isAllDChecked = computed(() =>
  listD109.value.length > 0 && listD109.value.every(t => dSteps.value.includes(t.taskCode))
);
const toggleAllD = () => {
  if (isBizClosed.value) return;
  if (isAllDChecked.value) {
    dSteps.value = dSteps.value.filter(c => props.lockedSteps.includes(c));
  } else {
    const allCodes = listD109.value.map(t => t.taskCode);
    dSteps.value = [...new Set([...dSteps.value, ...allCodes])];
  }
};

// 용역/인허가/주민상생/SPC: 전체 선택 여부 / 전체 토글
const isAllFieldChecked = (fieldName, list) =>
  list.length > 0 && list.every(t => (localData.value[fieldName] || []).includes(t.taskCode));

const toggleAllField = (fieldName, list) => {
  if (isBizClosed.value) return;
  if (isAllFieldChecked(fieldName, list)) {
    updateField(fieldName, []);
  } else {
    updateField(fieldName, list.map(t => t.taskCode));
  }
};

// ============================================================
// [10] 선택 결과 요약
// ============================================================
// "선택된 항목" 카드 클릭으로 토글, 항목 선택 시 자동 펼침
const showSummary = ref(false);

// 전체 초기화: lockedSteps 코드는 유지하고 나머지 모두 초기화 후 패널 접기
const resetAll = () => {
  if (isBizClosed.value) return;
  const lockedS = sSteps.value.filter(c => props.lockedSteps.includes(c));
  const lockedD = dSteps.value.filter(c => props.lockedSteps.includes(c));
  emit('update:modelValue', {
    ...props.modelValue,
    proSteps: [...lockedS, ...lockedD],
    service: [],
    license: [],
    publicTask: [],
    spc: [],
  });
  showSummary.value = false;
};

// 선택된 항목을 그룹별로 정리, 빈 그룹은 제외
// 부모 task(templateYn='Y')는 자식이 아예 없을 때만 표시 (자식이 하나라도 존재하면 자식들이 대신 표시됨)
const showInSummary = (t, bizType, selectedCodes) => {
  if (!selectedCodes.includes(t.taskCode)) return false;
  if (t.templateYn !== 'Y') return true;
  return !getTasksForBizType(bizType).some(c => c.templateCode === t.taskCode);
};

// 자식 task는 부모의 배열 위치 기준으로 정렬 (부모가 앞에 있으면 자식도 앞에)
const summaryItems = (bizType, selectedCodes) => {
  const all = getTasksForBizType(bizType);
  const filtered = all.filter(t => showInSummary(t, bizType, selectedCodes));
  return [...filtered].sort((a, b) => {
    const key = (t) => {
      const ownIdx    = all.findIndex(p => p.taskCode === t.taskCode);
      const parentIdx = t.templateCode ? all.findIndex(p => p.taskCode === t.templateCode) : -1;
      return parentIdx >= 0 ? parentIdx * 1000 + ownIdx : ownIdx * 1000;
    };
    return key(a) - key(b);
  });
};

const summaryGroups = computed(() => [
  { title: '사업발굴', items: listS109.value.filter(t => sSteps.value.includes(t.taskCode)),   toggle: toggleSStep },
  { title: '사업개발', items: listD109.value.filter(t => dSteps.value.includes(t.taskCode)),   toggle: toggleDStep },
  { title: '용역',    items: summaryItems('180', localData.value.service    || []),            toggle: (c) => toggleField(c, 'service') },
  { title: '인허가',  items: summaryItems('181', localData.value.license    || []),            toggle: (c) => toggleField(c, 'license') },
  { title: 'SPC',    items: summaryItems('182', localData.value.spc        || []),            toggle: (c) => toggleField(c, 'spc') },
  { title: '주민상생',items: summaryItems('183', localData.value.publicTask || []),            toggle: (c) => toggleField(c, 'publicTask') },
].filter(g => g.items.length > 0));

// 전체 선택 항목 수 (0이 되면 패널은 수동 열기 전까지 유지, 양수가 되면 자동 펼침)
const totalCheckedCount = computed(() => summaryGroups.value.reduce((s, g) => s + g.items.length, 0));

watch(totalCheckedCount, (val) => {
  if (val > 0) showSummary.value = true;
});

</script>

<style lang="scss" scoped>
/* ── 컬럼 ── */
.task-category-col {
  flex: 1 1 0;
  min-width: 120px;
}

/* ── 상단 그룹 ── */
.task-category-box {
  border: 1px solid #4472c4;
  border-radius: 12px;
  overflow: hidden;
}
.task-category-header {
  display: flex;
  align-items: center;
  gap: 4px;
  background-color: #f4f7fd;
  border-bottom: 1px solid #dce8f8;
  border-radius: 8px 8px 0 0;
  padding: 8px 12px;
}
.task-category-title {
  font-size: 14px;
  font-weight: bold;
  color: #4472c4;
}
.task-select-all {
  font-size: 11px;
  color: #aaa;
  cursor: pointer;
  user-select: none;
}
.task-select-all:hover {
  color: #4472c4;
  text-decoration: underline;
}
.task-category-scroll {
  overflow-y: auto;
}

/* ── 카드 ── */
.task-item-card {
  height: 30px;
  background-color: #f8fafc !important;
  border: 1.5px solid #cbd5e1 !important;
  border-radius: 16px;
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease,
              transform 0.15s ease, box-shadow 0.15s ease;
}
.task-item-card:hover {
  background-color: #e8effa !important;
  border-color: #4472c4 !important;
  transform: translateY(-1px);
  box-shadow: 0 3px 8px rgba(68, 114, 196, 0.15) !important;
}
.task-item-card.selected {
  background-color: #4472c4 !important;
  border: 1.5px solid #4472c4 !important;
}
.task-item-card.selected:hover {
  background-color: #3561a8 !important;
  border-color: #3561a8 !important;
}
.task-item-card.selected-locked {
  background-color: #94a3b8 !important;
  border: 1.5px solid #94a3b8 !important;
  &:hover {
    background-color: #94a3b8 !important;
    border-color: #94a3b8 !important;
    transform: none;
    box-shadow: none !important;
  }
}
.task-item-card.item-locked {
  cursor: not-allowed;
  &:hover {
    border-color: #cbd5e1 !important;
    transform: none;
    box-shadow: none !important;
  }
}
.task-item-card.biz-closed {
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
  &:hover {
    border-color: #cbd5e1 !important;
    transform: none !important;
    box-shadow: none !important;
  }
}
.task-item-name {
  font-size: 13px;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.2s ease;
}
.selected .task-item-name,
.selected-locked .task-item-name {
  color: white;
  font-weight: bold;
}

/* ── 부모 task 컨테이너 (wrapper) ── */
.task-parent-wrapper {
  border-radius: 16px;
  border: 1.5px solid #cbd5e1;
  background-color: #f8fafc;
  overflow: hidden;
  box-shadow: 0px 2px 4px -1px rgba(0,0,0,.2), 0px 4px 5px 0px rgba(0,0,0,.14), 0px 1px 10px 0px rgba(0,0,0,.12);
  transition: background-color 0.2s ease, border-color 0.2s ease,
              transform 0.15s ease, box-shadow 0.15s ease;
  &:hover {
    background-color: #e8effa;
    border-color: #4472c4;
    transform: translateY(-1px);
    box-shadow: 0 3px 8px rgba(68, 114, 196, 0.15);
  }
  &.parent-selected {
    background-color: #4472c4;
    border-color: #4472c4;
    &:hover {
      background-color: #3561a8;
      border-color: #3561a8;
    }
  }
}
.task-parent-header {
  height: 30px;
  cursor: pointer;
  user-select: none;
}
.task-parent-wrapper.biz-closed {
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
  .task-parent-header { cursor: not-allowed; }
  &:hover {
    background-color: #f8fafc;
    border-color: #cbd5e1;
    transform: none;
    box-shadow: none;
  }
}
.parent-selected .task-parent-header .task-item-name {
  color: white;
  font-weight: bold;
}

/* ── 자식 카드 (컨테이너 안) ── */
.task-parent-children {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.task-child-inner {
  height: 28px;
  background-color: white;
  border: 1.5px solid #cbd5e1;
  border-radius: 12px;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.15s ease, border-color 0.15s ease;
  &:hover {
    background-color: #e8effa;
    border-color: #4472c4;
  }
  &.child-selected-locked {
    background-color: #94a3b8;
    border-color: #94a3b8;
    cursor: not-allowed;
  }
  &.biz-closed {
    cursor: not-allowed;
    &:hover {
      background-color: white;
      border-color: #cbd5e1;
    }
  }
  &.child-selected-locked .task-item-name {
    color: white;
    font-weight: bold;
  }
  &.child-selected {
    background-color: #4472c4;
    border-color: #4472c4;
    &:hover {
      background-color: #3561a8;
      border-color: #3561a8;
    }
  }
  &.child-selected .task-item-name {
    color: white;
    font-weight: bold;
  }
}

/* ── 자식 수 chip ── */
.child-count-chip {
  font-size: 10px;
  font-weight: 600;
  color: #4472c4;
  background: #ffffff;
  border-radius: 10px;
  padding: 0px 6px;
  line-height: 1.4;
  flex-shrink: 0;
  box-shadow: 0 2px 5px rgba(53, 96, 173, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.18);
}

/* ── 요약 영역 ── */
.task-summary-panel {
  width: 100%;
  min-width: 0;
  contain: inline-size;
  overflow-x: clip;
  border: 1px solid #c5d5f0;
  border-radius: 12px;
  padding: 12px 16px;
}
.task-summary-footer {
  display: flex;
  justify-content: flex-end;
}
.task-reset-btn {
  font-size: 11px;
  color: #ef5350;
  cursor: pointer;
  user-select: none;
}
.task-reset-btn:hover {
  color: #c62828;
  text-decoration: underline;
}
.task-empty-state {
  font-size: 13px;
  color: #aaa;
  text-align: center;
  padding: 16px 0;
}
.task-group {
  margin-top: 12px;
}
.task-group-header {
  display: flex;
  align-items: center;
  gap: 6px;
}
.task-group-bar {
  display: inline-block;
  width: 3px;
  height: 14px;
  background-color: #4472c4;
  border-radius: 2px;
  flex-shrink: 0;
}
.task-group-title {
  font-size: 13px;
  font-weight: bold;
  color: #1a237e;
}
.task-group-count {
  font-size: 11px;
  color: #888;
}
.task-chip-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.task-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background-color: #eff6ff;
  color: #1e40af;
  border: 1px solid #bfdbfe;
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 20px;
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease;
}
.task-chip:hover {
  background-color: #dbeafe;
  border-color: #93c5fd;
}
.task-chip-remove {
  font-size: 10px;
  color: #ef5350;
  transition: color 0.15s ease;
}
.task-chip:hover .task-chip-remove {
  color: #c62828;
}

/* ── 칩 애니메이션 ── */
.task-chip-enter-active,
.task-chip-leave-active {
  transition: all 0.2s ease;
}
.task-chip-enter-from,
.task-chip-leave-to {
  opacity: 0;
  transform: scale(0.8);
}
</style>
