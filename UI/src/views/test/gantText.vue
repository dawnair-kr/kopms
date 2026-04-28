<template no-gutters>
   
        <!-- 조회조건 영역 -->
        <v-card variant="outlined" 
                class="ma-2 pa-2 flex-grow-0 bg-white" 
                style="border-color: #1867c0"
                >
                <!-- d-flex와 align-center로 라벨과 버튼들의 높이를 맞춥니다 -->
                <div class="d-flex align-center ">
                    <!-- 2. 라벨 영역: 원하는 아이콘과 텍스트를 자유롭게 구성 -->
                    <div class="d-flex align-center mr-4">
                        <v-icon icon="mdi-circle-small" color="primary"></v-icon>
                        <span class="text-subtitle-1 font-weight-bold">주기선택 :</span>
                        <span >선택된 값: {{ selectedType }}</span>
                    </div>
                    <!-- v-radio-group에 v-model을 연결하여 선택된 값을 관리합니다 -->
                    <v-radio-group v-model="selectedType" inline hide-details
                        @update:model-value="onRadioChange"
                        > <!--label="주기선택"--> 
                        <v-radio
                            v-for="(item, i) in typeMap"
                            :key="i"
                            :label="item.label"
                            :value="item.value"
                            color="primary"
                            class="mr-2" 
                        ></v-radio>                        
                    </v-radio-group>
                </div>
        </v-card>
        <!-- 조회조건 영역 끝 -->

        <v-card variant="outlined" class="ma-2 pa-2 flex-grow-0 bg-white" style="border-color: #1867c0">
            <v-card-title class="d-flex align-center pb-4">
                <v-icon icon="mdi-chart-gantt" color="primary" class="mr-2"></v-icon>
                {{ oprTitle }}
            </v-card-title>
            <DayPilotGantt id="schGantt" :config="config"  ref="ganttRef"/> 
            
        </v-card>
        <v-container fluid class="pa-0">
            <v-card variant="outlined" class="ma-2 pa-2 flex-grow-0 bg-white" style="border-color: #1867c0">
            <iframe
            src="https://wikipedia.org"
            width="100%"
            height="800px"
            frameborder="0"
            style="display: block;"
            ></iframe>
            </v-card>
        </v-container>

 
</template>


<script setup>

</script>

<script>
// official npm install https://npm.daypilot.org/daypilot-pro-vue/trial/2026.1.6849.tar.gz
// sanbox npm install https://npm.daypilot.org/daypilot-pro-vue/trial/2026.1.6857.tar.gz
import {DayPilot, DayPilotGantt} from 'daypilot-pro-vue'
import ganttPeriod from '@/popups/biz/GanttPeriod.vue'


export default {
  
  props: {
    // dataComm: {
    //   type: Object,
    //   default: {}
    // },
  },

  components: {
    DayPilotGantt
  },

  watch: {
  },

  computed: {

  },

  mounted() {
    // gantt chart icon click 함수
    var pthis = this;
    window.handleGanttIconClick = function(masterNo, taskType, taskCode) {       
        pthis.onClickLink(masterNo, taskType, taskCode);
    };

    this.selectedType = "WW"; 
    this.loadTasks(this.selectedType);
  },

  methods: {
    onClickLink: function(masterNo, taskType, taskCode) {
        console.log(masterNo, taskType, taskCode);
    },
    onRadioChange: function(newVar) {
        console.log('선택된 값:', newVar);
        
        this.loadTasks(newVar);
    },
    
    getStartOfWeek(date) {
        // 해당주의 첫날
        //if( date == null ) return '';
        const d = new Date(date);
        const day = d.getDay(); // 0: 일요일, 1: 월요일, ..., 6: 토요일
        const diff = d.getDate() - day; // 현재 날짜 - 요일 차이
        
        var strDt = new Date(d.setDate(diff)).getFullYear()
                    +'-'+(new Date(d.setDate(diff)).getMonth()+1).toString().padStart(2,"0")
                    +'-'+new Date(d.setDate(diff)).getDate().toString().padStart(2,"0");
        return strDt; //new Date(d.setDate(diff));
    },
    calculateWeeks(startDate, endDate) {
        //if( startDate == null && endDate == null ) return 0;

        const start = new Date(startDate);
        const end = new Date(endDate);
        console.log("------start----end----------");
        console.log(start + " , " +end);

        // 날짜 차이(밀리초)를 일(day)로 변환
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // 주차 계산 (7일 단위, 올림 처리)
        const weeks = Math.ceil(diffDays / 7);
        // 시작일 포함 여부에 따라 +1을 하거나, 
        // 혹은 0일 차이를 1주차로 정의하기 위해 조정이 필요할 수 있습니다.
        return weeks === 0 ? 1 : (weeks+1); // 0주차 방지
    },
    loadTasks: function(opt) {
      var dataDay= this.bizTaskData;
      var dataDay__= [
                {
				    id: "D1",
				    start: "2026-03-02",
				    end: "2026-03-06",
				    step1: "사내절차",
				    step2: "사업정보검토회의",
				    b_step: "",
				    text: "tag1",
                    complete: 40, // DayPilot 기본 진행률 바
                    box: {
                        barColor: "blue",
                    },
                    row: {
                        marginTop: 5,
                        marginBottom: 5
                    }
                },
                {
				    id: "D2",
				    start: "2026-03-09",
				    end: "2026-03-30",
				    step1: "사내절차",
				    step2: "사업타당성조사",
				    b_step: "사업타당성조사",
				    text: "tag2",
                    complete: 40, // DayPilot 기본 진행률 바
                    box: {
                        barColor: "blue",
                    },
                    row: {
                        marginTop: 5,
                        marginBottom: 5
                    }
                },
                {
				    id: "D3",
				    start: "2026-04-01",
				    end: "2026-04-15",
				    step1: "사내절차",
				    step2: "사업개발심사회의",
				    b_step: "Task 3",
				    text:"tag3",
                    complete: 40, // DayPilot 기본 진행률 바
                    box: {
                        barColor: "blue",
                    },
                    row: {
                        marginTop: 5,
                        marginBottom: 5,
                        html: "Task 1 (important)"
                    }
                },
                {
				    id: "D4",
				    start: "2026-04-16",
				    end: "2026-05-10",
				    step1: "사내절차",
				    step2: "입찰서/제안서관리",
				    b_step: "Task 4",
				    text:"tag4",
                    complete: 40, // DayPilot 기본 진행률 바
                    box: {
                        barColor: "blue",
                    },
                    row: {
                        marginTop: 5,
                        marginBottom: 5
                    }
                },
                {
				    id: "D5",
				    start: "2026-05-15",
				    end: "2027-05-10",
				    step1: "사내절차",
				    step2: "사업착수",
				    b_step: "Task 5",
				    text:"tag5",
                    complete: 40, // DayPilot 기본 진행률 바
                    box: {
                        barColor: "blue", 
                    },
                    row: {
                        marginTop: 5,
                        marginBottom: 5
                    }
                }
            ];

        switch(opt) {
        case "DD":
            this.oprTitle = "일간 공정표";
            var startDt = "";
            var weeks = 0;
            if( dataDay.length > 0 ) {
                var minVal = dataDay[0].start;
                var maxVal = dataDay[0].end;
                for(var i=0; i<dataDay.length; i++) {
                    var strDt = dataDay[i].start||"";
                    var endDt = dataDay[i].end||"";
                    if( strDt<minVal) minVal=strDt;
                    if( maxVal<endDt) maxVal=endDt;
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
                        const rows = this.bizTaskData; // args.row.events.all(); //
                        const currentIndex = args.row.index;
                        const row = rows[currentIndex];
                        if (currentIndex > 0) {
                            const prevRow = rows[currentIndex - 1];
                            
                            if (row.taskTypeName === prevRow.taskTypeName) {
                                args.row.columns[0].html = ""; // 텍스트 숨김                                
                                args.row.columns[0].cssClass = "merged-cell-style"; // 위쪽 테두리 제거 CSS 적용                                
                            }
                        }
                        if( 1==1 ) {
                            const iconUrl = "/images/biz/icons_30.png";
                            const imgHtml = `<img 
                                                onclick="handleGanttIconClick('${row.masterNo}' , '${row.taskType}', '${row.taskCode}')" 
                                                src="${iconUrl}" 
                                                style="width:12px; height:13px; vertical-align:middle; margin-left:3px;"
                                                >`;

                            // 기존 텍스트 앞에 이미지 추가
                            args.row.columns[1].html = `<span>${row.taskName}${imgHtml}</span>`;
                        }
                        for(var i=0; i<args.row.columns.length; i++) {
                            // 2차 분류제외
                            if(i!=1) args.row.columns[i].horizontalAlignment = "center";
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
                        <table style="border: 0px solid #c0c0c0; border-collapse: collapse; width: 720px; height: 100%;">
                        <tbody>
                            <tr>
                                <td colspan="2" style="
                                    border-right: 1px solid #c0c0c0; 
                                    padding: 0px; 
                                    width: 239px;
                                    font-weight: bold;
                                    font-family: var(--dp-gantt-font-family);
                                    font-size: var(--dp-gantt-font-size);
                                    text-align: center;">
                                    사업공정표
                                </td>                            
                                <td colspan="3" style="
                                    border-right: 1px solid #c0c0c0; 
                                    padding: 0px; 
                                    width: 240px;
                                    font-weight: bold;
                                    font-family: var(--dp-gantt-font-family);
                                    font-size: var(--dp-gantt-font-size);
                                    text-align: center;">
                                    계획
                                </td>
                                <td colspan="3" style="
                                    border: 0px solid #c0c0c0; 
                                    padding: 0px; 
                                    width: 240px;
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
            for(var i=0; i<dataDay.length; i++)
            {
                if( (i+1) < dataDay.length)
                {
                    var islink1 = dataDay[i].islink;
                    var islink2 = dataDay[i+1].islink;

                    if( islink1==true && islink2==true ) {
                        arrLink.push( {from: dataDay[i].id, to: dataDay[i+1].id, type: "FinishToStart"} );
                    }
                }    
            }
            
            //this.$refs.ganttRef.control.links.list = arrLink;
            //this.$refs.ganttRef.control.update();
            this.$refs.ganttRef.control.update({
                ...aConfig,
                // tasks: dataDay,      // 태스크 데이터  , assign config에 설정함
                links: arrLink,      // 생성한 링크 데이터 (data 아님!)
            });
            break;
        case "WW":
            this.oprTitle = "주간 공정표";
            var startDt = "";
            var weeks = 0;
            if( dataDay.length > 0 ) {
                var minVal = dataDay[0].start;
                var maxVal = dataDay[0].end;
                for(var i=0; i<dataDay.length; i++) {
                    var strDt = dataDay[i].start||"";
                    var endDt = dataDay[i].end||"";
                    if( strDt<minVal) minVal=strDt;
                    if( maxVal<endDt) maxVal=endDt;
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
                        const rows = this.bizTaskData; // args.row.events.all(); //
                        const currentIndex = args.row.index;
                        const row = rows[currentIndex];
                        if (currentIndex > 0) {
                            const prevRow = rows[currentIndex - 1];
                            
                            if (row.taskTypeName === prevRow.taskTypeName) {
                                args.row.columns[0].html = ""; // 텍스트 숨김                                
                                args.row.columns[0].cssClass = "merged-cell-style"; // 위쪽 테두리 제거 CSS 적용                                
                            }
                        }
                        if( 1==1 ) {
                            // 이미지 경로와 스타일 지정
                            // https://gw.mailplug.com/static/resources/service/gw/front/images/common/empty-data/default.svg
                            // https://gw.mailplug.com/static/resources/service/gw/front/images/common/file-icon/excel.svg
                            // https://gw.mailplug.com/static/resources/service/gw/front/images/mail/icon-unread.svg
                            
                            const iconUrl = "/images/biz/icons_30.png";
                            const imgHtml = `<img 
                                                onclick="handleGanttIconClick('${row.masterNo}' , '${row.taskType}', '${row.taskCode}')" 
                                                src="${iconUrl}" 
                                                style="width:12px; height:13px; vertical-align:middle; margin-left:3px;"
                                                >`;

                            // 기존 텍스트 앞에 이미지 추가
                            args.row.columns[1].html = `<span>${row.taskName}${imgHtml}</span>`;
                        }
                        for(var i=0; i<args.row.columns.length; i++) {
                            // 2차 분류제외
                            if(i!=1) args.row.columns[i].horizontalAlignment = "center";
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
                        <table style="border: 0px solid #c0c0c0; border-collapse: collapse; width: 720px; height: 100%;">
                        <tbody>
                            <tr>
                                <td colspan="2" style="
                                    border-right: 1px solid #c0c0c0; 
                                    padding: 0px; 
                                    width: 239px;
                                    font-weight: bold;
                                    font-family: var(--dp-gantt-font-family);
                                    font-size: var(--dp-gantt-font-size);
                                    text-align: center;">
                                    사업공정표
                                </td>                            
                                <td colspan="3" style="
                                    border-right: 1px solid #c0c0c0; 
                                    padding: 0px; 
                                    width: 240px;
                                    font-weight: bold;
                                    font-family: var(--dp-gantt-font-family);
                                    font-size: var(--dp-gantt-font-size);
                                    text-align: center;">
                                    계획
                                </td>
                                <td colspan="3" style="
                                    border: 0px solid #c0c0c0; 
                                    padding: 0px; 
                                    width: 240px;
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
            for(var i=0; i<dataDay.length; i++)
            {
                if( (i+1) < dataDay.length)
                {
                    var islink1 = dataDay[i].islink;
                    var islink2 = dataDay[i+1].islink;

                    if( islink1==true && islink2==true ) {
                        arrLink.push( {from: dataDay[i].id, to: dataDay[i+1].id, type: "FinishToStart"} );
                    }
                }    
            }
            // DayPilot.guid()

            //this.$refs.ganttRef.control.links.list = arrLink;
            //this.$refs.ganttRef.control.update();
            this.$refs.ganttRef.control.update({
                ...aConfig,
                // tasks: dataDay,      // 태스크 데이터  , assign config에 설정함
                links: arrLink,      // 생성한 링크 데이터 (data 아님!)
            }); 
            break;
        case "MM":
            this.oprTitle = "월간 공정표";
            var startDt = "";
            var weeks = 0;
            if( dataDay.length > 0 ) {
                var minVal = dataDay[0].start;
                var maxVal = dataDay[0].end;
                for(var i=0; i<dataDay.length; i++) {
                    var strDt = dataDay[i].start||"";
                    var endDt = dataDay[i].end||"";
                    if( strDt<minVal) minVal=strDt;
                    if( maxVal<endDt) maxVal=endDt;
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
                        const rows = this.bizTaskData; // args.row.events.all(); //
                        const currentIndex = args.row.index;
                        const row = rows[currentIndex];
                        if (currentIndex > 0) {
                            const prevRow = rows[currentIndex - 1];
                            
                            if (row.taskTypeName === prevRow.taskTypeName) {
                                args.row.columns[0].html = ""; // 텍스트 숨김                                
                                args.row.columns[0].cssClass = "merged-cell-style"; // 위쪽 테두리 제거 CSS 적용
                            }
                        }
                        if( 1==1 ) {
                            const iconUrl = "/images/biz/icons_30.png";
                            const imgHtml = `<img 
                                                onclick="handleGanttIconClick('${row.masterNo}' , '${row.taskType}', '${row.taskCode}')" 
                                                src="${iconUrl}" 
                                                style="width:12px; height:13px; vertical-align:middle; margin-left:3px;"
                                                >`;

                            // 기존 텍스트 앞에 이미지 추가
                            args.row.columns[1].html = `<span>${row.taskName}${imgHtml}</span>`;
                        }
                        for(var i=0; i<args.row.columns.length; i++) {
                            // 2차 분류제외
                            if(i!=1) args.row.columns[i].horizontalAlignment = "center";
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
                        <table style="border: 0px solid #c0c0c0; border-collapse: collapse; width: 720px; height: 100%;">
                        <tbody>
                            <tr>
                                <td colspan="2" style="
                                    border-right: 1px solid #c0c0c0; 
                                    padding: 0px; 
                                    width: 239px;
                                    font-weight: bold;
                                    font-family: var(--dp-gantt-font-family);
                                    font-size: var(--dp-gantt-font-size);
                                    text-align: center;">
                                    사업공정표
                                </td>                            
                                <td colspan="3" style="
                                    border-right: 1px solid #c0c0c0; 
                                    padding: 0px; 
                                    width: 240px;
                                    font-weight: bold;
                                    font-family: var(--dp-gantt-font-family);
                                    font-size: var(--dp-gantt-font-size);
                                    text-align: center;">
                                    계획
                                </td>
                                <td colspan="3" style="
                                    border: 0px solid #c0c0c0; 
                                    padding: 0px; 
                                    width: 240px;
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
            for(var i=0; i<dataDay.length; i++)
            {
                if( (i+1) < dataDay.length)
                {
                    var islink1 = dataDay[i].islink;
                    var islink2 = dataDay[i+1].islink;

                    if( islink1==true && islink2==true ) {
                        arrLink.push( {from: dataDay[i].id, to: dataDay[i+1].id, type: "FinishToStart"} );
                    }
                }    
            }
            
            //this.$refs.ganttRef.control.links.list = arrLink;
            //this.$refs.ganttRef.control.update();
            this.$refs.ganttRef.control.update({
                ...aConfig,
                // tasks: dataDay,      // 태스크 데이터  , assign config에 설정함
                links: arrLink,      // 생성한 링크 데이터 (data 아님!)
            });
            break;
        case "YY":
            this.oprTitle = "년간 공정표";
            var startDt = "";
            var weeks = 0;
            if( dataDay.length > 0 ) {
                var minVal = dataDay[0].start;
                var maxVal = dataDay[0].end;
                for(var i=0; i<dataDay.length; i++) {
                    var strDt = dataDay[i].start||"";
                    var endDt = dataDay[i].end||"";
                    if( strDt<minVal) minVal=strDt;
                    if( maxVal<endDt) maxVal=endDt;
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
                        const rows = this.bizTaskData; // args.row.events.all(); //
                        const currentIndex = args.row.index;
                        const row = rows[currentIndex];
                        if (currentIndex > 0) {
                            const prevRow = rows[currentIndex - 1];
                            
                            if (row.taskTypeName === prevRow.taskTypeName) {
                                args.row.columns[0].html = ""; // 텍스트 숨김                                
                                args.row.columns[0].cssClass = "merged-cell-style"; // 위쪽 테두리 제거 CSS 적용                                
                            }
                        }
                        if( 1==1 ) {
                            const iconUrl = "/images/biz/icons_30.png";
                            const imgHtml = `<img 
                                                onclick="handleGanttIconClick('${row.masterNo}' , '${row.taskType}', '${row.taskCode}')" 
                                                src="${iconUrl}" 
                                                style="width:12px; height:13px; vertical-align:middle; margin-left:3px;"
                                                >`;

                            // 기존 텍스트 앞에 이미지 추가
                            args.row.columns[1].html = `<span>${row.taskName}${imgHtml}</span>`;
                        }
                        for(var i=0; i<args.row.columns.length; i++) {
                            // 2차 분류제외
                            if(i!=1) args.row.columns[i].horizontalAlignment = "center";
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
                        <table style="border: 0px solid #c0c0c0; border-collapse: collapse; width: 720px; height: 100%;">
                        <tbody>
                            <tr>
                                <td colspan="2" style="
                                    border-right: 1px solid #c0c0c0; 
                                    padding: 0px; 
                                    width: 239px;
                                    font-weight: bold;
                                    font-family: var(--dp-gantt-font-family);
                                    font-size: var(--dp-gantt-font-size);
                                    text-align: center;">
                                    사업공정표
                                </td>                            
                                <td colspan="3" style="
                                    border-right: 1px solid #c0c0c0; 
                                    padding: 0px; 
                                    width: 240px;
                                    font-weight: bold;
                                    font-family: var(--dp-gantt-font-family);
                                    font-size: var(--dp-gantt-font-size);
                                    text-align: center;">
                                    계획
                                </td>
                                <td colspan="3" style="
                                    border: 0px solid #c0c0c0; 
                                    padding: 0px; 
                                    width: 240px;
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
            for(var i=0; i<dataDay.length; i++)
            {
                if( (i+1) < dataDay.length)
                {
                    var islink1 = dataDay[i].islink;
                    var islink2 = dataDay[i+1].islink;

                    if( islink1==true && islink2==true ) {
                        arrLink.push( {from: dataDay[i].id, to: dataDay[i+1].id, type: "FinishToStart"} );
                    }
                }    
            }
            
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
        {label : "일", value : "DD"},
        {label : "주", value : "WW"},
        {label : "월", value : "MM"},
        {label : "년", value : "YY"}
      ],
      bizTaskData: [
                    {
                        "taskCodeOrd": "A10",
                        "tipDesc": null,
                        "plnTakeDays": "10",
                        "leadDays": null,
                        "delayRate": null,
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
                        "complete": 0,
                        "nextTask": null,
                        "taskStatus": "N",
                        "prfStartDate": null,
                        "islink": false,
                        "id": "D0",
                        "start": "2026-03-25",
                        "end": "2026-03-24",
                        "box": {
                            "backColor": "transparent",
                            "barBackColor": "transparent",
                            "html": "",
                            "htmlRight": ""
                        },
                        "row": {
                            "marginTop": 5,
                            "marginBottom": 5
                        }
                    },
                    {
                        "taskCodeOrd": "A20",
                        "tipDesc": null,
                        "plnTakeDays": "15",
                        "leadDays": null,
                        "delayRate": null,
                        "taskTypeName": "사내절차",
                        "prfTakeDays": null,
                        "masterNo": "886",
                        "plnEndDate": null,
                        "prevTask": null,
                        "taskType": "109",
                        "prfEndDate": null,
                        "taskCode": "S20",
                        "takeDays": "15",
                        "taskName": "입수정보분석",
                        "plnStartDate": null,
                        "complete": 0,
                        "nextTask": null,
                        "taskStatus": "N",
                        "prfStartDate": null,
                        "islink": false,
                        "id": "D1",
                        "start": "2026-03-25",
                        "end": "2026-03-24",
                        "box": {
                            "backColor": "transparent",
                            "barBackColor": "transparent",
                            "html": "",
                            "htmlRight": ""
                        },
                        "row": {
                            "marginTop": 5,
                            "marginBottom": 5
                        }
                    },
                    {
                        "taskCodeOrd": "A30",
                        "tipDesc": "대한민국. 여긴 어딘가..",
                        "plnTakeDays": "20",
                        "leadDays": "1",
                        "delayRate": "15",
                        "taskTypeName": "사내절차",
                        "prfTakeDays": "17",
                        "masterNo": "886",
                        "plnEndDate": "2026-03-02",
                        "prevTask": null,
                        "taskType": "109",
                        "prfEndDate": "2026-02-27",
                        "taskCode": "S30",
                        "takeDays": "20",
                        "taskName": "사업정보검토회의",
                        "plnStartDate": "2026-02-10",
                        "complete": 85,
                        "nextTask": null,
                        "taskStatus": "N",
                        "prfStartDate": "2026-02-10",
                        "islink": true,
                        "id": "D2",
                        "start": "2026-02-10",
                        "end": "2026-03-02",
                        symbol: "../icons/daypilot.svg#edit",
                        "box": {
                            "barColor": "#3C78D8",
                            "html": "",
                            "barBackColor": "#A4C2F4",
                            "htmlRight": ""
                        },
                        "row": {
                            "marginTop": 5,
                            "marginBottom": 5
                        }
                    },
                    {
                        "taskCodeOrd": "A40",
                        "tipDesc": null,
                        "plnTakeDays": "25",
                        "leadDays": null,
                        "delayRate": null,
                        "taskTypeName": "사내절차",
                        "prfTakeDays": "6",
                        "masterNo": "886",
                        "plnEndDate": "2026-03-29",
                        "prevTask": null,
                        "taskType": "109",
                        "prfEndDate": "2026-03-10",
                        "taskCode": "S40",
                        "takeDays": "25",
                        "taskName": "사업타당성기초조사",
                        "plnStartDate": "2026-03-04",
                        "complete": 24,
                        "nextTask": null,
                        "taskStatus": "N",
                        "prfStartDate": "2026-03-04",
                        "islink": true,
                        "id": "D3",
                        "start": "2026-03-04",
                        "end": "2026-03-29",
                        "box": {
                            "barColor": "#3C78D8",
                            "html": "",
                            "barBackColor": "#A4C2F4",
                            "htmlRight": ""
                        },
                        "row": {
                            "marginTop": 5,
                            "marginBottom": 5
                        }
                    },
                    {
                        "taskCodeOrd": "A50",
                        "tipDesc": null,
                        "plnTakeDays": "30",
                        "leadDays": null,
                        "delayRate": null,
                        "taskTypeName": "사내절차",
                        "prfTakeDays": null,
                        "masterNo": "886",
                        "plnEndDate": null,
                        "prevTask": null,
                        "taskType": "109",
                        "prfEndDate": null,
                        "taskCode": "S50",
                        "takeDays": "30",
                        "taskName": "사업개발심사회의",
                        "plnStartDate": null,
                        "complete": 0,
                        "nextTask": null,
                        "taskStatus": "N",
                        "prfStartDate": null,
                        "islink": false,
                        "id": "D4",
                        "start": "2026-03-25",
                        "end": "2026-03-24",
                        "box": {
                            "backColor": "transparent",
                            "barBackColor": "transparent",
                            "html": "",
                            "htmlRight": ""
                        },
                        "row": {
                            "marginTop": 5,
                            "marginBottom": 5
                        }
                    },
                    {
                        "taskCodeOrd": "01",
                        "tipDesc": null,
                        "plnTakeDays": "75",
                        "leadDays": null,
                        "delayRate": null,
                        "taskTypeName": "용역",
                        "prfTakeDays": "17",
                        "masterNo": "886",
                        "plnEndDate": "2026-06-07",
                        "prevTask": null,
                        "taskType": "180",
                        "prfEndDate": "2026-04-10",
                        "taskCode": "01",
                        "takeDays": "75",
                        "taskName": "사업타당성조사",
                        "plnStartDate": "2026-03-24",
                        "complete": 23,
                        "nextTask": null,
                        "taskStatus": "N",
                        "prfStartDate": "2026-03-24",
                        "islink": true,
                        "id": "D5",
                        "start": "2026-03-24",
                        "end": "2026-06-07",
                        "box": {
                            "barColor": "#3C78D8",
                            "html": "",
                            "barBackColor": "#A4C2F4",
                            "htmlRight": ""
                        },
                        "row": {
                            "marginTop": 5,
                            "marginBottom": 5
                        }
                    },
                    {
                        "taskCodeOrd": "02",
                        "tipDesc": null,
                        "plnTakeDays": "80",
                        "leadDays": null,
                        "delayRate": null,
                        "taskTypeName": "용역",
                        "prfTakeDays": null,
                        "masterNo": "886",
                        "plnEndDate": null,
                        "prevTask": null,
                        "taskType": "180",
                        "prfEndDate": null,
                        "taskCode": "02",
                        "takeDays": "80",
                        "taskName": "해상풍력자원조사",
                        "plnStartDate": null,
                        "complete": 0,
                        "nextTask": null,
                        "taskStatus": "N",
                        "prfStartDate": null,
                        "islink": false,
                        "id": "D6",
                        "start": "2026-03-25",
                        "end": "2026-03-24",
                        "box": {
                            "backColor": "transparent",
                            "barBackColor": "transparent",
                            "html": "",
                            "htmlRight": ""
                        },
                        "row": {
                            "marginTop": 5,
                            "marginBottom": 5
                        }
                    },
                    {
                        "taskCodeOrd": "01",
                        "tipDesc": null,
                        "plnTakeDays": "30",
                        "leadDays": null,
                        "delayRate": null,
                        "taskTypeName": "인허가",
                        "prfTakeDays": null,
                        "masterNo": "886",
                        "plnEndDate": null,
                        "prevTask": null,
                        "taskType": "181",
                        "prfEndDate": null,
                        "taskCode": "01",
                        "takeDays": "30",
                        "taskName": "발전사업허가(1단계)",
                        "plnStartDate": null,
                        "complete": 0,
                        "nextTask": null,
                        "taskStatus": "N",
                        "prfStartDate": null,
                        "islink": false,
                        "id": "D7",
                        "start": "2026-03-25",
                        "end": "2026-03-24",
                        "box": {
                            "backColor": "transparent",
                            "barBackColor": "transparent",
                            "html": "",
                            "htmlRight": ""
                        },
                        "row": {
                            "marginTop": 5,
                            "marginBottom": 5
                        }
                    },
                    {
                        "taskCodeOrd": "02",
                        "tipDesc": null,
                        "plnTakeDays": "30",
                        "leadDays": null,
                        "delayRate": null,
                        "taskTypeName": "인허가",
                        "prfTakeDays": null,
                        "masterNo": "886",
                        "plnEndDate": null,
                        "prevTask": null,
                        "taskType": "181",
                        "prfEndDate": null,
                        "taskCode": "02",
                        "takeDays": "30",
                        "taskName": "발전사업허가(2단계)",
                        "plnStartDate": null,
                        "complete": 0,
                        "nextTask": null,
                        "taskStatus": "N",
                        "prfStartDate": null,
                        "islink": false,
                        "id": "D8",
                        "start": "2026-03-25",
                        "end": "2026-03-24",
                        "box": {
                            "backColor": "transparent",
                            "barBackColor": "transparent",
                            "html": "",
                            "htmlRight": ""
                        },
                        "row": {
                            "marginTop": 5,
                            "marginBottom": 5
                        }
                    }
        ],
      config: {
            columns : [
                {
                    title: "1차분류",
                    width: 90, // 100
                    property: "taskTypeName",
                },
                {
                    title: "2차분류",
                    width: 150,
                    property: "taskName"
                },
                {
                    title: "시작일",
                    width: 85, // 90
                    property: "plnStartDate",
                },
                {
                    title: "소요기간", // "Duration",
                    width: 70, // 100
                    property: "plnTakeDays"
                },
                {
                    title: "종료일",
                    width: 85,
                    property: "plnEndDate"
                },
                {
                    title: "시작일",
                    width: 85,
                    property: "prfStartDate",
                },
                {
                    title: "소요기간", // "Duration",
                    width: 70, // 100
                    property: "prfTakeDays"
                },
                {
                    title: "종료일",
                    width: 85,
                    property: "prfEndDate"
                },
            ],
            rowMoveHandling: "Disabled",
            cellWidthSpec: "Fixed",
            cellWidth: 40,
            taskHeight: 30, // task높이
            completeBarVisible: true, // 실적라인 표시여부 true,false
            completeBarHeight: 30,// task높이중 실적라인 표시높이( taskHeight전체를 실적으로 덮는다. )
            rowHeaderHideIconEnabled: false, // true, false rowheader cololumn들을 숨기고/표시하는 버튼 사용여부
            taskResizeHandling: "Disabled", // taskbar resize 차단
            taskMoveHandling: "Disabled", // "Update", // taskbar move차단
            linkCreateHandling: "Disabled",// "Update", // task간 연결선 활성여부
            tasks: [],
            onTaskClick: (args) => {
                console.log(args.task);
            },
            rowDoubleClickHandling: "Enabled",
            onRowDoubleClick: async args => {
                console.log(args);
                //DayPilot.Modal.alert("Clicked: " + args.task.id());
                var masterNo = args.task.data.masterNo;
                var taskType = args.task.data.taskType;
                var taskCode = args.task.data.taskCode;
                var paramTask={masterNo:masterNo,taskType:taskType,taskCode:taskCode};
                //var paramTask={masterNo:886,taskType:'109',taskCode:'S40'};
                var userGubun = this.userGubun; // 관리자 v
                var height = 500;
                if( userGubun != "V" ) height=350;
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
      configDay: {
        columns : [
            {
                title: "1차분류",
                width: 100,
                property: "step1"

            },
            {
                title: "2차분류",
                width: 200,
                property: "step2"
            },
            {
                title: "소요기간", // "Duration",
                width: 100
            },
            {
                title: "시작일",
                width: 50,
                property: "start",
            },
            {
                title: "종료일",
                width: 50,
                property: "end"
            },
        ],
        cellWidthSpec: "Fixed",
        cellWidth: 40,
        taskHeight: 30, // task높이
        completeBarVisible: true, // 실적라인 표시여부 true,false
        completeBarHeight: 10,// task높이중 실적라인 표시높이
        timeHeaders: [{"groupBy":"Month","format":"yyyy.MM"},{"groupBy":"Day","format":"d"}],
        scale: "Day",// Day groupBy: Year, Month, Week, Day, Hour, Cell (최하단 단위) 등
        days: 64*7,
        startDate: "2026-03-01",
        rowHeaderHideIconEnabled: false, // true, false rowheader cololumn들을 숨기고/표시하는 버튼 사용여부
        taskResizeHandling: "Disabled", // taskbar resize 차단
        taskMoveHandling: "Disabled", // "Update", // taskbar move차단
        /* rowMoveHandling: "Update",
        onRowMoved: args => {
          //this.gantt.message("Row moved: " + args.source.text());
        },
        taskMoveHandling: "Update",
        onTaskMoved: args => {
          //this.gantt.message("Task moved: " + args.task.text());
        },*/
        linkCreateHandling: "Disabled", // "Update", // task간 연결선 활성여부
        onLinkCreated: args => {
          //this.gantt.message("Link created: " + args.type);
        },        
        /*
        신규 타스크를 생성할수 있도록 해주는 옵션( 마지막 라인이 입력행으로 표현됨 )
        rowCreateHandling: "Enabled",
        onRowCreate: args => {
          this.gantt.tasks.add({
            id: DayPilot.guid(),
            text: args.text,
            start: new DayPilot.Date().getDatePart(),
            end: new DayPilot.Date().getDatePart().addDays(1)
          });
        },*/
      },

    }
  
  }

}
</script>
<style>

/* 상단 테두리를 없애고 배경색을 통일하여 이어진 것처럼 표시 */
.merged-cell-style {
  border-top: none !important; 
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