<template>
  <v-container class="main-page-wrapper">

    <!-- 기간 / 축 설정 -->
    <v-sheet rounded="lg" class="pa-4 form-card ma-2">
      <div class="form-section-header mb-3 d-flex align-center justify-space-between">
        <div class="d-flex align-center" style="gap: 8px;">
          <div class="section-bar" />
          <span>조회 조건</span>
        </div>
        <div class="d-flex ga-2">
          <v-btn color="red-darken-1" prepend-icon="mdi-refresh" text="초기화" @click="handleReset" />
          <v-btn variant="flat" prepend-icon="mdi-magnify" text="조회" @click="handleSearch" />
        </div>
      </div>
      <div class="form-grid-4">
        <v-row no-gutters class="ga-6 mb-3">
          <!-- 년/월 구분 + 기간 (2칸 span) -->
          <v-col class="col-span-2">
            <div class="field-item">
              <div class="d-flex align-center ga-2">
                <span class="field-label">년/월 구분</span>
                <v-btn-toggle v-model="yearmm" mandatory density="compact" class="toggle-group">
                  <v-btn value="1" variant="text" class="toggle-btn">년</v-btn>
                  <v-btn value="2" variant="text" class="toggle-btn">월</v-btn>
                </v-btn-toggle>
                <v-select v-model="stYear" :items="yearItems" variant="outlined" hide-details style="width: 110px;">
                  <template #append-inner><span class="form-unit">년</span></template>
                </v-select>
                <v-select v-if="yearmm === '2'" v-model="stMonth" :items="monthItems" item-title="text" item-value="value" variant="outlined" hide-details style="width: 90px;">
                  <template #append-inner><span class="form-unit">월</span></template>
                </v-select>
                <span class="text-body-2 text-medium-emphasis">~</span>
                <v-select v-model="endYear" :items="yearItems" variant="outlined" hide-details style="width: 110px;">
                  <template #append-inner><span class="form-unit">년</span></template>
                </v-select>
                <v-select v-if="yearmm === '2'" v-model="endMonth" :items="monthItems" item-title="text" item-value="value" variant="outlined" hide-details style="width: 90px;">
                  <template #append-inner><span class="form-unit">월</span></template>
                </v-select>
              </div>
            </div>
          </v-col>
          <!-- X축 선택 -->
          <v-col>
            <div class="field-item">
              <div class="d-flex align-center ga-2">
                <span class="field-label">X축 선택</span>
                <v-select v-model="xAxis" :items="xAxisItems" item-title="text" item-value="value" variant="outlined" hide-details />
              </div>
            </div>
          </v-col>
          <!-- Y축 선택 -->
          <v-col>
            <div class="field-item">
              <div class="d-flex align-center ga-2">
                <span class="field-label">Y축 선택</span>
                <v-select v-model="yAxis" :items="yAxisItems" item-title="text" item-value="value" variant="outlined" hide-details />
              </div>
            </div>
          </v-col>
        </v-row>

        <!-- Row 1: 사업단계(2칸) + 사업구분(1칸) + 사업유형(1칸) -->
        <v-row no-gutters class="ga-6 mb-3">
          <v-col class="col-span-2">
            <div class="field-item">
              <div class="d-flex align-center ga-2">
                <span class="field-label">사업단계</span>
                <v-btn-toggle v-model="filterModes.proStep" mandatory density="compact" class="toggle-group"
                  @update:model-value="v => { if (v === '전체') selectedFilters.proStepList = [] }">
                  <v-btn value="전체" variant="text" class="toggle-btn">전체</v-btn>
                  <v-btn value="선택" variant="text" class="toggle-btn">선택</v-btn>
                </v-btn-toggle>
              </div>
              <v-chip-group v-if="filterModes.proStep === '선택'"
                v-model="selectedFilters.proStepList" multiple selected-class="chip-active" column>
                <v-chip v-for="c in codes['109']" :key="c.codeValue" :value="c.codeValue"
                  variant="outlined" size="small" filter>{{ c.codeName }}</v-chip>
              </v-chip-group>
            </div>
          </v-col>
          <v-col>
            <div class="field-item">
              <div class="d-flex align-center ga-2">
                <span class="field-label">사업방식</span>
                <v-btn-toggle v-model="filterModes.bizSection" mandatory density="compact" class="toggle-group"
                  @update:model-value="v => { if (v === '전체') selectedFilters.bizSectionList = [] }">
                  <v-btn value="전체" variant="text" class="toggle-btn">전체</v-btn>
                  <v-btn value="선택" variant="text" class="toggle-btn">선택</v-btn>
                </v-btn-toggle>
              </div>
              <v-chip-group v-if="filterModes.bizSection === '선택'"
                v-model="selectedFilters.bizSectionList" multiple selected-class="chip-active" column>
                <v-chip v-for="c in codes['102']" :key="c.codeValue" :value="c.codeValue"
                  variant="outlined" size="small" filter>{{ c.codeName }}</v-chip>
              </v-chip-group>
            </div>
          </v-col>
          <v-col>
            <div class="field-item">
              <div class="d-flex align-center ga-2">
                <span class="field-label">사업유형</span>
                <v-btn-toggle v-model="filterModes.bizType" mandatory density="compact" class="toggle-group"
                  @update:model-value="v => { if (v === '전체') selectedFilters.bizTypeList = [] }">
                  <v-btn value="전체" variant="text" class="toggle-btn">전체</v-btn>
                  <v-btn value="선택" variant="text" class="toggle-btn">선택</v-btn>
                </v-btn-toggle>
              </div>
              <v-chip-group v-if="filterModes.bizType === '선택'"
                v-model="selectedFilters.bizTypeList" multiple selected-class="chip-active" column>
                <v-chip v-for="c in codes['101']" :key="c.codeValue" :value="c.codeValue"
                  variant="outlined" size="small" filter>{{ c.codeName }}</v-chip>
              </v-chip-group>
            </div>
          </v-col>
        </v-row>
        <!-- Row 2: 대륙별/국가별(2칸) + 사업상태(1칸) + 정보제공형태(1칸) -->
        <v-row no-gutters class="ga-6">
          <v-col class="col-span-2">
            <div class="field-item">
              <div class="d-flex align-center ga-2">
                <span class="field-label">국가분류</span>
                <v-btn-toggle v-model="filterModes.continent" mandatory density="compact" class="toggle-group"
                  @update:model-value="() => { selectedFilters.continentCode = ''; selectedFilters.nationCode = '' }">
                  <v-btn value="전체"  variant="text" class="toggle-btn">전체</v-btn>
                  <v-btn value="대륙별" variant="text" class="toggle-btn">대륙별</v-btn>
                  <v-btn value="국가별" variant="text" class="toggle-btn">국가별</v-btn>
                </v-btn-toggle>
              </div>
              <div v-if="filterModes.continent !== '전체'" class="d-flex align-center ga-2 mt-1">
                <v-select v-model="selectedFilters.continentCode"
                  :items="[{ codeName: '선택', codeValue: '' }, ...(codes['106'] || [])]"
                  item-title="codeName" item-value="codeValue"
                  density="compact" variant="outlined" hide-details style="width: 150px;"
                  @update:model-value="selectedFilters.nationCode = ''">
                  <template #prepend-inner><span class="form-unit">대륙</span></template>
                </v-select>
                <v-autocomplete v-if="filterModes.continent === '국가별'"
                  v-model="selectedFilters.nationCode"
                  :items="[{ codeName: '선택', codeValue: '' }, ...filteredNations]"
                  item-title="codeName" item-value="codeValue"
                  density="compact" variant="outlined" hide-details style="width: 180px;"
                  auto-select-first>
                  <template #prepend-inner><span class="form-unit">국가</span></template>
                </v-autocomplete>
              </div>
            </div>
          </v-col>
          <v-col>
            <div class="field-item">
              <div class="d-flex align-center ga-2">
                <span class="field-label">진행상태</span>
                <v-btn-toggle v-model="filterModes.proState" mandatory density="compact" class="toggle-group"
                  @update:model-value="v => { if (v === '전체') selectedFilters.proStateList = [] }">
                  <v-btn value="전체" variant="text" class="toggle-btn">전체</v-btn>
                  <v-btn value="선택" variant="text" class="toggle-btn">선택</v-btn>
                </v-btn-toggle>
              </div>
              <v-chip-group v-if="filterModes.proState === '선택'"
                v-model="selectedFilters.proStateList" multiple selected-class="chip-active" column>
                <v-chip v-for="c in codes['108']" :key="c.codeValue" :value="c.codeValue"
                  variant="outlined" size="small" filter>{{ c.codeName }}</v-chip>
              </v-chip-group>
            </div>
          </v-col>
          <v-col>
            <div class="field-item">
              <div class="d-flex align-center ga-2">
                <span class="field-label">정보제공형태</span>
                <v-btn-toggle v-model="filterModes.infoMethod" mandatory density="compact" class="toggle-group"
                  @update:model-value="v => { if (v === '전체') selectedFilters.infoMethodList = [] }">
                  <v-btn value="전체" variant="text" class="toggle-btn">전체</v-btn>
                  <v-btn value="선택" variant="text" class="toggle-btn">선택</v-btn>
                </v-btn-toggle>
              </div>
              <v-chip-group v-if="filterModes.infoMethod === '선택'"
                v-model="selectedFilters.infoMethodList" multiple selected-class="chip-active" column>
                <v-chip v-for="c in codes['104']" :key="c.codeValue" :value="c.codeValue"
                  variant="outlined" size="small" filter>{{ c.codeName }}</v-chip>
              </v-chip-group>
            </div>
          </v-col>
        </v-row>
      </div>

    </v-sheet>

    <!-- 결과 영역 -->
    <v-sheet rounded="lg" class="pa-4 form-card ma-2 d-flex flex-column flex-grow-1" style="min-height: 0;">
      <div class="form-section-header mb-3 flex-shrink-0 d-flex align-center justify-space-between">
        <div class="d-flex align-center" style="gap: 8px;">
          <div class="section-bar" />
          <span>조회 결과</span>
          <span class="text-medium-emphasis">총 {{ uniqueDates.length }}건</span>
        </div>
        <v-btn-toggle v-model="viewMode" mandatory density="compact" class="toggle-group">
          <v-btn value="table" variant="text" class="toggle-btn" prepend-icon="mdi-table">테이블</v-btn>
          <v-btn value="chart" variant="text" class="toggle-btn" prepend-icon="mdi-chart-bar">차트</v-btn>
        </v-btn-toggle>
      </div>

      <!-- 테이블 -->
      <template v-if="viewMode === 'table'">
        <div class="br-table-wrap stat-table-wrap">
          <v-table density="compact" class="stat-table">
            <thead>
              <tr>
                <th style="width: 150px;">년/월</th>
                <th v-for="col in tableColumns" :key="col.value">{{ col.label }}</th>
                <th v-if="yAxis">합계</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in tableRows" :key="row.vdate">
                <td style="width: 150px;">{{ formatVdate(row.vdate) }}</td>
                <td v-for="col in tableColumns" :key="col.value">{{ row[col.value] ?? 0 }}</td>
                <td v-if="yAxis">{{ row._total }}</td>
              </tr>
            </tbody>
          </v-table>
        </div>
      </template>

      <!-- 차트 -->
      <template v-else>
        <div class="br-table-wrap stat-chart-wrap">
          <apexchart
            type="bar"
            height="100%"
            :options="chartOptions"
            :series="chartSeries"
          />
        </div>
      </template>
    </v-sheet>

  </v-container>
</template>

<script setup>
// ============================================================
// [1] Vue / 플러그인 임포트
// ============================================================
import { ref, computed, getCurrentInstance, onMounted } from 'vue';
import { useCommonCode } from '@/composables/useCommonCode';

// ============================================================
// [2] 글로벌 도구
// ============================================================
const { proxy } = getCurrentInstance();
const { loadCodes } = useCommonCode();

// ============================================================
// [3] 공통 코드
// ============================================================
const codes = ref({});

// ============================================================
// [4] 필터 상태
// ============================================================
const yearmm    = ref('1');
const stYear    = ref('전체');
const endYear   = ref('전체');
const stMonth   = ref('01');
const endMonth  = ref('12');
const xAxis     = ref('');
const yAxis     = ref('');

const filterModes = ref({
  proStep:    '전체',
  proState:   '전체',
  continent:  '전체',
  infoMethod: '전체',
  bizSection: '전체',
  bizType:    '전체',
  bizForm:    '전체',
});

const selectedFilters = ref({
  proStepList:    [],
  proStateList:   [],
  continentCode:  '',
  nationCode:     '',
  infoMethodList: [],
  bizSectionList: [],
  bizTypeList:    [],
  bizFormList:    [],
});

// ============================================================
// [5] 드롭다운 항목 (계산)
// ============================================================
const currentYear = new Date().getFullYear();

const yearItems = computed(() => {
  const items = ['전체'];
  for (let y = currentYear; y >= 2010; y--) {
    items.push(yearmm.value === '1' ? String(y) : String(y));
  }
  return items;
});

const xAxisItems = [
  { text: '전체',                         value: '' },
  { text: '사업단계(특정단계 완료건수)', value: '109' },
  { text: '진행상태',                     value: '108' },
  { text: '대륙분류',                     value: '106' },
  { text: '정보제공형태',                 value: '104' },
  { text: '사업방식',                     value: '102' },
  { text: '사업유형',                     value: '101' },
  { text: '사업형태',                     value: '103' },
];

const yAxisItems = [
  { text: '전체',                         value: '' },
  { text: '사업단계(전체단계진행건수)', value: '109' },
  { text: '진행상태',                     value: '108' },
  { text: '대륙분류',                     value: '106' },
  { text: '정보제공형태',                 value: '104' },
  { text: '사업방식',                     value: '102' },
  { text: '사업유형',                     value: '101' },
  { text: '사업형태',                     value: '103' },
];


const monthItems = Array.from({ length: 12 }, (_, i) => ({
  text: `${i + 1}월`,
  value: String(i + 1).padStart(2, '0'),
}));

const filteredNations = computed(() => {
  if (!selectedFilters.value.continentCode) return codes.value['107'] || [];
  return (codes.value['107'] || []).filter(n => n.upCode === selectedFilters.value.continentCode);
});

// ============================================================
// [6] 조회 결과
// ============================================================
const resultData = ref([]);
const viewMode   = ref('table');

const handleReset = () => {
  yearmm.value   = '1';
  stYear.value   = '전체';
  endYear.value  = '전체';
  stMonth.value  = '01';
  endMonth.value = '12';
  xAxis.value    = '';
  yAxis.value    = '';
  filterModes.value = { proStep: '전체', proState: '전체', continent: '전체', infoMethod: '전체', bizSection: '전체', bizType: '전체', bizForm: '전체' };
  selectedFilters.value = { proStepList: [], proStateList: [], continentCode: '', nationCode: '', infoMethodList: [], bizSectionList: [], bizTypeList: [], bizFormList: [] };
  resultData.value = [];
};

const handleSearch = () => {
  const isMonth = yearmm.value === '2';
  const stVal  = stYear.value  !== '전체' ? (isMonth ? stYear.value  + stMonth.value  : stYear.value)  : null;
  const endVal = endYear.value !== '전체' ? (isMonth ? endYear.value + endMonth.value : endYear.value) : null;

  const params = {
    yearmm: yearmm.value,
    xAxis:  xAxis.value || null,
    yAxis:  yAxis.value || null,
    stYear:  stVal,
    endYear: endVal,
    proStepList:    filterModes.value.proStep    === '선택' ? selectedFilters.value.proStepList    : [],
    proStateList:   filterModes.value.proState   === '선택' ? selectedFilters.value.proStateList   : [],
    infoMethodList: filterModes.value.infoMethod === '선택' ? selectedFilters.value.infoMethodList : [],
    bizSectionList: filterModes.value.bizSection === '선택' ? selectedFilters.value.bizSectionList : [],
    bizTypeList:    filterModes.value.bizType    === '선택' ? selectedFilters.value.bizTypeList    : [],
    bizFormList:    filterModes.value.bizForm    === '선택' ? selectedFilters.value.bizFormList    : [],
    continentCode:  filterModes.value.continent !== '전체' ? selectedFilters.value.continentCode : null,
    nationCode:     filterModes.value.continent === '국가별' ? selectedFilters.value.nationCode : null,
  };

  proxy.$br_trans([{
    url: '/kopms-api/biz/getBizStatistics',
    method: 'post',
    data: params,
  }], (_url, code, _msg, data) => {
    if (code < 0) return;
    resultData.value = data.statisticsList || [];
  });
};

// ============================================================
// [7] 테이블 데이터 가공
// ============================================================
const uniqueDates = computed(() => [...new Set(resultData.value.map(r => r.vdate))].sort());

const formatVdate = (vdate) => {
  if (!vdate) return vdate;
  if (String(vdate).length === 6) return `${vdate.slice(0, 4)}년 ${vdate.slice(4, 6)}월`;
  return `${vdate}년`;
};

// Y축 코드맵 (시리즈/행 분기용)
const yAxisCodeMap = computed(() => {
  if (!yAxis.value) return {};
  return Object.fromEntries((codes.value[yAxis.value] || []).map(c => [c.codeValue, c.codeName]));
});

// Y축 고유값 목록 → 테이블 행 분기 & 차트 시리즈
const uniqueYValues = computed(() =>
  [...new Set(resultData.value.map(r => r.yValue).filter(v => v != null))].sort()
);

// 테이블 컬럼: Y축 없으면 카운트수 단일 컬럼
const tableColumns = computed(() => {
  if (!yAxis.value) return [{ value: '_total', label: '카운트수' }];
  return uniqueYValues.value.map(v => ({ value: v, label: yAxisCodeMap.value[v] || v }));
});

const tableRows = computed(() => {
  return uniqueDates.value.map(vdate => {
    const rows = resultData.value.filter(r => r.vdate === vdate);
    const row = { vdate };
    let total = 0;
    rows.forEach(r => {
      const key = r.yValue ?? '_total';
      row[key] = Number(r.cnt);
      total += Number(r.cnt);
    });
    row._total = total;
    return row;
  });
});

// ============================================================
// [8] 차트 데이터 가공
// ============================================================
const chartSeries = computed(() => {
  if (!yAxis.value) {
    return [{ name: '카운트', data: uniqueDates.value.map(d => tableRows.value.find(r => r.vdate === d)?._total ?? 0) }];
  }
  return tableColumns.value.map(col => ({
    name: col.label,
    data: uniqueDates.value.map(d => tableRows.value.find(r => r.vdate === d)?.[col.value] ?? 0),
  }));
});

const chartOptions = computed(() => ({
  chart: { type: 'bar', stacked: !!yAxis.value, toolbar: { show: false } },
  plotOptions: { bar: { borderRadius: 4, columnWidth: '55%' } },
  xaxis: { categories: uniqueDates.value.map(formatVdate) },
  colors: ['#004098','#1565c0','#42a5f5','#90caf9','#b0bec5','#78909c','#546e7a','#37474f','#263238','#0d47a1'],
  dataLabels: { enabled: false },
  legend: { position: 'top' },
  grid: { borderColor: '#f0f0f0' },
  states: { active: { filter: { type: 'none' } } },
}));

// ============================================================
// [9] 생명주기
// ============================================================
onMounted(async () => {
  codes.value = await loadCodes(
    ['101','102','103','104','106','107','108','109'],
    { '109': ['D80', 'D90'] }
  );
});
</script>

<style scoped lang="scss">
/* 필터 레이블 너비 고정 — 토글 버튼 수직 정렬 */
.form-grid-4 :deep(.field-label) {
  min-width: 72px;
  flex-shrink: 0;
}

.stat-chart-wrap {
  flex: 1;
  min-height: 0;
  padding: 16px;
}

.stat-table-wrap {
  overflow-y: auto;
  flex: 1;
  min-height: 0;
  border-radius: 8px 8px 0 0;
}

.stat-table {

  :deep(th) {
    background-color: #e8edf5 !important;
    font-weight: 600;
    font-size: 0.85rem;
    text-align: center !important;
    color: #1a237e;
  }
  :deep(td) {
    text-align: center !important;
    font-size: 0.85rem;
  }
  :deep(th:first-child),
  :deep(td:first-child) {
    text-align: left !important;
  }
}
</style>
