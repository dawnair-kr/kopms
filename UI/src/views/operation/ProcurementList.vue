<template>
  <v-container class="main-page-wrapper">

    <!-- 조회조건 -->
    <v-card class="flex-grow-0 ma-2 pa-2" variant="outlined" style="border-color: #1867c0">
      <v-row no-gutters class="d-flex ga-1 align-center">
        <v-select
          v-model="searchYear"
          :items="yearItems"
          variant="outlined"
          density="compact"
          hide-details
          style="max-width: 100px"
        />
        <span class="mx-1 text-body-2 font-weight-medium">년</span>
        <v-select
          v-model="searchMonth"
          :items="monthItems"
          variant="outlined"
          density="compact"
          hide-details
          style="max-width: 80px"
        />
        <span class="mx-1 text-body-2 font-weight-medium">월</span>
        <v-btn variant="flat" size="small" prepend-icon="mdi-magnify" text="조회" @click="search" />
      </v-row>
    </v-card>

    <!-- 탭 + 테이블 -->
    <v-card class="mx-2 flex-grow-1 d-flex flex-column" variant="outlined" style="border-color: #1867c0">

      <v-tabs v-model="activeTab" color="primary" density="compact" class="px-2 pt-1 flex-grow-0">
        <v-tab value="invest">출자금</v-tab>
        <v-tab value="pf">PF대출상환</v-tab>
      </v-tabs>
      <v-divider />

      <div class="procurement-table-wrap">

        <!-- 출자금 탭 -->
        <table v-if="activeTab === 'invest'" class="procurement-table">
          <thead>
            <tr>
              <th class="col-company">출자회사</th>
              <th class="col-connection">연결여부</th>
              <th class="col-amount">총출자금<br>(백만원)</th>
              <th class="col-amount">기출자금<br>(백만원)</th>
              <th class="col-amount">잔여출자금<br>(백만원)</th>
              <th class="col-chart">
                <div class="chart-legend">
                  <span class="legend-dot" style="background:#1565c0"></span>총 출자금
                  <span class="legend-dot ml-2" style="background:#e53935"></span>잔여출자금
                  <span class="legend-dot ml-2" style="background:#42a5f5"></span>기출자금
                </div>
              </th>
            </tr>
          </thead>
          <tbody v-if="investItems.length === 0">
            <tr>
              <td colspan="6" class="text-center py-4 text-grey">등록된 데이터가 없습니다</td>
            </tr>
          </tbody>
          <tbody v-else>
            <tr v-for="row in investItems" :key="row.masterNo">
              <td class="col-company">{{ row.bizTitle || '-' }}</td>
              <td class="col-connection text-center">{{ row.connectionName || '-' }}</td>
              <td class="col-amount text-right">{{ formatNum(row.totalInvestment) }}</td>
              <td class="col-amount text-right">{{ formatNum(row.paidInvestment) }}</td>
              <td class="col-amount text-right">{{ formatNum(row.remainInvestment) }}</td>
              <td class="col-chart">
                <div class="bar-group" v-if="investMaxTotal > 0">
                  <div class="bar-row">
                    <div class="bar" style="background:#1565c0"
                         :style="{width: barPx(row.totalInvestment, investMaxTotal) + 'px'}"></div>
                  </div>
                  <div class="bar-row">
                    <div class="bar" style="background:#e53935"
                         :style="{width: barPx(row.remainInvestment, investMaxTotal) + 'px'}"></div>
                  </div>
                  <div class="bar-row">
                    <div class="bar" style="background:#42a5f5"
                         :style="{width: barPx(row.paidInvestment, investMaxTotal) + 'px'}"></div>
                  </div>
                </div>
              </td>
            </tr>
            <!-- 종속회사합산 -->
            <tr class="subtotal-row">
              <td colspan="2" class="text-center">종속회사합산</td>
              <td class="text-right">{{ formatNum(investSubtotal.total) }}</td>
              <td class="text-right">{{ formatNum(investSubtotal.paid) }}</td>
              <td class="text-right">{{ formatNum(investSubtotal.remain) }}</td>
              <td></td>
            </tr>
            <!-- 전체합산 -->
            <tr class="total-row">
              <td colspan="2" class="text-center">전체합산</td>
              <td class="text-right">{{ formatNum(investTotal.total) }}</td>
              <td class="text-right">{{ formatNum(investTotal.paid) }}</td>
              <td class="text-right">{{ formatNum(investTotal.remain) }}</td>
              <td></td>
            </tr>
          </tbody>
        </table>

        <!-- PF대출상환 탭 -->
        <table v-else class="procurement-table">
          <thead>
            <tr>
              <th class="col-company">출자회사</th>
              <th class="col-connection">연결여부</th>
              <th class="col-amount">총PF대출액<br>(백만원)</th>
              <th class="col-amount">원금상환액<br>(백만원)</th>
              <th class="col-amount">이자상환액<br>(백만원)</th>
              <th class="col-amount">PF대출잔액<br>(백만원)</th>
              <th class="col-chart">
                <div class="chart-legend">
                  <span class="legend-dot" style="background:#1565c0"></span>총 PF채무
                  <span class="legend-dot ml-2" style="background:#e53935"></span>PF채무 전액
                  <span class="legend-dot ml-2" style="background:#42a5f5"></span>원금상환액
                </div>
              </th>
            </tr>
          </thead>
          <tbody v-if="pfItems.length === 0">
            <tr>
              <td colspan="7" class="text-center py-4 text-grey">등록된 데이터가 없습니다</td>
            </tr>
          </tbody>
          <tbody v-else>
            <tr v-for="row in pfItems" :key="row.masterNo">
              <td class="col-company">{{ row.bizTitle || '-' }}</td>
              <td class="col-connection text-center">{{ row.connectionName || '-' }}</td>
              <td class="col-amount text-right">{{ formatNum(row.totalPf) }}</td>
              <td class="col-amount text-right">{{ formatNum(row.paidPrincipal) }}</td>
              <td class="col-amount text-right">{{ formatNum(row.paidInterest) }}</td>
              <td class="col-amount text-right">{{ formatNum(row.remainPf) }}</td>
              <td class="col-chart">
                <div class="bar-group" v-if="pfMaxTotal > 0">
                  <div class="bar-row">
                    <div class="bar" style="background:#1565c0"
                         :style="{width: barPx(row.totalPf, pfMaxTotal) + 'px'}"></div>
                  </div>
                  <div class="bar-row">
                    <div class="bar" style="background:#e53935"
                         :style="{width: barPx(row.remainPf, pfMaxTotal) + 'px'}"></div>
                  </div>
                  <div class="bar-row">
                    <div class="bar" style="background:#42a5f5"
                         :style="{width: barPx(row.paidPrincipal, pfMaxTotal) + 'px'}"></div>
                  </div>
                </div>
              </td>
            </tr>
            <!-- 종속회사합산 -->
            <tr class="subtotal-row">
              <td colspan="2" class="text-center">종속회사합산</td>
              <td class="text-right">{{ formatNum(pfSubtotal.totalPf) }}</td>
              <td class="text-right">{{ formatNum(pfSubtotal.paidPrincipal) }}</td>
              <td class="text-right">{{ formatNum(pfSubtotal.paidInterest) }}</td>
              <td class="text-right">{{ formatNum(pfSubtotal.remainPf) }}</td>
              <td></td>
            </tr>
            <!-- 전체합산 -->
            <tr class="total-row">
              <td colspan="2" class="text-center">전체합산</td>
              <td class="text-right">{{ formatNum(pfTotal.totalPf) }}</td>
              <td class="text-right">{{ formatNum(pfTotal.paidPrincipal) }}</td>
              <td class="text-right">{{ formatNum(pfTotal.paidInterest) }}</td>
              <td class="text-right">{{ formatNum(pfTotal.remainPf) }}</td>
              <td></td>
            </tr>
          </tbody>
        </table>

      </div>
    </v-card>

  </v-container>
</template>

<script setup>
import { ref, computed, getCurrentInstance, onMounted } from 'vue';

const { proxy } = getCurrentInstance();

// ============================================================
// [1] 조회조건
// ============================================================
const now = new Date();
const searchYear  = ref(String(now.getFullYear()));
const searchMonth = ref(String(now.getMonth() + 1).padStart(2, '0'));

const yearItems = Array.from(
  { length: now.getFullYear() - 2009 },
  (_, i) => String(now.getFullYear() - i)
);

const monthItems = Array.from({ length: 12 }, (_, i) =>
  String(i + 1).padStart(2, '0')
);

const searchYearMonth = computed(() => `${searchYear.value}-${searchMonth.value}`);

// ============================================================
// [2] 탭
// ============================================================
const activeTab = ref('invest');

// ============================================================
// [3] 데이터
// ============================================================
const investItems = ref([]);
const pfItems     = ref([]);

const fetchInvest = () => {
  proxy.$br_trans([{
    url: '/kopms-api/nbm/getProcurementInvestList',
    method: 'post',
    data: { searchYearMonth: searchYearMonth.value },
  }], (_url, code, _msg, data) => {
    if (code < 0) return;
    investItems.value = data.list || [];
  });
};

const fetchPf = () => {
  proxy.$br_trans([{
    url: '/kopms-api/nbm/getProcurementPfList',
    method: 'post',
    data: { searchYearMonth: searchYearMonth.value },
  }], (_url, code, _msg, data) => {
    if (code < 0) return;
    pfItems.value = data.list || [];
  });
};

const search = () => {
  fetchInvest();
  fetchPf();
};

// ============================================================
// [4] 소계 / 합계 (출자금)
// ============================================================
const investSubtotal = computed(() => {
  const rows = investItems.value.filter(r => r.connectionInfo === '01');
  return {
    total:  rows.reduce((s, r) => s + (Number(r.totalInvestment)  || 0), 0),
    paid:   rows.reduce((s, r) => s + (Number(r.paidInvestment)   || 0), 0),
    remain: rows.reduce((s, r) => s + (Number(r.remainInvestment) || 0), 0),
  };
});

const investTotal = computed(() => ({
  total:  investItems.value.reduce((s, r) => s + (Number(r.totalInvestment)  || 0), 0),
  paid:   investItems.value.reduce((s, r) => s + (Number(r.paidInvestment)   || 0), 0),
  remain: investItems.value.reduce((s, r) => s + (Number(r.remainInvestment) || 0), 0),
}));

// ============================================================
// [5] 소계 / 합계 (PF)
// ============================================================
const pfSubtotal = computed(() => {
  const rows = pfItems.value.filter(r => r.connectionInfo === '01');
  return {
    totalPf:       rows.reduce((s, r) => s + (Number(r.totalPf)       || 0), 0),
    paidPrincipal: rows.reduce((s, r) => s + (Number(r.paidPrincipal) || 0), 0),
    paidInterest:  rows.reduce((s, r) => s + (Number(r.paidInterest)  || 0), 0),
    remainPf:      rows.reduce((s, r) => s + (Number(r.remainPf)      || 0), 0),
  };
});

const pfTotal = computed(() => ({
  totalPf:       pfItems.value.reduce((s, r) => s + (Number(r.totalPf)       || 0), 0),
  paidPrincipal: pfItems.value.reduce((s, r) => s + (Number(r.paidPrincipal) || 0), 0),
  paidInterest:  pfItems.value.reduce((s, r) => s + (Number(r.paidInterest)  || 0), 0),
  remainPf:      pfItems.value.reduce((s, r) => s + (Number(r.remainPf)      || 0), 0),
}));

// ============================================================
// [6] 바 차트 스케일
// ============================================================
const BAR_MAX_PX = 140;

const investMaxTotal = computed(() =>
  Math.max(...investItems.value.map(r => Number(r.totalInvestment) || 0), 0)
);

const pfMaxTotal = computed(() =>
  Math.max(...pfItems.value.map(r => Number(r.totalPf) || 0), 0)
);

const barPx = (val, maxVal) => {
  if (!maxVal) return 0;
  return Math.round((Number(val) || 0) / maxVal * BAR_MAX_PX);
};

// ============================================================
// [7] 유틸
// ============================================================
const formatNum = (val) => {
  const n = Number(val);
  return isNaN(n) || val == null || val === '' ? '-' : n.toLocaleString();
};

onMounted(() => search());
</script>

<style scoped lang="scss">
.main-page-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 8px;
}

.procurement-table-wrap {
  overflow-x: auto;
  overflow-y: auto;
  max-height: 620px;
}

.procurement-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;

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
    white-space: nowrap;
  }

  tbody td {
    border: 1px solid #dee2e6;
    padding: 6px 10px;
    vertical-align: middle;
  }

  tbody tr:hover td {
    background-color: #f5f5f5;
  }
}

.subtotal-row td {
  background-color: #fff9c4 !important;
  font-weight: 700;
  color: #37474f;
}

.total-row td {
  background-color: #e8f5e9 !important;
  font-weight: 700;
  color: #1b5e20;
}

/* 컬럼 너비 */
.col-company    { min-width: 180px; }
.col-connection { min-width: 80px;  width: 80px; text-align: center; }
.col-amount     { min-width: 120px; text-align: right; white-space: nowrap; }
.col-chart      { min-width: 180px; width: 180px; }

/* 바 차트 */
.chart-legend {
  display: flex;
  align-items: center;
  font-size: 11px;
  font-weight: 400;
  color: #37474f;
  gap: 2px;
}

.legend-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 2px;
}

.bar-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 2px 0;
}

.bar-row {
  height: 8px;
  background: #f0f0f0;
  border-radius: 2px;
  overflow: hidden;
}

.bar {
  height: 100%;
  border-radius: 2px;
  transition: width 0.3s ease;
}
</style>
