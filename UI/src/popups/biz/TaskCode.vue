<template>
  <v-card>
    <v-card-title class="pa-0">
      <v-toolbar color="primary" density="compact">
        <v-toolbar-title class="text-subtitle-1 font-weight-bold">
          <v-icon icon="mdi-circle-double"/>
          Task코드 관리
        </v-toolbar-title>
      </v-toolbar>
    </v-card-title>

    <v-container fluid class="pt-4 pl-4 pr-4 bg-grey-lighten-4" style="height: 500px;">
      <v-row class="fill-height">

        <!-- ────────── 좌측: 그룹코드 목록 ────────── -->
        <v-col cols="3">
          <v-card variant="outlined" class="fill-height bg-white">
            <v-toolbar color="grey-lighten-4" density="compact" flat>
              <v-toolbar-title class="text-subtitle-2 font-weight-bold">
                그룹코드
              </v-toolbar-title>
            </v-toolbar>
            <v-table density="compact" hover>
              <thead>
                <tr class="bg-grey-lighten-3">
                  <th>코드</th>
                  <th>코드명</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="group in groupCodes" :key="group.code"
                    :class="{ 'bg-blue-lighten-5': selectedGroup == group.code }"
                    @click="selectGroup(group.code)">
                  <td>{{ group.code }}</td>
                  <td>
                    {{ group.name }}
                    <v-badge
                      v-if="changedCountByGroup[group.code]"
                      :content="changedCountByGroup[group.code]"
                      color="orange"
                      inline
                    />
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card>
        </v-col>

        <!-- ────────── 중앙: Task코드 목록 ────────── -->
        <v-col cols="4" class="fill-height">
          <v-card variant="outlined" class="fill-height bg-white">
            <v-toolbar color="grey-lighten-4" density="compact" flat>
              <v-toolbar-title class="text-subtitle-2 font-weight-bold">
                Task코드
              </v-toolbar-title>
            </v-toolbar>
            <v-table density="compact" hover class="overflow-y-auto" style="height: calc(100% - 48px);">
              <colgroup>
                <col />
                <col />
                <col style="width: 50px;" />
              </colgroup>
              <thead>
                <tr class="bg-grey-lighten-3">
                  <th style="white-space: nowrap;">코드</th>
                  <th style="white-space: nowrap;">코드명</th>
                  <th style="white-space: nowrap;">소요기간</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="task in currentTaskList"
                  :ref="el => { if (el) taskRowRefs[task.taskCode] = el }"
                  @click="selectTask(task)"
                  :class="{
                    'bg-yellow-lighten-5': selectedTask?.taskCode === task.taskCode,
                    'bg-orange-lighten-5': isChanged(task),
                    'bg-green-lighten-5':  isNewlyAdded(task),
                    'task-child-row':      task._depth > 0,
                  }"
                >
                  <td
                    style="white-space: nowrap;"
                    :style="task._hasChildren ? 'cursor: pointer;' : ''"
                    @click.stop="task._hasChildren ? (toggleExpand(task.taskCode), selectTask(task)) : selectTask(task)"
                  >
                    <!-- 자식이 있는 부모: 펼침/접기 아이콘 (시각적 힌트) -->
                    <v-icon v-if="task._hasChildren" size="14" style="margin-right: 2px; color: #666;">
                      {{ expandedTasks[task.taskCode] ? 'mdi-chevron-down' : 'mdi-chevron-right' }}
                    </v-icon>
                    <!-- 자식 행: 들여쓰기 -->
                    <span v-else-if="task._depth > 0" style="display:inline-block; width:20px; color:#aaa; font-size:11px;">└</span>
                    <!-- 일반 task: 빈 공간으로 정렬 맞춤 -->
                    <span v-else style="display:inline-block; width:20px;"></span>
                    {{ task.taskCode }}
                  </td>
                  <td>
                    <div class="d-flex flex-wrap align-center" style="gap: 2px 6px;">
                      <span>{{ task.taskName }}</span>
                      <v-chip v-if="isNewlyAdded(task)" size="x-small" color="green" label>신규추가</v-chip>
                      <v-chip v-if="getChangedFields(task).includes('taskName')" size="x-small" color="orange" label>명칭변경</v-chip>
                    </div>
                  </td>
                  <td>
                    <div class="d-flex flex-wrap align-center" style="gap: 2px 6px;">
                      <span>{{ task.takeDays || '-' }}</span>
                      <v-chip v-if="getChangedFields(task).includes('takeDays')" size="x-small" color="orange" label>변경</v-chip>
                    </div>
                  </td>
                </tr>
                <tr v-if="currentTaskList.length === 0">
                  <td colspan="3" class="text-center py-4 text-grey">데이터가 없습니다.</td>
                </tr>
              </tbody>
            </v-table>
          </v-card>
        </v-col>

        <!-- ────────── 우측: Task 상세정보 / 편집 폼 ────────── -->
        <v-col cols="5">
          <v-card variant="outlined" class="fill-height overflow-y-auto bg-white">
            <v-toolbar color="grey-lighten-4" density="compact" flat>
              <v-toolbar-title class="text-subtitle-2 font-weight-bold">
                <span>Task정보</span>
              </v-toolbar-title>
              <!-- 버전 선택 드롭다운 -->
              <v-select
                v-model="selectedVersion"
                :items="versionOptions"
                item-title="title"
                item-value="value"
                density="compact"
                @update:model-value="onVersionChange"
                hide-details
                variant="outlined"
                class="mr-2"
                style="max-width: 255px;"
              >
              </v-select>
            </v-toolbar>

            <!-- 그룹코드 (읽기전용) -->
            <v-row no-gutters class="align-center mx-4 mt-2">
              <v-col cols="3">그룹코드</v-col>
              <v-col cols="9">
                <v-text-field
                  :model-value="currentGroupName"
                  density="compact"
                  variant="outlined"
                  hide-details
                  readonly
                  bg-color="grey-lighten-4"
                  persistent-placeholder
                  placeholder="그룹을 선택해주세요"
                >
                </v-text-field>
              </v-col>
            </v-row>

            <!-- 코드: 사내절차(109) 또는 수정 모드에서는 읽기전용 -->
            <v-row no-gutters class="align-center mx-4 mt-2">
              <v-col cols="3">코드</v-col>
              <v-col cols="9">
                <v-text-field
                  v-model="taskData.taskCode"
                  density="compact"
                  variant="outlined"
                  hide-details
                  readonly
                  bg-color="grey-lighten-4"
                />
              </v-col>
            </v-row>

            <!-- 코드명: 사내절차(109)에서는 읽기전용 -->
            <v-row no-gutters class="align-center mx-4 mt-2">
              <v-col cols="3">코드명</v-col>
              <v-col cols="9">
                <v-text-field
                  ref="taskNameRef"
                  v-model="taskData.taskName"
                  density="compact"
                  variant="outlined"
                  hide-details
                  :readonly="selectedGroup == '109'"
                  :bg-color="selectedGroup == '109' ? 'grey-lighten-4' : ''"
                />
              </v-col>
            </v-row>

            <!-- 소요기간 -->
            <v-row no-gutters class="align-center mx-4 mt-2">
              <v-col cols="3">소요기간</v-col>
              <v-col cols="9">
                <v-text-field v-model="taskData.takeDays" density="compact" variant="outlined" hide-details/>
              </v-col>
            </v-row>

            <!-- 차수관리 여부 (109 사내절차 제외, child task 제외) -->
            <v-row v-if="selectedGroup != '109' && !taskData.templateCode" no-gutters class="align-center mx-4 mt-2">
              <v-col cols="3">차수관리</v-col>
              <v-col cols="9">
                <v-checkbox
                  v-model="taskData.templateYn"
                  true-value="Y"
                  false-value="N"
                  label="차수관리 여부"
                  density="compact"
                  hide-details
                />
              </v-col>
            </v-row>

            <!-- 액션 버튼: 신규 / 저장 / 삭제 -->
            <div class="d-flex justify-end ma-4 ga-2" style="min-height: 36px;">
              <v-btn v-if="selectedGroup != '109'" color="primary" @click="addNewTask">신규</v-btn>
              <v-btn v-if="selectedVersion == 'current'" color="primary" @click="saveTaskList">저장</v-btn>
              <v-btn v-if="selectedGroup != '109' && selectedVersion == 'current' && selectedTask && !isNew" color="error" @click="deleteTask">삭제</v-btn>
            </div>
          </v-card>
        </v-col>

      </v-row>
    </v-container>

  </v-card>
</template>

<script setup>
// ============================================================
// [1] Vue / 플러그인 임포트
// ============================================================
import { ref, computed, onMounted, nextTick, getCurrentInstance } from 'vue';
import { useUserStore } from '@/store/user.js';

// ============================================================
// [2] 글로벌 도구 / 스토어
// ============================================================
const { proxy } = getCurrentInstance();
const userStore = useUserStore();
const userInfo = userStore.getUserInfo();

// ============================================================
// [3] 그룹코드 정의 (정적 데이터)
// ============================================================
const groupCodes = [
  { code: '109', name: '사내절차' },
  { code: '180', name: '용역' },
  { code: '181', name: '인허가' },
  { code: '182', name: 'SPC' },
  { code: '183', name: '주민상생' }
];

// ============================================================
// [4] 상태 변수 (refs)
// ============================================================
const selectedGroup   = ref('109');  // 좌측 그룹코드 선택값 (기본: 사내절차)
const selectedTask    = ref(null);   // 중앙 테이블에서 선택된 Task
const isNew           = ref(false);  // 신규 등록 모드 여부 (true: 코드 입력 가능)
const taskList        = ref([]);     // 서버에서 받아온 전체 Task 목록
const taskHistoryList = ref([]);     // 서버에서 받아온 Task 이력 목록
const originalTaskList = ref([]);    // 버전 복원용 원본 Task 목록 (깊은 복사 보관)
const selectedVersion = ref('current'); // 버전 드롭다운 선택값
const taskRowRefs    = ref({});         // 중앙 테이블 행 DOM 참조 (변경 행 스크롤용)
const taskNameRef    = ref(null);       // 코드명 입력 필드 DOM 참조 (신규 시 자동 포커스용)
const expandedTasks  = ref({});         // 부모 task 펼침 상태 { taskCode: true/false }

// 우측 폼에 바인딩되는 Task 편집 데이터
const taskData = ref({
  bizType:    '',
  taskCode:   '',
  taskName:   '',
  takeDays:   '',
  templateYn: 'N',
  writerId:   userInfo.empno
});

// ============================================================
// [5] Computed
// ============================================================

// taskData.bizType에 해당하는 그룹명(한글) 반환 — 우측 폼 "그룹코드" 필드에 표시
const currentGroupName = computed(() => {
  const group = groupCodes.find(g => g.code == taskData.value.bizType);
  return group ? group.name : '';
});

// 현재 선택된 그룹(bizType)에 해당하는 Task를 트리 구조로 정렬하여 반환
// - 부모(templateCode 없음)를 먼저 나열하고, 펼쳐진 부모 아래에 자식을 삽입
// - _depth: 0=최상위, 1=자식 / _hasChildren: 자식 존재 여부
const currentTaskList = computed(() => {
  if (!taskList.value || !Array.isArray(taskList.value)) return [];
  const all = taskList.value.filter(item => item.bizType == selectedGroup.value);
  const parents = all.filter(t => !t.templateCode);
  const result = [];
  for (const parent of parents) {
    const children = all.filter(c => c.templateCode === parent.taskCode);
    result.push({ ...parent, _depth: 0, _hasChildren: parent.templateYn === 'Y' && children.length > 0 });
    if (parent.templateYn === 'Y' && expandedTasks.value[parent.taskCode] && children.length > 0) {
      for (const child of children) {
        result.push({ ...child, _depth: 1, _hasChildren: false });
      }
    }
  }
  return result;
});

// 현재 버전과 비교했을 때 변경된 필드 목록 반환 (taskName / takeDays)
// 현재 버전 선택 중이거나 원본과 동일하면 빈 배열
const getChangedFields = (task) => {
  if (selectedVersion.value === 'current') return [];
  const original = originalTaskList.value.find(
    o => o.bizType === task.bizType && o.taskCode === task.taskCode
  );
  if (!original) return [];
  const fields = [];
  if (String(original.taskName) !== String(task.taskName)) fields.push('taskName');
  if (String(original.takeDays) !== String(task.takeDays)) fields.push('takeDays');
  return fields;
};

// 하나라도 변경된 필드가 있으면 true
const isChanged = (task) => getChangedFields(task).length > 0;

// 선택한 버전에서 신규 추가된 task인지 판별
// — DB에서 REGI_DATE와 VERSION_UPDATE_DATE 차이가 5초 이내인 경우 IS_NEW_TASK='Y'로 반환
// — task 등록과 이력 저장이 연속 실행되므로 5초 이내면 신규 등록 시점으로 간주
const isNewlyAdded = (task) => {
  if (selectedVersion.value === 'current') return false;
  const v = Number(selectedVersion.value);
  return taskHistoryList.value.some(
    h => Number(h.version) === v
      && h.bizType === task.bizType
      && h.taskCode === task.taskCode
      && h.isNewTask === 'Y'
  );
};

// 그룹별 변경/신규 건수 — 좌측 그룹코드 테이블 뱃지에 사용
const changedCountByGroup = computed(() => {
  if (selectedVersion.value === 'current') return {};
  return taskList.value.reduce((acc, task) => {
    if (isChanged(task) || isNewlyAdded(task)) {
      acc[task.bizType] = (acc[task.bizType] || 0) + 1;
    }
    return acc;
  }, {});
});

// 버전 드롭다운 옵션: '현재 버전' + 이력 버전 목록
const versionOptions = computed(() => {
  const options = [{ title: '현재 버전 (최신)', value: 'current' }];
  if (taskHistoryList.value?.length > 0) {
    options.push(
      ...taskHistoryList.value.map(item => ({
        title: `버전 ${item.version} (${item.versionUpdateDate})`,
        value: item.version,
      }))
    );
  }
  return options;
});

// ============================================================
// [6] 이벤트 핸들러
// ============================================================

// 부모 task 펼침 상태 토글
const toggleExpand = (taskCode) => {
  expandedTasks.value[taskCode] = !expandedTasks.value[taskCode];
};

// 자식이 있는 부모 task를 모두 자동 펼침 (그룹 전환 및 데이터 로드 후 호출)
const expandParents = (bizType) => {
  const all = taskList.value.filter(t => t.bizType == bizType);
  all.forEach(t => {
    if (t.templateYn === 'Y' && all.some(c => c.templateCode === t.taskCode)) {
      expandedTasks.value[t.taskCode] = true;
    }
  });
};

// 그룹코드 선택 — 해당 그룹의 첫 번째 Task를 자동 선택
const selectGroup = (groupCode) => {
  selectedGroup.value = groupCode;
  expandParents(groupCode);
  const firstItem = taskList.value.find(item => item.bizType === groupCode);
  if (firstItem) {
    selectTask(firstItem);
  } else {
    // 해당 그룹에 데이터가 없으면 폼 초기화 (신규 모드 진입 방지)
    selectedTask.value = null;
    isNew.value = false;
    taskData.value = { bizType: groupCode, taskCode: '', taskName: '', takeDays: 0 };
  }
};

// Task 행 클릭 — 우측 폼에 선택된 Task 정보 표시
const selectTask = (task) => {
  isNew.value = false;
  selectedTask.value = task;
  taskData.value = {
    bizType:      task.bizType,
    taskCode:     task.taskCode,
    taskName:     task.taskName,
    takeDays:     task.takeDays || 0,
    templateYn:   task.templateYn || 'N',
    templateCode: task.templateCode || null,
    writerId:     userInfo.empno
  };
};

// 신규 버튼 클릭 — 폼 초기화 후 신규 입력 모드 진입
const addNewTask = () => {
  if (!selectedGroup.value) {
    alert('그룹을 먼저 선택해주세요.');
    return;
  }

  // 현재 그룹 내 최상위(부모) task만 대상으로 최대 코드 + 1 자동채번
  // (자식 코드 '01-01' 등은 parseInt 시 1로 파싱되므로 제외)
  const maxCode = currentTaskList.value.filter(t => !t.templateCode).reduce((max, t) => {
    const num = parseInt(t.taskCode, 10);
    return isNaN(num) ? max : Math.max(max, num);
  }, 0);
  const nextCode = String(maxCode + 1).padStart(2, '0');

  isNew.value = true;
  selectedVersion.value = 'current';
  selectedTask.value = null;
  taskData.value = {
    bizType:    selectedGroup.value,
    taskCode:   nextCode,
    taskName:   '',
    takeDays:   '',
    templateYn: 'N',
    writerId:   userInfo.empno
  };
  nextTick(() => taskNameRef.value?.focus());
};

// 버전 드롭다운 변경 — 선택 버전에 맞게 taskList 갱신
const onVersionChange = (version) => {
  // 현재 버전: 원본 목록으로 복원
  if (!version || version === 'current') {
    taskList.value = JSON.parse(JSON.stringify(originalTaskList.value));
  } else {
    // 과거 버전: 해당 버전 이력 데이터로 원본 목록의 takeDays / taskName 덮어쓰기
    const selectedHistories = taskHistoryList.value.filter(h => h.version === version);
    taskList.value = originalTaskList.value.map(mainTask => {
      const matchedHistory = selectedHistories.find(
        h => h.bizType === mainTask.bizType && h.taskCode === mainTask.taskCode
      );
      if (matchedHistory) {
        return {
          ...mainTask,
          takeDays:      matchedHistory.takeDays,
          taskName:      matchedHistory.taskName,
          isHistoryData: true,
        };
      }
      return { ...mainTask, isHistoryData: false };
    });
  }

  // 버전 변경 후 DOM 갱신 대기 → 첫 번째 변경/신규추가 행으로 자동 포커스
  // 1. 전체 taskList에서 변경(isChanged) 또는 신규추가(isNewlyAdded)된 첫 번째 항목 탐색 (그룹 무관)
  // 2. 해당 그룹으로 좌측 패널 전환 후 행 스크롤
  // nextTick 2중 중첩: 그룹 전환으로 인한 DOM 재렌더링까지 대기
  nextTick(() => nextTick(() => {
    const firstChanged = taskList.value.find(t => isChanged(t) || isNewlyAdded(t));
    if (firstChanged) {
      selectedGroup.value = firstChanged.bizType;  // 좌측 그룹 전환
      selectTask(firstChanged);                    // 우측 폼 반영
      nextTick(() => {
        taskRowRefs.value[firstChanged.taskCode]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    } else if (selectedTask.value) {
      // 변경 행이 없으면 기존 선택 Task를 최신 데이터로 갱신
      const refreshed = taskList.value.find(
        t => t.bizType === selectedTask.value.bizType && t.taskCode === selectedTask.value.taskCode
      );
      if (refreshed) selectTask(refreshed);
    }
  }));
};

// ============================================================
// [7] API 호출
// ============================================================

// Task 목록 + 이력 목록 조회
// focusTarget: { bizType, taskCode } — 조회 후 해당 행으로 자동 포커스 (신규 등록 후 사용)
const getTaskList = (focusTarget = null) => {
  proxy.$br_trans([{
    url:    '/kopms-api/biz/taskList',
    method: 'post',
    data:   { excludeChildren: true },
  }], (url, code, msg, data) => {
    taskList.value         = data.taskList;
    taskHistoryList.value  = data.taskHistoryList;
    originalTaskList.value = JSON.parse(JSON.stringify(data.taskList)); // 버전 복원용 원본 보관
    expandParents(selectedGroup.value);

    if (focusTarget) {
      nextTick(() => {
        selectedGroup.value = focusTarget.bizType;
        const target = taskList.value.find(
          t => t.bizType === focusTarget.bizType && t.taskCode === focusTarget.taskCode
        );
        if (target) {
          selectTask(target);
          nextTick(() => {
            taskRowRefs.value[target.taskCode]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          });
        }
      });
    }
  });
};

// Task 삭제
const deleteTask = () => {
  proxy.$dialog.confirm({
    title: '삭제 확인',
    text: `[${taskData.value.taskName}] Task를 삭제하시겠습니까?`,
    actions: {
      true:  { text: '확인', color: 'error' },
      false: '취소',
    },
  }).then(res => {
    if (!res) return;

    proxy.$br_trans([{
      url:    '/kopms-api/biz/deleteTask',
      method: 'post',
      data:   { bizType: taskData.value.bizType, taskCode: taskData.value.taskCode },
    }], (_url, _code, _msg, data) => {
      const status = data?.status;
      if (status === 'success') {
        proxy.$dialog.message.success(data.message || '삭제되었습니다.');
        getTaskList();
        selectedTask.value = null;
        isNew.value = false;
        taskData.value = { bizType: selectedGroup.value, taskCode: '', taskName: '', takeDays: '' };
      } else {
        proxy.$dialog.message.error(data?.message || '삭제에 실패하였습니다.');
      }
    });
  });
};

// Task 저장 (신규 등록 / 수정)
const saveTaskList = () => {
  const savedBizType  = taskData.value.bizType;
  const savedTaskCode = taskData.value.taskCode;

  proxy.$br_trans([{
    url:    '/kopms-api/biz/setTask',
    method: 'post',
    data:   { ...taskData.value, isNew: isNew.value },
  }], (url, code, msg, data) => {
    const status = data?.status;
    if (status === 'success') {
      proxy.$dialog.message.success(data.message || '저장되었습니다.');
      // 신규 등록 시 저장된 행으로 자동 포커스, 수정 시는 현재 선택 유지
      getTaskList(isNew.value ? { bizType: savedBizType, taskCode: savedTaskCode } : null);
    } else {
      proxy.$dialog.message.error(data?.message || '저장에 실패하였습니다.');
    }
  });
};

// ============================================================
// [8] 생명주기
// ============================================================
onMounted(() => {
  getTaskList();
});
</script>

<style scoped lang="scss">
:deep(.v-field__input) {
  min-height: 28px;
  padding-top: 0;
  padding-bottom: 0;
  font-size: 13px;
}

.task-child-row td {
  background-color: #fafafa;
  font-size: 12px;
  color: #555;
}
</style>
