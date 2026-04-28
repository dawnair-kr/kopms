<!-- 2026 01 14 hold -->
<template>
  <v-card class="mx-auto">

    <v-row no-gutters>
      <v-col class="ma-2 d-flex align-center">
        <v-icon icon="mdi-circle-double" style="margin-top: 2px" color="primary"></v-icon>
        <h3 class="ml-1">관련자료</h3>
      </v-col>
    </v-row>

    <v-divider></v-divider>

    <v-card class="ma-2" flat>
      <v-row no-gutters>
        <v-col cols="1" align="center">
          <div class="d-flex align-center justify-center">
            <v-icon icon="mdi-circle-small" color="orange"></v-icon>
            <span>제목</span>
          </div>
        </v-col>
        <v-col>
          <v-text-field variant="outlined" type="text" rounded="md" hide-details
            density="compact" readonly>
          </v-text-field>
        </v-col>
      </v-row>
      <v-row no-gutters>
        <v-col cols="1" align="center">
          <span>작성자</span>
        </v-col>
        <v-col cols="5">
          <span>개발1</span>
        </v-col>
        <v-col cols="1">
          <div class="d-flex align-center justify-center">
            <v-icon icon="mdi-circle-small" color="orange"></v-icon>
            <span>등록일</span>
          </div>
        </v-col>
        <v-col cols="5">
          <v-text-field append-inner-icon="mdi-calendar" variant="outlined" density="compact" hide-details style="max-width: 150px">
            <span>2025-12-23</span>
          </v-text-field>
        </v-col>
      </v-row>
      <v-row no-gutters>
        <v-col cols="1" align="center">
          <div class="d-flex align-center justify-center">
            <v-icon icon="mdi-circle-small" color="orange"></v-icon>
            <span>내용</span>
          </div>
        </v-col>
        <v-col>
          <v-textarea hide-details variant="outlined"/>
        </v-col>
      </v-row>
      <v-row no-gutters>
        <v-col cols="1" align="center">
          <span>첨부파일</span>
        </v-col>
        <v-col class="d-flex align-center">
          <v-text-field variant="outlined" density="compact" hide-details style="max-width: 300px"></v-text-field>
          <v-btn style="height: 28px; border: 1px solid #1867c0">
            <span>찾아보기</span>
          </v-btn>
          <v-btn style="height: 28px; border: 1px solid #1867c0">
            <span>추가</span>
            <template v-slot:prepend>
              <v-icon class="mr-n1" icon="mdi-plus-thick" color="red"/>
            </template>
          </v-btn>
          <v-btn style="height: 28px; border: 1px solid #1867c0">
            <span>삭제</span>
            <template v-slot:prepend>
              <v-icon class="mr-n1" icon="mdi-trash-can-outline" color="blue"/>
            </template>
          </v-btn>
        </v-col>
      </v-row>
    </v-card>

    <template v-slot:actions>
      <v-row no-gutters>
        <v-col class="pa-0" align="end">
          <v-btn class="font-weight-bold mr-1" rounded="md" style="border: 1px solid #1867c0" @click="">
            <template v-slot:prepend>
              <v-icon icon="mdi-check" size="20" color="green"></v-icon>
            </template>
            <span>저장</span>
          </v-btn>
          <v-btn class="font-weight-bold" rounded="md" style="border: 1px solid #1867c0" @click="closeHandler">
            <template v-slot:prepend>
              <v-icon icon="mdi-close-thick" color="red" size="20"></v-icon>
            </template>
            <span>목록</span>
          </v-btn>
        </v-col>
      </v-row>
    </template>
  </v-card>
</template>

<script setup>
</script>

<script>

export default {
  props: {
    workItem: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },

  data() {
    return {
      selected: [],
      currentPage: 1,
      pagePerRow: this.pagePerCount,
      loading: false,
      getPageCount: "",
      headers: [
        { title: "번호", key: "no", minWidth: "", align: "center", sortable: false },
        { title: "구분", key: "busClass", minWidth: "", align: "center", sortable: false },
        { title: "제목", key: "busTitle", minWidth: "", align: "center", sortable: false },
        { title: "등록일", key: "regDate", minWidth: "", align: "center", sortable: false },
        { title: "등록자", key: "regUser", minWidth: "", align: "center", sortable: false },
      ],
      dataItems: [
        { no: 1,
          busClass: "사업정보검토회의",
          busTitle: "사업정보 검토결과보고서.hwp",
          regDate: "2025-12-16",
          regUser: "서국인",
        },
        { no: 2,
          busClass: "사업정보검토회의",
          busTitle: "251215_사업정보검토회의 개최보고.hwp",
          regDate: "2025-12-15",
          regUser: "서국인",
        },
      ]
    };
  },
  components: {

  },
  computed: {

  },
  mounted() {
    
  },
  methods: {
    isValidCategory() {
      let category = this.category;
      let categoryNm = category.categoryNm;
      if (categoryNm == null || categoryNm == '') {
        this.$dialog.error({
          title: this.$t('expense.categoryError'),
          text: this.$t('expense.categoryValidText'),
          persistent: true,
        });
        return false;
      }
      return true;
    },
    // confirmHandler(categoryId) {
    //   if (!this.isValidCategory()) return;

    //   const inputData = {
    //     categoryId: categoryId,
    //     categoryNm: this.category.categoryNm,
    //     remark: this.category.remark
    //   };

    //   this.$br_trans([
    //     {
    //       url: "/expense/setCategoryCreate",
    //       method: "post",
    //       data: inputData,
    //     }
    //   ], (url, code, msg, data) => {

    //     if (code == 0) {
    //       // console.log(":::: ", data)
    //       this.category.categoryId = data.categoryId;
    //       // 여기서 저장한다.
    //       this.$emit("submit", this.category);
    //     }
    //     else {
    //       this.$dialog.error({
    //         title: this.$t('message.systemError'),
    //         text: data.detail,
    //         persistent: true,
    //       }).then(res => {

    //       });
    //     }
    //   });
    // },
    closeHandler() {
      this.$emit("submit", null);
    }
  },
  props: {
    workItem: {
      type: Object,
      default: {}
    },
  }
}
</script>

<style scoped>
:deep(.v-field__input) {
  min-height: 28px;
  padding-top: 0;
  padding-bottom: 0;
  font-size: 13px;
}

.custom-table :deep(.v-table__wrapper table thead tr th) {
  background-color: #bcd3fd !important;
}
</style>

<style lang="scss">
</style>