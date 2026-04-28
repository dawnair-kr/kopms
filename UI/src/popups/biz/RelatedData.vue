<template>
  <v-card>

    <v-row no-gutters>
      <v-col class="ma-2 d-flex align-center">
        <v-icon icon="mdi-circle-double" style="margin-top: 2px" color="primary"></v-icon>
        <h3 class="ml-1">관련자료</h3>
      </v-col>
    </v-row>
    <!-- 검색영역 시작 -->
    <v-card variant="outlined" class="ma-2 pa-1 flex-grow-0 bg-white"  style="border-color: #1867c0">
        <v-row no-gutters >
            <v-col cols="1" class="ma-1 d-flex align-center">
                <span class="font-weight-bold">
                    <v-icon icon="mdi-circle-small" color="orange" />사업명
                </span>
            </v-col>
            <v-col cols="5" class="pa-1" >
                <span class="font-weight-bold">
                    {{ bizTitle }}
                </span>
            </v-col>
        </v-row>
        <v-row no-gutters >
            <v-col cols="1" class="ma-1 d-flex align-center">
                <span class="font-weight-bold">
                    <v-icon icon="mdi-circle-small" color="orange" />1차 분류
                </span>
            </v-col>
            <v-col cols="4" class="d-flex align-center pa-1">
                <div class="d-flex align-center ga-1 w-100">
                    <v-select
                    v-model="searchParams.taskType"
                    @update:model-value="item => onCondTaskTypeChanged(item)"
                    :items="itemTaskType"
                    item-title="text"
                    item-value="value"
                    density="compact"
                    variant="outlined"
                    hide-details
                    style="max-width: 200px"
                    />
                </div>
            </v-col>
            <v-col cols="1" class="ma-1 d-flex align-center">
                <span class="font-weight-bold">
                    <v-icon icon="mdi-circle-small" color="orange" />2차 분류
                </span>
            </v-col>
            <v-col cols="4" class="d-flex align-center pa-1">
                <div class="d-flex align-center ga-1 w-100">
                    <v-select
                    v-model="searchParams.pTaskCode"
                    @update:model-value="item => onCondTaskCodeChanged(item)"
                    :items="itemTaskCode"
                    item-title="text"
                    item-value="value"
                    density="compact"
                    variant="outlined"
                    hide-details
                    style="width: 100%"
                    />
                </div>
            </v-col>
            <v-col class="d-flex justify-end pa-1">
                <v-btn variant="outlined" @click="getFile">
                    <template v-slot:prepend>
                        <v-icon icon="mdi-magnify" style="margin-top: 2px"></v-icon>
                    </template>
                    <span>검색</span>
                </v-btn>
            </v-col>
        </v-row>
        <v-row no-gutters >
            <v-col cols="1" class="ma-1 d-flex align-center">
                <span class="font-weight-bold">
                    <v-icon icon="mdi-circle-small" color="orange" />등록일
                </span>
            </v-col>
            <v-col cols="4" class="d-flex align-center pa-1">
                <v-menu v-model="startDateMenu" :close-on-content-click="false">
                    <template #activator="{ props: menuProps }">
                        <BrDateField
                        v-bind="menuProps"
                        v-model="searchParams.startDate"
                        @update:model-value="date => onStartDateChanged( date)"
                        variant="outlined"
                        density="compact"
                        hide-details
                        append-inner-icon="mdi-calendar"
                        class="br-date-field"
                        style="max-width: 150px"
                        />
                    </template>
                    <!--v-model="startDatePicker"-->
                    <v-date-picker
                        :model-value="searchParams.startDate ? new Date(searchParams.startDate) : null"
                        @update:model-value="date => onStartDateSelected(date)"
                        hide-header
                    />
                </v-menu>
                <span class="mx-2">~</span>
                <v-menu v-model="endDateMenu" :close-on-content-click="false">
                    <template #activator="{ props: menuProps }">
                        <BrDateField
                        v-bind="menuProps"
                        v-model="searchParams.endDate"
                        @update:model-value="date => onEndDateChanged(date)"
                        variant="outlined"
                        density="compact"
                        hide-details
                        append-inner-icon="mdi-calendar"
                        class="br-date-field"
                        style="max-width: 150px"
                        />
                    </template>
                    <!--v-model="endDatePicker"-->
                    <v-date-picker                        
                        :model-value="searchParams.endDate ? new Date(searchParams.endDate) : null"
                        @update:model-value="date => onEndDateSelected(date)"
                        hide-header
                    />
                </v-menu>
            </v-col>
            <v-col cols="2" class="ma-1 d-flex align-center">
                    <v-icon icon="mdi-circle-small" color="orange" />
                    <v-select
                        v-model="searchParams.searchType"
                        :items="itemType"
                        item-title="text"
                        item-value="value"
                        density="compact"
                        variant="outlined"
                        hide-details
                        style="width: 100%;"
                    />
            </v-col>
            <v-col cols="3" class="d-flex align-center pa-1">
                <v-text-field variant="outlined"
                    v-model="searchParams.searchText"
                    density="compact" hide-details style="width: 100%">
                </v-text-field>
            </v-col>
        </v-row>
    </v-card>
    <!-- 검색영역 종료 -->
    <!--ma-2 pa-1 flex-grow-0 bg-white-->
    <v-card variant="outlined" class="ma-2 d-flex flex-column"  style="border-color: #1867c0; min-height: 550px; max-height: 800px;">
        <!--v-card class="flex-grow-1 mx-auto" variant="outlined" style="border: 1px solid #1867c0"
            v-card class="mx-2 flex-grow-1" variant="outlined" style="border: 1px solid #1867c0" v-if="isViewHistory"
        -->
        <!--v-row no-gutters justify="center" align="center" -->
            <!--v-col class="mx-1"-->
                <!--fileList :enableUpload="isUploadMode" :files="upLoadDataInfo.files" 
                :pagePerCount="pagePerCount" @addFiles="addFiles"
                /---->
                <fileList ref="fileListRef" :enableUpload="isUploadMode" :files="upLoadDataInfo.files" 
                    v-model:currentPage="currentPage"  v-model:pagePerCount="pagePerCount"
                    @addFiles="addFiles" 
                />

            <!--/v-col-->
        <!--/v-row-->
    </v-card>
    <!--v-card-text>   
        <v-row no-gutters justify="center" align="center" class="mt-2">
            <v-col class="mx-1">
            <fileList :enableUpload="isUploadMode" :files="upLoadDataInfo.files" :pagePerCount="pagePerCountF" @addFiles="addFiles" />
            </v-col>
        </v-row>
        <v-spacer style="height: 10px;" />
        <v-divider class="border-opacity-50"></v-divider>
    </v-card-text--> 

    
    <!-- 파일업로드 정보 입력 시작 -->
    <v-card variant="outlined" class="ma-2 pa-1 flex-grow-0 bg-white"  style="border-color: #1867c0">
        <v-row no-gutters >
            <v-col cols="2" class="d-flex align-center pa-1">
                <div class="d-flex align-center ga-1 w-100">
                    <v-select
                    label="1차 분류"
                    v-model="upLoadDataInfo.taskType"
                    @update:model-value="item => onTaskTypeChanged(item)"
                    :items="saveItemTaskType"
                    item-title="text"
                    item-value="value"
                    density="compact"
                    variant="outlined"
                    hide-details
                    style="max-width: 200px"
                    />
                </div>
            </v-col>
            <v-col cols="3" class="d-flex align-center pa-1">
                <div class="d-flex align-center ga-1 w-100">
                    <v-select
                    label="2차 분류"
                    v-model="upLoadDataInfo.pTaskCode"
                    @update:model-value="item => onTaskCodeChanged(item)"
                    :items="saveItemTaskCode"
                    item-title="text"
                    item-value="value"
                    density="compact"
                    variant="outlined"
                    hide-details
                    style="width: 100%"
                    />
                </div>
            </v-col>
            <v-col cols="4" class="d-flex align-center pa-1">
                <v-text-field variant="outlined"
                    label="제목"
                    v-model="upLoadDataInfo.title"
                    density="compact" hide-details style="width: 100%">
                </v-text-field>
            </v-col>
            <v-col class="d-flex justify-end pa-1">
                <v-btn class="font-weight-bold mr-1" rounded="md" style="border: 1px solid #1867c0"
                        @click="uploadFile">
                    <template v-slot:prepend>
                        <v-icon icon="mdi-check" size="20" color="green" style="margin-top: 2px"></v-icon>
                    </template>
                    <span>저장</span>
                </v-btn>
                <v-btn class="font-weight-bold" rounded="md" style="border: 1px solid #1867c0" @click="closeHandler">
                    <template v-slot:prepend>
                    <v-icon icon="mdi-close-thick" color="red" size="20"></v-icon>
                    </template>
                    <span>닫기</span>
                </v-btn>
            </v-col>
        </v-row>
    </v-card> 

  </v-card>
</template>

<script setup>
import BrDateField from "@/components/BrDateField.jsx";
import fileList from '@/views/file/FileList.vue';
import lodash from 'lodash';
</script>

<script>


export default {
  props: {
    /*pagePerCount: {
      type: Number,
      default: 5,
    },*/
    workItem: {
      type: Object,
      default: () => {
        return {};
      },
    },
    params: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  components: {
    fileList,   // FileList 컴포넌트 등록 필수!
  },
  computed: {

  },
  mounted() {
    console.log(this.params);

    this.loadinitData();
  },
  methods: {
    addFiles(files) {
      console.log("addFiles >>>>>");
      this.upLoadDataInfo.files = files;

      // 2. 마지막 페이지 계산 및 이동
      // $nextTick을 사용하여 데이터가 반영된 후 계산하는 것이 안전.
      this.$nextTick(() => {
        const totalFiles = this.upLoadDataInfo.files.length;
        const rowsPerPage = this.pagePerCount; // 부모가 가지고 있는 페이지당 행 수
        
        if (totalFiles > 0) {
          // 마지막 페이지 번호 = 올림(전체 개수 / 페이지당 개수)
          const lastPage = Math.ceil(totalFiles / rowsPerPage);
          this.currentPage = lastPage;
        }
      });

    },

    
    // ======================
    // 파일 업로드
    // ======================
     // ======================
    // 파일 업로드
    // ======================
    uploadFile() {
      this.upLoadDataInfo.masterNo = this.params.masterNo;
      var masterNo = this.upLoadDataInfo.masterNo||'';
      var taskType = this.upLoadDataInfo.taskType||'';
      var pTaskCode = this.upLoadDataInfo.pTaskCode||'';
      var title = this.upLoadDataInfo.title||'';
      var taskCode = pTaskCode.substr(3); // taskType을 제거후 taskCode만 담아라
      this.upLoadDataInfo.taskCode = taskCode||'';
      /*
      if( taskType.length == 0 ) {
            this.$dialog.error({
                    title: "필수입력",
                    text: "1차 분류를 선택하세요."
                }).then(res => {
                });
            return;
      }
      if( pTaskCode.length == 0 ) {
            this.$dialog.error({
                    title: "필수입력",
                    text: "2차 분류를 선택하세요."
                }).then(res => {
                });
            return;
      }
      if( title.length == 0 ) {
            this.$dialog.error({
                    title: "필수입력",
                    text: "제목을 입력하세요."
                }).then(res => {
                });
            return;
      }*/
      const formData = new FormData();
      const files = [];
      const infos = [];

      // 자식 컴포넌트(FileList) 인스턴스 참조 (ref="fileListRef" 가정)
      const fileListComp = this.$refs.fileListRef;
      if (!fileListComp) {
        console.error("파일 리스트 컴포넌트를 찾을 수 없습니다.");
        return;
      }

      // 1. 상태가 "upload"인 파일들만 골라내기
      lodash.forEach(this.upLoadDataInfo.files, o => {
        if (o.status === "upload") {
          // 핵심 수정: o.file(유실될 수 있는 참조) 대신 
          // 자식 컴포넌트가 메모리에 꽉 잡고 있는 orgUploadFiles에서 실제 파일 객체 추출
          const actualFile = fileListComp.orgUploadFiles[o.fileKey];

          if (actualFile) {
            files.push(actualFile); // 실제 바이너리 데이터
            infos.push({
              ...o,
              file: null // 전송 데이터 경량화를 위해 file 객체는 null 처리
            });
          } else {
            console.warn(`파일 객체를 찾을 수 없습니다: ${o.fileName}. 페이지 이동 중 유실되었는지 확인이 필요합니다.`);
          }
        }
      });

      // 전송할 신규 파일이 없는 경우 예외 처리
      if (files.length === 0) {
        this.$dialog.message.info("업로드할 신규 파일이 없습니다.");
        return;
      }

      // 2.데이터 구조화
      this.upLoadDataInfo.uploadfiles = infos;    // 파일 정보 배열(infos)을 uploadfiles라는 키값에 할당

      // 3. FormData 조립
      // 3.1 실제 파일 데이터들을 FormData에 추가, 서버는 files라는 이름의 배열이나 리스트로 이 파일들을 받게 됨
      for (const file of files) {
        formData.append("files", file);
      }
      // 메타 정보(JSON) 추가
      // 3.2 정보 객체 추가 : 데이터베이스(DB)에 기록용 정보, 서버가 읽을 수 있도록 JSON 문자열로 변환
      formData.append("upLoadDataInfo", JSON.stringify(this.upLoadDataInfo));

      // 4. 전송 실행
      this.$br_trans([
        {
          url: "/kopms-api/file/upload",
          method: "post",
          data: formData,
          isWait: false,
          options: {
            headers: {
              'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: progressEvent => {
              //console.log(progressEvent);
              this.progress =
                Math.ceil((progressEvent.loaded / progressEvent.total) * 100);
            }
          }
        }
      ], (url, code, msg, data) => {
        this.$log.debug(" upload - url : " , url , " :::: - code : " , code , " :::: - msg : " , msg);
        if (code == 0) {
          
          this.$dialog.message.success("업로드 완료 되었습니다.");
          
          // 업로드 성공 후 자식 컴포넌트의 메모리 저장소 비우기
          fileListComp.orgUploadFiles = {};

          // 서버에서 내려준 최신 파일 목록으로 교체
          this.upLoadDataInfo.files = data.fileList;
          if ( this.upLoadDataInfo.files.length > 0 ) {
            this.upLoadDataInfo.attachFileSeq = data.fileList[0].attachFileSeq;
          }

        } else {

          this.$dialog.error({
            title: "시스템 오류",
            text: data.detail
          }).then(res => {

          });

        }

      });


    },
    // ======================
    // 파일 목록 조회
    // ======================
    getFile() {
      // 로그인 사용자 정보 가져오기
      // 1. 메소드 시작 시점에 직접 스토어를 변수에 담습니다.
      //const userStore = useUserStore();
      // 2. 이제 안전하게 접근 (Optional Chaining 활용)
      // this.$log.debug("FileList.vue :: 삭제 시도 사용자 ~~~", userStore.memberInfo);
      // const memberName = userStore.memberInfo?.name;
      // this.$log.debug("FileList.vue :: 삭제 시도 사용자 ~~~", memberName);
        
      console.log(this.upLoadDataInfo.files)
      
      var pTaskCode = this.searchParams.pTaskCode||'';
      var taskCode = pTaskCode.substr(3); // taskType을 제거후 taskCode만 담아라
      this.searchParams.taskCode = taskCode;
      const inputData = this.searchParams;

      this.$br_trans([
        {
          url: "/kopms-api/file/getFile",
          method: "post",
          data: inputData,
          //isWait: false,
        }

      ], (url, code, msg, data) => {
        ///this.$log.debug(" getFile - url : " , url , " :::: - code : " , code , " :::: - msg : " , msg);
        if( code == 0 ) {
            this.currentPage=1;
        } else {
            this.$dialog.error({
                    title: "오류",
                    text: "[파일목록]시스템관리자에게 문의 하세요."
                }).then(res => {
                });
        }
        this.upLoadDataInfo.files = data.fileList;

      });
    },

    //-------------------------------------------------
    formatDate: function(date) {
        if (!date) return "";
        const d = new Date(date);
        // ISO 방식(YYYY-MM-DD)으로 안전하게 변환
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },
    
    loadinitData: function() {

        const today = this.formatDate(new Date());
        const formDt = today.substr(0,4)+"-01-01";
        this.searchParams.startDate = formDt;
        this.searchParams.endDate = today;
        this.searchParams.masterNo=this.params.masterNo;     
        const taskType = this.params.taskType||'';
        const taskCode = this.params.taskCode||'';

        const inputData = this.searchParams;        
        this.$br_trans([
            {
            url: "/kopms-api/biz/getBizTaskComboData",
            method: "post",
            data: inputData,
            //isWait: false,
            }
        ], (url, code, msg, data) => {
            //console.log(" tranCodeGroupS - url : " + url + " :::: - code : " + code + " :::: - msg : " + msg);
            if( code == 0 ) {
                /*this.$dialog.message.success("저장 되었습니다.", { timeout: 1000 });*/

                this.itemTaskType = data.bizTaskTypeList;
                this.itemTaskCode = data.bizTaskCodeList;
                this.saveItemTaskType = JSON.parse( JSON.stringify(data.bizTaskTypeList));
                this.saveItemTaskCode = [];//JSON.parse( JSON.stringify(data.bizTaskCodeList));
                
                if( this.itemTaskType.length > 0 ) this.bizTitle = this.itemTaskType[0].bizTitle;
                this.itemTaskType.splice(0,0,{text:"전체" , value:"" , taskType:"" , taskCode:""});
                this.itemTaskCode.splice(0,0,{text:"전체" , value:"" , taskType:"" , taskCode:""});
                this.itemTaskCodeCopy = JSON.parse( JSON.stringify(this.itemTaskCode));

                if( taskType.length>0 ) {
                    this.searchParams.taskType=taskType;
                    this.upLoadDataInfo.taskType=taskType;
                } else {
                    this.searchParams.taskType="";
                }
                this.onTaskTypeChanged(taskType);
                
                if( taskCode.length>0 ) {
                    // id중복오류 발생으로 코드를 묶음, 조회시 쿼리에서 substr처리
                    this.searchParams.pTaskCode=taskType+taskCode;
                    this.searchParams.taskCode=taskCode;

                    this.upLoadDataInfo.pTaskCode=taskType+taskCode;
                    this.upLoadDataInfo.taskCode=taskCode;
                } else {
                    this.searchParams.pTaskCode="";
                    this.searchParams.taskCode="";
                }
                this.getFile();
                
            } else {
                this.$dialog.error({
                        title: "오류",
                        text: "시스템관리자에게 문의 하세요."
                    }).then(res => {
                    });
            }
        });
    },

    onCondTaskTypeChanged: function(taskType) {
        console.log("onCondTaskTypeChanged" , taskType);
        if( (taskType||'').length > 0 ) {
            var items = this.itemTaskCodeCopy.filter( (item) => (item.taskType==taskType || item.taskType==""));
            this.itemTaskCode = JSON.parse( JSON.stringify(items));
        } else {
            this.itemTaskCode = JSON.parse( JSON.stringify(this.itemTaskCodeCopy));
        }
        this.searchParams.pTaskCode="";
        this.searchParams.taskCode="";
    },
    onCondTaskCodeChanged: function(pTaskCode) {
        console.log("onCondTaskCodeChanged" , pTaskCode);
    },
    onTaskTypeChanged: function(taskType) {
        console.log("onTaskTypeChanged" , taskType);
        if( (taskType||'').length > 0 ) {
            var items = this.itemTaskCodeCopy.filter( (item) => item.taskType==taskType);
            this.saveItemTaskCode = JSON.parse( JSON.stringify(items));
        }
        this.upLoadDataInfo.pTaskCode="";
        this.upLoadDataInfo.taskCode="";
    },
    onTaskCodeChanged: function(pTaskCode) {
        console.log("onTaskCodeChanged" , pTaskCode);
    },
    onStartDateChanged: function( val) {
        console.log("onStartDateChanged" , val);
        if( !val ) {
            this.searchParams.startDate = null;
        } else {
            var dt = new Date(val);
            if( dt == "Invalid Date" ) {
                this.searchParams.startDate = null;

                this.$dialog.error({
                    title: "입력 오류",
                    text: "올바른 날짜가 아닙니다."
                }).then(res => {
                    this.searchParams.startDate= "";
                });
            } else {
                this.searchParams.startDate = this.formatDate(val);
            }
        }
    },
    onEndDateChanged: function( val) {
        console.log("onEndDateChanged" , val);
        if( !val ) {
            this.searchParams.endDate = null;
        } else {
            var dt = new Date(val);
            if( dt == "Invalid Date" ) {
                this.searchParams.endDate = null;

                this.$dialog.error({
                    title: "입력 오류",
                    text: "올바른 날짜가 아닙니다."
                }).then(res => {
                    this.searchParams.endDate= "";
                });
            } else {
                this.searchParams.endDate = this.formatDate(val);
            }
        }
    },
    onStartDateSelected: function(val) {
        if (val) {
            this.searchParams.startDate = this.formatDate(val);
        }
        this.startDateMenu = false;
    },
    onEndDateSelected: function( val) {
        if (val) {            
            this.searchParams.endDate = this.formatDate(val);
        }
        this.endDateMenu = false;
    },   
    closeHandler() {
      this.$emit("submit", null);
    },
  },
  data() {
    return {
        pagePerCount: 5,
        currentPage: 1,
        fileList: null,        
        isUploadMode: true,
        upLoadDataInfo: {
            job: "Biz",    // Biz는 고정(관련자료팝업에서는)   // Biz : 사업업무, Gen : 미확정 - 자료실, 게시판,.. 등등 구분 용도  
            attachFileSeq: "",
            masterNo: "",
            taskType: "",
            taskCode: "",
            pTaskCode: "",
            fileGubun:"R",    // A : 첨부, R : 관련파일
            title : "",
            files: [],
        },

        bizTitle: "",
        startDateMenu: false,
        endDateMenu: false,
        startDatePicker: false,
        endDatePicker: false,
        searchParams: {
            masterNo: "",
            taskType: "",
            taskCode: "", // 조회 파라미터용(조회시 pTaskCode에서 taskType은 제거후 taskCode만 날려라)
            pTaskCode: "", // 콤포넌트 매핑용
            startDate:"2026-01-01",
            endDate:"2026-01-01",
            searchText: "",
            searchType: "bizTitle",
            arrFileGubun: ['A','R'], // 파일구분(A : 첨부파일, R : 관련파일, D:자료실)
        },
        saveItemTaskType: [],
        saveItemTaskCode: [],
        itemTaskType: [
           /* { text: "전체", value: "" },
            { text: "사내절차", value: "109" },*/
        ],
        itemTaskCode: [
            /*{ text: "전체", value: "" },
            { text: "사업정보입수", value: "S01" },*/
        ],
        itemTaskCodeCopy: [],
        itemType: [
            { text: "제목", value: "bizTitle" },
            { text: "파일명", value: "bizFile" },
        ],
        selected: [],
        dataItems: []
    };
  },

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
:deep(.v-data-table__tr:last-child td) {
  border-bottom: thin solid rgba(0, 0, 0, 0.12);
}
</style>

<style lang="scss">
</style>