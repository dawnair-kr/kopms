<template>
  
  <v-card class="mx-auto">
    <v-card-text class="my-2 pa-0">
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
                @update:modelValue="getMdsett1List">
              </v-pagination>
            </v-col>
          </v-row>
        </template>

      </v-data-table>
    </v-card-text>
  </v-card>
  
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

    this.getMdsett1List();
    
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
        { title: "사번", key: "wstSbn", minWidth: "", align: "center", sortable: false },
        { title: "신청자", key: "wstSbnName", minWidth: "", align: "center", sortable: false },
        { title: "신청권한", key: "wstNm", minWidth: "", align: "center", sortable: false },
        { title: "승인여부", key: "recYnNm", minWidth: "", align: "center", sortable: false },
        { title: "등록일", key: "regDate", minWidth: "", align: "center", sortable: false },
        
      ],
      dataItems: [
        // { maxCnt: 1,
            // no: 1,
            // recDate:null,
            // recYn: "N",
            // recYnNm: "미승인",
            // regDate: "2026-02-12 17:29:40",
            // regSbn: "DEV00006",
            // totalPage: 1,
            // wstDate: "2026-02-12 17:29:40",
            // wstNm: "O",
            // wstNum: 0,
            // wstNumSeq: 0,
            // wstSbn: "DEV00005",
            // wstSbnName: "외부평가위원"
        // },        
      ],
    };
  },

  methods: {
    
    getMdsett1List(pageNum) {
      // this.$log.debug("getMdsett1List - pageNum", pageNum ); 
      // Post
      if (pageNum == null) pageNum = 1;
      const inputData = {
        pageNum: pageNum,
        pagePerRow: this.pagePerRow,
      };

      this.loading = true;

      this.$br_trans([
        {
          url: "/kopms-api/mdsett1/getMdsett1ListP",
          method: "post",
          data: inputData,
          //isWait: false,
        }
      ], (url, code, msg, data) => {
        this.loading = false;
        // this.$log.debug("getMdsett1List - url : ", url, " code : ", code ,"msg : ", msg);  
        // this.$log.debug("data : ", data);  
        
        this.dataItems = data.mdsetLisP;
        if (this.dataItems.length > 0) {
          this.maxCnt = this.dataItems[0].maxCnt;
          this.totalPage = this.dataItems[0].totalPage;
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
      this.getMdsett1List(page);
    },
    
  },
};
</script>

