<template>
  <v-container class="d-flex flex-column h-100">

    <!-- 파일 업로드 영역 -->
    <v-row no-gutters class="flex-grow-0 border border-opacity-100 border-primary rounded pa-1 mb-2 align-center ga-2">
      <v-btn variant="flat" density="comfortable">
        <span style="color: orange">등록양식샘플</span>
      </v-btn>
      <v-text-field class="vTextField" variant="outlined" density="comfortable" hide-details />
      <v-btn variant="flat" density="comfortable" text="찾아보기" />
      <v-btn variant="flat" density="comfortable" prepend-icon="mdi-content-save" text="저장" />
      <v-btn variant="flat" density="comfortable" text="다운로드">
        <template #prepend>
          <v-icon icon="mdi-microsoft-excel" color="green" size="small" class="mr-n1" />
        </template>
      </v-btn>
    </v-row>

    <!-- 테이블 -->
    <div class="flex-grow-1 border table-wrapper rounded">
      <div class="d-flex align-center justify-end pa-2 bg-grey-lighten-5 border-b">
        <span class="text-caption font-weight-bold text-grey-darken-2">
          <v-icon icon="mdi-information-outline" size="small" class="mr-1" />단위 : 억원
        </span>
      </div>

      <v-table class="profit-table overflow-y-auto" fixed-header>
        <thead>
          <tr>
            <th
              v-for="header in financialHeaders"
              :key="header.title"
              :rowspan="header.rowspan"
              :colspan="header.colspan"
              :style="{ width: header.width }"
            >
              {{ header.title }}
            </th>
          </tr>
          <tr>
            <th v-for="sub in subHeaders" :key="sub.title">
              {{ sub.title }}
            </th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(item, index) in tableItems" :key="index">
            <td class="text-center bg-grey-lighten-4">{{ item.date }}</td>
            <template v-for="group in groups" :key="group">
              <td v-for="field in fields" :key="`${group}_${field}`" class="text-right border-e border-b">
                {{ formatNumber(item[`${group}_${field}`]) }}
              </td>
            </template>
          </tr>
        </tbody>
      </v-table>
    </div>

  </v-container>
</template>

<script setup>
import { ref } from 'vue';

defineProps({
  nbmId: { type: String, default: '' },
});

// ============================================================
// [1] 테이블 헤더
// ============================================================
const financialHeaders = ref([
  { title: 'Date', rowspan: 2, colspan: 1, width: '10%' },
  { title: 'PF1',  rowspan: 1, colspan: 4 },
  { title: 'PF2',  rowspan: 1, colspan: 4 },
  { title: '합계',  rowspan: 1, colspan: 4 },
]);

const baseFields = [
  { title: '부채' },
  { title: '원금상환' },
  { title: '이자' },
  { title: '소계' },
];

const subHeaders = ref(Array.from({ length: 3 }, () => [...baseFields]).flat());

// ============================================================
// [2] 데이터
// ============================================================
const groups = ['pf1', 'pf2', 'total'];
const fields = ['debt', 'repay', 'interest', 'subtotal'];

const formatNumber = (num) => (num ? num.toLocaleString() : 0);

const generateData = () => {
  const data = [];
  const startDate = new Date(2011, 6, 1);

  for (let i = 0; i < 30; i++) {
    const pf1_debt     = 1727;
    const pf1_repay    = i > 15 ? 33 : 0;
    const pf1_interest = Math.floor(Math.random() * 10) + 25;
    const pf2_debt     = 1762;
    const pf2_repay    = i > 15 ? 33 : 0;
    const pf2_interest = Math.floor(Math.random() * 10) + 20;

    data.push({
      date:           startDate.toISOString().split('T')[0],
      pf1_debt,
      pf1_repay,
      pf1_interest,
      pf1_subtotal:   pf1_debt + pf1_repay + pf1_interest,
      pf2_debt,
      pf2_repay,
      pf2_interest,
      pf2_subtotal:   pf2_debt + pf2_repay + pf2_interest,
      total_debt:     pf1_debt + pf2_debt,
      total_repay:    pf1_repay + pf2_repay,
      total_interest: pf1_interest + pf2_interest,
      total_subtotal: (pf1_debt + pf1_repay + pf1_interest) + (pf2_debt + pf2_repay + pf2_interest),
    });

    startDate.setMonth(startDate.getMonth() + 3);
  }

  return data;
};

const tableItems = ref(generateData());
</script>

<style scoped lang="scss">
.table-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.profit-table {
  height: 100%;

  :deep(.v-table__wrapper table thead tr th) {
    padding: 0;
    height: 42px;
    background-color: #E3F2FD !important;
    font-weight: bold !important;
    border-right: 1px solid #e0e0e0 !important;
    text-align: center !important;
  }
}

:deep(.vTextField .v-field__input) {
  min-height: 28px;
  height: 28px;
  padding-top: 0;
  padding-bottom: 0;
  font-size: 13px;
}
</style>
