<template>
  <v-container class="d-flex flex-column h-100">

    <!-- 조회조건 영역 -->
    <v-row no-gutters class="flex-grow-0 border border-opacity-100 border-primary rounded pa-2 mb-2 align-center ga-2">
      <v-menu transition="slide-y-transition">
        <template #activator="{ props: menuProps }">
          <v-btn
            v-bind="menuProps"
            variant="outlined"
            class="text-subtitle-2"
            append-icon="mdi-arrow-down-drop-circle-outline"
            size="small"
            width="150"
          >
            <span>{{ selectedYear.text }}</span>
          </v-btn>
        </template>
        <v-card rounded="md">
          <v-list density="compact">
            <v-list-item
              v-for="item in yearList"
              :key="item.text"
              :value="item"
              @click="selectedYear = item"
            >
              <span class="text-caption font-weight-bold">{{ item.text }}</span>
            </v-list-item>
          </v-list>
        </v-card>
      </v-menu>

      <v-btn variant="flat" density="comfortable" prepend-icon="mdi-magnify" text="조회" />
    </v-row>

    <!-- 테이블 -->
    <v-data-table
      class="stat-table border rounded"
      :headers="financialHeaders"
      :items="financialData"
      density="compact"
      hide-default-footer
    >
      <template #item="{ item, index }">
        <tr :class="{ 'bg-indigo-lighten-5': item.isHighlight }">
          <td v-if="item.isFirst" :rowspan="item.groupCount" class="text-center border-e font-weight-bold">
            {{ item.category }}
          </td>

          <td :class="['text-center border-e border-b', item.isHighlight ? 'text-primary font-weight-bold' : '']">
            {{ item.label }}
          </td>

          <td class="border-e border-b text-right">
            {{ item.amount }}
          </td>

          <td v-if="index === 0" :rowspan="financialData.length" class="pa-2 vertical-top">
            <div class="d-flex align-center ga-1 mb-2">
              <v-text-field class="vTextField" density="compact" variant="outlined" hide-details />
              <v-btn variant="flat" size="small" text="찾아보기" />
              <v-btn variant="flat" color="error" size="small" prepend-icon="mdi-plus" text="추가" />
              <v-btn variant="flat" color="grey"  size="small" prepend-icon="mdi-delete" text="삭제" />
            </div>
            <v-btn variant="flat" block prepend-icon="mdi-content-save" text="저장" />
          </td>
        </tr>
      </template>
    </v-data-table>

  </v-container>
</template>

<script setup>
import { ref } from 'vue';

defineProps({
  nbmId: { type: String, default: '' },
});

// ============================================================
// [1] 조회조건
// ============================================================
const yearList = [
  { text: '2025' },
  { text: '2024' },
];
const selectedYear = ref(yearList[0]);

// ============================================================
// [2] 테이블
// ============================================================
const financialHeaders = [
  { title: '구분',             key: 'category', align: 'center', width: '15%' },
  { title: '지표명',           key: 'label',    align: 'center', width: '20%' },
  { title: '금액(단위:백만원)', key: 'amount',   align: 'center', width: '20%' },
  { title: '파일첨부',         key: 'file',     align: 'center', width: '45%' },
];

const financialData = ref([
  { category: '재무구조', label: '자산',      amount: '', isFirst: true,  groupCount: 4, isHighlight: false },
  { category: '재무구조', label: '부채',      amount: '', isFirst: false,                isHighlight: false },
  { category: '재무구조', label: '자본',      amount: '', isFirst: false,                isHighlight: false },
  { category: '재무구조', label: '부채비율',  amount: '', isFirst: false,                isHighlight: false },

  { category: '손익현황', label: '매출액',    amount: '', isFirst: true,  groupCount: 8, isHighlight: false },
  { category: '손익현황', label: '매출원가',  amount: '', isFirst: false,                isHighlight: false },
  { category: '손익현황', label: '판매관리비', amount: '', isFirst: false,                isHighlight: false },
  { category: '손익현황', label: '영업이익',  amount: '', isFirst: false,                isHighlight: true  },
  { category: '손익현황', label: '기타의손익', amount: '', isFirst: false,                isHighlight: false },
  { category: '손익현황', label: '금융손익',  amount: '', isFirst: false,                isHighlight: false },
  { category: '손익현황', label: '법인세비용', amount: '', isFirst: false,                isHighlight: false },
  { category: '손익현황', label: '당기순이익', amount: '', isFirst: false,                isHighlight: true  },
]);
</script>

<style scoped lang="scss">
.stat-table {
  min-height: 0;
  flex-grow: 1;
  height: 100%;

  :deep(table) {
    height: 100%;
  }

  .vertical-top {
    vertical-align: top;
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
