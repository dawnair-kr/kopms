<template>
  <v-container class="main-page-wrapper">
    <!-- 조회조건 영역 -->
    <v-card
      variant="outlined"
      class="ma-2 pa-2 flex-grow-0 bg-white"
      style="border-color: #1867c0"
    >
      <v-row no-gutters class="align-center">
        <v-col cols="auto" class="font-weight-bold mr-2">
          <span>
            <v-icon icon="mdi-circle-small" color="orange" />구분
          </span>
        </v-col>
        <v-col cols="auto" class="mr-4">
          <v-select
            v-model="searchParams.meetGubun"
            :items="roomTypeItems"
            item-title="text"
            item-value="value"
            density="compact"
            variant="outlined"
            hide-details
            style="min-width: 120px"
          />
        </v-col>

        <v-col cols="auto" class="font-weight-bold mr-2">
          <span>
            <v-icon icon="mdi-circle-small" color="orange" />사용일
          </span>
        </v-col>
        <v-col cols="auto" class="d-flex align-center">
          <v-menu v-model="startDateMenu" :close-on-content-click="false">
            <template #activator="{ props: menuProps }">
              <BrDateField
                v-bind="menuProps"
                v-model="searchParams.startDate"
                variant="outlined"
                density="compact"
                hide-details
                append-inner-icon="mdi-calendar"
                class="br-date-field"
                style="min-width: 150px"
              />
            </template>
            <v-date-picker
              v-model="startDatePicker"
              @update:model-value="onStartDateSelected"
              hide-header
            />
          </v-menu>
          <span class="mx-2">~</span>
          <v-menu v-model="endDateMenu" :close-on-content-click="false">
            <template #activator="{ props: menuProps }">
              <BrDateField
                v-bind="menuProps"
                v-model="searchParams.endDate"
                variant="outlined"
                density="compact"
                hide-details
                append-inner-icon="mdi-calendar"
                class="br-date-field"
                style="min-width: 150px"
              />
            </template>
            <v-date-picker
              v-model="endDatePicker"
              @update:model-value="onEndDateSelected"
              hide-header
            />
          </v-menu>
        </v-col>

        <v-spacer />
        <v-btn
          class="mr-2"
          color="red"
          prepend-icon="mdi-refresh"
          text="초기화"
          @click="resetSearchParams"
        />
        <v-btn
          variant="flat"
          prepend-icon="mdi-magnify"
          text="조회"
          @click="getMeetingList"
        />
      </v-row>
    </v-card>
    <!-- 조회조건 영역 끝 -->

    <!-- 메인 컨텐츠 영역 -->
    <v-card
      class="mx-2 mb-2 flex-grow-1 d-flex flex-column overflow-hidden"
      variant="outlined"
    >
      <div ref="tableWrapper" class="flex-grow-1 overflow-hidden">
        <v-data-table
          :headers="headers"
          :items="pagedItems"
          :items-per-page="itemsPerPage"
          :height="tableHeight"
          fixed-header
          item-value="rsvIdx"
          :row-props="rowProps"
          @click:row="onRowClick"
        >
          <!-- 구분: 코드값 → 라벨 변환 -->
          <template #item.meetGubun="{ item }">
            {{ roomTypeItems.find(r => r.value === item.meetGubun)?.text ?? item.meetGubun }}
          </template>

          <!-- 제목: 클릭 시 상세/수정 팝업 오픈 -->
          <template v-slot:item.title="{ item }">
            <div align="left" class="text-truncate" style="max-width: 400px;">
              <a
                href="#"
                class="text-decoration-none text-black"
                @click.prevent="openDetail(item)"
              >
                {{ item.title }}
              </a>
            </div>
          </template>

          <!-- 데이터 없음 -->
          <template v-slot:no-data>
            <v-row no-gutters justify="center" align="center" class="my-2">
              <v-col align="center">
                <span class="text-subtitle-1 text-black">등록된 데이터가 없습니다</span>
              </v-col>
            </v-row>
          </template>

          <template v-slot:bottom></template>
        </v-data-table>
      </div>

      <!-- 페이지네이션 + 등록 버튼 -->
      <div class="flex-shrink-0 mx-2 d-flex align-center justify-center" style="position: relative;">
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
        <v-btn
          variant="flat"
          prepend-icon="mdi-plus"
          text="등록"
          @click="openRegister"
          style="position: absolute; right: 0;"
        />
      </div>
    </v-card>
    <!-- 메인 컨텐츠 영역 끝 -->
  </v-container>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick, getCurrentInstance } from 'vue';
import { useRouter } from 'vue-router';
import { useSelectMenuStore } from '@/store/selectMenuStore.js';
import BrDateField from '@/components/BrDateField.jsx';
import MeetingDetail from '@/popups/meeting/MeetingDetail.vue';

const router = useRouter();
const { proxy } = getCurrentInstance();
const selectMenuStore = useSelectMenuStore();

// 메뉴 menuNo → 부서코드 areaCode 매핑
const AREA_CODE_MAP = {
  '4402': 'OB',  // 해외사업
  '5700': 'BO'   // 사업운영
};

// ============================================================
// [1] 상태 데이터
// ============================================================
const meetingList = ref([]);
const selectedRow = ref(null);

// ============================================================
// [2] 구분 목록 (추후 공통코드로 대체 가능)
// ============================================================
const roomTypeItems = [
  { text: '전체', value: '' },
  { text: '소회의실', value: 'SM' },
  { text: '대회의실', value: 'LG' },
];

// ============================================================
// [3] 날짜 피커
// ============================================================
const startDateMenu = ref(false);
const endDateMenu = ref(false);

const parseDate = (str) => str && str.length === 10 ? new Date(str + 'T00:00:00') : null;

const formatDate = (val) => {
  const d = new Date(val);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const startDatePicker = computed({
  get: () => parseDate(searchParams.startDate),
  set: () => {},
});
const endDatePicker = computed({
  get: () => parseDate(searchParams.endDate),
  set: () => {},
});

const onStartDateSelected = (val) => {
  if (val) searchParams.startDate = formatDate(val);
  startDateMenu.value = false;
};
const onEndDateSelected = (val) => {
  if (val) searchParams.endDate = formatDate(val);
  endDateMenu.value = false;
};

// ============================================================
// [4] 페이지네이션
// ============================================================
const currentPage = ref(1);
const itemsPerPage = ref(12);

const pagedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return meetingList.value.slice(start, start + itemsPerPage.value);
});

const getPageCount = computed(() =>
  Math.ceil(meetingList.value.length / itemsPerPage.value)
);

// ============================================================
// [5] 테이블 높이 자동 조정
// ============================================================
const tableWrapper = ref(null);
const tableHeight = ref(0);
const ROW_HEIGHT = 40;

const updateTableSize = () => {
  if (!tableWrapper.value) return;
  tableHeight.value = tableWrapper.value.clientHeight;
  const firstRow = tableWrapper.value.querySelector('tbody tr');
  const rowH = firstRow ? firstRow.offsetHeight : ROW_HEIGHT;
  itemsPerPage.value = Math.max(1, Math.floor(tableHeight.value / rowH));
};

let ro = null;

// ============================================================
// [6] 검색 조건
// ============================================================
const getDefaultDates = () => {
  const today = new Date();
  const before = new Date(today);
  before.setFullYear(today.getFullYear() - 1);
  return { startDate: formatDate(before), endDate: formatDate(today) };
};

const searchParams = reactive({
  meetGubun: '',
  areaCode:  AREA_CODE_MAP[selectMenuStore.selectMenuInfo?.menuNo] ?? '',
  ...getDefaultDates(),
});

const resetSearchParams = () => {
  const { startDate, endDate } = getDefaultDates();
  searchParams.meetGubun = '';
  searchParams.startDate = startDate;
  searchParams.endDate = endDate;
  getMeetingList();
};

// ============================================================
// [7] 테이블 헤더
// ============================================================
const headers = [
  { title: '번호',      key: 'rsvIdx',          align: 'center', sortable: false, width: '70px' },
  { title: '구분',      key: 'meetGubun',     align: 'center', sortable: false, width: '100px' },
  { title: '사용일',    key: 'rsvDate',       align: 'center', sortable: false, width: '120px' },
  { title: '시작시간',  key: 'srtTime',       align: 'center', sortable: false, width: '100px' },
  { title: '종료시간',  key: 'endTime',       align: 'center', sortable: false, width: '100px' },
  { title: '제목',      key: 'title',         align: 'center', sortable: false },
  { title: '등록일',    key: 'regiDate',      align: 'center', sortable: false, width: '120px' },
  { title: '등록자',    key: 'inwriterName',  align: 'center', sortable: false, width: '120px' },
  { title: '첨부파일수', key: 'fileCount',    align: 'center', sortable: false, width: '100px' },
];

// ============================================================
// [8] 행 선택
// ============================================================
const onRowClick = (event, { item }) => {
  selectedRow.value = item;
};

const rowProps = ({ item }) => ({
  class: selectedRow.value === item ? 'selected-row' : '',
});

// ============================================================
// [9] API 조회
// ============================================================
const getMeetingList = () => {

  proxy.$br_trans([{
    url: '/kopms-api/meeting/getMeetingList',
    method: 'post',
    data: { ...searchParams },
  }], (url, code, msg, data) => {
      if (code < 0) return;
      meetingList.value = data.meetingList ?? [];
      nextTick(() => updateTableSize());
    }
  );
};

// ============================================================
// [10] 팝업
// ============================================================
const openDetail = async (item) => {
  await proxy.$dialog.showAndWait(
    { MeetingDetail },
    { width: 860, rsvIdx: item.rsvIdx }
  );
};

const openRegister = () => {
  router.push('/meeting/regist');
};

// ============================================================
// [11] 생명주기
// ============================================================
onMounted(() => {
  getMeetingList();
  nextTick(() => {
    ro = new ResizeObserver(updateTableSize);
    if (tableWrapper.value) ro.observe(tableWrapper.value);
    updateTableSize();
  });
});

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
</style>
