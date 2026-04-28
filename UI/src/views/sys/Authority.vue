<template no-gutters>
  <v-container class="main-page-wrapper">

    <!-- 검색 조건 + 액션 버튼 -->
    <v-row no-gutters class="flex-grow-0 pa-2">
      <v-col cols="12">
        <div class="search-bar d-flex align-center pa-2">
          <!-- 부서명 필터: '전체' 선택 시 모든 부서 표시 -->
          <span class="search-label mx-2">부서명</span>
          <v-autocomplete
            v-model="searchDeptName"
            :items="allDeptNames"
            density="compact"
            hide-details
            variant="outlined"
            style="max-width: 220px;"
            @update:model-value="search"
          />
          <!-- 메뉴명 필터: Enter / 조회 버튼으로 매칭 항목 순환 -->
          <span class="search-label mx-2">메뉴명</span>
          <v-text-field
            v-model="searchMenuName"
            density="compact"
            hide-details
            variant="outlined"
            style="max-width: 160px;"
            @keydown.enter="scrollToNextMatch"
          />
          <v-btn
            class="ml-1 mr-2"
            variant="flat"
            density="comfortable"
            @click="scrollToNextMatch"
          >조회</v-btn>
          <!-- 검색어가 있을 때 매칭 건수 안내 -->
          <span v-if="searchMenuName.trim()" class="search-result-text">
            <span class="font-weight-bold text-primary">"{{ searchMenuName.trim() }}"</span> 검색 결과: <span class="font-weight-bold">{{ matchCount }}건</span>
          </span>
          <v-spacer />
          <!-- 등록: AuthorityEdit 화면으로 이동 -->
          <v-btn color="primary" variant="flat" density="comfortable" class="mr-1" @click="openRegist">등록</v-btn>
          <!-- 삭제: 선택된 메뉴 항목 단건 삭제 (saveDeptMenus 재사용) -->
          <v-btn color="error" variant="flat" density="comfortable" @click="deleteItem">삭제</v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- 부서별 메뉴 카드 목록 -->
    <div ref="scrollContainer" class="flex-grow-1 overflow-y-auto px-2 pb-2">
      <div
        v-if="groupedByDept.length > 0"
        v-for="(dept, dIdx) in groupedByDept"
        :key="dept.deptno"
        class="dept-section"
        :class="{ 'mb-2': dIdx < groupedByDept.length - 1 }"
      >
        <!-- 부서 헤더 (파란 배경) -->
        <div class="dept-header">
          <span class="dept-code-badge">{{ dept.deptno }}</span>
          {{ dept.deptName }}
        </div>

        <!-- 상위메뉴 카드 가로 나열: menuOrder(메뉴 스토어)에 정의된 순서로 정렬 -->
        <div class="menu-grid">
          <div
            v-for="group in dept.topMenuGroups"
            :key="group.topMenuName"
            class="menu-card"
          >
            <!-- 상위메뉴명 헤더 -->
            <div class="menu-card-header">{{ group.topMenuName }}</div>
            <div class="menu-card-body">
              <!-- 메뉴 항목: 클릭 시 selectedKey 갱신, 검색어 일치 부분 하이라이트 -->
              <div
                v-for="(menu, mIdx) in group.menus"
                :key="mIdx"
                class="menu-item"
                :class="{ selected: selectedKey === dept.deptno + '-' + group.topMenuName + '-' + mIdx }"
                @click="selectedKey = dept.deptno + '-' + group.topMenuName + '-' + mIdx"
              >
                <span v-html="highlight(menu.menuName)" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 검색 결과 없음 -->
      <div v-if="groupedByDept.length === 0" class="text-center text-grey py-8">
        조회 결과가 없습니다.
      </div>
    </div>


  </v-container>
</template>

<script setup>
// ============================================================
// [1] Vue / 플러그인 임포트
// ============================================================
import { ref, computed, watch, onMounted, nextTick, getCurrentInstance } from 'vue';
import { useRouter } from 'vue-router';
import { useMenuStore } from '@/store/menu.js';

// ============================================================
// [2] 스토어 / 글로벌 도구
// ============================================================
const { proxy } = getCurrentInstance();   // $br_trans, $dialog 등 글로벌 메서드 접근용
const router = useRouter();
const menuStore = useMenuStore();         // 상위메뉴 정렬 순서 참조용

// ============================================================
// [3] 상태 데이터
// ============================================================
const searchDeptName = ref('전체');       // 부서명 필터 (autocomplete) — '전체' 선택 시 전체 조회
const searchMenuName = ref('');          // 메뉴명 검색어 (하이라이트 + 순환 이동)
const tableData = ref([]);               // API 응답 원본 목록 (flat 구조)
const allDeptNames = ref([]);            // 부서명 autocomplete 목록 ('전체' 포함)
const selectedKey = ref(null);           // 선택된 항목 키 — 포맷: "deptno-topMenuName-mIdx"
const scrollContainer = ref(null);       // 스크롤 대상 DOM ref (scrollIntoView 용)

// ============================================================
// [4] 생명주기
// ============================================================
onMounted(() => {
  loadDepts(); // 부서 autocomplete 목록 로드
  search();    // 전체 권한 목록 최초 조회
});

// ============================================================
// [5] 부서 목록 조회 (loadDepts)
// ============================================================
// 부서명 autocomplete에 사용할 목록을 조회
// '전체' 항목을 맨 앞에 추가해서 전체 조회 선택지 제공
const loadDepts = () => {
  proxy.$br_trans([{
    url: '/kopms-api/dept/getDepts',
    method: 'post',
    data: {
      comCodes: [
        { groupCode: "117", codeName: "orgType", useYn: 'Y' },
        { groupCode: "155", codeName: "useType", useYn: 'Y' },
      ],
    },
  }], (_url, code, _msg, data) => {
    if (code < 0) return;
    allDeptNames.value = ['전체', ...(data.depts || []).map(d => d.deptName)];
  });
};

// ============================================================
// [6] 권한 목록 조회 (search)
// ============================================================
// selectedKey 포맷 파싱 유틸 — "deptno-topMenuName-mIdx" 에서 상위메뉴명만 추출
// split('-')[0] = deptno, split('-').at(-1) = mIdx, 중간 전부 = topMenuName
const getTopMenuFromKey = (key) => {
  if (!key) return null;
  const parts = key.split('-');
  return parts.slice(1, -1).join('-');
};

const search = () => {
  proxy.$br_trans([{
    url: '/kopms-api/dept/getAuthorityList',
    method: 'post',
    data: {
      deptName: (searchDeptName.value === '전체' ? '' : searchDeptName.value) || '',
    },
  }], (_url, code, _msg, data) => {
    if (code < 0) return;
    // 재조회 전 선택 위치(부서 + 상위메뉴)를 보존해 재조회 후 동일 위치로 복원
    const prevDeptno = selectedKey.value ? selectedKey.value.split('-')[0] : null;
    const prevTopMenuName = getTopMenuFromKey(selectedKey.value);
    tableData.value = data.list || [];
    selectedKey.value = null;

    if (prevDeptno && prevTopMenuName) {
      // 1순위: 동일 부서 + 동일 상위메뉴
      let idx = matchingKeys.value.findIndex(key =>
        key.split('-')[0] === prevDeptno && getTopMenuFromKey(key) === prevTopMenuName
      );
      // 2순위: 해당 부서가 결과에 없으면 동일 상위메뉴만 매칭
      if (idx === -1) {
        idx = matchingKeys.value.findIndex(key => getTopMenuFromKey(key) === prevTopMenuName);
      }
      matchIndex.value = idx !== -1 ? idx - 1 : -1;
    } else {
      matchIndex.value = -1;
    }
    scrollToNextMatch();
  });
};

// ============================================================
// [7] 메뉴명 검색 / 하이라이트 (highlight)
// ============================================================
// 검색어와 일치하는 부분을 <mark>로 감싸서 반환 (v-html로 렌더링)
const highlight = (text) => {
  const query = searchMenuName.value?.trim();
  if (!query) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text.replace(new RegExp(`(${escaped})`, 'gi'), '<mark>$1</mark>');
};

// ============================================================
// [8] 매칭 항목 순환 이동 (scrollToNextMatch)
// ============================================================
// 매칭 항목 순환 인덱스 — 검색어가 바뀌면 초기화
const matchIndex = ref(-1);
watch(searchMenuName, () => { matchIndex.value = -1; });

// 검색어와 일치하는 항목의 selectedKey 목록 (순서: 부서 → 상위메뉴 → 메뉴 순)
const matchingKeys = computed(() => {
  const query = searchMenuName.value?.trim();
  if (!query) return [];
  const result = [];
  groupedByDept.value.forEach(dept => {
    dept.topMenuGroups.forEach(group => {
      group.menus.forEach((menu, mIdx) => {
        if (menu.menuName?.toLowerCase().includes(query.toLowerCase())) {
          result.push(dept.deptno + '-' + group.topMenuName + '-' + mIdx);
        }
      });
    });
  });
  return result;
});

const matchCount = computed(() => matchingKeys.value.length);

// 조회/Enter 시 다음 매칭 항목으로 순환 이동 + selected 처리 + 자동 스크롤
const scrollToNextMatch = () => {
  if (matchingKeys.value.length === 0) return;
  matchIndex.value = (matchIndex.value + 1) % matchingKeys.value.length;
  selectedKey.value = matchingKeys.value[matchIndex.value];
  nextTick(() => {
    scrollContainer.value?.querySelector('.menu-item.selected')
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
};

// ============================================================
// [9] 부서별 그룹핑 (groupedByDept)
// ============================================================
// tableData(flat 배열) → 부서별 → 상위메뉴별로 중첩 구조 생성
// 상위메뉴는 menuStore.mainMenus 순서(menuOrder)로 정렬
const menuOrder = computed(() =>
  menuStore.mainMenus.map(m => m.menuName)
);

const groupedByDept = computed(() => {
  const map = new Map();
  tableData.value.forEach(item => {
    if (!map.has(item.deptno)) {
      map.set(item.deptno, { deptno: item.deptno, deptName: item.deptName, topMenuGroups: new Map() });
    }
    const dept = map.get(item.deptno);
    if (!dept.topMenuGroups.has(item.topMenuName)) {
      dept.topMenuGroups.set(item.topMenuName, []);
    }
    dept.topMenuGroups.get(item.topMenuName).push(item);
  });

  return Array.from(map.values()).map(dept => {
    const topMenuGroups = Array.from(dept.topMenuGroups.entries())
      .map(([topMenuName, menus]) => ({ topMenuName, menus }))
      .sort((a, b) => {
        const ai = menuOrder.value.indexOf(a.topMenuName);
        const bi = menuOrder.value.indexOf(b.topMenuName);
        return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
      });
    return { deptno: dept.deptno, deptName: dept.deptName, topMenuGroups };
  });
});

// ============================================================
// [10] 등록 이동 (openRegist)
// ============================================================
const openRegist = () => {
  router.push('/authority/edit');
};

// ============================================================
// [11] 삭제 (deleteItem)
// ============================================================
// 단건 삭제 방식:
//   선택 항목을 제외한 나머지 메뉴 목록을 saveDeptMenus에 전달
//   → 전체 비활성화(USE_YN='N') 후 목록 MERGE 구조를 재사용해 신규 엔드포인트 불필요
const deleteItem = () => {
  if (selectedKey.value === null) {
    proxy.$dialog.message.error('삭제할 항목을 선택하세요.');
    return;
  }

  // selectedKey: deptno-topMenuName-mIdx → 실제 item 역추적
  const deptno      = selectedKey.value.split('-')[0];
  const mIdx        = parseInt(selectedKey.value.split('-').at(-1));
  const topMenuName = getTopMenuFromKey(selectedKey.value);

  const dept  = groupedByDept.value.find(d => d.deptno === deptno);
  const group = dept?.topMenuGroups.find(g => g.topMenuName === topMenuName);
  const item  = group?.menus[mIdx];

  if (!item) {
    proxy.$dialog.message.error('삭제 대상을 찾을 수 없습니다.');
    return;
  }

  proxy.$dialog.confirm({
    title: '삭제 확인',
    text: `"${item.menuName}" 권한을 삭제하시겠습니까?`,
    actions: {
      true:  { text: '확인', color: 'primary' },
      false: '취소',
    },
  }).then(res => {
    if (!res) return;

    // 해당 부서의 현재 메뉴 목록에서 선택 항목만 제외한 나머지를 saveDeptMenus로 전달
    const remainingMenus = tableData.value
      .filter(d => d.deptno === deptno && !(d.menuCode === item.menuCode && d.menuNo === item.menuNo))
      .map(d => ({ menuCode: d.menuCode, menuNo: d.menuNo }));

    proxy.$br_trans([{
      url: '/kopms-api/dept/saveDeptMenus',
      method: 'post',
      data: {
        deptno:   deptno,
        menuList: remainingMenus,
      },
    }], (_url, code) => {
      if (code < 0) return;
      proxy.$dialog.message.success('삭제되었습니다.');
      selectedKey.value = null;
      search();
    });
  });
};
</script>

<style scoped>
.search-bar {
  border: 1px solid #cbd5e0;
  border-radius: 6px;
  background: #f9fafb;
}
.search-label {
  font-weight: 600;
  font-size: 0.88rem;
  white-space: nowrap;
}
.search-result-text {
  font-size: 0.85rem;
  white-space: nowrap;
  color: #4a5568;
}

/* 부서 섹션 */
.dept-section {
  border: 1px solid #cbd5e0;
  border-radius: 8px;
  overflow: hidden;
}

.dept-header {
  background: #1a56db;
  color: #fff;
  font-weight: 700;
  font-size: 0.9rem;
  padding: 8px 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.dept-code-badge {
  background: rgba(255, 255, 255, 0.25);
  border-radius: 4px;
  padding: 1px 7px;
  font-size: 0.78rem;
  font-weight: 600;
}

/* 카드 그리드 */
.menu-grid {
  display: flex;
  flex-wrap: wrap;
  background: #e2e8f0;
  border-top: 1px solid #cbd5e0;
  gap: 1px;
}

/* 상위메뉴 카드 */
.menu-card {
  background: #fff;
  width: 180px;
  flex-shrink: 0;
}

.menu-card-header {
  background: #ebf4ff;
  color: #1a56db;
  font-weight: 700;
  font-size: 0.82rem;
  padding: 6px 10px;
  text-align: center;
  border-bottom: 1px solid #cbd5e0;
}

.menu-card-body {
  padding: 4px 0;
}

.menu-item {
  padding: 5px 12px;
  font-size: 0.855rem;
  cursor: pointer;
  color: #2d3748;
  transition: background 0.1s;
}

.menu-item:hover {
  background: #ebf8ff;
}

.menu-item.selected {
  background: #bee3f8;
  font-weight: 600;
}

.menu-item mark {
  background: #fef08a;
  color: inherit;
  border-radius: 2px;
  padding: 0 1px;
}
</style>
