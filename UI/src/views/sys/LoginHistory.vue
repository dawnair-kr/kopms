<template no-gutters>
  
  <!-- <v-container fluid class="pa-0 d-flex flex-column con" style="height: calc(100% - 5px);"> -->
  <!-- <v-container fluid class="pa-0 d-flex flex-column con" style="height: calc(100% - 5%);"> -->
  <v-container fluid class="pa-0 d-flex flex-column contentFullHeight" >
  
    <!-- <v-data-table-server class="custom-table overflow-y-auto" fixed-header
      :headers="headers" :items="dataItems"
      item-value="empId" :items-length="maxCnt" :items-per-page="pagePerRow"
      :items-per-page-options="pagePerRows" 
     
      :loading="loading" show-current-page hover
      @update:options="loadItems">
      
      
      <template v-slot:loading>
        <v-skeleton-loader type="card"></v-skeleton-loader>
      </template>
    </v-data-table-server> -->

    <!-- 메인 컨텐츠 영역 -->
    <v-card class="mx-2 flex-grow-1 bg-white" variant="outlined">
      <v-data-table :headers="headers" :items="dataItems" class="custom-table overflow-y-auto" fixed-header>
        
        <template v-slot:no-data>
          <v-row no-gutters justify="center" align="center" class="my-2">
            <v-col align="center">
              <span class="text-subtitle-1 text-black">데이터가 존재하지 않습니다.</span>
            </v-col>
          </v-row>
        </template>
        
        <template v-slot:bottom>
          <v-divider></v-divider>
          <v-row no-gutters align="center" justify="center" class="mx-1 mt-0">
            <v-col align="center" class="pa-2">
              <v-pagination v-model="currentPage" :length="totalPage" rounded="circle" :total-visible="7" show-first-last-page
                size="small" first-icon="mdi-page-first" prev-icon="mdi-menu-left" next-icon="mdi-menu-right" last-icon="mdi-page-last"
                @update:modelValue="getLoginHistory">
              </v-pagination>
            </v-col>
          </v-row>
        </template>

      </v-data-table>
    </v-card>
    <!-- 메인 컨텐츠 영역 끝 -->    

  </v-container>

</template>

<script setup>
import { ref } from "vue";

</script>

<script>

export default {
  setup() {
  },
  props: {
  },
  components: {
    
  },
  created() {

  },
  beforeMount() {

  },
  watch: {
  },

  computed: {
 
  },

  mounted() {

    this.getLoginHistory();
    
  },

  data() {
    return {
      currentPage: 1,
      pagePerRows: [5, 15, 20, 30, 50, 100],
      pagePerRow: 20,
      loading: false,
      totalPage: 0,
      maxCnt: 0,  // v-data-table-server 용
      
      headers: [
        { title: "NO", key: "no", minWidth: "", align: "center", sortable: false },
        { title: "사번", key: "empId", minWidth: "", align: "center", sortable: false },
        { title: "성명", key: "empName", minWidth: "", align: "center", sortable: false },
        { title: "접속 일시", key: "loginDate", minWidth: "", align: "center", sortable: false },
        
      ],
      dataItems: [
        // { "no": 1,
        // "empId": "EMPN0003",
        // "empName": "홍경례",
        // "loginDate": "2026-01-30 09:55:41",
        // "maxCnt": 3,
        // "ipaddr": "127.0.0.1"
        // },
        
      ],
    };
  },

  methods: {
    
    getLoginHistory(pageNum) {
      this.$log.debug("getLoginHistory - pageNum", pageNum ); 
      // Post
      if (pageNum == null) pageNum = 1;
      const inputData = {
        pageNum: pageNum,
        pagePerRow: this.pagePerRow,
      };

      this.loading = true;

      this.$br_trans([
        {
          url: "/kopms-api/getLoginHistory",
          method: "post",
          data: inputData,
          //isWait: false,
        }
      ], (url, code, msg, data) => {
        this.loading = false;

        // this.$log.debug("getLoginHistory - url : ", url, " code : ", code ,"msg : ", msg);  
        // this.$log.debug("data : ", data);  
        
        this.dataItems = data.logInHis;
        
        if (this.dataItems.length > 0) {
          this.maxCnt = this.dataItems[0].maxCnt;
          this.totalPage = this.dataItems[0].totalPage;

          // this.$log.debug("dataItems : ", this.dataItems);  
          // this.$log.debug("dataItems - maxCnt: ", this.dataItems[0].maxCnt);  
          // this.$log.debug("dataItems - totalPage: ", this.dataItems[0].totalPage);  
        
        }

        
      });
    },

    // v-data-table-server 용
    loadItems({ page, itemsPerPage }) {

      if (typeof window != "object") {
        console.warn(`SSR STATE Call`);
        return;
      }
      //console.log("pagepagepagepagepage ::::: ", page, itemsPerPage);
      this.pagePerRow = itemsPerPage;
      this.getLoginHistory(page);
    },
    
  },
};
</script>

<style scoped>
.con{
  background-color: #F6F8FB;
  border-radius: 20px 0 0 0;
  margin-top: 8px;
}

:deep(.v-field__input) {
  min-height: 28px;
  padding-top: 0;
  padding-bottom: 0;
  font-size: 13px;
}

</style>
