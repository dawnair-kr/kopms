<template no-gutters>
  <v-container class="main-page-wrapper">
    <!-- 조회조건 영역 -->
    <v-sheet rounded="lg" class="pa-4 mb-3 form-card ma-2 flex-shrink-0">
      <div class="form-section-header mb-3 d-flex align-center justify-space-between">
        <div class="d-flex align-center" style="gap: 8px;">
          <div class="section-bar" />
          <span>조회 조건</span>
        </div>
        <div class="d-flex ga-2">
          <v-btn color="red-darken-1" prepend-icon="mdi-refresh" text="초기화" @click="resetSearchParams()" />
          <v-btn variant="flat" prepend-icon="mdi-magnify" text="조회" @click="getBizList()" />
        </div>
      </div>

      <div class="form-grid-5">
        <!-- Row 1: 사업검색(2칸) + 등록일(1칸) + 진행단계 완료기준(2칸) -->
        <v-row no-gutters class="ga-6 mb-3">
          <v-col class="col-span-2">
            <div class="field-item">
              <span class="field-label">사업 검색</span>
              <div class="d-flex align-center ga-2">
                <v-select
                  v-model="searchType"
                  :items="itemList"
                  item-title="text"
                  item-value="value"
                  variant="outlined"
                  hide-details
                  style="max-width: 130px;"
                />
                <v-text-field
                  v-model="searchText"
                  variant="outlined"
                  hide-details
                  placeholder="검색어 입력"
                />
              </div>
            </div>
          </v-col>
          <v-col>
            <div class="field-item">
              <span class="field-label">등록일</span>
              <div class="d-flex align-center ga-2">
                <v-menu v-model="startDateMenu" :close-on-content-click="false">
                  <template #activator="{ props: menuProps }">
                    <BrDateField
                      v-bind="menuProps"
                      v-model="searchParams.startDate"
                      variant="outlined"
                      hide-details
                      append-inner-icon="mdi-calendar"
                      class="br-date-field"
                    />
                  </template>
                  <v-date-picker v-model="startDatePicker" @update:model-value="onStartDateSelected" hide-header />
                </v-menu>
                <span class="text-medium-emphasis">~</span>
                <v-menu v-model="endDateMenu" :close-on-content-click="false">
                  <template #activator="{ props: menuProps }">
                    <BrDateField
                      v-bind="menuProps"
                      v-model="searchParams.endDate"
                      variant="outlined"
                      hide-details
                      append-inner-icon="mdi-calendar"
                      class="br-date-field"
                    />
                  </template>
                  <v-date-picker v-model="endDatePicker" @update:model-value="onEndDateSelected" hide-header />
                </v-menu>
              </div>
            </div>
          </v-col>
          <v-col class="col-span-2">
            <div class="field-item">
              <span class="field-label">진행단계 완료기준</span>
              <v-chip-group v-model="searchParams.proSteps" multiple selected-class="chip-active" column>
                <v-chip v-for="item in filteredSteps" :key="item.codeValue" :value="item.codeValue"
                  variant="outlined" size="small" filter>
                  {{ item.customLabel }}
                </v-chip>
              </v-chip-group>
            </div>
          </v-col>
        </v-row>

        <!-- Row 2: 사업방식 + 사업유형 + 에너지원 + 진행단계 + 진행상태 각 1칸 -->
        <v-row no-gutters class="ga-6">
          <v-col>
            <div class="field-item">
              <span class="field-label">사업방식</span>
              <v-select
                v-model="searchParams.bizSection"
                :items="withAll(codes['102'])"
                item-title="codeName"
                item-value="codeValue"
                variant="outlined"
                hide-details
              />
            </div>
          </v-col>
          <v-col>
            <div class="field-item">
              <span class="field-label">사업유형</span>
              <v-select
                v-model="searchParams.bizType"
                :items="withAll(codes['101'])"
                item-title="codeName"
                item-value="codeValue"
                variant="outlined"
                hide-details
              />
            </div>
          </v-col>
          <v-col>
            <div class="field-item">
              <span class="field-label">에너지원</span>
              <v-select
                v-model="searchParams.powerType"
                :items="withAll(codes['105'])"
                item-title="codeName"
                item-value="codeValue"
                variant="outlined"
                hide-details
              />
            </div>
          </v-col>
          <v-col>
            <div class="field-item">
              <!-- 진행단계 셀렉트: proSteps 선택 시 이미 지난 단계 항목 제외 (filteredProStepOptions) -->
              <span class="field-label">진행단계</span>
              <v-select
                v-model="searchParams.proStep"
                :items="withAll(filteredProStepOptions)"
                item-title="codeName"
                item-value="codeValue"
                variant="outlined"
                hide-details
              />
            </div>
          </v-col>
          <v-col>
            <div class="field-item">
              <span class="field-label">진행상태</span>
              <v-select
                v-model="searchParams.proState"
                :items="withAll(codes['108'])"
                item-title="codeName"
                item-value="codeValue"
                variant="outlined"
                hide-details
              />
            </div>
          </v-col>
        </v-row>
      </div>
    </v-sheet>
    <!-- 조회조건 영역 끝 -->

    <!-- 메인 컨텐츠 영역 -->
    <div class="mx-2 mb-2 flex-grow-1 d-flex flex-column br-table-wrap">
      <!-- tableWrapper: ResizeObserver 감시 대상 — 높이 변화 시 itemsPerPage 재계산 -->
      <div ref="tableWrapper" class="flex-grow-1 overflow-hidden">
        <v-data-table
          :headers="headers"
          :items="pagedItems"
          :items-per-page="itemsPerPage"
          :height="tableHeight"
          fixed-header
          item-value="masterNo"
          :row-props="rowProps"
          @click:row="onRowClick"
        >
          <!-- 사업명: 클릭 시 사업 포털(/bizportal?bizId=...)로 이동 -->
          <template v-slot:item.bizTitle="{ item }">
            <div align="left">
              <router-link
                :to="{ path: '/bizportal', query: { bizId: item.masterNo } }"
                class="text-decoration-none text-black"
              >
                {{ item.bizTitle }}
              </router-link>
            </div>
          </template>
          <!-- 공정표: Gantt Chart 팝업 (masterNo 전달) -->
          <template v-slot:item.schedule="{ item }">
            <v-btn
              variant="flat"
              prepend-icon="mdi-chart-gantt"
              @click.stop="openSchedule(item.masterNo)"
              text="공정표"
            />
          </template>
          <!-- 관련자료: RelatedData 팝업 -->
          <template v-slot:item.relatedData="{ item }">
            <v-btn
              variant="flat"
              prepend-icon="mdi-paperclip"
              @click.stop="openRelatedData(item.masterNo)"
              text="관련자료"
            />
          </template>
          <!-- 기본정보수정: S10(사업등록) 화면으로 직접 이동 -->
          <template v-slot:item.modify="{ item }">
            <v-btn
              variant="flat"
              prepend-icon="mdi-pencil-outline"
              :to="{
                name: 'TaskDetail',
                params: { taskCode: 'S10' },
                query: { bizId: item.masterNo },
              }"
              text="기본정보수정"
              @click.stop
            />
          </template>

          <!-- 데이터 없음 표시 -->
          <template v-slot:no-data>
            <v-row no-gutters justify="center" align="center" class="my-2">
              <v-col align="center">
                <span class="text-subtitle-1 text-black"
                  >등록된 데이터가 없습니다</span
                >
              </v-col>
            </v-row>
          </template>

          <!-- v-data-table 기본 페이지네이션 비활성화 (직접 구현) -->
          <template v-slot:bottom></template>
        </v-data-table>
      </div>

      <!-- 페이지네이션 + 등록 버튼 푸터 영역 -->
      <div class="flex-shrink-0 d-flex align-center justify-center border-t" style="position: relative;">
        <v-pagination
          v-model="currentPage"
          :length="getPageCount"
          rounded="circle"
          :total-visible="10"
          show-first-last-page
          size="small"
          first-icon="mdi-page-first"
          prev-icon="mdi-menu-left"
          next-icon="mdi-menu-right"
          last-icon="mdi-page-last"
        />
        <div class="d-flex ga-1 mr-2" style="position: absolute; right: 0;">
          <v-btn variant="flat" prepend-icon="mdi-cog-outline" text="TASK코드 관리" @click="openTaskCode" />
          <!-- 사업정보등록: S10(사업등록) 신규 화면 — bizId 없이 이동하면 신규 등록 모드 -->
          <v-btn
            variant="flat"
            prepend-icon="mdi-file-document-plus-outline"
            text="사업정보등록"
            :to="{ name: 'TaskDetail', params: { taskCode: 'S10' } }"
          />
        </div>
      </div>
    </div>
    <!-- 메인 컨텐츠 영역 끝 -->
  </v-container>
</template>

<script setup>
// ============================================================
// [1] Vue / 플러그인 임포트
// ============================================================
import { ref, reactive, computed, watch, onMounted, onUnmounted, nextTick, getCurrentInstance } from "vue";
import { useRoute } from 'vue-router';
import { useSelectMenuStore } from '@/store/selectMenuStore.js';
import { useCommonCode } from '@/composables/useCommonCode';

import RelatedData from "@/popups/biz/RelatedData.vue";
import taskCode from "@/popups/biz/TaskCode.vue";
import ganttChart from "@/popups/biz/GanttChart.vue";
import BrDateField from "@/components/BrDateField.jsx";

// ============================================================
// [2] 스토어 / 글로벌 도구
// ============================================================
const { proxy } = getCurrentInstance();   // $br_trans, $dialog 등 글로벌 메서드 접근용
const route = useRoute();
const { loadCodes } = useCommonCode();

const selectMenuStore = useSelectMenuStore();

// 메뉴 menuNo → 사업구분 areaCode 매핑
const AREA_CODE_MAP = {
  '2200': 'RE',  // 재생에너지
  '3200': 'NE',  // 신에너지
  '4200': 'OB',  // 해외사업
};

const codes = ref({});  // 공통코드 맵 (101~109 등)

// ============================================================
// [3] 상태 데이터
// ============================================================
const bizList = ref([]);        // API 응답 원본 목록 (전체 페이지 데이터 포함)
const selectedRow = ref(null);  // 현재 클릭 선택된 행 (selected-row 스타일용)

// ============================================================
// [4] 날짜 피커 (startDate / endDate)
// ============================================================
// BrDateField(텍스트 입력) + v-date-picker(달력 팝업) 연동 패턴
// - startDatePicker/endDatePicker: Date 객체 ↔ 문자열 변환 브릿지 (computed)
// - onStartDateSelected/onEndDateSelected: 달력 선택 → 문자열 포맷 후 searchParams에 저장
const startDateMenu = ref(false);
const endDateMenu = ref(false);

// "YYYY-MM-DD" 문자열 → Date 객체 변환 (v-date-picker가 Date 타입 요구)
const parseDate = (str) => str && str.length === 10 ? new Date(str + 'T00:00:00') : null;

const startDatePicker = computed({
  get: () => parseDate(searchParams.startDate),
  set: () => {},
});
const endDatePicker = computed({
  get: () => parseDate(searchParams.endDate),
  set: () => {},
});

// Date 객체 → "YYYY-MM-DD" 문자열 변환
const formatDate = (val) => {
  const d = new Date(val);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const onStartDateSelected = (val) => {
  if (val) searchParams.startDate = formatDate(val);
  startDateMenu.value = false;
};

const onEndDateSelected = (val) => {
  if (val) searchParams.endDate = formatDate(val);
  endDateMenu.value = false;
};

// ============================================================
// [5] 페이지네이션 상태
// ============================================================
const currentPage = ref(1);      // 현재 페이지 번호 (1-based)
const itemsPerPage = ref(20);    // 페이지당 행 수

// ============================================================
// [6] 테이블 높이 자동 조정 (updateTableSize)
// ============================================================
// tableWrapper div의 현재 높이를 v-data-table :height에 바인딩
// ResizeObserver로 창 크기 변경 감지 → itemsPerPage 재계산
// ROW_HEIGHT: 첫 번째 tr이 렌더링되기 전 fallback 기본값
const tableWrapper = ref(null);
const tableHeight = ref(0);

const updateTableSize = () => {
  if (!tableWrapper.value) return;
  tableHeight.value = tableWrapper.value.clientHeight;
};

let ro = null; // ResizeObserver 인스턴스 (onUnmounted에서 disconnect)

// ============================================================
// [7] 검색 조건 상태 (searchParams / searchType / searchText)
// ============================================================

// 검색 타입 목록: 사업명(bizTitle) / 사업요약(bizContents) 중 선택
const itemList = [
  { text: "사업명", value: "bizTitle" },
  { text: "사업요약", value: "bizContents" },
];

const withAll = (list) => [{ codeName: '전체', codeValue: null }, ...(list || [])];

const searchType = ref("bizTitle"); // 현재 선택된 검색 필드 타입
const searchText = ref("");         // 검색 키워드

// 기본 등록일: 오늘 기준 3650일 전 ~ 오늘 (약 10년, 실질적 전체 조회)
const getDefaultDates = () => {
  const today = new Date();
  const before30 = new Date(today);
  //before30.setDate(today.getDate() - 30);
  before30.setDate(today.getDate() - 3650);
  return { startDate: formatDate(before30), endDate: formatDate(today) };
};

// reactive 사용: 여러 필드를 하나의 객체로 묶어 API 요청 시 spread 가능
const searchParams = reactive({
  areaCode: AREA_CODE_MAP[selectMenuStore.selectMenuInfo?.menuNo] ?? '',
  proSteps: [],           // 진행단계 체크박스 다중 선택 (S30/S50/D35)
  ...getDefaultDates(),   // startDate, endDate
  bizSection: null,       // 사업방식 (공통코드 102)
  bizType: null,          // 사업유형 (공통코드 101)
  powerType: null,        // 에너지원 (공통코드 105)
  infoMethod: null,       // (미사용 예비 필드)
  proStep: null,          // 진행단계 단일 선택 (공통코드 109)
  proState: null,         // 진행상태 (공통코드 108)
});

// 초기화: 모든 검색 조건을 기본값으로 되돌리고 재조회
const resetSearchParams = () => {
  const { startDate, endDate } = getDefaultDates();
  searchParams.proSteps = [];
  searchParams.startDate = startDate;
  searchParams.endDate = endDate;
  searchType.value = "bizTitle";
  searchText.value = "";
  searchParams.bizSection = null;
  searchParams.bizType = null;
  searchParams.powerType = null;
  searchParams.infoMethod = null;
  searchParams.proStep = null;
  searchParams.proState = null;
  getBizList();
};

// ============================================================
// [8] 테이블 헤더 정의
// ============================================================
const headers = [
  { title: "NO", key: "rnum", align: "center", sortable: false },
  { title: "사업명", key: "bizTitle", align: "center", sortable: false, width: "400px" },
  { title: "공정표", key: "schedule", align: "center", sortable: false },
  { title: "관련자료", key: "relatedData", align: "center", sortable: false },
  { title: "작성자", key: "writerName", align: "center", sortable: false },
  { title: "사업방식", key: "bizSectionName", align: "center", sortable: false },
  { title: "등록일자", key: "regiDate", align: "center", sortable: false },
  { title: "진행단계", key: "proStepName", align: "center", sortable: false, width: "175px" },
  { title: "진행상태", key: "proStateName", align: "center", sortable: false },
  { title: "기본정보수정", key: "modify", align: "center", sortable: false },
];

// ============================================================
// [9] 페이지네이션 계산 (pagedItems / getPageCount)
// ============================================================
// v-data-table 기본 페이지네이션을 비활성화(template #bottom)하고
// 프론트에서 slice로 직접 페이징 처리 (서버 페이징 아닌 클라이언트 페이징)
const pagedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return bizList.value.slice(start, start + itemsPerPage.value);
});

const getPageCount = computed(() =>
  Math.ceil(bizList.value.length / itemsPerPage.value),
);

// ============================================================
// [10] 행 선택 (onRowClick / rowProps)
// ============================================================
// 행 클릭 시 selectedRow 갱신 → rowProps에서 selected-row 클래스 부여
const onRowClick = (event, { item }) => {
  selectedRow.value = item;
};

const rowProps = ({ item }) => ({
  class: selectedRow.value === item ? "selected-row" : "",
});

// ============================================================
// [11] 진행단계 필터 (filteredSteps / filteredProStepOptions)
// ============================================================
// filteredSteps: 상단 체크박스에 표시할 3개 단계 (S30/S50/D35)
//   체크 의미: "해당 단계 '이후'까지 진행된 사업" — S30 체크 = S40 이상 사업 조회
//   customLabel: 더 직관적인 한글 레이블로 교체
const filteredSteps = computed(() => {
  if (!codes.value["109"]) return [];

  const labelMap = {
    S30: "사업정보검토회의완료",
    S50: "사업개발심사회의완료",
    D35: "리스크위원회구성완료",
  };

  const targetCodes = ["S30", "S50", "D35"];

  return codes.value["109"]
    .filter((item) => targetCodes.includes(item.codeValue))
    .map((item) => ({
      ...item,
      customLabel: labelMap[item.codeValue],
    }));
});

// filteredProStepOptions: 체크박스 단계 기준 이전 단계는 진행단계 셀렉트에서 제외
//   D35 체크 → D40 이상만 선택 가능 / S50 체크 → D10 이상 / S30 체크 → S40 이상
const filteredProStepOptions = computed(() => {
  const allSteps = codes.value["109"] || [];
  if (!searchParams.proSteps.length) return allSteps;

  let excluded = [];
  if (searchParams.proSteps.includes("D35")) {
    excluded = ["S10", "S20", "S30", "S40", "S50", "D10", "D20", "D30", "D35"];
  } else if (searchParams.proSteps.includes("S50")) {
    excluded = ["S10", "S20", "S30", "S40", "S50"];
  } else if (searchParams.proSteps.includes("S30")) {
    excluded = ["S10", "S20", "S30"];
  }

  return allSteps.filter((item) => !excluded.includes(item.codeValue));
});

// 체크박스 변경으로 filteredProStepOptions가 줄었을 때
// 현재 선택된 proStep이 목록에서 제외되면 자동 초기화
watch(filteredProStepOptions, (options) => {
  if (searchParams.proStep && !options.find((o) => o.codeValue === searchParams.proStep)) {
    searchParams.proStep = null;
  }
});

// 같은 컴포넌트에서 메뉴만 바뀔 때(meta.menuNo 변경) 목록 재조회
watch(() => route.meta.menuNo, (menuNo) => {
  searchParams.areaCode = AREA_CODE_MAP[menuNo] ?? '';
  selectedRow.value = null;
  resetSearchParams();
});

// ============================================================
// [12] 사업 목록 조회 (getBizList)
// ============================================================
// proSteps 체크박스 선택 시 단계 변환 로직:
//   선택된 단계 '이후' 모든 단계 코드를 proSteps 배열로 변환해 API 전달
//   ex) D35 체크 → D40, D50, D60, D70 코드 배열 전송
const getBizList = () => {
  const inputData = {
    ...searchParams,
    proSteps: [...searchParams.proSteps],
    // searchType에 따라 bizTitle 또는 bizContents 중 하나만 검색어 전달
    bizTitle: searchType.value === "bizTitle" ? searchText.value : "",
    bizContents: searchType.value === "bizContents" ? searchText.value : "",
  };

  const allSteps = codes.value["109"] || [];

  // 단계 완료 기준 필터: 체크된 단계의 이전 단계를 제외한 나머지 코드로 대체
  if (inputData.proSteps.includes("D35")) {
    const excluded = [
      "S10", "S20", "S30", "S40", "S50", "D10", "D20", "D30", "D35"
    ];
    inputData.proSteps = allSteps
      .map((v) => v.codeValue)
      .filter((v) => !excluded.includes(v));
  } else if (inputData.proSteps.includes("S50")) {
    const excluded = ["S10", "S20", "S30", "S40", "S50"];
    inputData.proSteps = allSteps
      .map((v) => v.codeValue)
      .filter((v) => !excluded.includes(v));
  } else if (inputData.proSteps.includes("S30")) {
    const excluded = ["S10", "S20", "S30"];
    inputData.proSteps = allSteps
      .map((v) => v.codeValue)
      .filter((v) => !excluded.includes(v));
  }

  proxy.$br_trans(
    [
      {
        url: "/kopms-api/biz/getBizList",
        method: "post",
        data: inputData,
      },
    ],
    (url, code, msg, data) => {
      if (code < 0) return;
      currentPage.value = 1;
      bizList.value = data.bizList;
      // 데이터 반영 후 테이블 높이 재계산 (행 수 변화 시 itemsPerPage 동기화)
      nextTick(() => updateTableSize());
    },
  );
};

// ============================================================
// [13] 팝업 다이얼로그
// ============================================================

// TASK 코드 관리 팝업 (taskCode 컴포넌트)
const openTaskCode = async () => {
  await proxy.$dialog.showAndWait(
    { taskCode },
    {
      width: 1200,
      minWidth: 1200,
    },
  );
};

// 관련자료 팝업 (RelatedData 컴포넌트)
const openRelatedData = async (masterNo) => {
  
    const params = {masterNo:masterNo};
    await proxy.$dialog.showAndWait(
    { RelatedData },
    {
      params,
      width: 1200,
      minWidth: 1200,
      /*height: 500,
      maxHeight: 500,*/
    },
  );
};

// 공정표(Gantt Chart) 팝업 — masterNo로 해당 사업의 일정 차트 표시
const openSchedule = async (masterNo) => {
  await proxy.$dialog.showAndWait(
    { ganttChart },
    {
      masterNo,
      width: 1600,
      /*height: 1200,*/
    },
    console.log("masterNo:", masterNo), // ← 이 값 확인
  );
};

// ============================================================
// [14] 생명주기
// ============================================================
onMounted(async () => {
  //console.log("onMounted parameter check...");
  //console.log("Query ID:", route.query.id); // 쿼리 옵션으로 파라미터 처리시 query  123이 찍힙니다!
  //console.log("State ID:", history.state.id); // state 옵션으로 파라미터 처리시  123이 찍힙니다!

  // 공통코드(101~109 등) 로드
  const groupCodes = await loadCodes(['100','101','102','103','104','105','106','107','108','109','140','180','181','182','183']);
  if (groupCodes['109']) {
    groupCodes['109'] = groupCodes['109'].filter(t => !['D80', 'D90'].includes(t.codeValue));
  }
  codes.value = groupCodes;
  getBizList(); // 사업 목록 최초 조회

  // ResizeObserver: tableWrapper 크기 변경 감지 → itemsPerPage 자동 재계산
  nextTick(() => {
    ro = new ResizeObserver(updateTableSize);
    if (tableWrapper.value) ro.observe(tableWrapper.value);
    updateTableSize();
  });
});

// 컴포넌트 언마운트 시 ResizeObserver 해제 (메모리 누수 방지)
onUnmounted(() => ro?.disconnect());
</script>

<style scoped lang="scss">
:deep(.v-data-table__tr:last-child td) {
  border-bottom: thin solid rgba(0, 0, 0, 0.12);
}

:deep(.v-field__input) {
  min-height: 28px;
  padding-top: 0;
  padding-bottom: 0;
  font-size: 13px;
}

:deep(.br-date-field input) {
  cursor: text !important;
}

:deep(.br-date-field .v-field__append-inner) {
  cursor: pointer;
}

:deep(.v-chip-group) {
  padding-top: 0;

  .v-chip {
    margin-top: 0;
  }
}
</style>
