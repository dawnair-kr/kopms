<template no-gutters>
  <v-container>
  
    <v-card class="pa-2 mb-2">
      <v-row no-gutters class="ga-2">

        <v-col v-for="(section, key) in materialManagement" :key="key">
          <div :class="['text-subtitle-1 mb-2 text-white pa-1 text-center', `bg-${section.color}`]">
            {{ section.title }}
          </div>

          <v-sheet border>

            <v-row 
              v-for="(item, idx) in section.items" 
              :key="idx" 
              no-gutters 
              class="border-b align-center"
            >
            
              <v-col 
                cols="4" 
                class="bg-grey-lighten-4 pa-3 text-center border-e font-weight-bold d-flex align-center justify-center"
                style="white-space: pre-line;"
              >
                {{ item.label }}
              </v-col>

              <v-col class="pa-3">
                <div 
                  v-for="(file, fIdx) in item.files" 
                  :key="fIdx" 
                  class="d-flex align-center"
                >
                  <v-icon icon="mdi-file-document" size="small" class="mr-2" color="grey-darken-1" />
                  <span class="text-body-2">{{ file }}</span>
                </div>
              </v-col>

            </v-row>

          </v-sheet>

        </v-col>

      </v-row>
    </v-card>

    <div class="section-header">
        <v-icon icon="mdi-play" size="small" color="blue" class="mr-1" />
        <span class="font-weight-bold">자료관리</span>
        <v-spacer />
        <div class="d-flex" style="width: 300px;">
          <v-select density="compact" hide-details :items="['제목', '작성자']" defaultValue="제목" class="mr-1"/>
          <v-text-field density="compact" hide-details append-inner-icon="mdi-magnify" />
        </div>
      </div>

      <v-data-table
        v-model="selected"
        :headers="listHeaders"
        :items="listData"
        show-select
        density="compact"
        hide-default-footer
        class="border-top-blue custom-table border mb-2"
      >
        <template v-slot:item.attachment="{ item }">
          <v-icon v-if="item.attachment" icon="mdi-file-document-outline" size="small" />
        </template>

        <template v-slot:bottom>
          <div class="text-center">
            <v-pagination density="compact" :length="6" total-visible="6"></v-pagination>
          </div>
        </template>
      </v-data-table>

      <div class="d-flex justify-end ga-1">
        <v-btn variant="flat" density="compact" prepend-icon="mdi-pencil-outline" class="px-4">등록</v-btn>
        <v-btn variant="flat" density="compact" prepend-icon="mdi-delete-outline" class="px-4">삭제</v-btn>
        <v-btn variant="flat" density="compact" prepend-icon="mdi-content-save-outline" class="px-4">저장</v-btn>
      </div>

  </v-container>

</template>

<script setup>
import { ref } from 'vue';

const materialManagement = ref({
  // 왼쪽 박스 데이터
  spc: {
    title: 'SPC자료관리',
    color: 'indigo-darken-2',
    items: [
      { label: '주주 협약서', files: ['현대E 주주간 협약서_090903'] },
      { label: '시운전 계약서', files: ['현대E 시운전 용역계약서_1107xx'] },
      { 
        label: 'O/M 계약서', 
        files: [
          '현대E O&M 용역 계약서_1107xx',
          '현대에너지 O&M계약서_2012년',
          '현대에너지 O&M계약서_2013년'
        ] 
      },
      { label: 'EPC 계약서', files: ['현대E 공사도급계약서'] },
      { label: '금융 약정서', files: ['현대E PF 관련서류_110331'] },
      { label: '회사 정관', files: ['정_관_131010'] },
    ]
  },
  // 오른쪽 박스 데이터
  namdong: {
    title: '남동발전 자료관리',
    color: 'blue-darken-2',
    items: [
      { label: '사업정보 입수/검토', files: ['현대E_사업정보입수보고'] },
      { label: '사업선정 회의', files: ['현대E_사업선정검토보고'] },
      { label: '사업타당성 조사\n(Due Diligence)', files: ['여수집단에너지_사업_사업성분석_보고서_0630_12'] },
      { label: '재무모델', files: ['현대E 재무모델'] },
      { label: '리스크 관리위원회', files: ['현대E_리스크관리위원회'] },
      { label: '이사회 개최', files: ['현대E 이사회 부의 안건'] },
    ]
  }
});

const listHeaders = ref([
  { title: '', key: 'data-table-select', align: 'center', width: '50', sortable: false },
  { title: '순서', key: 'id', align: 'center', width: '70', sortable: false },
  { title: '제목', key: 'title', align: 'left', sortable: false },
  { title: '첨부', key: 'attachment', align: 'center', width: '80', sortable: false },
  { title: '등록일', key: 'date', align: 'center', width: '120', sortable: false },
  { title: '작성자', key: 'author', align: 'center', width: '100', sortable: false },
  { title: '분류', key: 'category', align: 'center', width: '100', sortable: false },
]);

const listData = ref([
  { id: 1, title: '보임에너지 이사회해임금지 가처분신청 결과보고_140519', attachment: true, date: '2014-05-26', author: '이상열', category: '운영관리' },
  { id: 2, title: '증기공급(여수화력-현대에너지)계약 추진 기본계획(안)_130612', attachment: true, date: '2014-05-26', author: '이상열', category: '운영관리' },
  { id: 3, title: '현대에너지 경영현황 보고_131121', attachment: true, date: '2014-05-26', author: '이상열', category: '운영관리' },
  { id: 4, title: '현대에너지 경영정상화를 위한 관리체계 구축(안)_140107', attachment: true, date: '2014-05-26', author: '이상열', category: '운영관리' },
  { id: 5, title: '현대에너지 유상증자 신주 주식근질권 설정(안)_140320', attachment: true, date: '2014-05-26', author: '이상열', category: '운영관리' },
  { id: 6, title: '현대에너지 社名 변경(안)_140320', attachment: true, date: '2014-05-26', author: '이상열', category: '운영관리' },
  { id: 7, title: '보임에너지 주주협약 위반에 따른 후속조치 방안_140408', attachment: true, date: '2014-05-26', author: '이상열', category: '운영관리' },
  { id: 8, title: '현대에너지 비상임 감사 변경(안)_140418', attachment: true, date: '2014-05-26', author: '이상열', category: '운영관리' },
  { id: 9, title: '유상증자참여(안)_130326', attachment: true, date: '2014-05-26', author: '이상열', category: '운영관리' },
  { id: 10, title: '현대에너지(주) 파견이사 선임_120308', attachment: true, date: '2014-05-26', author: '이상열', category: '운영관리' },
]);

const selected = ref([]); // 체크박스 선택 데이터
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