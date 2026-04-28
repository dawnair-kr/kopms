<template>
  <v-container>
    <v-row align="center" justify="center">
      <v-col cols="auto">
        <v-btn density="compact" @click="tranCodeGroupS" >Tr - Code Group : 단건 </v-btn>
      </v-col>
      <v-col cols="auto">
        <v-btn density="compact" @click="tranCodeGroupL" >Tr - Code Group : 다건 </v-btn>
      </v-col>
      <v-col cols="auto">
        <v-btn density="compact" @click="tranCode" >Tr - Tran Code : 단건</v-btn>
      </v-col>
      <v-col cols="auto">
        <v-btn density="default" @click="tranCodeL" >Tr - Tran Code : 다건</v-btn>
      </v-col>
      <v-col cols="auto">
        <v-btn density="default" @click="tranCodeP" >Tr - Tran Code : 페이징</v-btn>
      </v-col>
      <v-col cols="auto">
        <v-btn density="default" @click="tranMenus" >Tr - Tran Code : 메뉴정보</v-btn>
      </v-col>
      <v-col cols="auto">
        <v-btn density="default" @click="tranCodeM" >Tr - Tran Code : 코드 멀티 그룹</v-btn>
      </v-col>
    </v-row>

  </v-container>
</template>


<script setup>
  // import { useRoute } from 'vue-router';
//   import { useRoute } from 'vue-router';
// import { onMounted } from 'vue';
</script>

<script>

export default {
  
  props: {
    // dataComm: {
    //   type: Object,
    //   default: {}
    // },
  },

  components: {
  },

  watch: {
  },

  computed: {
  },

  mounted() {
    //this.tranCodeGroup();
    
    console.log("Component Mounted... 라우터를 통한 호출 시 파라메터 받기");
    //console.log("Query ID:", this.$route.query.id); // 이제 123이 찍힙니다!
    console.log("Query ID:", history.state.id); // 이제 123이 찍힙니다!
  
  },


  methods: {

    tranCodeGroupS() {
      console.log("tranCodeGroupS ...........");

      // // npm install core-js 적용 테스트
      // console.log('[TEST] at:', typeof [].at);
      // console.log('[TEST] result:', [1,2,3].at(-1));
      // return;


      // Post
      const inputData = {
        groupCode: '103',
        useYn: 'Y'
      };

      this.$br_trans([
        {
          url: "/kopms-api/code/groupCode",
          method: "post",
          data: inputData,
          //isWait: false,
        }
      ], (url, code, msg, data) => {
        console.log(" tranCodeGroupS - url : " + url + " :::: - code : " + code + " :::: - msg : " + msg);
        this.dataGroupCode = data; 
        console.log(this.dataGroupCode);
      });
    },

    tranCodeGroupL() {
      console.log("tranCodeGroupList ...........");
      // Post
      const inputData = {
        // groupCode: '103',
        //groupCode: ,
        useYn: 'Y'
      };

      this.$br_trans([
        {
          url: "/kopms-api/code/groupCodeList",
          method: "post",
          data: inputData,
          //isWait: false,
        }
      ], (url, code, msg, data) => {
        console.log(" tranCodeGroupL - url : " + url + " :::: - code : " + code + " :::: - msg : " + msg);
        this.dataGroupList = data.groupList; 
        // console.log(data);
        console.log(this.dataGroupList);
      });
    },

    tranCode() {
      //console.log("tranCode ...........");
      // this.$log.debug("디버그 메시지입니다.");
      this.$log.info("tranCode.........");
      // this.$log.error("에러가 발생했습니다!");
      // Post
      const inputData = {
        groupCode: '103',
        codeValue: '10',
        useYn: 'Y'
      };

      this.$br_trans([
        {
          url: "/kopms-api/code/code",
          method: "post",
          data: inputData,
          //isWait: false,
        }
      ], (url, code, msg, data) => {
        console.log(" tranCode - url : " + url + " :::: - code : " + code + " :::: - msg : " + msg);
        this.$log.debug(" tranCode - url : " + url + " :::: - code : " + code + " :::: - msg : " + msg);
        this.dataCode = data;
        // console.log(data);
        this.$log.debug(this.dataCode);
      });
    },

    tranCodeL() {
      console.log("tranCodeL ...........");
      // Post
      const inputData = {
        groupCode: '103',
        useYn: 'Y'
      };

      this.$br_trans([
        {
          url: "/kopms-api/code/codeList",
          method: "post",
          data: inputData,
          //isWait: false,
        }
      ], (url, code, msg, data) => {
        console.log(" tranCodeL - url : " + url + " :::: - code : " + code + " :::: - msg : " + msg);
        this.dataCodeList = data.codeList;
        // console.log(data);
        // console.log(this.dataCodeList);
        this.$log.debug(this.dataCodeList);
      });
    },

    tranCodeP() {
      console.log("tranCode Page...........");
      // Post
      const inputData = {
        groupCode: '103',
        useYn: 'Y',
        pageNum: 1,
        pagePerRow: 5,
      };

      this.$br_trans([
        {
          url: "/kopms-api/code/codePage",
          method: "post",
          data: inputData,
          //isWait: false,
        }
      ], (url, code, msg, data) => {
        this.$log.debug("tranCode - url : ", url, " code : ", code ,"msg : ", msg);  
        this.$log.debug("data : ", data);  
        this.dataCodePage = data.codePage;
        this.$log.debug("dataCodePage : ", this.dataCodePage);  
        this.$log.debug("dataCodePage - maxCnt: ", this.dataCodePage[0].maxCnt);  
        this.$log.debug("dataCodePage - totalPage: ", this.dataCodePage[0].totalPage);  
        
      });
    },

    tranMenus() {
      console.log("tranMenus ...........");
      // Post
      const inputData = {
        groupCode: '103',
        useYn: 'Y',
        pageNum: 1,
        pagePerRow: 5,
      };

      this.$br_trans([
        {
          url: "/kopms-api/getMenus",
          method: "post",
          data: inputData,
          //isWait: false,
        }
      ], (url, code, msg, data) => {
        console.log(" tranCodeL - url : " + url + " :::: - code : " + code + " :::: - msg : " + msg);
        this.dataMenus = data.menus;
        // console.log(data);
        console.log(this.dataMenus);
        
      });
    },
    
    tranCodeM() {
      console.log("tranCode Multi Group ...........");
      // Post
      const inputData = {
        comCodes: [
          { groupCode: "101", codeName: "bisType", useYn: 'Y' },
          { groupCode: "116", codeName: "userGubun", useYn: 'Y' },
        ]
      };

      this.$br_trans([
        {
          //url: "/kopms-api/comm/code/groupCodes",
          url: "/kopms-api/code/groupCodes",
          method: "post",
          data: inputData,
          //isWait: false,
        }
      ], (url, code, msg, data) => {
        this.$log.debug("tranCode Multi Group - url :::: ", url, " code :::: ", code ,"msg :::: ", msg);  
        this.$log.debug(data);
        this.$log.debug(data.bisType);
        this.$log.debug(data.userGubun);
        
      });
    },

  },

  data() {

    return {
      dataGroupCode: {},
      dataGroupList: [],
      dataCode: {},
      dataCodeList: [],
      dataCodePage: [],
      dataMenus: {} 

    }
  
  }

}
</script>