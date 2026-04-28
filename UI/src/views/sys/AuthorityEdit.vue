<template>
  <v-container class="main-page-wrapper" @click="onContainerClick">

    <!-- 메인 컨텐츠 -->
    <div class="d-flex flex-grow-1 pa-2 ga-2" style="min-height: 0;">

      <!-- ━━━━━━━━ 좌측: 부서 트리 + 사원 목록 ━━━━━━━━ -->
      <div class="d-flex flex-column ga-2" style="flex: 1; min-height: 0;">

        <!-- 부서 트리: 키워드로 부서명 검색 후 해당 노드로 자동 이동 -->
        <v-card variant="outlined" class="bg-white d-flex flex-column" style="flex: 1; min-height: 0;">
          <div class="d-flex pa-2 ga-1">
            <v-text-field
              v-model="keyWord"
              placeholder="부서명 검색"
              density="compact"
              variant="outlined"
              hide-details
              clearable
              @keyup.enter="setKeydown"
            />
            <v-btn color="primary" variant="flat" density="comfortable" @click="setKeydown">검색</v-btn>
          </div>
          <div class="overflow-y-auto flex-grow-1">
            <!-- activatable: 단일 행 선택 / @update:activated → onSelectDept 호출 -->
            <v-treeview
              :items="treeItems"
              item-title="deptName"
              item-value="deptno"
              v-model:opened="openNodes"
              v-model:activated="activeNodes"
              @update:activated="val => { activeNodes = val; if (val.length > 0) onSelectDept(val[0]); }"
              density="compact"
              activatable
              expand-icon="mdi-chevron-right"
              collapse-icon="mdi-chevron-down"
            />
          </div>
        </v-card>

        <!-- 사원 목록: 선택된 부서의 소속 사원 표시 (참고용, 별도 저장 없음) -->
        <v-card variant="outlined" class="bg-white d-flex flex-column" style="flex: 1; min-height: 0;">
          <div class="overflow-y-auto flex-grow-1">
            <v-table density="compact" hover>
              <thead>
                <tr class="bg-grey-lighten-3">
                  <th>사번</th>
                  <th>이름</th>
                  <th>부서명</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="emp in empList"
                  :key="emp.empno"
                  style="cursor: pointer;"
                >
                  <td>{{ emp.empno }}</td>
                  <td>{{ emp.name }}</td>
                  <td>{{ emp.deptName }}</td>
                </tr>
                <tr v-if="empList.length === 0">
                  <td colspan="3" class="text-center text-grey py-3">부서를 선택하세요.</td>
                </tr>
              </tbody>
            </v-table>
          </div>
        </v-card>

      </div>

      <!-- ━━━━━━━━ 중앙: 전체 메뉴 (미등록 메뉴) ━━━━━━━━ -->
      <!-- 체크 후 '등록' 버튼 → 우측 권한 목록으로 이동 (셔틀 패턴) -->
      <v-card variant="outlined" class="bg-white d-flex flex-column" style="flex: 1.5; min-width: 0; min-height: 0;">
        <v-toolbar color="grey-lighten-3" density="compact" flat>
          <v-toolbar-title
            class="text-subtitle-2 font-weight-bold mr-2"
            style="flex: none;"
          >전체 메뉴
          </v-toolbar-title>
          <!-- 메뉴 검색: v-model=null로 초기화해야 placeholder 정상 표시 -->
          <div style="width: 275px; flex-shrink: 0;">
            <v-autocomplete
              v-model="menuSearchText"
              :items="filterItems"
              density="compact"
              hide-details
              variant="outlined"
              placeholder="메뉴 검색"
              clearable
            />
          </div>
          <v-spacer />
          <!-- 등록: 체크된 메뉴를 우측 권한 목록으로 이동 -->
          <v-btn
            class="mr-2"
            variant="flat"
            density="comfortable"
            prepend-icon="mdi-chevron-right"
            @click="addMenus"
          >등록</v-btn>
        </v-toolbar>
        <div class="overflow-y-auto flex-grow-1" @dragover.prevent @drop="onDropToAvailable">
          <v-table density="compact" hover>
            <thead>
              <tr class="bg-grey-lighten-3">
                <th>상위메뉴</th>
                <th>하위메뉴</th>
                <th class="text-center">
                  <div class="d-flex align-center justify-center">
                    <!-- 전체 선택 체크박스: indeterminate 상태(일부 선택) 지원 -->
                    <v-checkbox
                      :model-value="allAvailableChecked"
                      :indeterminate="someAvailableChecked"
                      hide-details
                      density="compact"
                      class="d-inline-flex"
                      @update:model-value="toggleAllAvailable"
                    >
                      <template #label>
                        <span class="text-subtitle-2 font-weight-medium">선택</span>
                      </template>
                    </v-checkbox>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody @dragover.prevent @drop="onDropToAvailable">
              <!-- row-removed: 제거 후 되돌아온 항목 (주황 표시) -->
              <!-- row-checked: 선택된 항목 (파란 표시, cursor: grab) -->
              <tr
                v-for="(menu, idx) in filteredAvailableMenus"
                :key="idx"
                :class="{ 'row-removed': menu.isRemoved, 'row-checked': menu.checked }"
                :draggable="menu.checked"
                @mousedown="onDragSelectStart(menu, $event, 'available', idx)"
                @mouseenter="onDragSelectEnter(menu, idx, 'available')"
                @dragstart="onDragStart('available', $event)"
                @dragend="onDragEnd"
                @click="onMenuRowClick(menu, $event)"
              >
                <td>{{ menu.topMenuName }}</td>
                <td>{{ menu.menuName }}</td>
                <td class="text-center">
                  <v-checkbox
                    v-model="menu.checked"
                    hide-details
                    density="compact"
                    class="d-inline-flex"
                  />
                </td>
              </tr>
            </tbody>
          </v-table>
        </div>
      </v-card>

      <!-- ━━━━━━━━ 우측: 부서 메뉴 권한 목록 (등록된 메뉴) ━━━━━━━━ -->
      <!-- 체크 후 '제거' 버튼 → 중앙 전체 메뉴로 이동 (셔틀 패턴) -->
      <v-card variant="outlined" class="bg-white d-flex flex-column" style="flex: 2.5; min-width: 0; min-height: 0;">
        <v-toolbar color="grey-lighten-3" density="compact" flat>
          <v-toolbar-title class="text-subtitle-2 font-weight-bold mr-2" style="flex: none;">
            <!-- 선택된 부서명 강조 표시 -->
            <span class="text-primary text-body-1 font-weight-bold">{{ selectedDeptName }}</span> 메뉴 권한
          </v-toolbar-title>
          <!-- 메뉴 검색: v-model=null로 초기화해야 placeholder 정상 표시 -->
          <div style="width: 275px; flex-shrink: 0;">
            <v-autocomplete
              v-model="registeredSearchText"
              :items="registeredFilterItems"
              density="compact"
              hide-details
              variant="outlined"
              placeholder="메뉴 검색"
              clearable
            />
          </div>
          <v-spacer />
          <!-- 제거: 체크된 메뉴를 중앙 전체 메뉴로 되돌림 -->
          <v-btn
            class="mr-2"
            variant="flat"
            density="comfortable"
            prepend-icon="mdi-chevron-left"
            @click="removeMenu"
          >제거</v-btn>
        </v-toolbar>
        <div class="overflow-y-auto flex-grow-1" @dragover.prevent @drop="onDropToRegistered">
          <v-table density="compact" hover>
            <thead>
              <tr class="bg-grey-lighten-3">
                <th>부서명</th>
                <th>상위메뉴</th>
                <th>하위메뉴</th>
                <th class="text-center">
                  <div class="d-flex align-center justify-center">
                    <!-- 전체 선택 체크박스: indeterminate 상태(일부 선택) 지원 -->
                    <v-checkbox
                      :model-value="allRegisteredChecked"
                      :indeterminate="someRegisteredChecked"
                      hide-details
                      density="compact"
                      class="d-inline-flex"
                      @update:model-value="toggleAllRegistered"
                    >
                      <template #label>
                        <span class="text-subtitle-2 font-weight-medium">선택</span>
                      </template>
                    </v-checkbox>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody @dragover.prevent @drop="onDropToRegistered">
              <!-- row-added: 신규 추가된 항목 (초록 표시) -->
              <!-- row-checked: 선택된 항목 (파란 표시, cursor: grab) -->
              <tr
                v-for="(menu, idx) in filteredRegisteredMenus"
                :key="idx"
                :class="{ 'row-added': menu.isNew, 'row-checked': menu.checked }"
                :draggable="menu.checked"
                @mousedown="onDragSelectStart(menu, $event, 'registered', idx)"
                @mouseenter="onDragSelectEnter(menu, idx, 'registered')"
                @dragstart="onDragStart('registered', $event)"
                @dragend="onDragEnd"
                @click="onMenuRowClick(menu, $event)"
              >
                <td>{{ selectedDeptName }}</td>
                <td>{{ menu.topMenuName }}</td>
                <td>{{ menu.menuName }}</td>
                <td class="text-center">
                  <v-checkbox
                    v-model="menu.checked"
                    hide-details
                    density="compact"
                    class="d-inline-flex"
                  />
                </td>
              </tr>
              <tr v-if="registeredMenus.length === 0">
                <td colspan="5" class="text-center text-grey py-3">부서를 선택하세요.</td>
              </tr>
            </tbody>
          </v-table>
        </div>
      </v-card>

    </div>

    <!-- 하단 버튼 바 (MIS 표준 패턴: 등록/수정 화면은 하단 고정) -->
    <div class="d-flex justify-end ga-1 px-2 mb-2">
      <v-btn color="primary" variant="flat" @click="save">저장</v-btn>
      <v-btn variant="flat" @click="reset">초기화</v-btn>
      <v-btn variant="flat" @click="close">목록</v-btn>
    </div>

  </v-container>
</template>

<script setup>
// ============================================================
// [1] Vue / 플러그인 임포트
// ============================================================
import { ref, computed, getCurrentInstance, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useMenuStore } from '@/store/menu.js';
import { useSelectMenuStore } from '@/store/selectMenuStore.js';
import { useDragSelect } from '@/composables/useDragSelect.js';
import { useDragAndDrop } from '@/composables/useDragAndDrop.js';

// ============================================================
// [2] 스토어 / 글로벌 도구
// ============================================================
const { proxy } = getCurrentInstance();         // $br_trans, $dialog 등 글로벌 메서드 접근용
const router = useRouter();
const menuStore = useMenuStore();               // 전체 메뉴 트리 원본 (allMenus 빌드용)
const selectMenuStore = useSelectMenuStore();   // 브레드크럼/선택메뉴 정보 업데이트용

// ============================================================
// [3] 상태 데이터
// ============================================================

// ── 부서 트리 ─────────────────────────────────────────────
const loading = ref(false);
const depts = ref([]);          // 부서 flat 목록 (트리 변환 + 검색 원본)
const treeItems = ref([]);      // v-treeview에 바인딩되는 중첩 트리 구조
const openNodes = ref([]);      // 트리에서 열린 노드 목록
const activeNodes = ref([]);    // 트리에서 선택(활성화)된 노드 목록
const selectedDeptCode = ref(null);  // 선택된 부서 코드 (저장 시 deptno로 사용)
const selectedDeptName = ref('');    // 선택된 부서명 (우측 카드 헤더 표시용)
const orgType = ref([]);        // 공통코드 117 (조직 유형)
const useType = ref([]);        // 공통코드 155 (사용 유형)
const deptCode = ref([]);       // 부서 선택용 코드 목록
const keyWord = ref('');        // 부서명 검색 키워드

// ── 사원 목록 ─────────────────────────────────────────────
const empList = ref([]);        // 선택된 부서의 소속 사원 목록 (참고용)

// ── 권한 등록할 메뉴 (우측) ───────────────────────────────
const registeredMenus = ref([]); // 현재 부서에 등록된(또는 등록 예정) 메뉴 목록

// ── 메뉴 선택 (중앙) ─────────────────────────────────────
const allMenus = ref([]);        // 전체 Leaf 메뉴 원본 — 셔틀 이후 순서 복원 기준점
const availableMenus = ref([]);  // 중앙 그리드 — 미등록 메뉴만 표시 (등록 시 우측으로 이동)

// ============================================================
// [4] 메뉴 로드 + 검색 필터 (loadAllMenus)
// ============================================================
// menuStore의 전체 메뉴 트리에서 Leaf 노드(isLeaf=1)만 추출해 중앙 그리드 원본 빌드
// menuCodeNo = menuCode + menuNo (2+4자리) → 셔틀/권한 매칭 식별자
const loadAllMenus = () => {
  const list = menuStore.menuInfo || [];
  const topMap = {};
  list.forEach(m => { if (m.level === 1) topMap[m.menuNo] = m.menuName; });
  allMenus.value = list
    .filter(m => m.isLeaf === 1)
    .map(m => ({
      menuCodeNo: m.menuCodeNo,   // 내부 고유 식별자 (셔틀 로직용)
      menuCode: m.menuCode,       // DB 저장용 (MENU_AUTH.MENU_CODE, 2자리)
      menuNo: m.menuNo,           // DB 저장용 (MENU_AUTH.MENU_NO)
      menuName: m.menuName,
      topMenuName: topMap[parseInt(m.topNo)] || '',
      checked: false,
    }));
  availableMenus.value = allMenus.value.map(m => ({ ...m }));
};

// ── 중앙 메뉴 검색 필터 ───────────────────────────────────
// v-model=null 초기화: ref('')이면 autocomplete가 "선택된 값 있음"으로 인식해 placeholder 미표시
const menuSearchText = ref(null);

const filterItems = computed(() => {
  const tops = availableMenus.value.map(m => m.topMenuName);
  const names = availableMenus.value.map(m => m.menuName);
  return [...new Set([...tops, ...names])];
});

const filteredAvailableMenus = computed(() => {
  if (!menuSearchText.value) return availableMenus.value;
  const kw = menuSearchText.value.toLowerCase();
  return availableMenus.value.filter(m =>
    m.topMenuName?.toLowerCase().includes(kw) ||
    m.menuName?.toLowerCase().includes(kw)
  );
});

// ── 우측 권한 목록 검색 필터 ─────────────────────────────
// v-model=null 초기화: 부서 전환 시 null로 리셋해야 placeholder 정상 표시
const registeredSearchText = ref(null);

const registeredFilterItems = computed(() => {
  const tops = registeredMenus.value.map(m => m.topMenuName);
  const names = registeredMenus.value.map(m => m.menuName);
  return [...new Set([...tops, ...names])];
});

const filteredRegisteredMenus = computed(() => {
  if (!registeredSearchText.value) return registeredMenus.value;
  const kw = registeredSearchText.value.toLowerCase();
  return registeredMenus.value.filter(m =>
    m.topMenuName?.toLowerCase().includes(kw) ||
    m.menuName?.toLowerCase().includes(kw)
  );
});

// ============================================================
// [5] 부서 트리 로드 (getDepts / listToTree)
// ============================================================
// flat 배열 → 계층 트리 변환
// upCode === '0000000000' 또는 null이면 루트 노드로 처리
// 자식이 없는 노드는 children 키 제거 (v-treeview 리프 노드 인식)
const listToTree = (list) => {
  const map = {};
  const tree = [];
  list.forEach(item => { map[item.deptno] = { ...item, children: [] }; });
  list.forEach(item => {
    if (item.upCode && item.upCode !== '0000000000') {
      map[item.upCode].children.push(map[item.deptno]);
    } else {
      tree.push(map[item.deptno]);
    }
  });
  const clean = (nodes) => nodes.forEach(n => {
    if (n.children.length === 0) delete n.children;
    else clean(n.children);
  });
  clean(tree);
  return tree;
};

const getDepts = () => {
  const inputData = {
    comCodes: [
      { groupCode: "117", codeName: "orgType", useYn: 'Y' },
      { groupCode: "155", codeName: "useType", useYn: 'Y' },
    ],
  };
  loading.value = true;
  proxy.$br_trans([{
    url: '/kopms-api/dept/getDepts',
    method: 'post',
    data: inputData,
  }], (_url, code, _msg, data) => {
    loading.value = false;
    if (code < 0) return;
    orgType.value  = data.orgType  || [];
    useType.value  = data.useType  || [];
    deptCode.value = data.deptCode || [];
    depts.value    = data.depts    || [];
    treeItems.value = listToTree(depts.value);
    openNodes.value  = [];
    activeNodes.value = [];
    // 트리 최초 로드 시 최상위 루트 노드를 자동 선택 + 펼치기
    if (treeItems.value.length > 0) {
      onSelectDept(treeItems.value[0].deptno);
      openNodes.value.push(treeItems.value[0].deptno);
      activeNodes.value.push(treeItems.value[0].deptno);
    }
  });
};

// ============================================================
// [6] 부서명 검색 (setKeydown)
// ============================================================
// 검색어와 일치하는 첫 번째 부서를 찾아 트리를 펼치고 해당 노드를 활성화
// getParentIds: 해당 노드의 모든 상위 노드 코드를 재귀로 수집 → openNodes에 추가
const setKeydown = () => {
  if (!keyWord.value || keyWord.value.length === 0) {
    openNodes.value  = [];
    activeNodes.value = [];
    return;
  }
  const result = depts.value.filter(item => item.deptName.includes(keyWord.value));
  if (result.length === 0) return;
  const target = result[0];
  const pathIds = [];
  getParentIds(target.deptno, pathIds);
  openNodes.value  = pathIds;
  activeNodes.value = [target.deptno];
  onSelectDept(target.deptno);
};

const getParentIds = (deptno, pathIds) => {
  const node = depts.value.find(d => d.deptno === deptno);
  if (node && node.upCode && node.upCode !== '0000000000') {
    pathIds.push(String(node.upCode));
    getParentIds(node.upCode, pathIds);
  }
};

// ============================================================
// [7] 부서 선택 → 사원 조회 + 부서 메뉴 권한 로드 (onSelectDept)
// ============================================================
// 부서 전환 시 중앙/우측 목록 초기화 + 검색어 null 리셋(placeholder 재표시)
const onSelectDept = (deptno) => {
  const dept = depts.value.find(d => d.deptno === deptno);
  selectedDeptCode.value = deptno;
  selectedDeptName.value = dept ? dept.deptName : '';
  registeredMenus.value = [];
  availableMenus.value = allMenus.value.map(m => ({ ...m, checked: false }));
  menuSearchText.value = null;
  registeredSearchText.value = null;
  getEmployee({ deptno, name: '' });
  getDeptMenus(deptno);
};

// ── 사원 조회 ─────────────────────────────────────────────
const getEmployee = (searchData) => {
  loading.value = true;
  proxy.$br_trans([{
    url: '/kopms-api/employee/getEmployee',
    method: 'post',
    data: searchData,
  }], (_url, code, _msg, data) => {
    loading.value = false;
    if (code < 0) return;
    empList.value = data.employLst || [];
  });
};

// ── 부서 메뉴 권한 조회 ───────────────────────────────────
// API 응답의 menuCode("AB") + menuNo(1100) → menuCodeNo("AB1100")로 변환해 allMenus와 매칭
// registeredMenus: 이미 등록된 메뉴 / availableMenus: 미등록 메뉴 (중앙 표시)
const getDeptMenus = (deptno) => {
  proxy.$br_trans([{
    url: '/kopms-api/dept/getDeptMenus',
    method: 'post',
    data: { deptno },
  }], (_url, code, _msg, data) => {
    if (code < 0) return;
    const assignedCodes = new Set((data.menuList || []).map(m => m.menuCode + m.menuNo));
    registeredMenus.value = allMenus.value
      .filter(m => assignedCodes.has(m.menuCodeNo))
      .map(m => ({ ...m, checked: false }));
    availableMenus.value = allMenus.value
      .filter(m => !assignedCodes.has(m.menuCodeNo))
      .map(m => ({ ...m, checked: false }));
  });
};

// ============================================================
// [8] 셔틀 — 등록 / 제거 (addMenus / removeMenu)
// ============================================================

// ── 등록: 체크된 메뉴를 권한 목록(우측)에 추가 ───────────
// isRemoved 항목(DB 기존→제거→재등록): 원래 상태로 복원 (플래그 없음 = 무색)
// 그 외(진짜 신규): isNew=true → row-added 스타일 (초록)
const addMenus = () => {
  const toAdd = availableMenus.value.filter(m => m.checked);
  toAdd.forEach(m => {
    if (!registeredMenus.value.some(r => r.menuCodeNo === m.menuCodeNo)) {
      registeredMenus.value.unshift({
        ...m,
        checked: true,
        isNew: !m.isRemoved,       // DB 원래 항목 복귀 시 false, 진짜 신규면 true
        isRemoved: false,
      });
    }
  });
  availableMenus.value = availableMenus.value.filter(m => !m.checked);
};

// ── 제거: 선택된 메뉴를 전체 메뉴(중앙)로 되돌림 ─────────
// isNew 항목: 단순 원복 (isRemoved 미표시)
// DB 기존 항목: isRemoved=true → row-removed 스타일 (주황) + 변경 감지 대상
const removeMenu = () => {
  const toReturn = registeredMenus.value.filter(m => m.checked);
  toReturn.forEach(m => {
    availableMenus.value.push({ ...m, checked: true, isNew: false, isRemoved: !m.isNew });
  });
  // allMenus 원본 순서로 정렬 복원
  const orderMap = {};
  allMenus.value.forEach((m, i) => { orderMap[m.menuCodeNo] = i; });
  availableMenus.value.sort((a, b) => orderMap[a.menuCodeNo] - orderMap[b.menuCodeNo]);
  registeredMenus.value = registeredMenus.value.filter(m => !m.checked);
};

// ============================================================
// [9] 전체 선택 / 해제 (toggleAllAvailable / toggleAllRegistered)
// ============================================================
// 필터링된 목록 기준으로 전체/일부 선택 상태를 computed로 계산
// indeterminate: 일부만 선택된 상태 표시

const allAvailableChecked = computed(() =>
  filteredAvailableMenus.value.length > 0 && filteredAvailableMenus.value.every(m => m.checked)
);
const someAvailableChecked = computed(() =>
  filteredAvailableMenus.value.some(m => m.checked) && !allAvailableChecked.value
);
const toggleAllAvailable = (val) => {
  filteredAvailableMenus.value.forEach(m => { m.checked = val; });
};

const allRegisteredChecked = computed(() =>
  filteredRegisteredMenus.value.length > 0 && filteredRegisteredMenus.value.every(m => m.checked)
);
const someRegisteredChecked = computed(() =>
  filteredRegisteredMenus.value.some(m => m.checked) && !allRegisteredChecked.value
);
const toggleAllRegistered = (val) => {
  filteredRegisteredMenus.value.forEach(m => { m.checked = val; });
};

// ============================================================
// [10] 드래그 셀렉션 + 드래그 앤 드롭
// ============================================================

// ── 드래그 셀렉션: 같은 그리드 내 행을 드래그로 다중 선택/해제 ──
// useDragSelect에 필터링된 목록(표시용)과 원본 목록(상태 갱신용) 모두 전달
const {
  dragSelectMode,
  dragOriginalStates,
  onDragSelectStart,
  onDragSelectEnter,
  onMenuRowClick,
  onContainerClick,
  resetDragSelect,
  setupMouseupListener,
} = useDragSelect(
  { available: filteredAvailableMenus, registered: filteredRegisteredMenus },
  [availableMenus, registeredMenus],
);

// ── 드래그 앤 드롭: 체크된 행을 중앙 ↔ 우측 그리드 간 이동 ──
const {
  onDragStart,
  onDragEnd,
  onDropToRegistered,
  onDropToAvailable,
} = useDragAndDrop(
  { availableMenus, registeredMenus, filteredAvailableMenus, allMenus },
  { dragSelectMode, dragOriginalStates, resetDragSelect },
);

// ============================================================
// [11] 저장 / 초기화 / 목록
// ============================================================

// ── 저장 (save) ───────────────────────────────────────────
// 유효성 검사: 부서 선택 여부 / 등록 목록 비어있지 않음 / 변경사항 존재 여부
// 저장 후 getDeptMenus 재호출 → isNew/isRemoved 플래그 초기화
const save = () => {
  if (!selectedDeptCode.value) {
    proxy.$dialog.message.error('부서를 선택하세요.');
    return;
  }

  const hasRemovals = availableMenus.value.some(m => m.isRemoved);
  if (registeredMenus.value.length === 0 && !hasRemovals) {
    proxy.$dialog.message.error('등록할 메뉴가 없습니다.');
    return;
  }

  // 변경사항 확인: 신규 추가(isNew) 또는 제거(isRemoved) 항목이 하나라도 있어야 저장 가능
  const hasChanges = registeredMenus.value.some(m => m.isNew) || availableMenus.value.some(m => m.isRemoved);
  if (!hasChanges) {
    proxy.$dialog.message.error('변경사항이 없습니다.');
    return;
  }

  const menuList = registeredMenus.value.map(m => ({
    menuCode: m.menuCode,
    menuNo: m.menuNo,
  }));
  const inputData = {
    deptno: selectedDeptCode.value,
    menuList,
  };

  proxy.$br_trans([{
    url: '/kopms-api/dept/saveDeptMenus',
    method: 'post',
    data: inputData,
  }], (_url, code) => {
    if (code < 0) return;
    proxy.$dialog.message.success('저장되었습니다.');
    getDeptMenus(selectedDeptCode.value); // isNew/isRemoved 플래그 초기화
  });
};

// ── 초기화 (reset) ────────────────────────────────────────
// 선택된 부서의 DB 저장 상태로 되돌림 (검색어도 null 리셋)
const reset = () => {
  if (selectedDeptCode.value) {
    menuSearchText.value = null;
    getDeptMenus(selectedDeptCode.value);
  }
};

// ── 목록으로 (close) ──────────────────────────────────────
// router.back() 대신 직접 라우팅: 링크 직접 입력 진입 시에도 목록으로 복귀 보장
const close = () => {
  router.push({ name: 'Authority' });
};

// ============================================================
// [12] 생명주기
// ============================================================
onMounted(() => {
  // 브레드크럼 업데이트
  if (selectMenuStore) {
    const basePath = selectMenuStore.selectMenuInfo?.menuPath || '';
    selectMenuStore.setMenuName('권한 등록 및 수정');
    selectMenuStore.setMenuPath(basePath ? `${basePath} > 권한 등록 및 수정` : '권한 등록 및 수정');
  }
  setupMouseupListener(); // 드래그 셀렉션 mouseup 이벤트 등록
  loadAllMenus();         // 스토어에서 전체 메뉴 로드
  getDepts();             // 부서 트리 + 공통코드 로드
});
</script>

<style scoped>
/* 신규 추가된 행: 초록 계열 표시 */
.row-added td {
  background-color: #f0fff4;
  color: #276749;
}
/* 제거된 행 (DB 기존 항목): 주황 계열 표시 */
.row-removed td {
  background-color: #fffaf0;
  color: #c05621;
}
/* 선택(체크)된 행: 파란 계열 표시 + 드래그 커서 */
.row-checked td {
  background-color: #ebf8ff;
  color: #2b6cb0;
  cursor: grab;
}
.row-checked:active td {
  cursor: grabbing;
}
/* row-removed / row-added 색이 row-checked보다 우선 적용되도록 오버라이드 */
.row-removed.row-checked td {
  background-color: #fffaf0;
  color: #c05621;
}
.row-added.row-checked td {
  background-color: #f0fff4;
  color: #276749;
}

tbody tr:last-child td {
  border-bottom: thin solid rgba(0, 0, 0, 0.12);
}
</style>
