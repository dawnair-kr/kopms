<template>
    <v-card>
        <v-row no-gutters>
            <v-col class="ma-2 d-flex align-center">
                <v-icon icon="mdi-circle-double" style="margin-top: 2px" color="primary"></v-icon>
                <h2 class="ml-1">공정표</h2>
            </v-col>
        </v-row>

            <!-- 조회조건 영역 -->
            <v-card variant="outlined" class="ma-2 pa-2 flex-grow-0 bg-white"  
                        style="border-color: #1867c0; min-height: 46px;" 
                        density="compact">
                <!-- d-flex와 align-center로 라벨과 버튼들의 높이를 맞춥니다 -->
                <div class="d-flex align-center mr-2">
                    <!-- 2. 라벨 영역: 원하는 아이콘과 텍스트를 자유롭게 구성 -->
                    <div class="d-flex align-center mr-2">
                        <v-icon icon="mdi-circle-small" color="primary"></v-icon>
                        <span class="text-subtitle-1 font-weight-bold" style="line-height: 1;">유형 선택 :</span>
                    </div>
                    <v-radio-group v-model="selectedType" inline hide-details
                        @update:model-value="onRadioChange"
                        density="compact"
                        class="ma-0 pa-0"
                        > <!--label="주기선택"--> 
                        <v-radio
                            v-for="(item, i) in typeMap"
                            :key="i" :label="item.label" :value="item.value"
                            color="primary" class="mr-2" 
                            density="compact"
                        ></v-radio>                        
                    </v-radio-group>            
                </div>
            </v-card>

        <!-- 조회조건 영역 끝 -->

        <!--ma-2 pa-1 flex-grow-0 bg-white flex-column bg-white -->
        <v-card variant="outlined" 
                class="ma-2 pa-1 d-flex flex-column bg-white" 
                style="border-color: #1867c0; height: 800px;"
                >
            <v-card-title class="d-flex align-center pb-1">
                <v-icon icon="mdi-chart-gantt" color="primary" class="mr-2"></v-icon>
                {{ oprTitle }}
            </v-card-title>
            
                <DayPilotGantt id="schGantt" 
                            :config="config"  ref="ganttRef"/> 
            
           
   
        </v-card>

      <v-row no-gutters justify="end" class="ma-2 flex-grow-0">
        <v-col class="d-flex justify-end ga-1">
        <!-- 등록 버튼 -->
        <v-btn style="border: 1px solid #1867c0" text="엑셀" @click="exportToExcel">
          <template v-slot:prepend>
            <v-icon icon="mdi-microsoft-excel"></v-icon>
          </template>
        </v-btn>
            <v-btn class="font-weight-bold" rounded="md" style="border: 1px solid #1867c0" @click="closeHandler">
            <template v-slot:prepend>
              <v-icon icon="mdi-close-thick" color="red"></v-icon>
            </template>
            <span>닫기</span>
          </v-btn>
        </v-col>
      </v-row>

    </v-card>
</template>


<script setup>
import { useUserStore } from '@/store/user.js';
</script>

<script>
// vuejs key : c5znbpaexjdurntou5tnuypjd4 ( key로 구성된 install url trial->key로 교체 )
// official npm install https://npm.daypilot.org/daypilot-pro-vue/c5znbpaexjdurntou5tnuypjd4/2026.2.6907.tar.gz
// sanbox npm install https://npm.daypilot.org/daypilot-pro-vue/trial/2026.2.6900.tar.gz
import {DayPilot, DayPilotGantt} from 'daypilot-pro-vue'
import * as ExcelJS from 'exceljs';

import ganttPeriod from '@/popups/biz/GanttPeriod.vue'
import RelatedData from "@/popups/biz/RelatedData.vue"


export default {
  
  props: {
    masterNo: {
      type: [String],
      default: null
    }
  },

  components: {
    DayPilotGantt
  },

  watch: {
  },

  computed: {
    userStore() {
      return useUserStore().getUserInfo();
    },
  },

  mounted() {
    // Vue reactivity(Proxy)를 우회해 ExcelJS,  DayPilot control에 직접 주입
    this.$refs.ganttRef.control.exceljs = ExcelJS.default;

    // gantt chart icon click 함수
    var pthis = this;
    window.handleGanttIconClick = function( masterNo, taskType, taskCode) {
        //console.log("--------------handleGanttIconClick---------------------");
        pthis.onClickLink(masterNo, taskType, taskCode);
    };

    this.selectedType = "WW";
    this.getBizTaskList();
    
  },

  methods: {
    exportToExcel: function() {

        // 1. xlsx 형식으로 내보내기 객체 생성
        const spreadsheet = this.$refs.ganttRef.control.exportAs("xlsx", { // xlsx png
            //includeImages: true,    // 차트 이미지 포함 여부
            area: "full",           // 전체 데이터 포함 ("viewport", "range" 선택 가능)
        });

        // 2. 파일 다운로드 실행
        spreadsheet.download(this.oprTitle+ ".xlsx");
    },
    onClickLink: function(masterNo, taskType, taskCode) {
        
        const params = {
            masterNo: masterNo,
            taskType: taskType,
            taskCode: taskCode
        };

        this.$dialog.showAndWait(
            { RelatedData },
            {
            params,
            width: 1200,
            /*height: 500,*/
            },
        );
    },
    closeHandler() {
      this.$emit("submit", null);
    },
    onRadioChange: function(newVar) {
        console.log('선택된 값:', newVar);
        
        this.loadTasks(newVar);
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
    getStartOfWeek(date) {
        // 해당주의 첫날
        const d1 = new Date();
        const d = new Date(date);
        const day = d.getDay(); // 0: 일요일, 1: 월요일, ..., 6: 토요일
        const diff = d.getDate() - day; // 현재 날짜 - 요일 차이
        
        var strDt = new Date(d.setDate(diff)).getFullYear()
                    +'-'+(new Date(d.setDate(diff)).getMonth()+1).toString().padStart(2,"0")
                    +'-'+new Date(d.setDate(diff)).getDate().toString().padStart(2,"0");
        //console.log("---------------"+strDt);
        return strDt; //new Date(d.setDate(diff));
    },
    calculateWeeks(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        // 날짜 차이(밀리초)를 일(day)로 변환
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // 주차 계산 (7일 단위, 올림 처리)
        const weeks = Math.ceil(diffDays / 7);
        
        // 시작일 포함 여부에 따라 +1을 하거나, 
        // 혹은 0일 차이를 1주차로 정의하기 위해 조정이 필요할 수 있습니다.
        return weeks === 0 ? 1 : (weeks+5); // 0주차 방지
    },
    getBizTaskList : function() {
        //alert(this.masterNo);
        const inputData = {masterNo:this.masterNo }
        
        this.$br_trans([
            {
            url: "/kopms-api/biz/bizTaskList",
            method: "post",
            data: inputData,
            //isWait: false,
            }
        ], (url, code, msg, data) => {
            //console.log(" tranCodeGroupS - url : " + url + " :::: - code : " + code + " :::: - msg : " + msg);
            //console.log(data);
            this.bizTaskData = data.bizTaskList;

            if( this.bizTaskData.length == 0 ) {
                this.$dialog.error({
                    title: "데이타 오류",
                    text: "공정표 데이타가 존재하지 않습니다."
                }).then(res => {
                    this.$emit("submit", null);
                });
                return;
            }
            this.loadTasks(this.selectedType);

        });
    
    },
    loadTasks: function(opt) {

        var dataDay = [];
        for(var i=0; i<this.bizTaskData.length; i++) {

            //console.log(this.bizTaskData[i].plnStartDate , this.bizTaskData[i].plnEndDate);
            if( this.bizTaskData[i].plnStartDate )
            {    
                // 연결 가능한 task
                this.bizTaskData[i].islink = true;
            }    
            else
            {
                // 연결 불가능한 task
                this.bizTaskData[i].islink = false;
            }
            // 종료->시작 연결된 task 여부(false:연결되지 않음, true:이미 연결됨)
            this.bizTaskData[i].isStartLinked = false;

            var today = this.formatDate(new Date());
            var befday  = this.formatDate( this.addDate(today, -1));

            this.bizTaskData[i].id = 'D'+i;
            this.bizTaskData[i].text= this.bizTaskData[i].taskName; // task 오른쪽 텍스트 설정
            //this.bizTaskData[i].start = this.formatDate(this.bizTaskData[i].plnStartDate||(today) );
            //this.bizTaskData[i].end =  this.formatDate(this.bizTaskData[i].plnEndDate||(befday)); // 안보이게 하기 위해 -1처리
            if( (this.bizTaskData[i].plnStartDate||'').length > 0 ) {
                this.bizTaskData[i].start = this.formatDate(this.bizTaskData[i].plnStartDate);
                this.bizTaskData[i].end =  this.formatDate(this.bizTaskData[i].plnEndDate);
            } else {
                this.bizTaskData[i].plnStartDate = "";
                this.bizTaskData[i].plnEndDate = "";
                this.bizTaskData[i].start = "";
                this.bizTaskData[i].end = "";
            }
            
            //this.bizTaskData[i].text = this.bizTaskData[i].taskName;
            this.bizTaskData[i].complete = this.bizTaskData[i].complete||0;
            if( this.bizTaskData[i].islink == true )
            {
                this.bizTaskData[i].box = { backColor: "#A4C2F4", barColor: "#3C78D8", barBackColor:"#A4C2F4"}; // html:"" 처리시 complete%미노출
            }
            else    
            {
                this.bizTaskData[i].box = { backColor: "transparent", backColor: "transparent", barBackColor: "transparent", html:""}; // html:"" 처리시 %미노출
            }
            this.bizTaskData[i].row = {marginTop: 5, marginBottom: 5};
        }

        dataDay  = this.bizTaskData;
        //console.log(dataDay);

        switch(opt) {
        case "DD":
            this.oprTitle = "[ "+ dataDay[0].bizTitle + " ] 일간 공정표";
            var startDt = "";
            var weeks = 0;
            if( dataDay.length > 0 ) {
                var minVal = '';
                var maxVal = '';
                for(var i=0; i<dataDay.length; i++) {
                    var strDt = dataDay[i].start||"";
                    var endDt = dataDay[i].end||"";
                    if( strDt.length == 0 ) continue;
                    if( minVal.length==0 && strDt.length>0 ) minVal=strDt;
                    if( strDt<minVal) minVal=strDt;
                    if( maxVal<endDt) maxVal=endDt;
                }
                var isEmpty = false;
                var to_day = "";
                var bef_day = "";
                if( (maxVal||'').length==0 && (minVal||'').length==0 ) {
                    to_day = this.formatDate(new Date());
                    bef_day  = this.formatDate( this.addDate(to_day, -1));
                    isEmpty = true;
                } else {
                    to_day = this.formatDate(this.addDate(minVal, 1));
                    bef_day  = this.formatDate( minVal );         
                }
                if( isEmpty == true ) {
                    minVal = to_day;
                    maxVal = to_day;
                }
                for(var i=0; i<dataDay.length; i++) {
                    var strDt = dataDay[i].start||"";
                    var endDt = dataDay[i].end||"";
                    if( strDt.length == 0  ) dataDay[i].start = to_day;
                    if( endDt.length == 0  ) dataDay[i].end = bef_day;
                }
                
                /*var startDt = this.getStartOfWeek(dataDay[0].start);
                weeks = this.calculateWeeks(dataDay[0].start , dataDay[dataDay.length-1].end);*/
                var startDt = this.getStartOfWeek(minVal);
                weeks = this.calculateWeeks(minVal , maxVal);
            }
            var newConfig = JSON.parse( JSON.stringify( this.config));
            var aConfig = Object.assign(newConfig, {
                    cellWidth: 30,
                    days:weeks*7, // 64*7, // 마지막 1주 여유를 주기위해 추가
                    startDate: startDt, // 시작일을 대상월의 첫날로 지정, 간트 표현은 날짜기준임(셀라인이 맞지않는 이유), 앞뒤를 맞추기위해
                    scale: "Day", //Week Day
                    timeHeaders: [ // groupBy: Year, Month, Week, Day, Hour, Cell
                            { groupBy: "Month", format: "yyyy.MM" },
                            { groupBy: "Week" }, // onBeforeTimeHeaderRender에서 'n주차'로 변환
                            { groupBy: "Day", format: "d" }
                        ],
                    tasks : dataDay,
                    onTaskClick: (args) => {
                        console.log(args.task);
                    },
                    onBeforeTimeHeaderRender: (args) => {
                        if (args.header.level === 1) { // Week level
                            
                            const weekNum = args.header.start.weekNumber();
                            const start = new DayPilot.Date(startDt);
                            const current = args.header.start;
                            const duration  = new DayPilot.Duration(start, current);
                            const diffDays  = duration.totalDays(); 
                            
                            // 2. 일수를 7로 나누고 1을 더해 순차 주차 계산
                            const seqWeek = Math.floor(diffDays / 7) + 1;
                            args.header.html = `${seqWeek}주`; // ${weekNum}주차
                            args.header.text = `${seqWeek}주`;
                            
                        }
                        /*if (args.header.level === 2) { // Day level
                        const day = args.header.start.getDayOfWeek();
                        if (day === 0 || day === 6) args.header.backColor = "#FFF3E0"; // 주말 색상
                        }*/
                    },
                    onBeforeRowHeaderRender: (args) => {
                        /**
                         * args.task (DayPilot.Task) - underlying row data object
                         * args.row.html (string) - row header HTML
                         * args.row.backColor (string) - row header background color
                         * args.row.columns (array) - row header column data; see the column object structure below
                         * args.row.cssClass (string) - custom CSS class
                         * args.row.toolTip (string) - row header tooltip
                         * args.row.contextMenu (DayPilot.Menu object or the variable name) - row header context menu
                         * args.row.areas (array) - active areas; for object structure see DayPilot.Area properties
                         */
                        const rows = this.bizTaskData;
                        const currentIndex = args.row.index;
                        const row = rows[currentIndex];
                        
                        args.row.columns[0].html = `<span style="font-size: 11px;">${row.taskTypeName}</span>`; args.row.columns[0].text = row.taskTypeName;
                        if (currentIndex > 0) {
                            const prevRow = rows[currentIndex - 1];
                            
                            if (row.taskTypeName === prevRow.taskTypeName) {
                                args.row.columns[0].html = ""; args.row.columns[0].text = ""; // 텍스트 숨김                                
                                args.row.columns[0].cssClass = "merged-cell-style"; // 위쪽 테두리 제거 CSS 적용                                
                            }
                        }
                        
                        if( row.fileCnt > 0 ) {
                            const iconUrl = "/images/biz/icons_30.png";
                            const imgHtml = `<img 
                                                onclick="event.stopPropagation(); handleGanttIconClick('${row.masterNo}' , '${row.taskType}', '${row.taskCode}')" 
                                                src="${iconUrl}" 
                                                style="width:12px; height:13px; vertical-align:middle; margin-left:3px;  cursor:pointer;"
                                                >`;

                            // 기존 텍스트 앞에 이미지 추가
                            args.row.columns[1].html = `<span style="font-size: 11px; cursor:pointer;">${row.taskName}${imgHtml}</span>`; args.row.columns[1].text = row.taskName;
                        } else {
                            args.row.columns[1].html = `<span style="font-size: 11px; cursor:pointer;">${row.taskName}</span>`; args.row.columns[1].text = row.taskName;
                        }
                        for(var i=0; i<args.row.columns.length; i++) {
                            // 2차 분류제외
                            if(i>1) {
                                args.row.columns[i].horizontalAlignment = "center";
                                args.row.columns[i].html = `<span style="font-size: 11px;">${args.row.columns[i].value}</span>`; args.row.columns[i].text = args.row.columns[i].value;
                            }
                        }
                    },
                    onBeforeCornerRender: args => {
                        /**
                        * Parameters
                        * args.control (DayPilot.Gantt) - control instance.
                        * args.html (string) - custom HTML.
                        * args.areas (array) - custom active areas.
                        */
                        var html = `
                        <table style="border: 0px solid #c0c0c0; border-collapse: collapse; width: 655px; height: 100%;">
                        <tbody>
                            <tr>
                                <td colspan="2" style="
                                    border-right: 1px solid #c0c0c0; 
                                    padding: 0px; 
                                    width: 224px;
                                    font-weight: bold;
                                    font-family: var(--dp-gantt-font-family);
                                    font-size: var(--dp-gantt-font-size);
                                    text-align: center;">
                                    사업공정표
                                </td>                            
                                <td colspan="3" style="
                                    border-right: 1px solid #c0c0c0; 
                                    padding: 0px; 
                                    width: 215px;
                                    font-weight: bold;
                                    font-family: var(--dp-gantt-font-family);
                                    font-size: var(--dp-gantt-font-size);
                                    text-align: center;">
                                    계획
                                </td>
                                <td colspan="3" style="
                                    border: 0px solid #c0c0c0; 
                                    padding: 0px; 
                                    width: 215px;
                                    font-weight: bold;
                                    font-family: var(--dp-gantt-font-family);
                                    font-size: var(--dp-gantt-font-size);
                                    text-align: center;">
                                    실적
                                </td>
                            </tr>
                        </tbody>
                        </table>
                        `;
                        args.html = html;
                    },    
                    /*
                    // columns 스크롤처리
                    rowHeaderScrolling: true,     
                    rowHeaderWidth: 300,          
                    rowHeaderSplitterWidth: 5,*/

                    rowHeaderWidthAutoFit: false,
            });

            var arrLink = [];
            // 방법 1 순차 매핑
            for(var i=0; i<dataDay.length; i++)
            {
                if( (i+1) < dataDay.length)
                {
                    var islink1 = dataDay[i].islink;
                    var islink2 = dataDay[i+1].islink;

                    if( islink1==true && islink2==true ) {
                        arrLink.push({from: dataDay[i].id, 
                                        to: dataDay[i+1].id, 
                                        type: "FinishToStart",
                                        color: "#3c78d8",
                                        width: 1
                                    });
                    }
                }    
            }
            /*
            // 방법 2 종료일 기준 최소 시작일 매핑
            var getNextTaskId = function(data, currentId) {
                const currentIndex = data.findIndex(item => item.id === currentId);
                const currentItem = data[currentIndex];
                if (!currentItem || !currentItem.plnEndDate) return null;

                const baseEndDate = new Date(currentItem.plnEndDate);
                const futureTasks = data.slice(currentIndex + 1);

                const candidates = futureTasks.filter(item => {
                    return item.plnStartDate && new Date(item.plnStartDate) > baseEndDate;
                });

                if (candidates.length === 0) return null;
                // plnStartDate가 가장 빠른 항목 찾기
                const minTask = candidates.reduce((prev, curr) => {
                    return new Date(prev.plnStartDate) < new Date(curr.plnStartDate) ? prev : curr;
                });

                return minTask; //minTask.id;
            };
            dataDay.forEach(task => {
                const nextTask = getNextTaskId(dataDay, task.id);   
                console.log(nextTask);
                var nextId =   nextTask.id;
                var isStartLinked =  nextTask.isStartLinked;     
                if (nextId && isStartLinked==false) {
                    
                    nextTask.isStartLinked = true;
                    arrLink.push({
                        from: task.id, // 현재 태스크 (출발)
                        to: nextId,    // 찾은 최소값 태스크 (도착)
                        type: "FinishToStart", // 종료 후 시작 타입
                        color: "#3c78d8",      // 선 색상
                        width: 1               // 선 굵기
                    });
                }
            });*/
            
            //this.$refs.ganttRef.control.links.list = arrLink;
            //this.$refs.ganttRef.control.update();
            this.$refs.ganttRef.control.update({
                ...aConfig,
                // tasks: dataDay,      // 태스크 데이터  , assign config에 설정함
                links: arrLink,      // 생성한 링크 데이터 (data 아님!)
            });
            break;
        case "WW":
            this.oprTitle = "[ "+ dataDay[0].bizTitle + " ] 주간 공정표";
            var startDt = "";
            var weeks = 0;
            if( dataDay.length > 0 ) {
                var minVal = '';
                var maxVal = '';
                for(var i=0; i<dataDay.length; i++) {
                    var strDt = dataDay[i].start||"";
                    var endDt = dataDay[i].end||"";
                    if( strDt.length == 0 ) continue;
                    if( minVal.length==0 && strDt.length>0 ) minVal=strDt;
                    if( strDt<minVal) minVal=strDt;
                    if( maxVal<endDt) maxVal=endDt;
                }
                var isEmpty = false;
                var to_day = "";
                var bef_day = "";
                if( (maxVal||'').length==0 && (minVal||'').length==0 ) {
                    to_day = this.formatDate(new Date());
                    bef_day  = this.formatDate( this.addDate(to_day, -1));
                    isEmpty = true;
                } else {
                    to_day = this.formatDate(this.addDate(minVal, 1));
                    bef_day  = this.formatDate( minVal );         
                }
                if( isEmpty == true ) {
                    minVal = to_day;
                    maxVal = to_day;
                }
                for(var i=0; i<dataDay.length; i++) {
                    var strDt = dataDay[i].start||"";
                    var endDt = dataDay[i].end||"";
                    if( strDt.length == 0  ) dataDay[i].start = to_day;
                    if( endDt.length == 0  ) dataDay[i].end = bef_day;
                }

                /*var startDt = this.getStartOfWeek(dataDay[0].start);
                weeks = this.calculateWeeks(dataDay[0].start , dataDay[dataDay.length-1].end);*/
                var startDt = this.getStartOfWeek(minVal);
                weeks = this.calculateWeeks(minVal , maxVal);
            }

            var newConfig = JSON.parse( JSON.stringify( this.config));
            var aConfig = Object.assign(newConfig, {
                    cellWidth: 50,
                    days:weeks*7, // 마지막 1주 여유를 주기위해 추가
                    startDate: startDt, // 시작일을 대상월의 첫날로 지정, 간트 표현은 날짜기준임(셀라인이 맞지않는 이유), 앞뒤를 맞추기위해
                    scale: "Week", //Week Day
                    timeHeaders: [ // groupBy: Year, Month, Week, Day, Hour, Cell
                            { groupBy: "Month", format: "yyyy.MM" },
                            { groupBy: "Week" }, // onBeforeTimeHeaderRender에서 'n주차'로 변환
                            //{ groupBy: "Day", format: "d" }
                        ],
                    tasks : dataDay,
                    onBeforeTimeHeaderRender: (args) => {
                        if (args.header.level === 1) { // Week level
                            
                            const weekNum = args.header.start.weekNumber();
                            const start = new DayPilot.Date(startDt);
                            const current = args.header.start;
                            const duration  = new DayPilot.Duration(start, current);
                            const diffDays  = duration.totalDays(); 
                            
                            // 2. 일수를 7로 나누고 1을 더해 순차 주차 계산
                            const seqWeek = Math.floor(diffDays / 7) + 1;
                            args.header.html = `${seqWeek}주`; // ${weekNum}주차
                            args.header.text = `${seqWeek}주`;
                            
                        }
                        /*if (args.header.level === 2) { // Day level
                        const day = args.header.start.getDayOfWeek();
                        if (day === 0 || day === 6) args.header.backColor = "#FFF3E0"; // 주말 색상
                        }*/
                    },
                    onBeforeTaskRender: (args) => {
                        // args.data.box.html = args.data.text;
                        // console.log("args.data.text="+args.data.text);
                    },
                    onBeforeRowHeaderRender: (args) => {
                        /**
                         * args.task (DayPilot.Task) - underlying row data object
                         * args.row.html (string) - row header HTML
                         * args.row.backColor (string) - row header background color
                         * args.row.columns (array) - row header column data; see the column object structure below
                         * args.row.cssClass (string) - custom CSS class
                         * args.row.toolTip (string) - row header tooltip
                         * args.row.contextMenu (DayPilot.Menu object or the variable name) - row header context menu
                         * args.row.areas (array) - active areas; for object structure see DayPilot.Area properties
                         */
                        //console.log(args)
                        const rows = this.bizTaskData;
                        const currentIndex = args.row.index;
                        const row = rows[currentIndex];
                        
                        args.row.columns[0].html = `<span style="font-size: 11px;">${row.taskTypeName}</span>`; args.row.columns[0].text = row.taskTypeName;
                        if (currentIndex > 0) {
                            const prevRow = rows[currentIndex - 1];
                            
                            if (row.taskTypeName === prevRow.taskTypeName) {
                                args.row.columns[0].html = ""; args.row.columns[0].text = ""; // 텍스트 숨김                                
                                args.row.columns[0].cssClass = "merged-cell-style"; // 위쪽 테두리 제거 CSS 적용                                
                            }
                        }
                        if( row.fileCnt > 0 ) {
                            const iconUrl = "/images/biz/icons_30.png";
                            const imgHtml = `<img 
                                                onclick="event.stopPropagation(); handleGanttIconClick('${row.masterNo}' , '${row.taskType}', '${row.taskCode}')" 
                                                src="${iconUrl}" 
                                                style="width:12px; height:13px; vertical-align:middle; margin-left:3px; cursor:pointer;"
                                                >`;

                            // 기존 텍스트 앞에 이미지 추가
                            args.row.columns[1].html = `<span style="font-size: 11px; cursor:pointer;">${row.taskName}${imgHtml}</span>`; args.row.columns[1].text = row.taskName;
                        } else {
                            args.row.columns[1].html = `<span style="font-size: 11px; cursor:pointer;">${row.taskName}</span>`; args.row.columns[1].text = row.taskName;
                        }
                        for(var i=0; i<args.row.columns.length; i++) {
                            // 2차 분류제외
                            if(i>1) {
                                args.row.columns[i].horizontalAlignment = "center";
                                args.row.columns[i].html = `<span style="font-size: 11px;">${args.row.columns[i].value}</span>`; args.row.columns[i].text = args.row.columns[i].value;
                            }
                        }
                    },
                    onBeforeCornerRender: args => {
                        /**
                        * Parameters
                        * args.control (DayPilot.Gantt) - control instance.
                        * args.html (string) - custom HTML.
                        * args.areas (array) - custom active areas.
                        */
                        var html = `
                        <table style="border: 0px solid #c0c0c0; border-collapse: collapse; width: 655px; height: 100%;">
                        <tbody>
                            <tr>
                                <td colspan="2" style="
                                    border-right: 1px solid #c0c0c0; 
                                    padding: 0px; 
                                    width: 224px;
                                    font-weight: bold;
                                    font-family: var(--dp-gantt-font-family);
                                    font-size: var(--dp-gantt-font-size);
                                    text-align: center;">
                                    사업공정표
                                </td>                            
                                <td colspan="3" style="
                                    border-right: 1px solid #c0c0c0; 
                                    padding: 0px; 
                                    width: 215px;
                                    font-weight: bold;
                                    font-family: var(--dp-gantt-font-family);
                                    font-size: var(--dp-gantt-font-size);
                                    text-align: center;">
                                    계획
                                </td>
                                <td colspan="3" style="
                                    border: 0px solid #c0c0c0; 
                                    padding: 0px; 
                                    width: 215px;
                                    font-weight: bold;
                                    font-family: var(--dp-gantt-font-family);
                                    font-size: var(--dp-gantt-font-size);
                                    text-align: center;">
                                    실적
                                </td>
                            </tr>
                        </tbody>
                        </table>
                        `;
                        args.html = html;
                    },    
                    /*
                    // columns 스크롤처리
                    rowHeaderScrolling: true,     
                    rowHeaderWidth: 520,          
                    rowHeaderSplitterWidth: 5,*/

                    rowHeaderWidthAutoFit: false,
            });

            //console.log(dataDay);
            var arrLink = [];
            // 방법 1 순차 매핑
            for(var i=0; i<dataDay.length; i++)
            {
                if( (i+1) < dataDay.length)
                {
                    var islink1 = dataDay[i].islink;
                    var islink2 = dataDay[i+1].islink;

                    if( islink1==true && islink2==true ) {
                        arrLink.push({from: dataDay[i].id, 
                                        to: dataDay[i+1].id, 
                                        type: "FinishToStart",
                                        color: "#3c78d8",
                                        width: 1
                                    });
                    }
                }    
            }
            /*
            // 방법 2 종료일 기준 최소 시작일 매핑
            var getNextTaskId = function(data, currentId) {
                const currentIndex = data.findIndex(item => item.id === currentId);
                const currentItem = data[currentIndex];
                if (!currentItem || !currentItem.plnEndDate) return null;

                const baseEndDate = new Date(currentItem.plnEndDate);
                const futureTasks = data.slice(currentIndex + 1);

                const candidates = futureTasks.filter(item => {
                    return item.plnStartDate && new Date(item.plnStartDate) > baseEndDate;
                });

                if (candidates.length === 0) return null;
                // plnStartDate가 가장 빠른 항목 찾기
                const minTask = candidates.reduce((prev, curr) => {
                    return new Date(prev.plnStartDate) < new Date(curr.plnStartDate) ? prev : curr;
                });

                return minTask; //minTask.id;
            };
            dataDay.forEach(task => {
                const nextTask = getNextTaskId(dataDay, task.id);   
                //console.log(nextTask);
                if( nextTask ) {
                    var nextId =   nextTask.id;
                    var isStartLinked =  nextTask.isStartLinked; // 이미 연결되었는지 확인    
                    if ( isStartLinked==false ) {                        
                        nextTask.isStartLinked = true;
                        arrLink.push({
                            from: task.id, // 현재 태스크 (출발)
                            to: nextId,    // 찾은 최소값 태스크 (도착)
                            type: "FinishToStart", // 종료 후 시작 타입
                            color: "#3c78d8",      // 선 색상
                            width: 1               // 선 굵기
                        });
                    }
                }
            }); */
            console.log(aConfig);
            //this.$refs.ganttRef.control.links.list = arrLink;
            //this.$refs.ganttRef.control.update();
            this.$refs.ganttRef.control.update({
                ...aConfig,
                // tasks: dataDay,      // 태스크 데이터  , assign config에 설정함
                links: arrLink,      // 생성한 링크 데이터 (data 아님!)
            }); 
            break;
        case "MM":
            this.oprTitle = "[ "+ dataDay[0].bizTitle + " ] 월간 공정표";
            var startDt = "";
            var weeks = 0;
            if( dataDay.length > 0 ) {
                var minVal = '';
                var maxVal = '';
                for(var i=0; i<dataDay.length; i++) {
                    var strDt = dataDay[i].start||"";
                    var endDt = dataDay[i].end||"";
                    if( strDt.length == 0 ) continue;
                    if( minVal.length==0 && strDt.length>0 ) minVal=strDt;
                    if( strDt<minVal) minVal=strDt;
                    if( maxVal<endDt) maxVal=endDt;
                }
                var isEmpty = false;
                var to_day = "";
                var bef_day = "";
                if( (maxVal||'').length==0 && (minVal||'').length==0 ) {
                    to_day = this.formatDate(new Date());
                    bef_day  = this.formatDate( this.addDate(to_day, -1));
                    isEmpty = true;
                } else {
                    to_day = this.formatDate(this.addDate(minVal, 1));
                    bef_day  = this.formatDate( minVal );         
                }
                if( isEmpty == true ) {
                    minVal = to_day;
                    maxVal = to_day;
                }
                for(var i=0; i<dataDay.length; i++) {
                    var strDt = dataDay[i].start||"";
                    var endDt = dataDay[i].end||"";
                    if( strDt.length == 0  ) dataDay[i].start = to_day;
                    if( endDt.length == 0  ) dataDay[i].end = bef_day;
                }
                
                /*var startDt = this.getStartOfWeek(dataDay[0].start);
                weeks = this.calculateWeeks(dataDay[0].start , dataDay[dataDay.length-1].end);*/
                var startDt = this.getStartOfWeek(minVal);
                weeks = this.calculateWeeks(minVal , maxVal);
            }

            var newConfig = JSON.parse( JSON.stringify( this.config));
            var aConfig = Object.assign(newConfig, {
                    cellWidth: 50,
                    days:weeks*7, // 마지막 1주 여유를 주기위해 추가
                    startDate: startDt, // 시작일을 대상월의 첫날로 지정, 간트 표현은 날짜기준임(셀라인이 맞지않는 이유), 앞뒤를 맞추기위해
                    scale: "Month", //Week Day
                    timeHeaders: [ // groupBy: Year, Month, Week, Day, Hour, Cell
                            { groupBy: "Year", format: "yyyy" },
                            { groupBy: "Month", format: "M월"  },
                            //{ groupBy: "Week" }, // onBeforeTimeHeaderRender에서 'n주차'로 변환
                            //{ groupBy: "Day", format: "d" }
                        ],
                    tasks : dataDay,
                    onTaskClick: (args) => {
                        console.log(args.task);
                    },
                    onBeforeTimeHeaderRender: (args) => {
                        if (args.header.level === 1) { // Week level
                        }
                        /*if (args.header.level === 2) { // Day level
                        const day = args.header.start.getDayOfWeek();
                        if (day === 0 || day === 6) args.header.backColor = "#FFF3E0"; // 주말 색상
                        }*/
                    },
                    onBeforeRowHeaderRender: (args) => {
                        /**
                         * args.task (DayPilot.Task) - underlying row data object
                         * args.row.html (string) - row header HTML
                         * args.row.backColor (string) - row header background color
                         * args.row.columns (array) - row header column data; see the column object structure below
                         * args.row.cssClass (string) - custom CSS class
                         * args.row.toolTip (string) - row header tooltip
                         * args.row.contextMenu (DayPilot.Menu object or the variable name) - row header context menu
                         * args.row.areas (array) - active areas; for object structure see DayPilot.Area properties
                         */
                        const rows = this.bizTaskData;
                        const currentIndex = args.row.index;
                        const row = rows[currentIndex];
                        
                        args.row.columns[0].html = `<span style="font-size: 11px;">${row.taskTypeName}</span>`; args.row.columns[0].text = row.taskTypeName;
                        if (currentIndex > 0) {
                            const prevRow = rows[currentIndex - 1];
                            
                            if (row.taskTypeName === prevRow.taskTypeName) {
                                args.row.columns[0].html = ""; args.row.columns[0].text = ""; // 텍스트 숨김                                
                                args.row.columns[0].cssClass = "merged-cell-style"; // 위쪽 테두리 제거 CSS 적용                                
                            }
                        }
                        if( row.fileCnt > 0 ) {
                            const iconUrl = "/images/biz/icons_30.png";
                            const imgHtml = `<img 
                                                onclick="event.stopPropagation(); handleGanttIconClick('${row.masterNo}' , '${row.taskType}', '${row.taskCode}')" 
                                                src="${iconUrl}" 
                                                style="width:12px; height:13px; vertical-align:middle; margin-left:3px; cursor:pointer;"
                                                >`;

                            // 기존 텍스트 앞에 이미지 추가
                            args.row.columns[1].html = `<span style="font-size: 11px; cursor:pointer;">${row.taskName}${imgHtml}</span>`; args.row.columns[1].text = row.taskName;
                        } else {
                            args.row.columns[1].html = `<span style="font-size: 11px; cursor:pointer;">${row.taskName}</span>`; args.row.columns[1].text = row.taskName;
                        }
                        for(var i=0; i<args.row.columns.length; i++) {
                            // 2차 분류제외
                            if(i>1) {
                                args.row.columns[i].horizontalAlignment = "center";
                                args.row.columns[i].html = `<span style="font-size: 11px;">${args.row.columns[i].value}</span>`; args.row.columns[i].text = args.row.columns[i].value;
                            }
                        }
                    },
                    onBeforeCornerRender: args => {
                        /**
                        * Parameters
                        * args.control (DayPilot.Gantt) - control instance.
                        * args.html (string) - custom HTML.
                        * args.areas (array) - custom active areas.
                        */
                        var html = `
                        <table style="border: 0px solid #c0c0c0; border-collapse: collapse; width: 655px; height: 100%;">
                        <tbody>
                            <tr>
                                <td colspan="2" style="
                                    border-right: 1px solid #c0c0c0; 
                                    padding: 0px; 
                                    width: 224px;
                                    font-weight: bold;
                                    font-family: var(--dp-gantt-font-family);
                                    font-size: var(--dp-gantt-font-size);
                                    text-align: center;">
                                    사업공정표
                                </td>                            
                                <td colspan="3" style="
                                    border-right: 1px solid #c0c0c0; 
                                    padding: 0px; 
                                    width: 215px;
                                    font-weight: bold;
                                    font-family: var(--dp-gantt-font-family);
                                    font-size: var(--dp-gantt-font-size);
                                    text-align: center;">
                                    계획
                                </td>
                                <td colspan="3" style="
                                    border: 0px solid #c0c0c0; 
                                    padding: 0px; 
                                    width: 215px;
                                    font-weight: bold;
                                    font-family: var(--dp-gantt-font-family);
                                    font-size: var(--dp-gantt-font-size);
                                    text-align: center;">
                                    실적
                                </td>
                            </tr>
                        </tbody>
                        </table>
                        `;
                        args.html = html;
                    },    
                    /*
                    // columns 스크롤처리
                    rowHeaderScrolling: true,     
                    rowHeaderWidth: 300,          
                    rowHeaderSplitterWidth: 5,*/

                    rowHeaderWidthAutoFit: false,
            });

            var arrLink = [];
            // 방법 1 순차 매핑
            for(var i=0; i<dataDay.length; i++)
            {
                if( (i+1) < dataDay.length)
                {
                    var islink1 = dataDay[i].islink;
                    var islink2 = dataDay[i+1].islink;

                    if( islink1==true && islink2==true ) {
                        arrLink.push({from: dataDay[i].id, 
                                        to: dataDay[i+1].id, 
                                        type: "FinishToStart",
                                        color: "#3c78d8",
                                        width: 1
                                    });
                    }
                }    
            }
            /*
            // 방법 2 종료일 기준 최소 시작일 매핑
            var getNextTaskId = function(data, currentId) {
                const currentIndex = data.findIndex(item => item.id === currentId);
                const currentItem = data[currentIndex];
                if (!currentItem || !currentItem.plnEndDate) return null;

                const baseEndDate = new Date(currentItem.plnEndDate);
                const futureTasks = data.slice(currentIndex + 1);

                const candidates = futureTasks.filter(item => {
                    return item.plnStartDate && new Date(item.plnStartDate) > baseEndDate;
                });

                if (candidates.length === 0) return null;
                // plnStartDate가 가장 빠른 항목 찾기
                const minTask = candidates.reduce((prev, curr) => {
                    return new Date(prev.plnStartDate) < new Date(curr.plnStartDate) ? prev : curr;
                });

                return minTask.id;
            };
            dataDay.forEach(task => {
                const nextId = getNextTaskId(dataDay, task.id);                
                if (nextId) {
                    arrLink.push({
                        from: task.id, // 현재 태스크 (출발)
                        to: nextId,    // 찾은 최소값 태스크 (도착)
                        type: "FinishToStart", // 종료 후 시작 타입
                        color: "#3c78d8",      // 선 색상
                        width: 1               // 선 굵기
                    });
                }
            });*/

            //this.$refs.ganttRef.control.links.list = arrLink;
            //this.$refs.ganttRef.control.update();
            this.$refs.ganttRef.control.update({
                ...aConfig,
                // tasks: dataDay,      // 태스크 데이터  , assign config에 설정함
                links: arrLink,      // 생성한 링크 데이터 (data 아님!)
            });
            break;
        case "YY":
            this.oprTitle = "[ "+ dataDay[0].bizTitle + " ] 년간 공정표";
            var startDt = "";
            var weeks = 0;
            if( dataDay.length > 0 ) {
                var minVal = '';
                var maxVal = '';
                for(var i=0; i<dataDay.length; i++) {
                    var strDt = dataDay[i].start||"";
                    var endDt = dataDay[i].end||"";
                    if( strDt.length == 0 ) continue;
                    if( minVal.length==0 && strDt.length>0 ) minVal=strDt;
                    if( strDt<minVal) minVal=strDt;
                    if( maxVal<endDt) maxVal=endDt;
                }
                var isEmpty = false;
                var to_day = "";
                var bef_day = "";
                if( (maxVal||'').length==0 && (minVal||'').length==0 ) {
                    to_day = this.formatDate(new Date());
                    bef_day  = this.formatDate( this.addDate(to_day, -1));
                    isEmpty = true;
                } else {
                    to_day = this.formatDate(this.addDate(minVal, 1));
                    bef_day  = this.formatDate( minVal );         
                }
                if( isEmpty == true ) {
                    minVal = to_day;
                    maxVal = to_day;
                }
                for(var i=0; i<dataDay.length; i++) {
                    var strDt = dataDay[i].start||"";
                    var endDt = dataDay[i].end||"";
                    if( strDt.length == 0  ) dataDay[i].start = to_day;
                    if( endDt.length == 0  ) dataDay[i].end = bef_day;
                }
                
                /*var startDt = this.getStartOfWeek(dataDay[0].start);
                weeks = this.calculateWeeks(dataDay[0].start , dataDay[dataDay.length-1].end);*/
                var startDt = this.getStartOfWeek(minVal);
                weeks = this.calculateWeeks(minVal , maxVal);
            }
            
            var newConfig = JSON.parse( JSON.stringify( this.config));
            var aConfig = Object.assign(newConfig, {
                    cellWidth: 100,
                    days:weeks*7, // 마지막 1주 여유를 주기위해 추가
                    startDate: startDt, // 시작일을 대상월의 첫날로 지정, 간트 표현은 날짜기준임(셀라인이 맞지않는 이유), 앞뒤를 맞추기위해
                    scale: "Year", //Week Day
                    timeHeaders: [ // groupBy: Year, Month, Week, Day, Hour, Cell
                            { groupBy: "Year", format: "yyyy" },
                            { groupBy: "Year", format: " " }
                        ],
                    tasks : dataDay,
                    onBeforeTimeHeaderRender: (args) => {
                        if (args.header.level === 0) {
                            args.header.cssClass = "merged-header-top";
                        }
                        if (args.header.level === 1) { // Week level
                            args.header.cssClass = "merged-header-bottom";
                        }
                        /*if (args.header.level === 2) { // Day level
                        const day = args.header.start.getDayOfWeek();
                        if (day === 0 || day === 6) args.header.backColor = "#FFF3E0"; // 주말 색상
                        }*/
                    },
                    onBeforeRowHeaderRender: (args) => {
                        /**
                         * args.task (DayPilot.Task) - underlying row data object
                         * args.row.html (string) - row header HTML
                         * args.row.backColor (string) - row header background color
                         * args.row.columns (array) - row header column data; see the column object structure below
                         * args.row.cssClass (string) - custom CSS class
                         * args.row.toolTip (string) - row header tooltip
                         * args.row.contextMenu (DayPilot.Menu object or the variable name) - row header context menu
                         * args.row.areas (array) - active areas; for object structure see DayPilot.Area properties
                         */
                        const rows = this.bizTaskData;
                        const currentIndex = args.row.index;
                        const row = rows[currentIndex];
                        
                        args.row.columns[0].html = `<span style="font-size: 11px;">${row.taskTypeName}</span>`; args.row.columns[0].text = row.taskTypeName;
                        if (currentIndex > 0) {
                            const prevRow = rows[currentIndex - 1];
                            
                            if (row.taskTypeName === prevRow.taskTypeName) {
                                args.row.columns[0].html = ""; args.row.columns[0].text = ""; // 텍스트 숨김                                
                                args.row.columns[0].cssClass = "merged-cell-style"; // 위쪽 테두리 제거 CSS 적용        
                            }
                        }
                        if( row.fileCnt > 0 ) {
                            const iconUrl = "/images/biz/icons_30.png";
                            const imgHtml = `<img 
                                                onclick="event.stopPropagation(); handleGanttIconClick('${row.masterNo}' , '${row.taskType}', '${row.taskCode}')" 
                                                src="${iconUrl}" 
                                                style="width:12px; height:13px; vertical-align:middle; margin-left:3px; cursor:pointer;"
                                                >`;

                            // 기존 텍스트 앞에 이미지 추가
                            args.row.columns[1].html = `<span style="font-size: 11px; cursor:pointer;">${row.taskName}${imgHtml}</span>`; args.row.columns[1].text = row.taskName;
                        } else {
                            args.row.columns[1].html = `<span style="font-size: 11px; cursor:pointer;">${row.taskName}</span>`; args.row.columns[1].text = row.taskName;
                        }
                        for(var i=0; i<args.row.columns.length; i++) {
                            // 2차 분류제외
                            if(i>1) {
                                args.row.columns[i].horizontalAlignment = "center";
                                args.row.columns[i].html = `<span style="font-size: 11px;">${args.row.columns[i].value}</span>`; args.row.columns[i].text = args.row.columns[i].value;
                            }
                        }
                    },
                    onBeforeCornerRender: args => {
                        /**
                        * Parameters
                        * args.control (DayPilot.Gantt) - control instance.
                        * args.html (string) - custom HTML.
                        * args.areas (array) - custom active areas.
                        */
                        var html = `
                        <table style="border: 0px solid #c0c0c0; border-collapse: collapse; width: 655px; height: 100%;">
                        <tbody>
                            <tr>
                                <td colspan="2" style="
                                    border-right: 1px solid #c0c0c0; 
                                    padding: 0px; 
                                    width: 224px;
                                    font-weight: bold;
                                    font-family: var(--dp-gantt-font-family);
                                    font-size: var(--dp-gantt-font-size);
                                    text-align: center;">
                                    사업공정표
                                </td>                            
                                <td colspan="3" style="
                                    border-right: 1px solid #c0c0c0; 
                                    padding: 0px; 
                                    width: 215px;
                                    font-weight: bold;
                                    font-family: var(--dp-gantt-font-family);
                                    font-size: var(--dp-gantt-font-size);
                                    text-align: center;">
                                    계획
                                </td>
                                <td colspan="3" style="
                                    border: 0px solid #c0c0c0; 
                                    padding: 0px; 
                                    width: 215px;
                                    font-weight: bold;
                                    font-family: var(--dp-gantt-font-family);
                                    font-size: var(--dp-gantt-font-size);
                                    text-align: center;">
                                    실적
                                </td>
                            </tr>
                        </tbody>
                        </table>
                        `;
                        args.html = html;
                    },    
                    /*
                    // columns 스크롤처리
                    rowHeaderScrolling: true,     
                    rowHeaderWidth: 300,          
                    rowHeaderSplitterWidth: 5,*/

                    rowHeaderWidthAutoFit: false,
            });

            var arrLink = [];
            // 방법 1 순차 매핑
            for(var i=0; i<dataDay.length; i++)
            {
                if( (i+1) < dataDay.length)
                {
                    var islink1 = dataDay[i].islink;
                    var islink2 = dataDay[i+1].islink;

                    if( islink1==true && islink2==true ) {
                        arrLink.push({from: dataDay[i].id, 
                                        to: dataDay[i+1].id, 
                                        type: "FinishToStart",
                                        color: "#3c78d8",
                                        width: 1
                                    });
                    }
                }    
            }
            /*
            // 방법 2 종료일 기준 최소 시작일 매핑
            var getNextTaskId = function(data, currentId) {
                const currentIndex = data.findIndex(item => item.id === currentId);
                const currentItem = data[currentIndex];
                if (!currentItem || !currentItem.plnEndDate) return null;

                const baseEndDate = new Date(currentItem.plnEndDate);
                const futureTasks = data.slice(currentIndex + 1);

                const candidates = futureTasks.filter(item => {
                    return item.plnStartDate && new Date(item.plnStartDate) > baseEndDate;
                });

                if (candidates.length === 0) return null;
                // plnStartDate가 가장 빠른 항목 찾기
                const minTask = candidates.reduce((prev, curr) => {
                    return new Date(prev.plnStartDate) < new Date(curr.plnStartDate) ? prev : curr;
                });

                return minTask.id;
            };
            dataDay.forEach(task => {
                const nextId = getNextTaskId(dataDay, task.id);                
                if (nextId) {
                    arrLink.push({
                        from: task.id, // 현재 태스크 (출발)
                        to: nextId,    // 찾은 최소값 태스크 (도착)
                        type: "FinishToStart", // 종료 후 시작 타입
                        color: "#3c78d8",      // 선 색상
                        width: 1               // 선 굵기
                    });
                }
            });*/
            
            //this.$refs.ganttRef.control.links.list = arrLink;
            //this.$refs.ganttRef.control.update();
            this.$refs.ganttRef.control.update({
                ...aConfig,
                // tasks: dataDay,      // 태스크 데이터  , assign config에 설정함
                links: arrLink,      // 생성한 링크 데이터 (data 아님!)
            });
            break;
      
        }
      
      
    }, 

  },/* end mthod */

  data() {

    return {
      oprTitle : "",
      selectedType: "",
      typeMap : [
        /*{label : "일", value : "DD"},*/
        {label : "주", value : "WW"},
        {label : "월", value : "MM"},
        {label : "년", value : "YY"}
      ],
      bizTaskData: [],
      config: {
            columns : [
                {
                    title: "1차분류",
                    width: 90, // 100
                    property: "taskTypeName",
                },
                {
                    title: "2차분류",
                    width: 135,
                    property: "taskName"
                },
                {
                    title: "시작일",
                    width: 75, // 90
                    property: "plnStartDate",
                },
                {
                    title: "소요기간", // "Duration",
                    width: 65, // 100
                    property: "plnTakeDays"
                },
                {
                    title: "종료일",
                    width: 75,
                    property: "plnEndDate"
                },
                {
                    title: "시작일",
                    width: 75,
                    property: "prfStartDate",
                },
                {
                    title: "소요기간", // "Duration",
                    width: 65, // 100
                    property: "prfTakeDays"
                },
                {
                    title: "종료일",
                    width: 75,
                    property: "prfEndDate"
                },
            ],
            rowMoveHandling: "Disabled",
            cellWidthSpec: "Fixed",
            cellWidth: 40,
            taskHeight: 21, // task높이
            headerHeight: 25,
            heightSpec: "Max100Pct", // 부모 높이까지만 커지고 그 이후엔 스크롤 생성  //height: "Parent100Pct",
            completeBarVisible: true, // 실적라인 표시여부 true,false
            completeBarHeight: 21,// task높이중 실적라인 표시높이( taskHeight전체를 실적으로 덮는다. )
            rowHeaderHideIconEnabled: false, // true, false rowheader cololumn들을 숨기고/표시하는 버튼 사용여부
            taskResizeHandling: "Disabled", // taskbar resize 차단
            taskMoveHandling: "Disabled", // "Update", // taskbar move차단
            linkCreateHandling: "Disabled",// "Update", // task간 연결선 활성여부
            linkShape: "RightAngled", // link선 지정
            tasks: [],
            useEventBoxes: "Always",
            allowUnscheduledTasks: true, // 날짜 없는 스케쥴 허용
            onTaskClick: (args) => {
                console.log(args.task);
            },
            onBeforeCornerExport: (args) => {
                args.text = "                     사업공정표                                                            계획                                                                      실적"; 
                args.horizontalAlignment = "left";
                args.verticalAlignment = "center";
            },
            onBeforeRowHeaderExport: args => {
                args.fontFamily="Malgun Gothic";
                args.fontSize=9;                
            },
            onBeforeExport: (args) => {

            },
            // 엑셀 내보내기 시 각 셀(타임라인 칸)마다 실행됨
            onBeforeCellExport: (args) => {
                /*console.log(args);
                // 현실적으로 맞지않아 주석처리
                const task = args.task; // 현재 행의 작업 데이터
                const cellStart = args.cell.start; // 현재 엑셀 셀의 시작 시간
                const cellEnd = args.cell.end;     // 현재 엑셀 셀의 종료 시간

                if( !task ) {
                return;
                }

                // 진척률이 있고, 현재 셀이 작업 기간 내에 있는지 확인
                if (task.data.start && task.data.end && task.data.complete > 0) {
                    const taskStart = new DayPilot.Date(task.data.start).getTime();
                    const taskEnd = new DayPilot.Date(task.data.end).getTime();
                    const totalDuration = taskEnd - taskStart;
                    
                    // 실제 진척된 종료 지점 계산
                    const completeEnd = taskStart + (totalDuration * (task.data.complete / 100));

                    // 현재 엑셀 셀이 진척 범위(Complete) 안에 있다면 색상 지정
                    if (cellStart.getTime() < completeEnd) {
                        args.backColor = "#3C78D8"; // 진척된 영역 색상 (파랑)
                    } else if (cellStart.getTime() < taskEnd) {
                        args.backColor = "#A4C2F4"; // 남은 작업 영역 색상 (연파랑)
                    }
                }*/
            },
            onBeforeTaskExport: (args) => {
                // onBeforeCellExport 같이 사용하나 의미가 없음
                //  엑셀 내 작업 바 위에 텍스트로 진척률 표시 (이미지 생성 시 반영됨)   
                /*args.backColor = "#A4C2F4"; 
                args.barColor = "#3C78D8"; 
                args.barBackColor = "#A4C2F4"; 
                args.completeColor = "#3C78D8"; */
                //const complete = args.task.data.complete;
                //args.text = args.task.data.text + " (" + complete + "%)";
            },
            rowDoubleClickHandling: "Enabled",
            //onRowDoubleClick: async args => {
            onRowClick: async args => {
                //console.log("args.x====="+args.x);
                if( args.x != 1) return;
                //DayPilot.Modal.alert("Clicked: " + args.task.id());
                var masterNo = args.task.data.masterNo;
                var taskType = args.task.data.taskType;
                var taskCode = args.task.data.taskCode;
                var paramTask={masterNo:masterNo,taskType:taskType,taskCode:taskCode};
                //var paramTask={masterNo:886,taskType:'109',taskCode:'S40'};
                var userGubun = this.userStore.userGubun; // 관리자 v
                var height = 400;
                if( userGubun != "V" ) height=300;
                const result = await this.$dialog.showAndWait(
                    { ganttPeriod },
                    {
                    paramTask,
                    width: 1200,
                    /*height: height,*/
                    },
                    console.log("masterNo:", paramTask.masterNo), // ← 이 값 확인
                );
                if(result) {
                    ////alert("123132");
                    this.getBizTaskList();
                };
            },
      },

    }
  
  }

}
</script>

<style>
/* 차트 전체 폰트 사이즈 조절 */
.gantt_default_main, 
.gantt_default_rowheader, 
.gantt_default_timeheader {
    font-size: 11px !important; /* 원하는 크기로 조절 */
    font-family: 'Malgun Gothic', sans-serif; /* 한글 폰트 최적화 */
  --dp-gantt-font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif !important;
  --dp-gantt-font-size: 11px !important; /* 원하는 크기로 변경 */
}

/* 전체 막대 배경 */
.progress-container {
  width: 100%;
  background-color: #A4C2F4;
  border-radius: 10px;
  margin: 10px 0;
  overflow: hidden; /* 배경색이 넘치지 않게 함 */
}

/* 진척률 색상 막대 */
.progress-bar {
  height: 25px;
  line-height: 25px; /* 글자 수직 중앙 정렬 */
  text-align: right;
  padding-right: 10px;
  color: white;
  font-size: 12px;
  border-radius: 10px;
  transition: width 0.5s ease-in-out; /* 부드러운 애니메이션 */
  
  /* 색상 지정 (진척도에 따라 아래에서 변경 가능) */
  background-color: #3C78D8; /* 기본 초록색 */
}

/* 진척도 수준에 따른 색상 변화 클래스 */
.progress-bar.low { background-color: #f44336; }    /* 30% 미만: 빨강 */
.progress-bar.mid { background-color: #ff9800; }    /* 30~70%: 주황 */
.progress-bar.high { background-color: #4CAF50; }   /* 70% 이상: 초록 */

/* 상단 테두리를 없애고 배경색을 통일하여 이어진 것처럼 표시 */
.merged-cell-style {
  border: none !important; 
}
.gantt_default_rowheader {
    border-top: 1px solid #cacaca; 
    border-left: 0px solid #cacaca;
    border-bottom: 1px solid #cacaca; 
    border-right: 0px solid #cacaca;
}
/* merged-cell-style효과가 적용되지 않아 일괄적용(class를 덮어씀) */
.gantt_default_resourcedivider {
    position: absolute; 
    bottom: 0px; 
    width: 100%; 
    height: 0px;
    box-sizing: content-box; 
    border-bottom: none !important;
}
.gantt_default_main {
  .gantt_default_columnheader_splitter {
    display: none !important;
    width: 1px !important;
  }
  
  .gantt_default_columnheader_cell {
    border-right: 1px solid #cacaca;
    padding-right: 2px;

    .gantt_default_columnheader_cell_inner {
        justify-content: center;
    }
   }
}

/* 상단 행의 아래쪽 테두리 제거 */
.merged-header-top {
  border-bottom: none !important;
}

/* 하단 행의 위쪽 테두리 제거 */
.merged-header-bottom {
  border-top: none !important;
}

/* 텍스트 위치를 중앙으로 조정 (2행 전체의 중앙처럼 보이게) */
.merged-header-top .gantt_default_timeheader_cell_inner {
  display: flex;
  border-bottom: none !important;
  border-top: none !important;
  align-items: flex-end; /* 텍스트를 아래로 밀어서 중앙 효과 */
  justify-content: center;
  padding-bottom: 0px;
}
</style>