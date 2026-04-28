<template no-gutters>
  <v-container>

    <div class="section-header">
        <v-icon icon="mdi-play" size="small" color="blue" class="mr-1" />
        <span class="font-weight-bold">이사회 구성</span>
      </div>

      <v-data-table
        :headers="headers1"
        :items="data1"
        density="compact"
        hide-default-footer
        class="border-top-blue custom-table border mb-2"
      >
      </v-data-table>

    <div class="section-header">
        <v-icon icon="mdi-play" size="small" color="blue" class="mr-1" />
        <span class="font-weight-bold">파견(전출) 인력 관리</span>
      </div>

      <v-data-table
        :headers="headers2"
        :items="data2"
        density="compact"
        hide-default-footer
        class="border-top-blue custom-table border mb-2"
      >
      </v-data-table>

    <div class="section-header">
        <v-icon icon="mdi-play" size="small" color="blue" class="mr-1" />
        <span class="font-weight-bold">SPC 조직도, 연락처</span>
      </div>

      <v-sheet border class="mb-2">

        <v-row no-gutters class="d-flex align-center">
        
          <v-col
            cols="2" 
            class="bg-grey-lighten-4 pa-3 text-center border-e font-weight-bold d-flex align-center justify-center"
          >
            <span class="text-body-2">조직도</span>
          </v-col>

          <v-col>
            <div class="d-flex align-center">
              <v-icon icon="mdi-file-document" size="small" class="mr-2 ml-1" color="grey-darken-1" />
              <span class="text-body-2 ml-1">happy.hwp</span>
            </div>
          </v-col>

          <v-col
            cols="2" 
            class="bg-grey-lighten-4 pa-3 text-center border-e font-weight-bold d-flex align-center justify-center"
          >
            <span class="text-body-2">연락처</span>
          </v-col>

          <v-col>
            <div class="d-flex align-center">
              <v-icon icon="mdi-file-document" size="small" class="mr-2 ml-1" color="grey-darken-1" />
              <span class="text-body-2">연락처.hwp</span>
            </div>
          </v-col>

        </v-row>

      </v-sheet>

    <div class="section-header">
        <v-icon icon="mdi-play" size="small" color="blue" class="mr-1" />
        <span class="font-weight-bold">퇴직임원 채용현황(알리오 공시내용)</span>
      </div>

      <v-data-table
        :headers="headers3"
        :items="data3"
        density="compact"
        hide-default-footer
        class="border-top-blue custom-table border mb-2"
      >
      </v-data-table>

    <div class="d-flex justify-end ga-1">
      <v-btn variant="flat" density="compact" prepend-icon="mdi-pencil-outline" class="px-4">수정</v-btn>
      <v-btn variant="flat" density="compact" prepend-icon="mdi-file-excel" class="px-4">저장</v-btn>
    </div>

  </v-container>

</template>

<script setup>
import { ref } from 'vue';

// 헤더 설정
const headers1 = [
  { title: '직책', key: 'position', align: 'center', sortable: false },
  { title: '성명', key: 'name', align: 'center', sortable: false },
  { title: '소속', key: 'affiliation', align: 'center', sortable: false },
  { title: '임기', key: 'term', align: 'center', sortable: false },
];

const headers2 = [
  { title: '직책', key: 'position', align: 'center', sortable: false },
  { title: '성명', key: 'name', align: 'center', sortable: false },
  { title: '사진', key: 'pic', align: 'center', sortable: false },
  { title: '구분', key: 'sort', align: 'center', sortable: false },
  { title: '소속', key: 'affiliation', align: 'center', sortable: false },
  { title: '임기', key: 'term', align: 'center', sortable: false },
];

const headers3 = [
  { title: '퇴직임원 이름', key: 'rtNm', align: 'center', sortable: false },
  { title: '퇴직시 직위', key: 'rtPos', align: 'center', sortable: false },
  { title: '퇴직일자', key: 'rtDate', align: 'center', sortable: false },
  { title: '재취업회사명', key: 'reComNm', align: 'center', sortable: false },
  { title: '재취업일', key: 'reDate', align: 'center', sortable: false },
];

// 데이터 샘플
const data1 = [
  { position: '대표이사', name: '박창수', affiliation: '현대건설', term: '2015.11.09 ~ 2017.11.08' },
  { position: '이사', name: '장재훈', affiliation: '현대건설', term: '2015.11.09 ~ 2017.11.08' },
];

const data2 = [
  { position: '이사', name: '홍길동', pic: '', sort: '파견', affiliation: '현대건설', term: '2015.11.09 ~ 2017.11.08' },
];

const data3 = [
  { rtNm: '', rtPos: '', rtDate: '', reComNm: '', reDate: ''},
];
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
      cbitems1: [
        { text1: "발전량", value: '' },
        { text1: "이용율", value: '' },
        { text1: "판매대금", value: '' },
      ],
      cbitems2: [
        { text1: "판매량", value: '' },
        { text1: "이용율", value: '' },
        { text1: "판매대금", value: '' },
      ],
      yearList: [
        { text: "2025" },
        { text: "2024" }
      ],
    }
  },
}
</script>

<style scoped lang="scss">
/* 상단 파란색 굵은 선 */
.border-top-blue {
  border-top: 2px solid #2196F3 !important;
}

/* 테이블 헤더 배경색 및 폰트 설정 */
.custom-table :deep(thead th) {
  background-color: #E3F2FD !important; /* 연한 파란색 배경 */
  font-weight: bold !important;
  color: #1565C0 !important;
}

/* 행 높이 및 테두리 조절 */
.custom-table :deep(tbody td) {
  height: 35px !important;
  border-bottom: 1px solid #e0e0e0 !important;
  font-size: 0.875rem;
}

:deep(.v-field__input) {
  min-height: 28px;
  padding-top: 0;
  padding-bottom: 0;
  font-size: 13px;
}
</style>