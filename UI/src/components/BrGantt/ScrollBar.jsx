import {
    defineComponent,
    shallowRef,
    toRefs,
    watch,
    computed,
    inject,
    onMounted,
    onBeforeUnmount,
    nextTick,
    watchEffect,
    getCurrentInstance,
    unref,
    ref,
    reactive,
} from 'vue';
import State from 'deep-state-observer';
import { ganttApi } from '../BrGanttApi.jsx';

export default defineComponent({
    name: "br-scroll-bar",
    //directives: { Resize },
    props: {
        state: State,
        gapi: ganttApi,
        type: String,
    },
    data() {
        return {
            //listColumns: [],
            //styleMap: {},
        };
    },
    methods: {
        dataChanged() {
            const dataScroll = this.state.get(`$data.scroll.${this.type}`),
                time = this.state.get("$data.chart.time");
            if (!time.allDates.length) return;
            const allDates = time.allDates[time.level],
                dataIndex = dataScroll.dataIndex;

            this.lastDataIndex = dataIndex;

            if ("horizontal" === this.type && allDates && allDates.length) {
                this.currentPos = dataScroll.handlePosPx;
                this.styleMapInner[this.moveProp] = this.currentPos + "px";

            } else if ("vertical" === this.type) {
                if (!this.state.get("$data.list.rowsWithParentsExpanded").length) return;
                this.currentPos = dataScroll.handlePosPx;
                this.styleMapInner[this.moveProp] = this.currentPos + "px";
            }
        },
        limitPosition(pos) {
            return Math.max(Math.min(pos, this.state.get(`$data.scroll.${this.type}.maxHandlePosPx`)), 0);
        },
        pointerDown(e) {
            e.stopPropagation();
            e.preventDefault();
            this.gapi.muteMethod("calculateRowsHeight");
            document.body.classList.add(this.bodyClassName);
            requestAnimationFrame((() => {
                this.moving = true;
                this.initialPointerPos = "horizontal" === this.type ? e.screenX : e.screenY;
                this.initialHandlePos = this.state.get(`$data.scroll.${this.type}.handlePosPx`);
                this.outerClassActive = " " + this.outerClass + "--active";
                this.innerClassActive = " " + this.outerClass + "-inner--active";
            }));
        },
        pointerUp(e) {
            if ( this.moving ) {
                this.gapi.unmuteMethod("calculateRowsHeight");
                e.preventDefault();
                e.stopPropagation();
                document.body.classList.remove(this.bodyClassName);
            }
            this.moving = false;
            this.outerClassActive = "";
            this.innerClassActive = "";
        },
        pointerMoveRead(e) {
            this.currentPointerPos = "horizontal" === this.type ? e.screenX : e.screenY;
        },
        pointerMoveWrite() {
            const configScroll = this.state.get(`config.scroll.${this.type}`),
                dataScroll = this.state.get(`$data.scroll.${this.type}`),
                cPos = this.currentPointerPos - this.initialPointerPos;
            
            this.currentPos = this.limitPosition(this.initialHandlePos + cPos);
            
            const time = this.state.get("$data.chart.time");
            if (!time.allDates.length) return;

            const allDates = time.allDates[time.level],
                dataIdxOffset = this.currentPos / dataScroll.maxHandlePosPx * dataScroll.absoluteSizeWithoutLastPage,
                dataIdxOffset2 = Math.round(dataIdxOffset);

            if ("horizontal" === this.type) {
                let dt, dataIndex = 0,
                    offset = 0,
                    curPx = 0;
                
                for (let len = allDates.length; dataIndex < len ; dataIndex++) {
                    dt = allDates[dataIndex];
                    curPx = Math.round(dt.rightPx);
                    if  ( !(curPx > dataIdxOffset2) ) {
                        break;
                    }
                }
                
                if ( configScroll.precise && curPx !== dataIdxOffset2 ) {
                    offset = dt.leftPx - dataIdxOffset;
                }
                if ( !dataIndex ) {
                    dataIndex = 0;
                }
                if ( !dt ) {
                    dt = allDates[0];
                }

                this.dataIndex = dataIndex;
                this.lastDate = allDates[dataIndex];
                if ( configScroll.byPixels ) {
                    //console.log("dataIdxOffset", dataIdxOffset);
                    this.gapi.setScrollLeft(dataIdxOffset);
                } else {
                    this.gapi.setScrollLeft(dt.id, offset);
                }
                this.lastDataIndex = dataIndex;
                this.lastOffset = offset;

            } else {
                const { dataIndex, row, rowData } = this.gapi.getRowInfoFromTop(dataIdxOffset);

                let offset = 0;

                if ( configScroll.precise && rowData.position.top !== dataIdxOffset) {
                    offset = rowData.position.top - dataIdxOffset;
                }
                this.dataIndex = dataIndex;
                this.previousRowId = row.id; 

                if ( configScroll.byPixels ) {
                    this.gapi.setScrollTop(dataIdxOffset);
                } else {
                    this.gapi.setScrollTop(dataIndex, offset);
                }
                this.lastDataIndex = dataIndex;
                this.lastOffset = offset;
            }
        },
        pointerMove(e) {
            if ( this.moving ) {
                e.stopPropagation();
                e.preventDefault();
                requestAnimationFrame((() => {
                    this.pointerMoveRead(e);
                }));
                requestAnimationFrame((() => {
                    this.pointerMoveWrite();
                }));
            }
        }
    },
    mounted() {
        document.addEventListener("pointermove", this.pointerMove);
        document.addEventListener("pointerup", this.pointerUp);
        this.unsubscribes.push(this.state.subscribe(`$data.scroll.${this.type}`, this.dataChanged));
    },
    beforeUnmount() {
        this.unsubscribes.forEach((unsubscribe) => unsubscribe());
        document.removeEventListener("pointermove", this.pointerMove);
        document.removeEventListener("pointerup", this.pointerUp)
    },
    setup(props, { attrs }) {
        let unsubscribes = [];
        
        
        let moving = false,
            initialPointerPos = 0, 
            initialHandlePos = 0, 
            currentPos = 0, 
            currentPointerPos = 0, 
            lastDataIndex = 0, 
            lastOffset = 0, 
            dataIndex = 0, 
            previousRowId = "";

        const bodyClassName = props.state.get("config.scroll.bodyClassName");

        const baseClass = "br-scroll-bar";
        let outerClass = baseClass, innerClass = baseClass + "-inner",
            outerClassActive = ref(""),
            innerClassActive = ref("");
        
        const barSize = "horizontal" === props.type ? "height" : "width",
            barLen = "height" === barSize ? "width" : "height",
            moveProp = "horizontal" === props.type ? "left" : "top",
            styleMapOuter = reactive({}),
            styleMapInner = reactive({}),
            tmpInfo = {
                maxPosPx: 0,
                innerHandleSize: 0,
                scrollSize: 0,
                dataId: ""
            };
        unsubscribes.push(props.state.subscribeAll("horizontal" === props.type ? [`config.scroll.${props.type}`, `$data.scroll.${props.type}`] : 
            [`config.scroll.${props.type}`, `$data.scroll.${props.type}`, 
             "$data.chart.dimensions.heightWithoutScrollBar", "$data.list.rowsWithParentsExpanded", 
             "$data.list.rowsHeight", "config.additionalSpace"], (function(value, eventInfo) {

            const configScroll = props.state.get(`config.scroll.${props.type}`),
                dataScroll = props.state.get(`$data.scroll.${props.type}`),
                scrollSize = props.gapi.getScrollSize(props.type),
                innerHandleSize = dataScroll.innerHandleSize,
                maxHandlePosPx = dataScroll.maxHandlePosPx,
                dataId = dataScroll.dataId,
                additionalSpace = props.state.get("config.additionalSpace"),
                time = props.state.get("$data.chart.time");

            if (!time.allDates || !time.allDates.length || !time.allDates[time.level]) return;
            
            dataScroll.visible ? styleMapOuter.display = "flex" : styleMapOuter.display = "none";
            styleMapOuter[barSize] = configScroll.width + "px";
            styleMapOuter[barLen] = scrollSize + "px"
            "vertical" === props.type && (styleMapOuter.top = props.state.get("config.headerHeight") + additionalSpace.top + "px");

            if (!dataScroll.lastPageSize || !dataScroll.absoluteSize || !scrollSize) return;

            styleMapInner[barSize] = "100%";
            styleMapInner[barLen] = innerHandleSize + "px";

            if ( !("set-scroll-top" === eventInfo.options.data || "set-scroll-left" === eventInfo.options.data) && 
                function(maxHandlePosPx, innerHandleSize, sz, dataId) {
                    const changed = tmpInfo.maxPosPx !== maxHandlePosPx || tmpInfo.innerHandleSize !== innerHandleSize || 
                        tmpInfo.scrollSize !== sz || tmpInfo.dataId !== dataId;
                    if ( changed ) {
                        tmpInfo.maxPosPx = maxHandlePosPx;
                        tmpInfo.innerHandleSize = innerHandleSize;
                        tmpInfo.scrollSize = sz;
                        tmpInfo.dataId = dataId;
                    }
                    return changed;
                }(maxHandlePosPx, innerHandleSize, scrollSize, dataId) ) {

                if ( "horizontal" === props.type ) {
                    configScroll.byPixels ? props.gapi.setScrollLeft(dataScroll.absolutePosPx) : props.gapi.setScrollLeft(dataScroll.dataIndex, dataScroll.preciseOffset)
                } else {
                    configScroll.byPixels ? props.gapi.setScrollTop(dataScroll.absolutePosPx) : props.gapi.setScrollTop(dataScroll.dataIndex, dataScroll.preciseOffset)
                }
                //d()
            }
        }), {
            group: true,
            bulkValue: false
        }));

        return {
            styleMapInner,
            styleMapOuter,
            outerClass,
            innerClass,
            outerClassActive,
            innerClassActive,
            moveProp,
            bodyClassName,
            moving,
            initialPointerPos, 
            initialHandlePos, 
            currentPos, 
            currentPointerPos, 
            lastDataIndex, 
            lastOffset, 
            dataIndex, 
            previousRowId,
            unsubscribes,
        };
    },
    render() {
        //console.log("scorll render", this.type, this);
        return (
            <div class={this.outerClass + " " + this.outerClass + "--" + this.type + this.outerClassActive} style={this.styleMapOuter}>
                <div class={this.innerClass + " " + this.innerClass + "--" + this.type + this.innerClassActive}
                  style={this.styleMapInner}
                  onpointerdown={this.pointerDown}
                ></div>
            </div>
        );
    }
});