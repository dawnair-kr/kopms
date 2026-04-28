<template>
  <v-container class="d-flex flex-column">

    <!-- 상단 타이틀 / 개최년도 -->
    <v-row no-gutters class="align-center mb-2">
      <h3 class="text-subtitle-1 font-weight-bold">
        <v-icon icon="mdi-play-box-outline" color="blue" class="mr-2" />등록양식샘플
      </h3>
      <v-spacer />
      <span class="text-caption font-weight-bold text-grey-darken-2 mr-1">개최년도</span>
      <v-menu transition="slide-y-transition">
        <template #activator="{ props: menuProps }">
          <v-btn
            v-bind="menuProps"
            variant="outlined"
            class="text-subtitle-2"
            append-icon="mdi-arrow-down-drop-circle-outline"
            size="small"
            style="width: 100px"
          >
            {{ selectedYear.text }}
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
    </v-row>

    <!-- 안건 테이블 -->
    <v-data-table
      show-select
      class="agenda-table border rounded mb-2"
      :headers="agendaHeaders"
      density="compact"
      hide-default-footer
    >
      <template #body.append>
        <tr class="bg-indigo-lighten-5 font-weight-bold">
          <td colspan="3" class="text-center border-e">{{ selectedYear.text }}년 소계</td>
          <td colspan="1" class="text-center border-e">개최건수 0건, 안건 수 0건</td>
          <td colspan="1" />
          <td colspan="1" />
          <td colspan="2" />
        </tr>
      </template>

      <template #column.data-table-select="{ allSelected, selectAll }">
        <v-checkbox-btn :model-value="allSelected" @update:model-value="selectAll" />
      </template>

      <template #item="{ item, isSelected, toggleSelect }">
        <tr :class="{ 'bg-indigo-lighten-5': item.isHighlight }">
          <td class="text-center border-e">
            <v-checkbox-btn
              :model-value="isSelected(item)"
              @update:model-value="toggleSelect(item)"
            />
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

    <!-- 하단 버튼 -->
    <v-row no-gutters class="justify-end ga-1">
      <v-btn variant="flat" size="small" prepend-icon="mdi-check-bold"  text="등록" />
      <v-btn variant="flat" size="small" prepend-icon="mdi-delete"      text="삭제" />
      <v-btn variant="flat" size="small" prepend-icon="mdi-file-excel"  text="저장" />
    </v-row>

  </v-container>
</template>

<script setup>
import { ref } from 'vue';

defineProps({
  nbmId: { type: String, default: '' },
});

// ============================================================
// [1] 개최년도
// ============================================================
const yearList = [
  { text: '2025년' },
  { text: '2024년' },
];
const selectedYear = ref(yearList[0]);

// ============================================================
// [2] 테이블 헤더
// ============================================================
const agendaHeaders = [
  { title: '',                         key: 'data-table-select', align: 'center', sortable: false, width: '5%'  },
  { title: '이사회 순번',               key: 'boardSeq',          align: 'center', sortable: false, width: '10%' },
  { title: '개최일자',                  key: 'meetDate',          align: 'center', sortable: false, width: '10%' },
  { title: '안건',                      key: 'agenda',            align: 'center', sortable: false, width: '20%' },
  { title: '의견',                      key: 'opinion',           align: 'center', sortable: false, width: '30%' },
  { title: '결과\n(승인/보고/수정/부결)', key: 'result',            align: 'center', sortable: false, width: '15%' },
  { title: '파일',                      key: 'file',              align: 'center', sortable: false, width: '10%' },
];
</script>

<style scoped lang="scss">
.agenda-table {
  height: 100%;

  :deep(.v-selection-control.v-selection-control--density-compact) {
    justify-content: center;
  }

  :deep(.v-data-table-header__content) {
    justify-content: center !important;
    width: 100%;
    white-space: pre-line !important;
    text-align: center;
    line-height: 1.3;
  }

  :deep(th) {
    padding: 8px 0 !important;
    background-color: #E3F2FD !important;
    font-weight: bold !important;
  }
}
</style>
