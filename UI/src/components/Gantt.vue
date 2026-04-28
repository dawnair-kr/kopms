<template>
    <div>
        <!--
        <canvas 
            id="gantt_canvas" :width="width" :height="height"
            
        >
        </canvas>
        -->
        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" :width="`${width}px`" :height="`${height}px`" :viewBox="`0 0 ${width} ${height}`" :enable-background="`new 0 0 ${width} ${height}`" xml:space="preserve">
            <defs>
                <linearGradient v-for="gr in gradientItems" :id="gr.id" x1="0%" y1="50%" x2="100%" y2="50%">
                    <stop v-for="s in gr.stop" :offset="s.offset" :style="s.style" />
                </linearGradient>
            </defs>
            <g>
                <rect v-for="bc in backgroundColumn" :x="bc.x" :y="bc.y" :width="bc.width" :height="bc.height" :style="bc.style"  />    
            </g>
            <g :stroke="headlineColor" :stroke-width="headlineWidth" :fill="headBkColor">
                <rect v-for="bc in firstHeadCells" :x="bc.x" :y="bc.y" :width="bc.width" :height="bc.height"  />
                <text v-for="bc in firstHeadCells" :x="bc.textX" :y="bc.textY" :style="bc.textStyle" dominant-baseline="middle" text-anchor="middle">
                    {{ bc.text  }}
                </text>
            </g>
            <g :stroke="headlineColor" :stroke-width="headlineWidth" :fill="headBkColor">
                <rect v-for="bc in secondHeadCells" :x="bc.x" :y="bc.y" :width="bc.width" :height="bc.height"  />
                <text v-for="bc in secondHeadCells" :x="bc.textX" :y="bc.textY" :style="bc.textStyle" dominant-baseline="middle" text-anchor="middle">
                    {{ bc.text  }}
                </text>
            </g>
            <g>
                <path v-for="link in linkItems" :d="link.path" :stroke-width="link.strokeWidth" :stroke="link.stroke" fill="none" />
            </g>
            <g>
                <path v-for="summary in summaryItems" :d="summary.path" :stroke-width="summary.strokeWidth" :stroke="summary.storke" :fill="summary.fill"  />
            </g>
            <g>
                <path v-for="milestone in milestoneItems" :d="milestone.path" :stroke-width="milestone.strokeWidth" :stroke="milestone.storke" :fill="milestone.fill" />
            </g>
            
            <g>
                <text v-for="bc in textItems" :x="bc.x" :y="bc.y" :style="bc.style" dominant-baseline="middle" text-anchor="end">
                    {{ bc.text  }}
                </text>
            </g>
            <g>
                <rect v-for="noraml in normalItems" rx="10" ry="10" :x="noraml.x" :y="noraml.y" :width="noraml.width" :height="noraml.height" :style="noraml.style"  />
                <rect v-for="progress in progressItems" rx="10" ry="10" :x="progress.x" :y="progress.y" :width="progress.width" :height="progress.height" :style="progress.style"  />
                <text v-for="bc in normalTextItems" :x="bc.x" :y="bc.y" :style="bc.style" dominant-baseline="middle" text-anchor="middle">
                    {{ bc.text  }}
                </text>
            </g>
            <!--
            <rect x="50" y="20" rx="20" ry="20" width="150" height="150" style="fill:red;stroke:black;stroke-width:5;opacity:0.5" />
            <text x="0" y="15" fill="red">I love SVG!</text>
            -->
        </svg>
    </div>
</template>
<script>
import {GregorianCalendar, TimeUnit} from "../util/GregorianCalendar.js";
import {TimelineMgr, TimelineScaleKinds, DateFormats} from "../util/GanttTimeLine.js";
import { setDataset, getTaskInfo } from '../util/GanttData.js';
import lodash from 'lodash';

//moment.locale("ko");

let calendar = new GregorianCalendar();
let timelineMgr = new TimelineMgr();

/***************
 * interface WatermarkImageStyle {
  width: number,
  height: number
}

interface WatermarkFontStyle {
  width: number,
  lineHeight: number,
  color: string,
  font: string,
  drawType: string,
  textAlign: string,
  textBaseline: string,
  rotate: number
}

interface WatermarkData {
  type: string,
  source: string,
  x: number,
  y: number,
  imageStyle?: WatermarkImageStyle,
  fontStyle?: WatermarkFontStyle
}

interface DataInit {
  loadedImage: any;
  drawing: boolean;
  context: any;
  images: any;
  strokes: any;
  guides: any;
  trash: any;
}
 */

const DEFAULT_ROW_HEIGHT = 40;
const DEFAULT_WIDTH = 1200;
const DEFAULT_FONT_SIZE = 12;
const DEFAULT_ROW_PADDING = 10;
const DEFAULT_RADIUS = 5;
const SLIDER_WIDTH = 10;
const HEADER_BORDER_WIDTH = 2;
const TODAY_MARKER_WIDTH = 2;
const CONNECTION_OFFSET = 10;
const CONNECTION_ARROW_WIDTH = (CONNECTION_OFFSET / 2);
const CONNECTION_ARROW_HEIGHT = (CONNECTION_OFFSET / 3);
const CONNECTION_LINE_WIDTH = 2;
const MIN_COLUMN_WIDTH = 40;
const TASK_BORDER_WIDTH = 2;

const COLORS = {
  milestone: {
    bar: {
      odd: {
        highlighted: "rgba(112, 162, 236, 0.8)",
        dragging: "rgba(112, 162, 236, 0.6)",
        draggingBorder: "rgba(61, 111, 185, 1)", // darkened, 20%
        default: "rgba(112, 162, 236, 1)",
        progress: "rgba(61, 111, 185, 1)", // darkened, 30%
        draggingSlider: "rgba(87, 137, 211, 1)",
        highlightedSlider: "rgba(87, 137, 211, 1)"
      },
      even: {
        highlighted: "rgba(111, 237, 124, 0.8)",
        dragging: "rgba(111, 237, 124, 0.6)",
        draggingBorder: "rgba(60, 186, 73, 1)", // darkened, 20%
        default: "rgba(111, 237, 124, 1)",
        progress: "rgba(35, 161, 48, 1)", // darkened, 30%
        draggingSlider: "rgba(42, 187, 115, 1)",
        highlightedSlider: "rgba(42, 187, 115, 1)"
      }
    },
    slider: {
      symbol: "rgba(0, 0, 0, 1.0)"
    },
    connection: {
      endToEnd: {
        line: "rgba(100, 100, 100, 1)"
      },
      endToStart: {
        line: "rgba(100, 100, 100, 1)"
      },
      startToStart: {
        line: "rgba(100, 100, 100, 1)"
      },
    }
  },
  scale: {
    bar: {
      odd: "rgba(255, 255, 255, 0.9)",
      even: "rgba(220, 225, 220, 0.4)"
    },
    marker: {
      today: "rgba(238, 156, 93, 1)"
    },
    header: {
      background: "rgba(255, 255, 255, 1)",
      border: "rgba(220, 225, 220, 0.4)"
    }
  }
};

const FONTS = {
  scale: {
    column: {
      title: {
        color: "rgba(0, 0, 0, 1)",
        size: 12,
        font: "Arial"
      }
    }
  },
  milestone: {
    label: {
      color: "rgba(0, 0, 0, 1)",
      size: 12,
      font: "Arial"
    }
  }
};
const HEADER_HEIGHT = FONTS.scale.column.title.size * 1.5;
const RIGHT_SLIDER = Symbol("right");
const LEFT_SLIDER = Symbol("left");
const EVENT_TYPE = {
  MILESTONE_MOVED: 'milestonemove',
  MILESTONE_RESIZED: 'milestoneresize',
};


export default {
    props: {
        timeLineScale: {
            type: Array,
            default: () => {
                return TimelineScaleKinds[17];
            }
        },
        image: {
            type: String,
            default: () => ''
        },
        backgroundColor: {
            type: String,
            default: () => '#FFFFFF'
        },
        backgroundImage: {
            type: String,
            default: () => null
        },
        watermark: {
            type: Object,
            default: () => null
        },
        saveAs: {
            type: String,
            validator: (value) => {
                return ['jpeg', 'png'].indexOf(value) !== -1
            },
            default: () => 'png'
        },
        initialImage: {
            type: Array,
            default: () => []
        },
        additionalImages: {
            type: Array,
            default: () => []
        },
        outputWidth: {
            type: Number
        },
        outputHeight: {
            type: Number
        }
    },
    watch: {
        backgroundImage() {
            this.loadedImage = null;
        }
    },
    data () {
        return {
            loadedImage: null,
            drawing: false,
            context: null,
            images: [],
            strokes: {
                type: '',
                from: { x: 0, y: 0 },
                coordinates: [],
                color: '',
                width: '',
                fill: false,
                lineCap: '',
                lineJoin: ''
            },
            guides: [],
            trash: [],
            canvasId: "gantt_canvas",
            headTickGap: 0,
            width: 100,
            height: 100,
            backgroundColumn: [],
            headlineWidth: 0,
            headlineColor: null,
            headBkColor: null,
            firstHeadCells: [],
            secondHeadCells: [],
            taskItems: [],
            taskLinks: [],
            taskMap: {},
            summaryItems: [],
            gradientItems: [],
            textItems: [],
            milestoneItems: [],
            normalItems: [],
            progressItems: [],
            normalTextItems: [],
            taskItemsRectMap: {},
            linkItems: [],
        };
    },
    computed: {
    },
    mounted() {
        setTimeout(() => {
            this.width = this.$el.offsetWidth;
            this.height = this.$el.offsetHeight;

            let dt = new Date();//new Date()
            dt.setFullYear(2023, 6, 14); //시작일자로 구성함.
            //dt.setFullYear(2023, 7, 14); //시작일자로 구성함.
            dt.setHours(0, 0, 0, 0);
            let baseDt = calendar.floor(dt, TimeUnit.DAY, 1);

            timelineMgr.setConfig(baseDt, baseDt, this.width, 0);
            timelineMgr.zoomFactor = TimeUnit.DAY.milliseconds/20;

            setDataset();
            const { taskdata, taskMap, LinksMap } = getTaskInfo();

            // console.log(taskdata);
            //this.setContext();
            this.$nextTick(() => {
                this.draw(taskdata, LinksMap);
            });
        }, 500);
    },
    methods: {
        draw(taskdata, linkMap) {
            this.headlineWidth = HEADER_BORDER_WIDTH;
            this.headlineColor = COLORS.scale.header.border;
            this.headBkColor = COLORS.scale.header.background;
            let firstHeadTimeLine = this.timeLineScale[0];
            let secondHeadTimeLine = this.timeLineScale[1];
            let tickTimes = this.getTickTimes(firstHeadTimeLine[0], firstHeadTimeLine[1]);
            //console.log("first", tickTimes);
            // tickTimes, dtFormat, y, h, isDay, isVertLine, isFirst
            this.drawTimeLineHeadCells(tickTimes, DateFormats[firstHeadTimeLine[2]], 0, HEADER_HEIGHT, 
               firstHeadTimeLine[0] == TimeUnit.DAY, null, true);
            tickTimes = this.getTickTimes(secondHeadTimeLine[0], secondHeadTimeLine[1]);
            //console.log("second", tickTimes);
            this.drawTimeLineHeadCells(tickTimes, DateFormats[secondHeadTimeLine[2]], HEADER_HEIGHT, HEADER_HEIGHT, 
                secondHeadTimeLine[0] == TimeUnit.DAY, null, false);

            this.drawBackgroundColumn(tickTimes, HEADER_HEIGHT);

            this.drawTaskItems(taskdata);

            this.drawTaskLinks(taskdata, linkMap);

        },
        /**
         * timeLine를 그리기 위해 주어진 timeUnit, time간격을 가지고 그려야 할 시간들을 Date 로 넘겨준다.
         * @param {TimeUnit} unit TimeUnit 값
         * @param {number} gap TimeUnit 단위의 간격 값
         * @return {array} Date Type 값들로 구성된 array
        **/
        getTickTimes(unit, gap) {
            let res = [];
            //console.log("getTickTimes", timelineMgr.startTime, timelineMgr.endTime);
            let sdt = calendar.floor(timelineMgr.startTime, unit, gap);
            let edt = calendar.floor(timelineMgr.endTime, unit, gap);
            edt = calendar.addUnits(edt, unit, gap, true);

            let next = calendar.floor(sdt, unit, gap),
                tmpDt;
            while ( !(next > edt) ) {
                res.push(next);
                tmpDt = calendar.addUnits(next, unit, gap);
                tmpDt = calendar.floor(tmpDt, unit, gap);
                next = tmpDt;
            }
            return res;
        },
        drawBackgroundColumn(tickTimes, y) {
            let startPos, endPos;
            let backgroundColumn = [];
            for ( let i = 0 , len = tickTimes.length - 1; i < len ; i++ ) {
                let time = tickTimes[i];
                if ( startPos == null ) {
                    startPos = timelineMgr.getCoordinate(time);
                } else {
                    startPos = endPos;
                }
                endPos = timelineMgr.getCoordinate(tickTimes[i+1]);
                let x0 = Math.max(0, startPos);
                let x1 = Math.min(this.width, endPos);
                
                let bkcellcolor = "";
                if (calendar.getDayOfYear(time) % 2 === 0) {
                    bkcellcolor = COLORS.scale.bar.even;
                } else {
                    bkcellcolor = COLORS.scale.bar.odd;
                }
                // 전체 column 단위 처리 
                backgroundColumn.push({
                    x: x0,
                    y: y,
                    width: x1 - x0,
                    height: this.height,
                    style: "fill:" + bkcellcolor + ";"
                });
            }
            this.backgroundColumn = backgroundColumn;
        },
        drawTimeLineHeadCells(tickTimes, dtFormat, y, h, isDay, isVertLine, isFirst) {
            let startPos, endPos;
            let cells = [];
            for ( let i = 0 , len = tickTimes.length - 1; i < len ; i++ ) {
                
                let time = tickTimes[i];
                
                let lbText = this.$dayjs(time).format(dtFormat);
                
                if ( startPos == null ) {
                    startPos = timelineMgr.getCoordinate(time);
                } else {
                    startPos = endPos;
                }
                endPos = timelineMgr.getCoordinate(tickTimes[i+1]);
                let x0 = Math.max(0, startPos);
                let x1 = Math.min(this.width, endPos);
                
                /*
                this.context.lineWidth = HEADER_BORDER_WIDTH;
                this.context.strokeStyle = COLORS.scale.header.border;

                this.context.beginPath();
                this.context.moveTo(x0, y);
                this.context.lineTo(x0, y+h);
                this.context.closePath();
                this.context.stroke();

                this.context.beginPath();
                this.context.moveTo(x0, y+h);
                this.context.lineTo(x1, y+h);
                this.context.closePath();
                this.context.stroke();

                this.context.beginPath();
                this.context.moveTo(x1, y+h);
                this.context.lineTo(x1, y);
                this.context.closePath();
                this.context.stroke();
                */

                
                //this.context.fillStyle = FONTS.scale.column.title.color;
                //this.context.font = `${FONTS.scale.column.title.size}px ${FONTS.scale.column.title.font}`;

                //let labelWidth = this.context.measureText(lbText).width;
                let txtColor = FONTS.scale.column.title.color;
                if ( isDay ) {
                    let day = time.getDay();
                    if ( day == 0 || day == 6 ) {
                        txtColor = "red";
			        }
                }
                cells.push({
                    x: x0,
                    y: y,
                    width: x1 - x0,
                    height: h,
                    text: lbText,
                    textX:  x0 + ((x1 - x0) / 2),
                    textY: y + h/2,
                    textStyle:  `font: ${FONTS.scale.column.title.size}px ${FONTS.scale.column.title.font}; fill: ${txtColor};`
                });
                
                //this.context.fillText(lbText, x0 + ((x1 - x0 - labelWidth) / 2), y + DEFAULT_FONT_SIZE);
            }
            if ( isFirst ) {
                this.firstHeadCells = cells;
            } else {
                this.secondHeadCells = cells;
            }
        },
        drawTaskItems(taskdata) {
            let rowGap = 3;
            let vPos = HEADER_HEIGHT * 2, rowHeight = 30;
            let summaryItems = [], gradientItems = [], textItems = [],
                milestoneItems = [], normalItems = [], progressItems = [], normalTextItems = [],
                taskItemsRectMap = {};

            let func = o => {
                //console.log(vPos, o);
                if ( this.isVisible(o.displayInfo.start, o.displayInfo.end) && vPos > -1 && vPos < this.height + 20 ) {
                    this.drawTaskItem(o, vPos, rowHeight, summaryItems, milestoneItems, normalItems, progressItems, normalTextItems, textItems, gradientItems, taskItemsRectMap);
                }
                vPos += rowHeight + rowGap;
            };

            lodash.forEach(taskdata, o => {
                this.traverseTree(o, func);
            });
            this.summaryItems = summaryItems;
            this.gradientItems = gradientItems;
            this.textItems = textItems;
            this.milestoneItems = milestoneItems;
            this.normalItems = normalItems;
            this.progressItems = progressItems;
            this.normalTextItems = normalTextItems;
            this.taskItemsRectMap = taskItemsRectMap;
        },
        traverseTree(rec, func) {
            let children = rec.children;

            if ( children && children.length ) {
                if ( typeof func == "function" ) {
                    func(rec);
                }
                lodash.forEach(children, o => {
                    this.traverseTree(o, func);
                });
            } else {
                if ( typeof func == "function" ) {
                    func(rec);
                }
            }
        },
        drawTaskLinks(taskdata, linkMap) {
            let rowGap = 3;
            let vPos = HEADER_HEIGHT * 2, rowHeight = 30;
            let linkItems = [];

            let func = o => {
                //console.log(vPos, o);
                if ( this.isVisible(o.displayInfo.start, o.displayInfo.end) && vPos > -1 && vPos < this.height + 20 ) {
                    this.drawTaskLink(o, linkMap, linkItems, rowHeight + rowGap, HEADER_HEIGHT * 2);
                }
                vPos += rowHeight + rowGap;
            };

            lodash.forEach(taskdata, o => {
                this.traverseTree(o, func);
            });
            this.linkItems = linkItems;
        },  
        isVisible(sdt, edt) {
            let visibleTimeStart = timelineMgr.startTime, visibleTimeEnd = timelineMgr.endTime;
            let start = Math.max(sdt.getTime(), visibleTimeStart.getTime());
            let end = Math.min(edt.getTime(), visibleTimeEnd.getTime());
            return (end - start) >= 0;
        },
        drawTaskItem(taskInfo, y, height, summaryItems, milestoneItems, normalItems, progressItems, normalTextItems, textItems, gradientItems, taskItemsRectMap) {
            let left = this.getClippedCoordinate(taskInfo.displayInfo.start);
            let right = this.getClippedCoordinate(taskInfo.displayInfo.end);
            let wGap = 12;
            let barX = left,
                barY = y,
                barW = right - left,
                barH = height,
                textX = 0, textY = y, textW = left - wGap,
                textH = height;
            
            if ( taskInfo.displayInfo.isMilestone ) {
                textItems.push({
                    x: textX + textW - 10,
                    y: y + parseInt(height/2) + 1,
                    text: taskInfo.displayInfo.text,
                    style:  `font: ${FONTS.milestone.label.size}px ${FONTS.milestone.label.font}; fill: ${FONTS.milestone.label.color};`
                });
				barH = height;
				barY += 6;
				//barX = barX - Math.floor(barH/2);
				//barW = barH;
                
                this.drawMilestone(taskInfo, barX, barY, barW, milestoneItems, taskItemsRectMap);
			} else if ( taskInfo.displayInfo.isSummary ) {
                textItems.push({
                    x: textX + textW - 10,
                    y: y + parseInt(height/2) - 4,
                    text: taskInfo.displayInfo.text,
                    style:  `font: ${FONTS.milestone.label.size}px ${FONTS.milestone.label.font}; fill: ${FONTS.milestone.label.color};`
                });
				barH = barH - 8;
				barY = barY + 4;
				barX -= barH/3;
				barW += (barH/3)*3;
                
                this.drawSummary(taskInfo, barX, barY, barW, barH, summaryItems, gradientItems, taskItemsRectMap);
			} else {
                textItems.push({
                    x: textX + textW - 10,
                    y: y + parseInt(height/2),
                    text: taskInfo.displayInfo.text,
                    style:  `font: ${FONTS.milestone.label.size}px ${FONTS.milestone.label.font}; fill: ${FONTS.milestone.label.color};`
                });
				barH -= 12;
				barY += 6;
                this.drawNoraml(taskInfo, barX, barY, barW, barH, normalItems, progressItems, normalTextItems, taskItemsRectMap);
			}

        },
        drawTaskLink(taskInfo, linkMap, linkItems, rowHeight, headHeight) {
            let link = linkMap[taskInfo.id];
            if ( link ) {
                lodash.forEach(link, (o, id) => {
                    //console.log("link ===>", o);
                    let toTaskInfo = o.to;
                    let fromTaskInfo = o.from;
                    let toRect = this.taskItemsRectMap[toTaskInfo.id];
                    let fromRect = this.taskItemsRectMap[fromTaskInfo.id];

                    if ( fromRect && !toRect ) {
                        let sDt = toTaskInfo.displayInfo.start;
					    let eDt = toTaskInfo.displayInfo.end;
                        let tmpleft = timelineMgr.getCoordinate(sDt);
					    let tmpright = timelineMgr.getCoordinate(eDt);
                        toRect = {x:tmpleft , y: headHeight + rowHeight * toTaskInfo.row, width: tmpright - tmpleft , height: this.height - headHeight};
                    } else if ( !fromRect && toRect ) {
                        let sDt = fromTaskInfo.displayInfo.start;
                        let eDt = fromTaskInfo.displayInfo.end;
                        let tmpleft = timelineMgr.getCoordinate(sDt);
                        let tmpright = timelineMgr.getCoordinate(eDt);
                        fromRect = {x:tmpleft , y: headHeight + rowHeight * fromTaskInfo.row, width:tmpright - tmpleft , height:this.height - headHeight};
                    }

                    if (  !fromRect && !toRect ) {
                        // console.log("link error", fromTaskInfo, toTaskInfo);
                        return;
                    }

                    //console.log("===>", "fromTaskInfo", fromTaskInfo, "toTaskInfo", toTaskInfo, "fromRect", fromRect, "toRect", toRect);

                    let top = Math.ceil(fromRect.y + fromRect.height/2); //8
                    let bottom = Math.ceil(toRect.y + toRect.height/2);  //10
                    let left = Math.ceil(fromRect.x + fromRect.width); //7
                    let right = Math.ceil(toRect.x); //9

                    
                    let wGap = 8, hGap = 8; // 14, 15
				    let ArrowSize = 8,
					    halfArrowSize = Math.ceil(ArrowSize/2);

                    let pathData, x, y, w, h;

                    if ( top < bottom && left <= right ) {
                        x = left;
                        y = top;
                        right += Math.ceil(toRect.width/2);
                        w = right - left;
                        h = toRect.y - top;
                        bottom -= Math.ceil(toRect.height/2);
                        //_loc_13 = "bottom";
                        //if ( fromVisible )
                        //{
                            pathData = "M" + x + " " + y;
                            pathData += "L" + (right) + " " + y;
                        //}
                        //else
                        //{
                        //	pathData = "M" + (w - 1) + " 1";
                        //}
                        pathData += "L" + (right) + " " + (bottom - 1);
                        // Arrow
                        pathData += "M" + (right - halfArrowSize) + " " + (bottom - halfArrowSize - 1);
                        pathData += "L" + (right) + " " + (bottom - 1);
                        pathData += "L" + (right + halfArrowSize) + " " + (bottom - halfArrowSize - 1);

                        
                        //w += ArrowSize/2;
                    } else if ( top < bottom && left > right  ) {
                        x = right - wGap;
                        y = top;
                        
                        w = left - right + wGap*2;
                        h = bottom - top;
                        let tmpY = (toRect.y - top) - hGap;
                        //if ( fromVisible )
                        //{
                            pathData = "M" + (x + w - wGap - 1) + " " + y;
                            pathData += "L" + (x + w - 1) + " " + y;
                        //}
                        //else
                        //{
                        //	pathData = "M" + (w - 1) + " 1";
                        //}
                        pathData += "L" + (x + w - 1) + " " + (y + tmpY);
                        pathData += "L" + (x) + " " + (y + tmpY);
                        pathData += "L" + (x) + " " + (y + h - 1);
                        pathData += "L" + (x + wGap) + " " + (y + h - 1);
                        pathData += "M" + (x + wGap - halfArrowSize - 1) + " " + (y + h - halfArrowSize - 1);
                        pathData += "L" + (x + wGap) + " " + (y + h - 1);
                        pathData += "L" + (x + wGap - halfArrowSize - 1) + " " + (y + h + halfArrowSize - 1);
                        h += ArrowSize/2;
                        //console.log("1111===> top", top, "bottom", bottom, "left", left, "right", right, "path", pathData);
                    } else if ( top > bottom && left + wGap > right - wGap ) {
                        x = right - wGap;
                        y = bottom - halfArrowSize;
                        w = left - right + wGap*2;
                        h = top - bottom + halfArrowSize;
                        let tmpY = Math.ceil(toRect.height/2) + hGap +  halfArrowSize;
                        pathData = "M" + (x + w - wGap - 1) + " " + (y + h - 1);
                        pathData += "L" + (x + w - 1) + " " + (y + h - 1);
                        pathData += "L" + (x + w - 1) + " " + (y + tmpY);
                        pathData += "L" + (x) + " " + (y + tmpY);
                        pathData += "L" + (x) + " " + (y + halfArrowSize + 1);
                        pathData += "L" + (x + wGap + 1) + " " + (y + halfArrowSize + 1);
                        pathData += "M" + (x + wGap - halfArrowSize- 1) + " " + (y);
                        pathData += "L" + (x + wGap + 1) + " " + (y + halfArrowSize + 1);
                        pathData += "L" + (x + wGap - halfArrowSize - 1) + " " + (y + ArrowSize + 1);
                    } else {
                        x = left;
                        y = bottom - halfArrowSize;
                        w = right - left;
                        h = top - bottom + halfArrowSize;
                        pathData = "M" + (x) + " " + (y + h - 1);
                        pathData += "L" + (x + wGap) + " " + (y + h - 1);
                        pathData += "L" + (x + wGap) + " " + (y + halfArrowSize + 1);
                        pathData += "L" + (x + w - 1) + " " + (y + halfArrowSize + 1);
                        pathData += "M" + (x + w - halfArrowSize - 1) + " " + (y);
                        pathData += "L" + (x + w - 1) + " " + (y + halfArrowSize + 1);
                        pathData += "L" + (x + w - halfArrowSize - 1) + " " + (y + ArrowSize + 1);
                    }
                    linkItems.push({
                        path: pathData,
                        strokeWidth: 1,
                        stroke: COLORS.milestone.connection.startToStart.line
                    });
                    
                    //console.log(linkItems.length - 1, linkItems[linkItems.length - 1]);
                });
            }

        },
        getClippedCoordinate(dt) {
            return timelineMgr.getCoordinate(dt);
        },
        async setContext() {
            let canvas =  document.querySelector('#' + this.canvasId);
            this.context = this.context ? this.context : canvas.getContext('2d');
            await this.setBackground();
        },
        clear() {
            this.context.clearRect(0, 0, Number(this.width), Number(this.height));
        },
        async setBackground() {
            this.clear();
            this.context.fillStyle = this.backgroundColor;
            this.context.fillRect(0, 0, Number(this.width), Number(this.height));
            
            await this.$nextTick(async () => {
                await this.drawBackgroundImage();
            })
            
        },
        async drawBackgroundImage() {
            if (!this.loadedImage) {
                return new Promise((resolve) => { 
                    if (!this.backgroundImage) {
                        resolve();
                        return;
                    }
                    const image = new Image();
                    image.src = this.backgroundImage;
                    image.onload = () => {
                        this.context.drawImage(image, 0, 0, Number(this.width), Number(this.height));
                        this.loadedImage = image;
                        resolve();
                    }
                });
            } else {
                this.context.drawImage(this.loadedImage, 0, 0, Number(this.width), Number(this.height));
            }
        },
        getCoordinates(event) {
            let x, y;
            if ((event).touches && (event).touches.length > 0) {
                let canvas = document.querySelector('#'+this.canvasId);
                let rect = canvas.getBoundingClientRect();
                x = ((event).touches[0].clientX - rect.left);
                y = ((event).touches[0].clientY - rect.top);
            } else {
                x = (event).offsetX;
                y = (event).offsetY;
            }
            return {
                x: x,
                y: y
            };
        },
        roundRect(ctx, x, y, width, height, radius, fill, stroke) {
            if (typeof stroke === "undefined") {
                stroke = false;
            }

            if (typeof radius === "undefined") {
                radius = 0;
            }

            if (typeof radius === "number") {
                radius = {
                    topRight: radius,
                    topLeft: radius,
                    bottomRight: radius,
                    bottomLeft: radius,
                };
            } else {
                const defaultRadius = {
                    topLeft: 0,
                    topRight: 0,
                    bottomRight: 0,
                    bottomLeft: 0,
                };

                for (let side of defaultRadius) {
                    radius[side] = radius[side] || defaultRadius[side];
                }
            }

            ctx.beginPath();

            ctx.moveTo(x + radius.topLeft, y);

            ctx.lineTo(x + width - radius.topRight, y);
            ctx.quadraticCurveTo(x + width, y, x + width, y + radius.topRight);

            ctx.lineTo(x + width, y + height - radius.bottomRight);
            ctx.quadraticCurveTo(
                x + width,
                y + height,
                x + width - radius.bottomRight,
                y + height
            );

            ctx.lineTo(x + radius.bottomLeft, y + height);
            ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bottomLeft);

            ctx.lineTo(x, y + radius.topLeft);
            ctx.quadraticCurveTo(x, y, x + radius.topLeft, y);

            ctx.closePath();

            if (fill) {
                ctx.fill();
            }

            if (stroke) {
                ctx.stroke();
            }
        },
        /**
         * summary 일정을 그리기 위해 다이아몬드 모양의 path data를 구성하여 넘겨준다.
         * @param {number} x 다이아몬드 그리는 시작 위치 중 x 값
         * @param {number} y 다이아몬드 그리는 시작 위치 중 y 값
         * @param {number} sz 다이아몬드 크기
        **/
        getDiamondPath(x, y, size) {
            let arr = [];
            arr.push("L" + (x + size/2) + " " + (y));
            arr.push("L" + (x + size) + " " + (y + size/2));
            arr.push("L" + (x + size/2) + " " + (y + size));
            arr.push("L" + x + " "  + (y + size/2));
            return arr.join("");
           /*
             
           ctx.lineTo((x + size), y);
           ctx.lineTo((x + size*2), (y + size));
           ctx.lineTo((x + size), (y + size*2));
           ctx.lineTo(x, (y + size));
           */
        },
        /**
         * milestone bar형태에서 좌우측 오각형 모양의 path data를 구성하여 넘겨준다.
         * @param {number} x 오각형 그리는 시작 위치 중 x 값
         * @param {number} y 오각형 그리는 시작 위치 중 y 값
         * @param {number} sz 오각형 크기
        **/
       getDownPentagonPath(x, y, size) {
            let arr = [];
            arr.push("L" + (x + size*2) + " " + (y));
            arr.push("L" + (x + size*2) + " " + (y + size));
            arr.push("L" + (x + size) + " " + (y + size*2));
            arr.push("L" + x + " "  + (y + size));
            arr.push("L" + x + " " + y);
            return arr.join("");
            /*
            ctx.lineTo((x + size*2), y);
            ctx.lineTo((x + size*2), (y + size));
            ctx.lineTo((x + size), (y + size*2));
            ctx.lineTo(x, (y + size));
            ctx.lineTo(x, y);
            */
       },
       drawSummary(taskInfo, x, y, w, h, sItems, gradientItems, taskItemsRectMap) {
            let sf = (h/3*2)/w * 100;
            let done = taskInfo.displayInfo.done;
            //done = ((100 - sf)/100)*done;
            let d = `M${x} ${y}`;
            d += this.getDownPentagonPath(x, y, h/3);
            d += "L" + (x + w) + " " + (y);
            d += this.getDownPentagonPath(x + (w - h), y, h/3);
            d += "L" + (x + w - h/3*2) + " " + (y + h/2);
            d += "L" + (x + h/3) + " " + (y + h/2);

            taskItemsRectMap[taskInfo.id] = {
                x: x,
                y: y,
                width: w,
                height: h
            };
            sItems.push({
                path: d,
                strokeWidth: TASK_BORDER_WIDTH,
                stroke: "black",
                fill: `url(#${taskInfo.id})`,
            });
            if ( done > 0 && done < 100 ) {
                gradientItems.push({
                    id: taskInfo.id,
                    stop: [
                        {
                            offset: "0%",
                            style: "stop-color:blue; stop-opacity:1;"
                        },
                        {
                            offset: done  + "%",
                            style: "stop-color:blue; stop-opacity:1;"
                        },
                        {
                            offset: (done + 1)  + "%",
                            style: "stop-color:black; stop-opacity:1;"
                        },
                        {
                            offset: "100%",
                            style: "stop-color:black; stop-opacity:1;"
                        }
                    ]
                });
            } else if ( done <= 100 ) {
                sItems[sItems.length - 1].fill = "blue";
            } else {
                sItems[sItems.length - 1].fill = "black";
            }
       },
       drawMilestone(taskInfo, x, y, sz, sItems, taskItemsRectMap) {
            //sz = sz/2;
            let d = "M" + (x + sz/2) + " " + y;
            d += this.getDiamondPath(x, y, sz);
            d += "Z";
            sItems.push({
                path: d,
                strokeWidth: TASK_BORDER_WIDTH,
                stroke: "#c9b981ff",
                fill: "#fcc82bff",
            });
            taskItemsRectMap[taskInfo.id] = {
                x: x,
                y: y,
                width: sz,
                height: sz
            };
       },
       drawNoraml(taskInfo, x, y, w, h, sItems, progressItems, textItems, taskItemsRectMap) {
            let max = 100, min = 0,
                pos = taskInfo.displayInfo.done;
            if ( taskInfo.children && taskInfo.children.length ) {
                sItems.push({
                    x: x,
                    y: y,
                    width: w,
                    height: h,
                    style: `fill:#ffffffff; stroke:#8c98a0ff; stroke-width: ${TASK_BORDER_WIDTH};`,
                });
                progressItems.push({
                    x: x + TASK_BORDER_WIDTH,
                    y: y + TASK_BORDER_WIDTH,
                    width: (w - TASK_BORDER_WIDTH) * (pos/(max - min)),
                    height: h - TASK_BORDER_WIDTH * 2,
                    style: `fill:#ffc067ff;`,
                });
                textItems.push({
                    x: x + w/2,
                    y: y + h/2,
                    text: pos + '%',
                    style:  `font: ${FONTS.milestone.label.size}px ${FONTS.milestone.label.font}; fill: #46586eff;`
                });
                taskItemsRectMap[taskInfo.id] = {
                    x: x,
                    y: y,
                    width: w,
                    height: h
                };
            } else {
                sItems.push({
                    x: x,
                    y: y,
                    width: w,
                    height: h,
                    style: `fill:#ffffffff; stroke:#8c98a0ff; stroke-width: ${TASK_BORDER_WIDTH};`,
                });
                progressItems.push({
                    x: x + TASK_BORDER_WIDTH,
                    y: y + TASK_BORDER_WIDTH,
                    width: (w - TASK_BORDER_WIDTH) * (pos/(max - min)),
                    height: h - TASK_BORDER_WIDTH * 2,
                    style: `fill:#ffc067ff;`,
                });
                textItems.push({
                    x: x + w/2,
                    y: y + h/2,
                    text: pos + '%',
                    style:  `font: ${FONTS.milestone.label.size}px ${FONTS.milestone.label.font}; fill: #46586eff;`
                });
                taskItemsRectMap[taskInfo.id] = {
                    x: x,
                    y: y,
                    width: w,
                    height: h
                };
            }
       },
       getClippedCoordinate(dt) {
            let x = timelineMgr.getCoordinate(dt);
            return x;
       },
       
    }
};
</script>
<style lang="scss">
 .wg-diamond {
    .link {
        stroke-width: 2px;
    }

    .tooltip {
        position: absolute;
        top: 0;
        left: 0;
        display: none;
        border: 1px solid #689cac;
        padding: 5px;
        background-color: #fff;
        font-size: 14px; 
        max-width: 358px;
    }

    .circle-es {
        fill: #e83f4b;
        stroke: #ba323c;
        opacity: 1;
        stroke-width: 1;
    }

    .circle-gd {
        fill: #188c3d;
        stroke: #005c1f;
        opacity: 1;
        stroke-width: 1;
    }
 }

</style>

