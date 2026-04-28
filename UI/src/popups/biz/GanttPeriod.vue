<template no-gutters>

  <v-container class="main-page-wrapper">
    <v-row no-gutters>
        <v-col class="ma-2 d-flex align-center">
            <v-icon icon="mdi-circle-double" style="margin-top: 2px" color="primary"></v-icon>
            <h3 class="ml-1">TASK 일자입력</h3>
        </v-col>
    </v-row>
    <!-- 조회조건 영역 -->    
    <v-row no-gutters>
    
        <v-card-title class="d-flex align-center pb-1">
            <v-icon icon="mdi-chart-gantt" color="primary" class="mr-1"></v-icon>
                    <span class="text-subtitle-1 font-weight-bold">TASK명 :</span>
                    <span >&nbsp{{ taskName }}</span>
        </v-card-title>

    </v-row>
    <!-- 조회조건 영역 끝 -->

    <!-- 메인 컨텐츠 -->
    <v-card class="mx-2 flex-grow-1" variant="outlined" style="border: 1px solid #1867c0">

      <v-data-table
        :headers="headers"
        :items="itemTask"
        class="business-table"
        fixed-header
        hide-default-footer
        height="104px"
      >
        <template v-slot:headers>
          <tr>
            <th colspan="3" class="text-center border">계획</th>
            <th colspan="3" class="text-center border">실적</th>
          </tr>
          <tr>
            <th class="text-center border">시작일자</th>
            <th class="text-center border">소요기간</th>
            <th class="text-center border">종료일자</th>
            <th class="text-center border">시작일자</th>
            <th class="text-center border">소요기간</th>
            <th class="text-center border">종료일자</th>
          </tr>
        </template>
        <template v-slot:item="{ item }">
          <tr @click="selectRow(item)" :class="{ 'selected-row': selectedItem == item }" class="clickable-row">
            <td class="border text-center px-2">
                <v-menu v-model="startDateMenu" :close-on-content-click="false">
                    <template #activator="{ props: menuProps }">
                    <BrDateField
                        v-bind="menuProps"
                        v-model="item.plnStartDate"
                        @update:model-value="date => onStartDateChanged(item, date)"
                        variant="outlined"
                        density="compact"
                        hide-details
                        append-inner-icon="mdi-calendar"
                        class="br-date-field"
                        style="min-width: 150px"
                    />
                    </template>
                    <v-date-picker
                    :model-value="item.plnStartDate ? new Date(item.plnStartDate) : null"
                    @update:model-value="date => onStartDateSelected(item, date)"
                    color="primary"
                    hide-header
                    />
                </v-menu>
            </td>
            <td class="border text-center">{{ item.plnTakeDays }}</td>
            <td class="border text-center">{{ item.plnEndDate }}</td>
            <td class="border text-center">{{ item.prfStartDate }}</td>
            <td class="border text-center">{{ item.prfTakeDays }}</td>
            <td class="border text-center px-2">
                <v-menu v-model="endDateMenu" :close-on-content-click="false">
                    <template #activator="{ props: menuProps }">
                    <BrDateField
                        v-bind="menuProps"
                        v-model="item.prfEndDate"
                        @update:model-value="date => onEndDateChanged(item, date)"
                        variant="outlined"
                        density="compact"
                        hide-details
                        append-inner-icon="mdi-calendar"
                        class="br-date-field"
                        style="min-width: 150px"
                    />
                    </template>
                    <v-date-picker
                    :model-value="item.prfEndDate ? new Date(item.prfEndDate) : null"
                    @update:model-value="date => onEndDateSelected(item, date)"
                    color="primary"
                    hide-header
                    />
                </v-menu>
            </td>
          </tr>
        </template>

      </v-data-table>
    </v-card>
    <v-spacer v-if="userStore.userGubun=='V'?true:false">&nbsp;</v-spacer>
    <v-card class="mx-2 flex-grow-1" variant="outlined" style="border: 1px solid #1867c0" v-if="userStore.userGubun=='V'?true:false">
      <v-data-table
        :headers="headers"
        :items="itemTask"
        class="business-table"
        fixed-header
        hide-default-footer
        density="compact"
        height="72px"
      >
        <template v-slot:headers>
          <tr>
            <th class="text-center border" style="width: 150px;">평균소요시간</th>
            <th class="text-center border" style="width: 150px;">평균지연확률</th>
            <th class="text-center border" style="max-width: 100%;">Tip</th>
          </tr>
        </template>
        <template v-slot:item="{ item }">
          <tr @click="selectRow(item)" :class="{ 'selected-row': selectedItem == item }" class="clickable-row">
            <td class="border text-center px-2">
                <v-text-field
                    v-model="item.leadDays"
                    label=""
                    control-variant="hidden"
                    density="compact"
                    hide-details
                    variant="underlined"
                    class="centered-input mx-auto"
                    style="max-width: 100px;"
                    maxlength="10"
                    @input="item.leadDays = item.leadDays.replace(/[^0-9]/g, '')"
                ></v-text-field>
            </td>
            <td class="border text-center px-2">
                <v-text-field
                    v-model="item.delayRate"
                    label=""
                    control-variant="hidden"
                    density="compact"
                    hide-details
                    variant="underlined"
                    class="centered-input mx-auto"
                    style="max-width: 100px;"
                    maxlength="10"
                    @input="item.delayRate = item.delayRate.replace(/[^0-9]/g, '')"
                ></v-text-field>
            </td>
            <td class="border text-center px-2">
                <v-text-field
                    v-model="item.tipDesc"
                    label=""
                    density="compact"  
                    hide-details
                    variant="underlined"
                    class="centered-input mx-auto"
                    style="max-width: 100%;"                    
                    @input="e => handleInput(e, item)"
                ></v-text-field>
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-card>
    
    <!--변경이력 table-->
    <v-spacer v-if="isViewHistory">&nbsp;</v-spacer>
    <v-card class="mx-2 flex-grow-1" variant="outlined" style="border: 1px solid #1867c0" v-if="isViewHistory">
        <!-- height="250px" -->
        <v-data-table
            :headers="histHeaders"
            :items="bizTaskHistory"
            class="no-padding-table"
            fixed-header
            hide-details
            hide-default-footer
            density="compact"            
            :height="tableHeight"
            >
        </v-data-table>
    </v-card>
    <!-- 메인 컨텐츠 끝 -->

    <!-- 푸터 시작 -->
    <v-row no-gutters justify="end" class="ma-2 flex-grow-0">
      <v-col class="d-flex justify-end ga-1">
        
        <!-- 변겨이력 버튼 -->
        <v-btn style="border: 1px solid #1867c0" text="변경이력보기" @click="selectHistoryHandleClick">
          <template v-slot:prepend>
            <v-icon icon="mdi-check-bold"></v-icon>
          </template>
        </v-btn>

        <!-- 등록 버튼 -->
        <v-btn style="border: 1px solid #1867c0" text="저장" @click="saveHandle">
          <template v-slot:prepend>
            <v-icon icon="mdi-check-bold"></v-icon>
          </template>
        </v-btn>

        <!-- 저장 버튼 -->
        <v-btn style="border: 1px solid #1867c0" text="닫기" @click="closeHandler">
          <template v-slot:prepend>
            <v-icon icon="mdi-close-thick"  color="red"></v-icon>
          </template>
        </v-btn>

      </v-col>
    </v-row>
    <!-- 푸터 끝 -->
   </v-container>
</template>

<script setup>
import BrDateField from "@/components/BrDateField.jsx";
import { useUserStore } from '@/store/user.js';
</script>

<script>

export default {
  props: {
    paramTask: {
      type: [Object],
      default: {}
    }
  },

  components: {
    
  },

  watch: {
  },

  computed: {
    userStore() {
      return useUserStore().getUserInfo();
    },
  },


  mounted() {
    this.getBizTaskList();
    
  },
  methods: {
    // Oracle AL32UTF8 기준 바이트 계산 (한글 3바이트)
    getByteLength2: function(str) {
        if (!str) return 0;
        let byte = 0;
        for (let i = 0; i < str.length; i++) {
            const charCode = str.charCodeAt(i);
            byte += (charCode <= 0x7f) ? 1 : 3; // 영문/숫자 1, 한글 3
        }
        return byte;
    },
    getByteLength: function(str) {
        return new TextEncoder().encode(str).length;
    },
    handleByteLimit: function(e, item) {
        const value = e.target.value;
        let byte = 0;
        let cutIndex = 0;

        for (let i = 0; i < value.length; i++) {
            const charCode = value.charCodeAt(i);
            byte += (charCode <= 0x7f) ? 1 : 3;

            if (byte <= 2000) {
                cutIndex = i + 1; // 안전한 인덱스 기록
            } else {
                // 2000바이트 초과 시 이전까지의 문자열로 교체
                item.tipDesc = value.substring(0, cutIndex);
                break;
            }
        }
    },
    handleInput: function(e, item){
        const value = e.target.value;
        console.log("getByteLength="+this.getByteLength(value))
        if (this.getByteLength(value) > 2000) {
            this.$dialog.error({
                title: "입력 오류",
                text: "입력가능한 길이를 초과했습니다."
            }).then(res => {
                this.handleByteLimit(e,item);
            });
        }
    },
    selectHistoryHandleClick: function() {
        if( this.isViewHistory ) {
            this.isViewHistory = false;
        } else {
            this.isViewHistory = true;
            this.selectHistoryHandle();
        }
    },
    selectHistoryHandle: function() {
        const inputData = {masterNo:this.paramTask.masterNo,
            taskType:this.paramTask.taskType,
            taskCode:this.paramTask.taskCode
        };
        
        this.$br_trans([
            {
            url: "/kopms-api/biz/getBizTaskPeriodHist",
            method: "post",
            data: inputData,
            //isWait: false,
            }
        ], (url, code, msg, data) => {
            console.log(" tranCodeGroupS - url : " + url + " :::: - code : " + code + " :::: - msg : " + msg);
            if( data.bizTaskHistory.length == 0 ) {
                //this.isViewHistory = false;
                this.$dialog.error({
                    title: "변경이력 조회",
                    text: "변경이력이 없습니다."
                }).then(res => {
                    
                });
            } else {
                // console.log(data);
                this.bizTaskHistory = data.bizTaskHistory;  


            }

        });



        
    },
    saveHandle: function() {
        var plnStartDate = this.itemTask[0].plnStartDate||'';
        var plnEndDate = this.itemTask[0].plnEndDate||'';
        var plnTakeDays = this.itemTask[0].plnTakeDays||'';
        var prfStartDate = this.itemTask[0].prfStartDate||'';
        var prfEndDate = this.itemTask[0].prfEndDate||'';
        var prfTakeDays = this.itemTask[0].prfTakeDays||'';
        
        var userGubun = this.userStore.userGubun; // 관리자 v
        if( plnStartDate ) {
            /* 계획 시작일자가 있을때만 필수 체크 한다. */
            if( !plnStartDate ) {
                this.$dialog.error({
                    title: "필수입력",
                    text: "계획 시작일자를 입력하세요."
                }).then(res => {
                });
                return;
            }
            if( !plnEndDate ) {
                this.$dialog.error({
                    title: "필수입력",
                    text: "계획 종료일자를 입력하세요."
                }).then(res => {
                });
                return;
            }
            /*if( !prfStartDate ) {
                this.$dialog.error({
                    title: "필수입력",
                    text: "실적 시작일자를 입력하세요."
                }).then(res => {
                });
                return;
            }
            if( !prfEndDate ) {
                this.$dialog.error({
                    title: "필수입력",
                    text: "실적 종료일자를 입력하세요."
                }).then(res => {
                });
                return;
            }*/
            if( prfEndDate.length>0 && plnStartDate > prfEndDate ) {
                this.$dialog.error({
                    title: "필수입력",
                    text: "종료일은 시작일 이후 날짜를 입력해야 합니다."
                }).then(res => {
                    this.itemTask[0].prfEndDate="";
                    this.itemTask[0].prfTakeDays="";
                });
                return;
            }
        }

        this.setTaskItemPeriod();

    },  
    closeHandler: function() {
        var isBool = false;
        if( this.isSaved ) isBool = true;
        this.$emit("submit", isBool);
    },
    selectRow(item) {
      this.selectedItem = item;
      console.log('선택된 데이터:', item);
    },
    formatDate: function(date) {
        if (!date) return "";
        const d = new Date(date);
        // ISO 방식(YYYY-MM-DD)으로 안전하게 변환
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },
    addDate: function(date,  days) {
        var d = new Date(date);
        var ad = new Date(d.setDate(d.getDate() + days));
        return ad;
    },
    diffDays: function(fromDt, endDt) {
        const date1 = new Date(fromDt); //'2024-01-01');
        const date2 = new Date(endDt); //'2024-01-10');

        // 밀리초 차이 계산
        const diffInMs = (date2 - date1);
        // 일수로 변환 (1000ms * 60s * 60m * 24h)
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
       return diffInDays;
    },
    onStartDateChanged: function(item, val) {
        console.log("onStartDateChanged" , val);
        if( !val ) {
            item.plnEndDate = "";
            item.prfStartDate = "";
            item.prfEndDate = "";
            item.prfTakeDays = "";
        } else {
            var dt = new Date(val);
            if( dt == "Invalid Date" ) {
                item.plnStartDate = null;

                this.$dialog.error({
                    title: "입력 오류",
                    text: "올바른 날짜가 아닙니다."
                }).then(res => {
                    item.plnStartDate = "";
                    item.plnEndDate = "";
                    item.prfStartDate = "";
                    item.prfEndDate = "";
                    item.prfTakeDays = "";
                });

            } else {
                item.prfStartDate = val;
                item.prfEndDate = "";
                item.prfTakeDays = "";

                var days = item.plnTakeDays;
                if( days ) {
                    days = parseInt(days);
                    var addDt = this.formatDate( this.addDate(val , days));
                    item.plnEndDate = addDt;
                } 
            }
        }
    },
    onEndDateChanged: function(item, val) {
        console.log("onEndDateChanged" , val);
        if( !val ) {
            item.prfTakeDays = "";
        } else {
            var dt = new Date(val);
            if( dt == "Invalid Date" ) {
                item.prfEndDate = null;

                this.$dialog.error({
                    title: "입력 오류",
                    text: "올바른 날짜가 아닙니다."
                }).then(res => {
                    item.prfEndDate = "";
                    item.prfTakeDays = "";
                });
            } else {
                item.prfEndDate = this.formatDate(val);
                var diffDays = this.diffDays(item.prfStartDate , item.prfEndDate );
                item.prfTakeDays = diffDays;
            }
        }
    },
    // 화살표 함수(=>)는 자신의 this가 없어 this.formatDate() 호출 시 undefined 에러 발생 → 일반 함수로 선언
    onStartDateSelected: function(item, val) {
        if (val) {
            // 계획 처리
            var days = item.plnTakeDays;
            if( (days||'').length==0 ) {
                this.$dialog.error({
                    title: "필수입력",
                    text: "계획 소요기간 정보가 누락되었습니다."
                }).then(res => {
                });
                return;
            }

            item.plnStartDate = this.formatDate(val);            
            
            if( days ) {
                days = parseInt(days);
                var addDt = this.formatDate( this.addDate(val , days));
                item.plnEndDate = addDt;
            }            
            // 실적 처리
            item.prfStartDate = item.plnStartDate;
            item.prfEndDate = "";
            item.prfTakeDays = "";
        }
        this.startDateMenu = false;
    },
    onEndDateSelected: function(item, val) {
        if (val) {            
            if( (item.prfStartDate||'').length==0 ) {
                this.$dialog.error({
                    title: "필수입력",
                    text: "계획 시작일자를 먼저 입력하세요."
                }).then(res => {
                });
                return;
            }
            item.prfEndDate = this.formatDate(val);
            var diffDays = this.diffDays(item.prfStartDate , item.prfEndDate );
            item.prfTakeDays = diffDays;
        }
        this.endDateMenu = false;
    },
    setTaskItemPeriod : function() {
        const inputData = this.itemTask [0];
        this.isSaved = true;
        this.$br_trans([
            {
            url: "/kopms-api/biz/setTaskItemPeriod",
            method: "post",
            data: inputData,
            //isWait: false,
            }
        ], (url, code, msg, data) => {
            console.log(" tranCodeGroupS - url : " + url + " :::: - code : " + code + " :::: - msg : " + msg);
            if( code == 0 ) {
                this.$dialog.message.success("저장 되었습니다.", { timeout: 1000 });
                this.getBizTaskList();
                if(this.isViewHistory) this.selectHistoryHandle();
            } else {
                this.$dialog.error({
                        title: "저장 오류",
                        text: "시스템관리자에게 문의 하세요."
                    }).then(res => {
                    });
            }
        });
    
    },
    getBizTaskList : function() {
        const inputData = {masterNo:this.paramTask.masterNo,
            taskType:this.paramTask.taskType,
            taskCode:this.paramTask.taskCode
        };
        
        this.$br_trans([
            {
            url: "/kopms-api/biz/bizTaskList",
            method: "post",
            data: inputData,
            //isWait: false,
            }
        ], (url, code, msg, data) => {
            console.log(" tranCodeGroupS - url : " + url + " :::: - code : " + code + " :::: - msg : " + msg);
           // console.log(data);
            this.bizTaskData = data.bizTaskList;            
            this.itemTask = [this.bizTaskData[0] ];  
            console.log(this.itemTask);
            this.taskName = this.itemTask[0].taskName;
            

        });
    
    },
  },

  data() {
    return {
        tableHeight: "250px",
        bizTaskHistory: [],
        histHeaders: [
            { title: "작성자", key: "modUserNm", align: "center", sortable: false, width: "40px" },   
            { title: "버젼", key: "version", align: "center", sortable: false, width: "80px" }, 
            { title: "계획 시작일자", key: "plnStartDate", align: "center", sortable: false, width: "80px" },
            { title: "계획 소요기간", key: "plnTakeDays", align: "center", sortable: false, width: "60px" },
            { title: "계획 종료일자", key: "plnEndDate", align: "center", sortable: false, width: "80px" },
            
            { title: "실적 시작일자", key: "prfStartDate", align: "center", sortable: false, width: "80px" },
            { title: "실적 소요기간", key: "prfTakeDays", align: "center", sortable: false, width: "60px" },
            { title: "실적 종료일자", key: "prfEndDate", align: "center", sortable: false, width: "80px" },
            { title: "평균소요시간", key: "leadDays", align: "center", sortable: false, width: "60px" },
            { title: "평균지연확률", key: "delayRate", align: "center", sortable: false, width: "60px" },
            { title: "Tip", key: "tipDesc", align: "left", sortable: false, width: "130px" },
        ],
        isViewHistory: false,
        isSaved: false,
        endDateMenu: false,
        startDateMenu: false,
        selectedItem: {},
        taskName: "사업정보검토회의",
        headers: new Array(6).fill({}),
        bizTaskData:[],
        itemTask: [
                {
                    "taskCodeOrd": "A10",
                    "tipDesc": null,
                    "plnTakeDays": null,
                    "leadDays": null,
                    "delayRate": null,
                    "fileCnt": 0,
                    "taskTypeName": "사내절차",
                    "prfTakeDays": null,
                    "masterNo": "886",
                    "plnEndDate": null,
                    "prevTask": null,
                    "taskType": "109",
                    "prfEndDate": null,
                    "taskCode": "S10",
                    "takeDays": "10",
                    "taskName": "사업정보입수",
                    "plnStartDate": null,
                    "nextTask": null,
                    "taskStatus": "N",
                    "prfStartDate": null,
                    "id": "D0",
                    "start": "2026-01-01",
                    "end": "2026-01-01",
                    "text": "사업정보입수",
                    "complete": 0,
                    "box": {
                        "barColor": "blue",
                        "text": "0%",
                        "htmlRight": "사업정보입수"
                    },
                    "row": {
                        "marginTop": 5,
                        "marginBottom": 5
                    }
                }
            ],
    };
  },
};
</script>

<style scoped lang="scss">
.no-padding-table :deep(th),
.no-padding-table :deep(td) {
  padding: 0 4px !important; /* 완전히 0보다는 4px 정도 주는 것이 가독성에 좋습니다 */
  height: 32px !important;
  font-size: 10px !important; /* 원하는 크기로 조절 */
  vertical-align: center !important; 
  border: 1px solid #dee2e6 !important;
}
/* 정렬 아이콘이 있는 경우 글자가 밀리지 않게 조정 (선택사항) */
.no-padding-table :deep(.v-data-table-header__content span) {
  width: 100%;
  text-align: center;
  font-size: 10px !important; /* 원하는 크기로 조절 */
}


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
  height: 32px !important;
}

.business-table :deep(tbody td) {
  border: 1px solid #dee2e6 !important;
  font-size: 13px;
  min-height: 24px !important;
}

.border {
  border: 1px solid #dee2e6 !important;
}

/* 기존 border 스타일 유지 */
.border {
  border: 1px solid #dee2e6 !important;
}
</style>
