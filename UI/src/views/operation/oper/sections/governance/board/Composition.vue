<template>
  <v-container class="d-flex flex-column">

    <v-data-table
      :headers="boardHeaders"
      :items="boardData"
      density="compact"
      hide-default-footer
      class="genaral-table border rounded"
    >
      <template #item="{ item, index }">
        <tr>
          <td class="text-center border-e border-b">{{ item.position }}</td>
          <td class="text-center border-e border-b">{{ item.name }}</td>
          <td class="text-center border-e border-b">{{ item.affiliation }}</td>
          <td class="text-center border-e border-b">{{ item.term }}</td>
          <td v-if="index === 0" :rowspan="groupCount" class="text-center border-e border-b bg-white">
            <v-btn icon="mdi-file-document-outline" variant="text" density="compact" />
          </td>
          <td v-if="index === 0" :rowspan="groupCount" class="text-center border-b bg-white">
            <v-btn icon="mdi-file-document-outline" variant="text" density="compact" />
          </td>
        </tr>
      </template>
    </v-data-table>

    <div class="d-flex justify-end mt-2">
      <v-btn variant="flat" density="compact" prepend-icon="mdi-content-save-outline" text="저장" />
    </div>

  </v-container>
</template>

<script setup>
const boardHeaders = [
  { title: '직책',      key: 'position',    align: 'center', width: '15%', sortable: false },
  { title: '성명',      key: 'name',        align: 'center', width: '15%', sortable: false },
  { title: '소속',      key: 'affiliation', align: 'center', width: '20%', sortable: false },
  { title: '임기',      key: 'term',        align: 'center', width: '30%', sortable: false },
  { title: '등기부등본', key: 'doc1',        align: 'center', width: '10%', sortable: false },
  { title: '사업자등록증', key: 'doc2',      align: 'center', width: '10%', sortable: false },
];

const boardData = [
  { position: '사장',     name: '이병수', affiliation: '현대건설',   term: '2015.11.09 ~ 2017.11.08' },
  { position: '비상근이사', name: '임다두', affiliation: '남동발전',   term: '2015.11.09 ~ 2017.11.08' },
  { position: '비상근이사', name: '한문선', affiliation: '보임에너지', term: '2015.11.09 ~ 2017.11.08' },
  { position: '사내이사',  name: '최성용', affiliation: '정관에너지', term: '2016.03.30 ~ 2018.03.29' },
];

const groupCount = boardData.length;
</script>

<style scoped lang="scss">
:deep(.v-data-table-header__sort-icon) {
  display: none !important;
}
</style>
