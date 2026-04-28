<template>
  <v-container class="main-page-wrapper">

    <!-- 조회조건 영역 -->
    <v-card class="flex-grow-0 ma-2 pa-2" variant="outlined" style="border-color: #1867c0">
      <v-row no-gutters class="d-flex ga-1 align-center">

        <v-text-field
          v-model="searchKeyword"
          variant="outlined"
          density="compact"
          hide-details
          placeholder="회사명"
          style="max-width: 300px"
          @keyup.enter="search"
        />

        <v-btn variant="flat" size="small" prepend-icon="mdi-magnify" text="조회" @click="search" />

        <v-spacer />
        <v-btn variant="flat" size="small" prepend-icon="mdi-office-building" text="회사관리" @click="companyMgmtOpen = true" />

      </v-row>
    </v-card>
    <!-- 조회조건 영역 끝 -->

    <!-- 메인 테이블 -->
    <v-card class="mx-2 flex-grow-1" variant="outlined" style="border-color: #1867c0">
      <div class="investment-table-wrap">
        <table class="investment-table">
          <thead>
            <tr>
              <th rowspan="2" class="col-gubun">구분</th>
              <th rowspan="2" class="col-company">회사명</th>
              <th rowspan="2" class="col-biz-type">사업분류</th>
              <th rowspan="2" class="col-dept">담당부서</th>
              <th rowspan="2" class="col-date">최초출자일</th>
              <th rowspan="2" class="col-main-biz">주요사업</th>
              <th rowspan="2" class="col-capital">자본금<br>(백만원)</th>
              <th colspan="2" class="col-koen-header">남동발전 자본</th>
              <th rowspan="2" class="col-remark">비고</th>
            </tr>
            <tr>
              <th class="col-koen-amount">금액<br>(백만원)</th>
              <th class="col-koen-rate">비율<br>(%)</th>
            </tr>
          </thead>
          <tbody v-if="groupedRows.length === 0">
            <tr>
              <td colspan="10" class="text-center py-4 text-grey">등록된 데이터가 없습니다</td>
            </tr>
          </tbody>
          <tbody v-else>
            <template v-for="group in groupedRows" :key="group.gubun">
              <tr v-for="(row, rowIdx) in group.rows" :key="row.companyCode">
                <!-- 구분 셀: 첫 번째 행에만 rowspan -->
                <td
                  v-if="rowIdx === 0"
                  :rowspan="group.rows.length"
                  class="col-gubun td-gubun"
                >
                  {{ group.gubunName }}<br>
                  <span class="gubun-count">({{ group.rows.length }})</span>
                </td>
                <td class="col-company">{{ row.companyName || '-' }}</td>
                <td class="col-biz-type text-center">{{ row.businessArea || '-' }}</td>
                <td class="col-dept text-center">{{ row.depts || '-' }}</td>
                <td class="col-date text-center">{{ row.investmentDate || '-' }}</td>
                <td class="col-main-biz">{{ row.description || '-' }}</td>
                <td class="col-capital text-right">{{ formatNum(row.captials) }}</td>
                <td class="col-koen-amount text-right">{{ formatNum(row.kosepMoney) }}</td>
                <td class="col-koen-rate text-center">{{ row.kosepRate || '-' }}</td>
                <td class="col-remark">{{ row.etc || '' }}</td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </v-card>
    <!-- 메인 테이블 끝 -->

    <!-- 회사관리 다이얼로그 -->
    <CompanyMgmtDialog v-model="companyMgmtOpen" @saved="search" />

  </v-container>
</template>

<script setup>
import { ref, computed, getCurrentInstance, onMounted } from 'vue';
import CompanyMgmtDialog from './investment/CompanyMgmtDialog.vue';

const { proxy } = getCurrentInstance();

// ============================================================
// [1] 검색
// ============================================================
const searchKeyword = ref('');
const tableItems    = ref([]);

// ============================================================
// [2] 구분별 그룹핑
// ============================================================
const groupedRows = computed(() => {
  const map = new Map();
  for (const row of tableItems.value) {
    const key = row.gubun || '-';
    if (!map.has(key)) {
      map.set(key, { gubun: key, gubunName: row.gubunName || key, rows: [] });
    }
    map.get(key).rows.push(row);
  }
  return Array.from(map.values());
});

// ============================================================
// [3] API 조회
// ============================================================
const fetchList = () => {
  proxy.$br_trans([{
    url: '/kopms-api/nbm/getInvestmentList',
    method: 'post',
    data: { keyword: searchKeyword.value },
  }], (_url, code, _msg, data) => {
    if (code < 0) return;
    tableItems.value = data.list || [];
  });
};

const search = () => fetchList();

// ============================================================
// [4] 회사관리 다이얼로그
// ============================================================
const companyMgmtOpen = ref(false);

// ============================================================
// [5] 유틸
// ============================================================
const formatNum = (val) => {
  const n = Number(val);
  return isNaN(n) || val == null || val === '' ? '-' : n.toLocaleString();
};

onMounted(() => fetchList());
</script>

<style scoped lang="scss">
.main-page-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 8px;
}

.investment-table-wrap {
  overflow-x: auto;
  overflow-y: auto;
  max-height: 640px;
}

.investment-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  white-space: nowrap;

  thead th {
    background-color: #e3f2fd;
    color: #1565c0;
    font-weight: 700;
    border: 1px solid #dee2e6;
    padding: 8px 10px;
    text-align: center;
    position: sticky;
    top: 0;
    z-index: 2;
  }

  tbody td {
    border: 1px solid #dee2e6;
    padding: 6px 10px;
    vertical-align: middle;
    font-size: 13px;
  }

  tbody tr:hover td {
    background-color: #f5f5f5;
  }
}

.td-gubun {
  background-color: #eff6ff;
  font-weight: 700;
  color: #1d4ed8;
  text-align: center;
  vertical-align: middle !important;
  white-space: pre-line;
}

.gubun-count {
  font-size: 11px;
  font-weight: 400;
  color: #64748b;
}

/* 컬럼 너비 */
.col-gubun        { min-width: 100px; width: 100px; }
.col-company      { min-width: 160px; }
.col-biz-type     { min-width: 100px; }
.col-dept         { min-width: 100px; }
.col-date         { min-width: 100px; }
.col-main-biz     { min-width: 200px; white-space: normal; }
.col-capital      { min-width: 100px; }
.col-koen-header  { min-width: 180px; }
.col-koen-amount  { min-width: 100px; }
.col-koen-rate    { min-width: 80px; }
.col-remark       { min-width: 160px; white-space: normal; }
</style>
