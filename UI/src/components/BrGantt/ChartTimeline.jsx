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
import ChartTimelineGrid from './ChartTimelineGrid.jsx';
import ChartTimelineItems from './ChartTimelineItems.jsx';
import ListToggle from './ListToggle.jsx';
//import { Selection } from './Selection.jsx';
//import { ItemMovement } from './ItemMovement.js';
//import { ItemResizing  } from './ItemResizing.jsx';
//import { DependencyLines } from './DependencyLines.jsx'

export default defineComponent({
    name: "br-chart-time-line",
    //directives: { Resize },
    props: {
        state: State,
        gapi: ganttApi,
    },
    data() {
        return {
            //listColumns: [],
            //styleMap: {},
        };
    },
    methods: {
    },
    mounted() {
        if ( this.state.get("$data.elements.chart-timeline") !== this.$el ) {
            this.state.update("$data.elements.chart-timeline", this.$el);
        }
    },
    setup(props, { attrs }) {
        let unsubscribes = [];
        onBeforeUnmount(() => {
            unsubscribes.forEach((unsubscribe) => unsubscribe());
            //selection.destroy();
            //itemMovement.destroy();
            //itemResizing.destroy();
            //dependencyLines.destroy();
        });

        const baseClassStr = "br-chart-timeline",
            classStr = baseClassStr,
            innerClassStr = baseClassStr + "-inner";

        let showToggle = ref(null);
        unsubscribes.push(props.state.subscribe("config.list.toggle.display", (value => showToggle = value)));

        const styleMap = reactive({}),
            innerStyleMap = reactive({});

        const ganttSlot = reactive([]);
        const lines = reactive([]);
        
        let additionalSpace, headerHeight;
        unsubscribes.push(props.state.subscribe("config.additionalSpace", (value => {
            additionalSpace = value;
        }))), 
        
        unsubscribes.push(props.state.subscribe("config.headerHeight", (value => {
            headerHeight = value;
        }))), 
        
        unsubscribes.push(props.state.subscribeAll(["$data.chart.dimensions.heightWithoutScrollBar", 
            "$data.scroll.vertical.offset", 
            "$data.chart.dimensions.width", "$data.list.visibleRowsHeight", 
            "$data.chart.time.dates.day", "config.headerHeight", 
            "config.additionalSpace"], (function() {
            const w = props.state.get("$data.chart.dimensions.width"),
                h = Math.round(props.gapi.getRealChartHeight(true));
                styleMap.height = props.state.get("config.innerHeight") + "px";

            styleMap["--height"] = styleMap.height;
            styleMap.top = additionalSpace.top + headerHeight + "px";

            if ( w  ) {
                styleMap.width = w + "px";
                styleMap["--width"] = w + "px";
            } else {
                styleMap.width = "0px";
                styleMap["--width"] = "0px";
            }
            innerStyleMap.height = h + "px";
            innerStyleMap.width = w ? w + "px" : "0px";
            const offset = props.state.get("$data.scroll.vertical.preciseOffset") || 0;
            innerStyleMap.transform = `translateY(${Math.round(offset)}px)`;

            /*
            const slotArr = props.state.get("config.slots.br-chart-timeline-items.outer");
            ganttSlot.length = 0;
            slotArr.forEach(slotFunc => {
                ganttSlot.push(slotFunc());    
            });
            */
            //resetReactive(lines, props.state.get("config.plugin.DependencyLines.lines"));
        }), {
            group: true,
            bulkValue: false
        }));

        function reactiveClear(r) {
            if ( r.length == null ) {
                for ( const p in r ) {
                    delete r[p];
                }
            } else {
                r.length = 0;
            }
        }

        function resetReactive(r, value) {
            if ( r.length == null ) {
                for ( const p in r ) {
                    delete r[p];
                }
                Object.assign(r, value);
            } else {
                r.length = 0;
                for ( const a of value ) r.push(a);
            }
        }

        const dependencyLinesStyleMap = reactive({});

        const chartTimelineItemsOuterSlots = reactive({});
        
        unsubscribes.push(props.state.subscribe("config.slots.br-chart-timeline-items.outer", value => {
            if ( Array.isArray(value) && value.length ) {
                const outers = [];
                value.forEach(slotFunc => {
                    outers.push(slotFunc({ 
                        state: props.state,
                        gapi: props.gapi
                    }));    
                });
                
                chartTimelineItemsOuterSlots.outer = (data, vNode) => {
                    let tmpVNode;
                    outers.forEach((outer, i) => {
                        tmpVNode = outer(data, i == 0 ? vNode : tmpVNode);
                    });
                    return tmpVNode;
                };
            }
        }));

        /*
        unsubscribes.push(props.state.subscribe("config.plugin.DependencyLines.lines", value => {
            //console.log("aaaa", value);
            ganttSlot.line = null;
            ganttSlot.points = null;
            value.forEach(slotFunc => {
                ganttSlot.push(slotFunc);    
            });
            ganttSlot.forEach(slotFunc => {
                if ( typeof slotFunc == "function") {
                    slotFunc(dependencyLines);
                }
            });
        }));
        */

        /*
        let C = [];
        unsubscribes.push(o.subscribe("config.actions.chart-timeline", (t => {
            C = t
        }))), C.push(class extends s {
            constructor(t) {
                super();
                o.get("$data.elements.chart-timeline") !== t && o.update("$data.elements.chart-timeline", t)
            }
        });
        */

        return {
            classStr,
            innerClassStr,
            styleMap,
            innerStyleMap,
            showToggle,
            unsubscribes,
            //selection,
            //lines,
            //getDependencyLinesSlot,
            chartTimelineItemsOuterSlots,
        };
    },
    render() {
        //console.log("render ChartTimeline", this.dependencyLines);
        // ChartCalendar
        // ChartTimeline
        // ScrollBarVertical
        // ScrollBarHorizontal
        /*
        { this.calculatedZoomMode ? null : (
            <ScrollBar type="horizontal" state={this.state} gapi={this.gapi} />
        )}

        <ChartTimelineGrid state={this.state} gapi={this.gapi} />
                    { this.dependencyLines.lines }
                    <ChartTimelineItems state={this.state} gapi={this.gapi} >
                        {{
                            ...this.chartTimelineItemsOuterSlots
                        }}
                    </ChartTimelineItems>
                    { this.showToggle ? <ListToggle state={this.state} gapi={this.gapi} /> : null }
                    {this.selectArea.visible ? (
                        <div class={this.selectArea.classStr} style={this.selectArea.style}></div>
                    ) : null}
                    { this.dependencyLines.points }
        */

       

        return (
            <div class={this.classStr} style={this.styleMap}>
                <div class={this.innerClassStr} style={this.innerStyleMap}>
                    <ChartTimelineGrid state={this.state} gapi={this.gapi} />
                    <ChartTimelineItems state={this.state} gapi={this.gapi} >
                        {{
                            ...this.chartTimelineItemsOuterSlots
                        }}
                    </ChartTimelineItems>
                    { this.showToggle ? <ListToggle state={this.state} gapi={this.gapi} /> : null }
                </div>
            </div>
        );
    }
});