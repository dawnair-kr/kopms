<template>
  <div class="contrib-panel d-flex flex-column overflow-hidden">
    <div class="view-section-header d-flex align-center mb-3">
      출자현황 <span class="contrib-unit">(단위: 억원)</span>
    </div>
    <div v-if="contributions.length === 0" class="view-empty">등록된 출자현황이 없습니다</div>
    <div v-else class="contrib-body d-flex overflow-hidden ga-3">

      <!-- ── 도넛 차트 ── -->
      <div class="contrib-chart-wrap d-flex align-center position-relative flex-shrink-0">
        <apexchart type="donut" :options="donutOptions" :series="donutSeries" width="350" @dataPointSelection="onSliceClick"/>
        <div class="donut-center position-absolute d-flex flex-column align-center">
          <template v-if="selectedSlice">
            <div class="donut-center-name text-no-wrap">{{ selectedSlice.corporation }}</div>
            <div class="donut-center-rate">{{ calcRateByEquity(selectedSlice) }}%</div>
            <div class="donut-center-amount">{{ Number(selectedSlice.investmentEquity).toLocaleString() }}억</div>
          </template>
          <template v-else>
            <div class="donut-center-total-label">Total</div>
            <div class="donut-center-total-value">{{ equityBase.toLocaleString() }}억원</div>
          </template>
        </div>
      </div>

      <!-- ── 범례 ── -->
      <div class="contrib-legend d-flex flex-column">
        <div class="contrib-sections d-flex ga-3">

          <!-- 출자금 컬럼 -->
          <div class="contrib-col d-flex flex-column">
            <div class="contrib-section-label">출자금</div>
            <div class="contrib-cards contrib-cards--equity">
              <div
                v-for="(row, i) in equityList"
                :key="row.contributionsSeq"
                class="contrib-card d-flex align-center justify-space-between"
              >
                <div class="d-flex align-center ga-1">
                  <span class="contrib-dot flex-shrink-0 rounded-circle" :style="{ background: equityColors[i % equityColors.length] }"/>
                  <span class="contrib-corp">{{ row.corporation || '-' }}</span>
                </div>
                <div class="d-flex align-center ga-1">
                  <span class="contrib-amount">{{ Number(row.investmentEquity).toLocaleString() }}<span class="contrib-unit">억</span></span>
                  <span class="contrib-divider mx-1">|</span>
                  <span class="contrib-rate">{{ calcRateByEquity(row) }}%</span>
                </div>
              </div>
            </div>
          </div>

          <!-- P/F 컬럼 -->
          <div class="contrib-col d-flex flex-column">
            <div class="contrib-section-label contrib-section-label--pf">P/F</div>
            <div class="contrib-cards contrib-cards--pf">
              <div
                v-for="(row, i) in pfList"
                :key="row.contributionsSeq"
                class="contrib-card contrib-card--pf d-flex align-center justify-space-between"
              >
                <div class="d-flex align-center ga-1">
                  <span class="contrib-dot flex-shrink-0 rounded-circle" :style="{ background: pfColors[i % pfColors.length] }"/>
                  <span class="contrib-corp">{{ row.corporation || '-' }}</span>
                </div>
                <span class="contrib-amount">{{ Number(row.investmentEquity).toLocaleString() }}<span class="contrib-unit">억</span></span>
              </div>
            </div>
          </div>

        </div>

        <!-- 소계 행 (총사업비 바로 위) -->
        <div class="contrib-subtotal-row d-flex ga-3">
          <div v-if="equityList.length > 0" class="contrib-subtotal contrib-col d-flex align-center justify-space-between">
            <span class="contrib-subtotal-label">소계</span>
            <span class="contrib-subtotal-value">{{ equityTotal.toLocaleString() }} 억원</span>
          </div>
          <div class="contrib-subtotal contrib-subtotal--pf contrib-col d-flex align-center justify-space-between">
            <span class="contrib-subtotal-label contrib-subtotal-label--pf">소계</span>
            <span class="contrib-subtotal-value contrib-subtotal-value--pf">{{ pfTotal.toLocaleString() }} 억원</span>
          </div>
        </div>

        <!-- 총사업비 -->
        <div class="contrib-total d-flex align-center justify-space-between">
          <span class="contrib-total-label">총 사업비</span>
          <span class="contrib-total-value">{{ projectCost ? Number(projectCost).toLocaleString() : grandTotal.toLocaleString() }} 억원</span>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  contributions: { type: Array, required: true },
  projectCost:   { type: [Number, String], default: null },
  // COM_CODE 153 중 P/F 구분 코드값 — 확정 후 상위에서 주입
  pfGubunCode:   { type: String, default: '02' },
});

// ── 색상 팔레트 ────────────────────────────────────────────────
const equityColors = ['#1D4ED8', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE', '#DBEAFE'];
const pfColors     = ['#0F766E', '#0D9488', '#2DD4BF', '#99F6E4'];

// ── 출자금 / P/F 분리 ──────────────────────────────────────────
const equityList = computed(() =>
  props.contributions.filter(r => r.gubun !== props.pfGubunCode)
);
const pfList = computed(() =>
  props.contributions.filter(r => r.gubun === props.pfGubunCode)
);

// ── 합계 / 비율 계산 ───────────────────────────────────────────
const grandTotal = computed(() =>
  [...equityList.value, ...pfList.value].reduce((sum, r) => sum + (Number(r.investmentEquity) || 0), 0)
);

const equityTotal = computed(() =>
  equityList.value.reduce((sum, r) => sum + (Number(r.investmentEquity) || 0), 0)
);

const pfTotal = computed(() =>
  pfList.value.reduce((sum, r) => sum + (Number(r.investmentEquity) || 0), 0)
);

// 도넛 base: 총사업비 - PF (PF 제외 사업비)
const equityBase = computed(() => {
  const base = Number(props.projectCost) || 0;
  return base > 0 ? Math.max(0, base - pfTotal.value) : equityTotal.value;
});

// 비율: equityBase 기준
const calcRateByEquity = (row) => {
  if (!equityBase.value) return '0.0';
  return ((Number(row.investmentEquity) || 0) / equityBase.value * 100).toFixed(1);
};

// 미배분: equityBase - equityTotal
const remaining = computed(() => Math.max(0, equityBase.value - equityTotal.value));

// ── 도넛 시리즈 (출자금 + 미배분) ─────────────────────────────
const donutSeries = computed(() => {
  const series = equityList.value.map(r => Number(r.investmentEquity) || 0);
  if (remaining.value > 0) series.push(remaining.value);
  return series;
});

const allColors = computed(() => {
  const colors = equityList.value.map((_, i) => equityColors[i % equityColors.length]);
  if (remaining.value > 0) colors.push('#E2E8F0');
  return colors;
});

// ── 슬라이스 클릭 (미배분 슬라이스 무시) ──────────────────────
const selectedSlice = ref(null);

const onSliceClick = (_event, _chartContext, config) => {
  const idx = config.dataPointIndex;
  if (idx < 0) return;
  if (!_event?.isTrusted) return;
  if (selectedSlice.value?.index === idx) {
    selectedSlice.value = null;
    return;
  }
  if (idx >= equityList.value.length) {
    // 미배분 슬라이스
    selectedSlice.value = {
      index: idx,
      corporation: '미배분',
      investmentEquity: remaining.value,
      isRemaining: true,
    };
  } else {
    const row = equityList.value[idx];
    selectedSlice.value = row ? { index: idx, ...row } : null;
  }
};

// ── ApexCharts 옵션 ────────────────────────────────────────────
const donutOptions = computed(() => ({
  chart: {
    type: 'donut',
    toolbar: { show: false },
    animations: { enabled: true },
    selection: { enabled: false },
    accessibility: { enabled: false },
  },
  labels: [
    ...equityList.value.map(r => r.corporation || '-'),
    ...(remaining.value > 0 ? ['미배분'] : []),
  ],
  colors: allColors.value,
  dataLabels: {
    enabled: true,
    formatter: (_val, opts) => {
      const row = equityList.value[opts.seriesIndex];
      return row ? `${calcRateByEquity(row)}%` : '';
    },
    style: { fontSize: '0.75rem', fontWeight: 700 },
    dropShadow: { enabled: false },
  },
  plotOptions: {
    pie: {
      expandOnClick: true,
      donut: { size: '62%', labels: { show: false } },
    },
  },
  states: { active: { filter: { type: 'none' } } },
  legend: { show: false },
  stroke: { width: 2, colors: ['#fff'] },
  tooltip: {
    custom: ({ seriesIndex }) => {
      const isRemaining = seriesIndex >= equityList.value.length;
      const color = allColors.value[seriesIndex];
      if (isRemaining) {
        return `<div class="apex-tooltip-custom apex-tooltip-custom--dark">
          <span class="apex-tooltip-marker" style="background:${color};border:1px solid #94A3B8"></span>
          <span>미배분 · ${remaining.value.toLocaleString()}억원</span>
        </div>`;
      }
      const row = equityList.value[seriesIndex];
      return `<div class="apex-tooltip-custom">
        <span class="apex-tooltip-marker" style="background:${color}"></span>
        <span>${row.corporation || '-'} · ${calcRateByEquity(row)}% · ${Number(row?.investmentEquity ?? 0).toLocaleString()}억원</span>
      </div>`;
    },
  },
}));
</script>

<style scoped lang="scss">
.view-section-header {
  gap: 8px;
  font-size: 1rem;
  font-weight: 700;
  color: #1a237e;
  border-left: 4px solid #1565c0;
  padding-left: 10px;
}

.contrib-unit {
  font-size: 0.75rem;
  font-weight: 400;
  color: #9e9e9e;
  margin-left: 4px;
}

.view-empty {
  padding: 20px;
  text-align: center;
  color: #bdbdbd;
  font-size: 0.875rem;
  border-radius: 8px;
  background: #fafafa;
}

.contrib-panel {
  flex: 1;
  border: 1px solid #e8eaf0;
  border-radius: 10px;
  padding: 16px 20px;
  background: #ffffff;
}

.contrib-body {
  flex: 1;
  min-height: 0;
}

.contrib-legend {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.contrib-col {
  flex: 1;
  min-width: 0;
}

.contrib-chart-wrap {
  width: 350px;

  :deep(.apexcharts-pie-series path) {
    stroke: #fff !important;
    stroke-width: 2px !important;
    filter: none !important;
  }

  :deep(foreignObject) {
    border: none !important;
    outline: none !important;
  }

  :deep(.apexcharts-tooltip-active) {
    border: none !important;
    outline: none !important;
    box-shadow: none !important;
  }
}

.donut-center {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;
  gap: 1px;
}

.donut-center-name {
  font-size: 0.82rem;
  font-weight: 700;
  color: #1e293b;
}

.donut-center-rate {
  font-size: 1.1rem;
  font-weight: 800;
  color: #1a237e;
  line-height: 1.3;
}

.donut-center-amount {
  font-size: 1.05rem;
  font-weight: 800;
  color: #1a237e;
  line-height: 1.3;
}

.donut-center-total-label {
  font-size: 0.7rem;
  color: #9e9e9e;
}

.donut-center-total-value {
  font-size: 1rem;
  font-weight: 800;
  color: #1a237e;
}

.contrib-sections {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.contrib-subtotal-row {
  flex-shrink: 0;
}


.contrib-section-label {
  align-self: flex-start;
  font-size: 0.85rem;
  font-weight: 700;
  color: #1D4ED8;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  margin-bottom: 6px;

  &--pf { color: #0F766E; }
}

.contrib-cards {
  display: grid;
  grid-template-columns: 1fr;
  gap: 6px;
  align-content: start;
  margin-bottom: 4px;

  /* 각 컬럼: 최대 높이 초과 시 스크롤 */
  &--equity,
  &--pf {
    max-height: 200px;
    overflow-y: auto;
    padding-right: 2px;

    &::-webkit-scrollbar       { width: 4px; }
    &::-webkit-scrollbar-track { background: transparent; }
    &::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 4px; }
  }
}

.contrib-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 8px 12px;

  &--pf {
    background: #f0fdf9;
    border-color: #99f6e4;
  }
}

.contrib-dot {
  width: 8px;
  height: 8px;
}

.contrib-corp {
  font-size: 0.875rem;
  font-weight: 600;
  color: #37474f;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.contrib-amount {
  font-size: 0.95rem;
  font-weight: 700;
  color: #1e293b;
}

.contrib-divider {
  font-size: 0.75rem;
  color: #cbd5e1;
  font-weight: 300;
  line-height: 1;
}

.contrib-rate {
  font-size: 0.75rem;
  font-weight: 600;
  color: #37474f;
}

.contrib-subtotal {
  padding: 6px 10px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 6px;
}

.contrib-subtotal-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #2563eb;

  &--pf { color: #0F766E; }
}

.contrib-subtotal-value {
  font-size: 0.8rem;
  font-weight: 700;
  color: #1d4ed8;

  &--pf { color: #0F766E; }
}

.contrib-subtotal--pf {
  background: #f0fdf9;
  border-color: #99f6e4;
}

.contrib-total {
  padding: 10px 14px;
  background: #004098;
  border-radius: 8px;
  margin-top: 8px;
  flex-shrink: 0;
}

.contrib-total-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
}

.contrib-total-value {
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
}
</style>

<!-- ApexCharts 전역 스타일 (scoped :deep 미적용 대응) -->
<style lang="scss">
.contrib-chart-wrap {
  .apexcharts-tooltip-active,
  .apexcharts-canvas {
    border: none !important;
    outline: none !important;
    box-shadow: none !important;
  }

  .apexcharts-canvas svg { outline: none !important; }

  .apexcharts-pie-series path {
    stroke: #fff !important;
    stroke-width: 2px !important;
    filter: none !important;
  }
}

.apexcharts-tooltip,
.apexcharts-tooltip.apexcharts-theme-light,
.apexcharts-tooltip.apexcharts-theme-dark {
  border: none !important;
  box-shadow: none !important;
  background: transparent !important;
  border-radius: 0 !important;
  padding: 0 !important;
  overflow: visible !important;
}

.apex-tooltip-custom {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 12px;
  background: #1e293b;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  font-size: 0.8rem;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;

  &--dark {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    color: #334155;
  }
}

.apex-tooltip-marker {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}
</style>
