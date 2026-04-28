<template>
  <v-container class="main-page-wrapper">

    <!-- 조회조건 영역 -->
    <v-card class="flex-grow-0 ma-2 pa-2" variant="outlined" style="border-color: #1867c0">
      <v-row no-gutters class="d-flex ga-1 align-center">

        <!-- 구분 드롭다운 -->
        <v-select
          v-model="selectedFilter"
          :items="filterItems"
          item-title="text"
          item-value="value"
          variant="outlined"
          density="compact"
          hide-details
          style="max-width: 120px"
        />

        <!-- 검색 텍스트필드 -->
        <v-text-field
          v-model="searchKeyword"
          variant="outlined"
          density="compact"
          hide-details
          style="max-width: 400px"
          @keyup.enter="search"
        />

        <!-- 조회 버튼 -->
        <v-btn
          variant="flat"
          size="small"
          prepend-icon="mdi-magnify"
          text="조회"
          @click="search"
        />

      </v-row>
    </v-card>
    <!-- 조회조건 영역 끝 -->

    <!-- 메인 컨텐츠 영역 -->
    <v-card class="mx-2 flex-grow-1" variant="outlined" style="border-color: #1867c0">
      <v-data-table
        :headers="headers"
        :items="tableItems"
        class="business-table"
        fixed-header
      >
        <template #headers>
          <tr>
            <th rowspan="2" class="text-center tbl-border">사업명</th>
            <th rowspan="2" class="text-center tbl-border" style="min-width: 160px">주주현황</th>
            <th rowspan="2" class="text-center tbl-border">용량</th>
            <th colspan="4" class="text-center tbl-border">총 사업비(억 원)</th>
            <th rowspan="2" class="text-center tbl-border">설립일자</th>
            <th rowspan="2" class="text-center tbl-border">준공일자</th>
            <th rowspan="2" class="text-center tbl-border">사업기간</th>
            <th colspan="3" class="text-center tbl-border">경제성 평가</th>
            <th rowspan="2" class="text-center tbl-border">담당자</th>
            <th rowspan="2" class="text-center tbl-border">회계 구분</th>
            <th rowspan="2" class="text-center tbl-border">계열 회사 구분</th>
          </tr>
          <tr>
            <th class="text-center tbl-border">총투자비</th>
            <th class="text-center tbl-border">남동</th>
            <th class="text-center tbl-border">참여사</th>
            <th class="text-center tbl-border">PF</th>
            <th class="text-center tbl-border">NPV</th>
            <th class="text-center tbl-border">IRR</th>
            <th class="text-center tbl-border">남동수익(억원)</th>
          </tr>
        </template>

        <template #item="{ item }">
          <tr
            :class="{ 'selected-row': selectedItem === item }"
            class="clickable-row"
            @click="selectedItem = item"
          >
            <td class="tbl-border text-center text-link" @click.stop="$router.push(`/operation/${item.nbmId}`)">
              {{ item.projectName }}
            </td>
            <td class="tbl-border text-center shareholders-cell">{{ item.shareholders }}</td>
            <td class="tbl-border text-center" v-html="item.capacity" />
            <td class="tbl-border text-center">{{ item.totalCost }}</td>
            <td class="tbl-border text-center">{{ item.koenCost }}</td>
            <td class="tbl-border text-center">{{ item.partnerCost }}</td>
            <td class="tbl-border text-center">{{ item.pf }}</td>
            <td class="tbl-border text-center">{{ item.setupDate }}</td>
            <td class="tbl-border text-center">{{ item.completeDate }}</td>
            <td class="tbl-border text-center">{{ item.period }}</td>
            <td class="tbl-border text-center">{{ item.npv }}</td>
            <td class="tbl-border text-center">{{ item.irr }}</td>
            <td class="tbl-border text-center">{{ item.profit }}</td>
            <td class="tbl-border text-center">{{ item.manager }}</td>
            <td class="tbl-border text-center">{{ item.accType }}</td>
            <td class="tbl-border text-center">{{ item.groupType }}</td>
          </tr>
        </template>

        <template #no-data>
          <v-row no-gutters justify="center" align="center" class="my-2">
            <v-col align="center">
              <span class="text-subtitle-1 text-black">등록된 데이터가 없습니다</span>
            </v-col>
          </v-row>
        </template>

        <template #bottom />
      </v-data-table>

      
    </v-card>
    <!-- 메인 컨텐츠 영역 끝 -->
     <!-- 테이블 하단 버튼 -->
      <v-row no-gutters class="d-flex justify-end ga-1 pa-2 flex-grow-0">
        <v-btn variant="flat" prepend-icon="mdi-microsoft-excel" text="저장" />
        <v-btn variant="flat" prepend-icon="mdi-check-bold" text="등록" @click="$router.push('/operation/regist')" />
      </v-row>

  </v-container>
</template>

<script setup>
import { ref, getCurrentInstance, onMounted } from 'vue';

const { proxy } = getCurrentInstance();

// ============================================================
// [1] 검색 조건
// ============================================================
const filterItems = [
  { text: '사업명',  value: 'bizTitle' },
  { text: '국가',   value: 'nationCode' },
];
const selectedFilter = ref(filterItems[0].value);
const searchKeyword  = ref('');

// ============================================================
// [2] 테이블
// ============================================================
const selectedItem = ref(null);
const headers      = ref(new Array(16).fill({}));
const tableItems   = ref([]);

// ============================================================
// [3] API 조회
// ============================================================
const fetchList = () => {
  proxy.$br_trans([{
    url: '/kopms-api/nbm/getNbmList',
    method: 'post',
    data: {
      searchType: selectedFilter.value,
      keyword:    searchKeyword.value,
    },
  }], (_url, code, _msg, data) => {
    if (code < 0) return;
    tableItems.value = (data.list || []).map(item => ({
      projectName:  item.bizTitle,
      shareholders: item.shareholders || '',
      capacity:     item.capacity,
      totalCost:    item.projectCost,
      koenCost:     item.koenCost    ?? '',
      partnerCost:  item.partnerCost ?? '',
      pf:           item.pfCost      ?? '',
      setupDate:    item.foundationDate,
      completeDate: item.completionDate,
      period:       item.businessPeriod,
      npv:          item.npv,
      irr:          item.irr != null ? item.irr + '%' : '',
      profit:       item.sales,
      manager:      item.empNames || '',
      accType:      item.cdAccuntingName || item.cdAccunting || '',
      groupType:    item.cdAffiliateName || item.cdAffiliate || '',
      nbmId:        item.masterNo,
    }));
  });
};

const search = () => fetchList();

onMounted(() => fetchList());
</script>

<style scoped lang="scss">
:deep(.v-field__input) {
  min-height: 28px;
  padding-top: 0;
  padding-bottom: 0;
  font-size: 13px;
}

.business-table :deep(thead th) {
  background-color: #e3f2fd !important;
  color: #1565c0 !important;
  font-weight: bold !important;
  border: 1px solid #dee2e6 !important;
  height: 48px !important;
}

.business-table :deep(tbody td) {
  border: 1px solid #dee2e6 !important;
  font-size: 13px;
}

.tbl-border {
  border: 1px solid #dee2e6 !important;
}

.clickable-row {
  cursor: pointer;

  &:hover {
    background-color: #f5f5f5 !important;
  }
}

.selected-row {
  background-color: #f5f5f5 !important;
}

.text-link {
  cursor: pointer;
  color: inherit;

  &:hover {
    text-decoration: underline;
  }
}

.shareholders-cell {
  white-space: pre-line;
  line-height: 1.6;
  font-size: 12px;
}
</style>
