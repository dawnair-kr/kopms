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
import lodash from 'lodash';

//import ChartCalendarDate from './ChartCalendarDate.jsx';
//import { Resize } from 'vuetify/directives';

export default defineComponent({
    name: "br-chart-time-line-grid-row-cell",
    //directives: { Resize },
    props: {
        state: State,
        gapi: ganttApi,
        cellId: String,
    },
    data() {
        return {
            //listColumns: [],
            //styleMap: {},
        };
    },
    mounted() {
        
    },
    methods: {
    },
    setup(props, { attrs }) {
        let unsubscribes = [];
        onBeforeUnmount(() => {
            unsubscribes.forEach((unsubscribe) => unsubscribe());
        });

        const baseClassStr = "br-chart-timeline-grid-row-cell";
        
        const classArr = reactive([baseClassStr]);
        const styleMap = reactive({
            width: "",
            height: ""
        });

        const actions = props.gapi.getActions(baseClassStr);

        const actionsCall = (data = {}, reactiveProps = {}) => {
            actions.forEach(action => {
                
                    if ( Object.prototype.hasOwnProperty.call(action, "prototype") ) {
                        //console.log("aaaaaaa111111", data, action);
                        //new action(data, reactiveProps);
                        action(data, reactiveProps);
                    } else if ( typeof action == "function" ) {
                        //console.log("aaaaaaa", data, action);
                        action(data, reactiveProps);
                    }
                    
                });
        };
        //console.log("actions", actions);
        /*
        if ( typeof actions == "function" ) {
            unsubscribes.push(props.state.subscribe("config.plugin.Selection.selecting.chart-timeline-grid-row-cell", value => {
                console.log(value);
                if ( value && value.includes(props.cellId) ) {

                    if ( !classArr.includes("br-selecting") ) {
                        classArr.push("br-selecting");
                    }
                } else {
                    if ( classArr.includes("br-selecting") ) {
                        lodash.remove(classArr, v => v == "br-selecting");
                    }
                }
            }));
        }
        */

        unsubscribes.push(props.state.subscribe(`$data.chart.grid.cells.${props.cellId}`, cell => {
            //const cell = props.gapi.getGridCell(props.cellId);

            if ( cell && cell.time && cell.time.current ) {
                classArr.push("current");
            }

            actionsCall({cell: cell}, {
                classArr: classArr,
                styleMap: styleMap
            });
            
            if ( cell && cell.row ) {
                let time, currentView;
                
                time = cell.time;
                if ( time != null ) {
                    currentView = time.currentView;
                }

                if ( currentView != null ) {
                    styleMap.width = currentView.width + "px";
                } else {
                    styleMap.width = "0px";
                }

                if ( cell.row.style ) {
                    for (const t in cell.row.style) {
                        styleMap[t] = cell.row.style[t];
                    }
                }
            }
        }));

        return {
            classArr,
            styleMap,
            //actions,
        };
    },
    render() {
        //console.log("render ChartCalendar", this.dates);
        // ChartCalendar
        // ChartTimeline
        // ScrollBarVertical
        // ScrollBarHorizontal
        /*
        { this.calculatedZoomMode ? null : (
            <ScrollBar type="horizontal" state={this.state} gapi={this.gapi} />
        )}
        { this.cell.id }
        */
        return (
            <div class={this.classArr} style={this.styleMap} data-type={"chart-timeline-grid-row-cell"} data-brid={this.cellId}>
                
            </div>
        );
    }
});