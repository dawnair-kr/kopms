<template>
  <div class="biz-card d-flex align-start overflow-hidden">

    <!-- 좌: 사진 패널 -->
    <div class="biz-card-photo">
      <v-img v-if="bizMaster.imageFile" :src="bizMaster.imageFile" width="100%"/>
      <div v-else class="biz-no-photo d-flex flex-column align-center justify-center ga-2">
        <v-icon icon="mdi-image-outline" size="52" color="#b0bec5"/>
        <span>이미지 없음</span>
      </div>
      <div v-if="bizMaster.imageFile" class="biz-photo-caption">
        <div class="biz-photo-title">{{ bizMaster.bizTitle }}</div>
      </div>
    </div>

    <!-- 우: 상세 패널 -->
    <div class="flex-grow-1 position-relative align-self-stretch">
      <div class="biz-card-body d-flex flex-column overflow-hidden">
        <div class="biz-info-columns d-flex overflow-y-auto">
          <div class="biz-info-col d-flex flex-column justify-space-between pr-4">

            <div class="biz-info-row d-flex align-center rounded">
              <span class="biz-info-label">사업명</span>
              <span class="biz-info-value">{{ bizMaster.bizTitle || '-' }}</span>
            </div>
            <div class="biz-info-row d-flex align-center rounded">
              <span class="biz-info-label">사업내용</span>
              <span class="biz-info-value">{{ bizMaster.bizContent || '-' }}</span>
            </div>
            <div class="biz-info-row d-flex align-center rounded">
              <span class="biz-info-label">위 치</span>
              <span class="biz-info-value">{{ bizMaster.location || '-' }}</span>
            </div>
            <div class="biz-info-row d-flex align-center rounded">
              <span class="biz-info-label">출자법인명</span>
              <span class="biz-info-value">{{ bizMaster.eisCompanyCode || '-' }}</span>
            </div>
            <div class="biz-info-row d-flex align-center rounded">
              <span class="biz-info-label">설비용량</span>
              <span class="biz-info-value">{{ bizMaster.capacity || '-' }}</span>
            </div>

            <div class="d-flex flex-column ga-2">
              <div class="d-flex ga-2">
                <div class="biz-pair-card biz-pair-card--kpi d-flex flex-column rounded-lg">
                  <span class="biz-pair-label">총사업비</span>
                  <span class="biz-pair-value">{{ bizMaster.projectCost != null ? Number(bizMaster.projectCost).toLocaleString() + ' 억원' : '-' }}</span>
                </div>
                <div class="biz-pair-card biz-pair-card--kpi d-flex flex-column rounded-lg">
                  <span class="biz-pair-label">연 매출액</span>
                  <span class="biz-pair-value">{{ bizMaster.sales != null ? Number(bizMaster.sales).toLocaleString() + ' 억원' : '-' }}</span>
                </div>
              </div>
              <div class="d-flex ga-2">
                <div class="biz-pair-card d-flex flex-column rounded-lg">
                  <span class="biz-pair-label">공사기간</span>
                  <span class="biz-pair-value">{{ bizMaster.construtionPeriod || '-' }}</span>
                </div>
                <div class="biz-pair-card d-flex flex-column rounded-lg">
                  <span class="biz-pair-label">준공일자</span>
                  <span class="biz-pair-value">{{ bizMaster.completionDate || '-' }}</span>
                </div>
              </div>
            </div>

          </div>

          <div class="biz-highlight-right d-flex flex-column pl-4">
            <div class="biz-highlight-cards">
              <div v-for="card in highlightCards" :key="card.label" class="biz-highlight-card d-flex flex-column rounded-lg" :class="{ 'biz-highlight-card--primary': card.primary }">
                <span class="biz-hl-label">{{ card.label }}</span>
                <span class="biz-hl-value">{{ card.value }}</span>
              </div>
            </div>
            <div class="biz-metrics d-flex align-center flex-shrink-0 rounded-lg py-4 px-5 mt-3">
              <div class="biz-metric-item d-flex flex-column align-center ga-1">
                <span class="biz-metric-key">NPV</span>
                <span class="biz-metric-val">{{ bizMaster.npv != null ? Number(bizMaster.npv).toLocaleString() + '억원' : '-' }}</span>
              </div>
              <div class="biz-metric-sep flex-shrink-0 mx-4"/>
              <div class="biz-metric-item d-flex flex-column align-center ga-1">
                <span class="biz-metric-key">IRR</span>
                <span class="biz-metric-val biz-metric-val--accent">{{ bizMaster.irr != null ? bizMaster.irr + '%' : '-' }}</span>
              </div>
              <div class="biz-metric-sep flex-shrink-0 mx-4"/>
              <div class="biz-metric-item d-flex flex-column align-center ga-1">
                <span class="biz-metric-key">투자수익</span>
                <span class="biz-metric-val">{{ bizMaster.investments != null ? bizMaster.investments + '%' : '-' }}</span>
              </div>
              <div class="biz-metric-sep flex-shrink-0 mx-4"/>
              <div class="biz-metric-item d-flex flex-column align-center ga-1">
                <span class="biz-metric-key">O&amp;M</span>
                <span class="biz-metric-val">{{ bizMaster.om ?? '-' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  bizMaster: { type: Object, required: true },
  members:   { type: Array,  required: true },
});

const memberNames = computed(() =>
  props.members.map(x => x.empName || x.empno).join(', ') || '-'
);

const highlightCards = computed(() => {
  const m = props.bizMaster;
  if (!m.bizTitle) return [];
  const fmt = (v, suffix = '') => (v != null && v !== '') ? `${v}${suffix}` : '-';
  return [
    { label: '국 가',          value: fmt(m.nationName),                                                          primary: true },
    { label: '담당자',          value: memberNames.value,                                                          primary: true },
    { label: '인력수주용역해당', value: m.laborService === 'Y' ? '해당' : m.laborService === 'N' ? '미해당' : '-'               },
    { label: '계열회사구분',     value: fmt(m.cdAffiliateName)                                                                   },
    { label: '회계구분',        value: fmt(m.cdAccuntingName)                                                                   },
    { label: '연결정보',        value: fmt(m.connectionInfoName)                                                                },
    { label: '기술료등',        value: fmt(m.engineeringFee, '%')                                                               },
    { label: '설립일자',        value: fmt(m.foundationDate)                                                                    },
    { label: '사업기간',        value: fmt(m.businessPeriod)                                                                    },
  ];
});
</script>

<style scoped lang="scss">
.biz-card {
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid #e8eaf0;
}

.biz-card-photo {
  flex: 0 0 450px;
  aspect-ratio: 450 / 362;
  position: relative;
  background: #eceff1;

  .biz-no-photo {
    width: 100%;
    height: 100%;
    color: #b0bec5;
    font-size: 0.875rem;
  }

  .biz-photo-caption {
    position: absolute;
    top: 0; left: 0; right: 0;
    background: linear-gradient(rgba(0, 0, 0, 0.55), transparent);
    padding: 12px 14px 28px;

    .biz-photo-title {
      color: #ffffff;
      font-weight: 600;
      letter-spacing: 0.02em;
    }
  }
}

.biz-card-body {
  position: absolute;
  inset: 0;
  padding: 20px 24px 16px;
  background: #ffffff;
}

.biz-info-columns { flex: 1; }

.biz-info-col {
  flex: 1;
  gap: 6px;
}

.biz-pair-card {
  flex: 1;
  gap: 3px;
  padding: 9px 12px;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
}

.biz-pair-label {
  font-size: 0.7rem;
  font-weight: 500;
  color: #9e9e9e;
  letter-spacing: 0.03em;
}

.biz-pair-value {
  font-size: 0.9rem;
  font-weight: 700;
  color: #1a237e;
}

.biz-pair-card--kpi .biz-pair-value {
  font-size: 1.35rem;
  font-weight: 800;
}

.biz-highlight-right {
  flex: 1;
  border-left: 1px solid #eceff1;
}

.biz-info-row {
  font-size: 0.875rem;
  padding: 3px 4px;
  transition: background 0.12s;

  &:hover { background: #f5f7ff; }
}

.biz-info-label {
  min-width: 108px;
  font-weight: 500;
  color: #9e9e9e;
  flex-shrink: 0;
  font-size: 0.72rem;
  letter-spacing: 0.02em;
}

.biz-info-value {
  color: #1a237e;
  font-weight: 500;
  font-size: 0.875rem;
}

.biz-highlight-cards {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
  align-content: stretch;
}

.biz-highlight-card {
  gap: 3px;
  padding: 9px 12px;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
}

.biz-highlight-card--primary {
  background: #eff6ff;
  border-color: #bfdbfe;

  .biz-hl-label { color: #2563eb; }
  .biz-hl-value { color: #1d4ed8; }
}

.biz-hl-label {
  font-size: 0.68rem;
  font-weight: 500;
  color: #9e9e9e;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.biz-hl-value {
  font-size: 0.85rem;
  font-weight: 700;
  color: #1a237e;
}

.biz-metrics { background: #1a237e; }

.biz-metric-item { flex: 1; }

.biz-metric-sep {
  width: 1px;
  height: 36px;
  background: rgba(255, 255, 255, 0.15);
}

.biz-metric-key {
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.5);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.biz-metric-val {
  font-size: 1.4rem;
  font-weight: 800;
  color: #ffffff;

  &--accent { color: #69f0ae; }
}
</style>
