<template no-gutters>
  <v-container class="d-flex flex-column h-100">

    <v-row no-gutters class="d-flex align-center">
      <h3 class="text-subtitle-1 font-weight-bold">
        <v-icon icon="mdi-play-box-outline" color="blue" class="mr-2"/>주주현황
      </h3>

      <v-spacer/>

      <span class="text-caption font-weight-bold text-grey-darken-2">
        <v-icon icon="mdi-information-outline" size="small" class="mr-1"/>기준일 : {{ today }}
      </span>
    </v-row>
    
    <v-row no-gutters class="pa-1 mb-2 rounded" style="background-color: #003F98;">
      <span style="color: #FFFFFF; font-weight: 500;">남동발전(%)</span>
    </v-row>

    <v-row no-gutters class="d-flex align-center mb-2">

      <h3 class="text-subtitle-1 font-weight-bold">
        <v-icon icon="mdi-play-box-outline" color="blue" class="mr-2"/>안건내용
      </h3>

      <v-spacer/>

      <span class="text-caption font-weight-bold text-grey-darken-2 mr-1">
        개최년도
      </span>
      <v-menu :persistent="false" transition="slide-y-transition">
        <template v-slot:activator="{ props }">
          <v-btn v-bind="props" variant="outlined"
            class="text-subtitle-2 d-flex justify-space-between"
            append-icon="mdi-arrow-down-drop-circle-outline"
            size="small" style="width: 100px">
            <span>2025년</span>
          </v-btn>
        </template>
        <v-card rounded="md">
          <v-list density="compact">
            <v-list-item v-for="(item, i) in itemList" :key="i" :value="item">
              <span class="text-caption font-weight-bold">{{ item.text }}</span>
            </v-list-item>
          </v-list>
        </v-card>
      </v-menu>

    </v-row>

    <v-data-table
      show-select
      class="genaral-table border rounded mb-2"
      :headers="genaralHeaders"
      density="compact"
      hide-default-footer
    >
      <template v-slot:body.append>
        <tr class="bg-indigo-lighten-5 font-weight-bold">
          <td colspan="3" class="text-center border-e">2025년 소계</td>
          <td colspan="1" class="text-center border-e">개최건수 0건, 안건 수 0건</td>
          <td colspan="1"></td>
          <td colspan="1"></td>
          <td colspan="2"></td>
        </tr>
      </template>

      <template v-slot:column.data-table-select="{ allSelected, selectAll }">
        <v-checkbox-btn
          :model-value="allSelected"
          @update:model-value="selectAll"
        ></v-checkbox-btn>
      </template>

      <template v-slot:item="{ item, isSelected, toggleSelect }">
          <tr :class="{ 'bg-indigo-lighten-5': item.isHighlight }">
            <td class="text-center border-e">
              <v-checkbox-btn
                :model-value="isSelected(item)"
                @update:model-value="toggleSelect(item)"
              ></v-checkbox-btn>
            </td>

          <td :class="['text-center border-e border-b', item.isHighlight ? 'text-primary font-weight-bold' : '']">
            {{ item.label }}
          </td>

          <td class="border-e border-b text-right">
            {{ item.amount }}
          </td>
        </tr>
      </template>
    </v-data-table>

    <v-row no-gutters class="d-flex justify-end ga-1">
      <v-btn variant="flat" size="small" prepend-icon="mdi-check-bold" text="등록" />
      <v-btn variant="flat" size="small" prepend-icon="mdi-delete" text="삭제" />
      <v-btn variant="flat" size="small" prepend-icon="mdi-file-excel" text="저장" />
    </v-row>

  </v-container>

</template>

<script setup>
import { ref } from 'vue';
import dayjs from 'dayjs'

const today = dayjs().format('YYYY-MM-DD');
const itemList = [
  { text: "2025" },
  { text: "2024" }
];

const genaralHeaders = ref([
  { title: '', key: 'data-table-select', align: 'center', width: '5%'},
  { title: '주주총회순번', key: '', align: 'center', width: '15%' },
  { title: '개최일자', key: '', align: 'center', width: '10%' },
  { title: '안건', key: '', align: 'center', width: '20%' },
  { title: '의견', key: '', align: 'center', width: '30%' },
  { title: '결과', key: '', align: 'center', width: '10%' },
  { title: '파일', key: '', align: 'center', width: '10%' },
])

</script>

<script>
export default {
  props: {
    nbmId: {
      type: String,
    },
  },
  components: {
  },
  watch: {
  },
  computed: {
  },

  mounted() {
  },
  methods: {

  },
  data() {
    return {
      businessInfo: {
        "사업내용": "여수 산단내 전기공급 및 증기 판매",
        "출자법인명": "데이원 에너지 (주)",
        "설비용량": "발전 24.2MW*2기 증기 350톤/h*2기",
        "위치": "여수화력 발전처 구내",
        "총사업비": "6,035 억원",
        "연 매출액": "1,000 억원",
        "IRR": "13.05%",
        "공사기간": "2009.12 ~ 2013.01",
        "준공일자": "2013-01-03"
      },
    }
  },
}
</script>

<style scoped lang="scss">
.table-wrapper {
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.genaral-table {
  height: 100%;

  :deep(.v-selection-control.v-selection-control--density-compact) {
    justify-content: center;
  }
  
  .genaral-table :deep(.v-data-table-header__content) {
    justify-content: center !important;
    width: 100%;
  }

  :deep(th) {
    padding: 8px 0 !important;
    background-color: #E3F2FD !important;
    font-weight: bold !important;
  }
}
</style>