<template>
  <v-container class="d-flex flex-column h-100">

    <v-card class="flex-grow-0 border mb-2" flat>
      <v-data-table
        :headers="headers"
        :items="economicAnalysis"
        class="feasibility-table"
        hide-default-footer
      >
        <template #thead>
          <tr>
            <th
              v-for="header in headers"
              :key="header.title"
              :rowspan="header.rowspan"
              :colspan="header.colspan"
              :class="['text-center', header.class]"
            >
              {{ header.title }}
            </th>
          </tr>
          <tr>
            <th
              v-for="sub in subHeaders"
              :key="sub.title"
              :class="['text-center', sub.class]"
            >
              {{ sub.title }}
            </th>
          </tr>
        </template>

        <template #item="{ item }">
          <tr>
            <td class="text-center">{{ item.indicator }}</td>
            <td class="text-center">{{ item.plan }}</td>
            <td class="text-center">{{ item.actual }}</td>
          </tr>
        </template>
      </v-data-table>
    </v-card>

    <v-card class="flex-grow-1 border border-opacity-100 border-primary" flat>
      <v-row no-gutters class="align-center pa-2 bg-primary border-b">
        <span class="font-weight-bold text-white d-flex align-center">
          <v-icon icon="mdi-text-box-search-outline" size="small" class="mr-1" />
          사후 경제성 분석결과 요약
        </span>
        <v-spacer />
        <v-btn class="font-weight-bold text-black" prepend-icon="mdi-check-bold" text="등록" density="comfortable" />
      </v-row>
      <v-textarea density="compact" hide-details no-resize variant="solo" flat />
    </v-card>

  </v-container>
</template>

<script setup>
import { ref } from 'vue';

const headers = ref([
  { title: '분석지표',           rowspan: 2, colspan: 1 },
  { title: '사업계획서(이사회기준)', rowspan: 2, colspan: 1 },
  { title: '사후경제성분석',       rowspan: 1, colspan: 1 },
]);

const subHeaders = ref([
  { title: '2차' },
]);

const economicAnalysis = ref([
  { indicator: '년도',       plan: '',    actual: '2014'   },
  { indicator: 'IRR',       plan: '%',   actual: '7.2 %'  },
  { indicator: 'ROE',       plan: '%',   actual: '7 %'    },
  { indicator: 'NPV',       plan: '억원', actual: '348 억원' },
  { indicator: 'B/C Ratio', plan: '',    actual: '1.02'   },
  { indicator: '회수기간',    plan: '년',  actual: '22 년'  },
  { indicator: 'GDP 성장율',  plan: '%',   actual: '2 %'   },
  { indicator: '노동생산성',  plan: '억원', actual: '억원'   },
  { indicator: 'EV/EBITDA', plan: '억원', actual: '억원'   },
  { indicator: '파일첨부',    plan: '',    actual: ''      },
]);
</script>

<style scoped lang="scss">
.feasibility-table {
  :deep(th) {
    padding: 8px 0 !important;
    background-color: #E3F2FD;
    font-weight: bold !important;
    border-right: 1px solid #e0e0e0 !important;
    border-bottom: 1px solid #e0e0e0 !important;
  }
}
</style>
