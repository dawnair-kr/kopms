<template>
  <v-container class="d-flex flex-column h-100">

    <div class="table-wrapper flex-grow-1 mb-2">
      <v-table class="contribution-table border rounded" fixed-header density="compact">
        <thead>
          <tr>
            <th rowspan="2" class="text-center border-e">출자법인명</th>
            <th rowspan="2" class="text-center border-e">출자일</th>
            <th rowspan="2" class="text-center border-e">지분율</th>
            <th rowspan="2" class="text-center border-e">보유주식수</th>
            <th rowspan="2" class="text-center border-e">전표통화</th>
            <th colspan="3" class="text-center border-e">출자금</th>
            <th rowspan="2" class="text-center border-e">납입확인</th>
          </tr>
          <tr>
            <th class="text-center border-e">원화</th>
            <th class="text-center border-e">외화</th>
            <th class="text-center border-e">환율</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(item, index) in tableItems" :key="index">
            <td v-if="index === 0" :rowspan="tableItems.length" class="text-center border-e">
              {{ item.company }}
            </td>
            <td class="text-center border-e">{{ item.date }}</td>
            <td class="text-center border-e">{{ item.share }}%</td>
            <td class="text-center border-e">{{ item.stocks.toLocaleString() }}</td>
            <td class="text-center border-e">{{ item.currency }}</td>
            <td class="text-right border-e">{{ item.krw.toLocaleString() }}</td>
            <td class="text-right border-e">{{ item.foreign }}</td>
            <td class="text-right border-e">{{ item.rate }}</td>
            <td class="text-center border-e">{{ item.confirmed }}</td>
          </tr>
        </tbody>

        <tfoot class="sticky-footer">
          <tr class="bg-grey-lighten-4 font-weight-bold">
            <td colspan="5" class="text-center border-e">납입완료 출자금</td>
            <td class="text-right border-e text-primary">{{ totalKrw.toLocaleString() }}</td>
            <td class="text-right border-e text-primary">0</td>
            <td class="border-e" />
            <td class="border-e" />
          </tr>
          <tr class="bg-grey-lighten-2 font-weight-bold">
            <td colspan="5" class="text-center border-e">총계 (계획포함)</td>
            <td class="text-right border-e text-primary">{{ totalKrw.toLocaleString() }}</td>
            <td class="text-right border-e text-primary">0</td>
            <td class="border-e" />
            <td class="border-e" />
          </tr>
        </tfoot>
      </v-table>
    </div>

    <v-row no-gutters class="justify-end">
      <v-btn variant="flat" prepend-icon="mdi-pencil" text="수정" />
    </v-row>

  </v-container>
</template>

<script setup>
import { computed, ref } from 'vue';

const tableItems = ref([
  { company: '', date: '2009-09-03', share: 29, stocks: 17400,   currency: 'KRW', krw: 87000000,    foreign: 0, rate: 0, confirmed: 'Y' },
  { company: '', date: '2009-12-29', share: 29, stocks: 997600,  currency: 'KRW', krw: 4901000000,  foreign: 0, rate: 0, confirmed: 'Y' },
  { company: '', date: '2010-05-07', share: 29, stocks: 3202180, currency: 'KRW', krw: 11022900000, foreign: 0, rate: 0, confirmed: 'Y' },
  { company: '', date: '2010-10-26', share: 29, stocks: 4750780, currency: 'KRW', krw: 7743000000,  foreign: 0, rate: 0, confirmed: 'Y' },
  { company: '', date: '2010-12-29', share: 29, stocks: 6629400, currency: 'KRW', krw: 9393100000,  foreign: 0, rate: 0, confirmed: 'Y' },
  { company: '', date: '2013-04-26', share: 29, stocks: 7093400, currency: 'KRW', krw: 2320000000,  foreign: 0, rate: 0, confirmed: 'Y' },
  { company: '', date: '2013-07-29', share: 29, stocks: 9413400, currency: 'KRW', krw: 11600000000, foreign: 0, rate: 0, confirmed: 'Y' },
  { company: '', date: '2013-07-29', share: 29, stocks: 9413400, currency: 'KRW', krw: 11600000000, foreign: 0, rate: 0, confirmed: 'Y' },
  { company: '', date: '2013-07-29', share: 29, stocks: 9413400, currency: 'KRW', krw: 11600000000, foreign: 0, rate: 0, confirmed: 'Y' },
  { company: '', date: '2013-07-29', share: 29, stocks: 9413400, currency: 'KRW', krw: 11600000000, foreign: 0, rate: 0, confirmed: 'Y' },
  { company: '', date: '2013-07-29', share: 29, stocks: 9413400, currency: 'KRW', krw: 11600000000, foreign: 0, rate: 0, confirmed: 'Y' },
  { company: '', date: '2013-07-29', share: 29, stocks: 9413400, currency: 'KRW', krw: 11600000000, foreign: 0, rate: 0, confirmed: 'Y' },
  { company: '', date: '2013-07-29', share: 29, stocks: 9413400, currency: 'KRW', krw: 11600000000, foreign: 0, rate: 0, confirmed: 'Y' },
  { company: '', date: '2013-07-29', share: 29, stocks: 9413400, currency: 'KRW', krw: 11600000000, foreign: 0, rate: 0, confirmed: 'Y' },
  { company: '', date: '2013-07-29', share: 29, stocks: 9413400, currency: 'KRW', krw: 11600000000, foreign: 0, rate: 0, confirmed: 'Y' },
  { company: '', date: '2013-07-29', share: 29, stocks: 9413400, currency: 'KRW', krw: 11600000000, foreign: 0, rate: 0, confirmed: 'Y' },
  { company: '', date: '2013-07-29', share: 29, stocks: 9413400, currency: 'KRW', krw: 11600000000, foreign: 0, rate: 0, confirmed: 'Y' },
  { company: '', date: '2013-07-29', share: 29, stocks: 9413400, currency: 'KRW', krw: 11600000000, foreign: 0, rate: 0, confirmed: 'Y' },
]);

const totalKrw = computed(() =>
  tableItems.value.reduce((acc, cur) => acc + cur.krw, 0)
);
</script>

<style scoped lang="scss">
.table-wrapper {
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.contribution-table {
  height: 100%;

  :deep(th) {
    padding: 8px 0 !important;
    background-color: #E3F2FD !important;
    font-weight: bold !important;
  }
}

.sticky-footer {
  position: sticky;
  bottom: 0;
  z-index: 2;

  td {
    border-top: 2px solid #bbb !important;
  }
}
</style>
