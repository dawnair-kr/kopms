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
//import ChartTimelineGridRowCell from './ChartTimelineGridRowCell.jsx';

export default defineComponent({
    name: "br-chart-time-line-grid-row",
    props: {
        state: State,
        gapi: ganttApi,
        row: {
            type: Object,
            default: () => {
                return {};
            }
        },
    },
    data() {
        return {
            //listColumns: [],
            //styleMap: {},
        };
    },
    methods: {
    },
    setup(props, { attrs, slots }) {
        let unsubscribes = [];
        onBeforeUnmount(() => {
            unsubscribes.forEach((unsubscribe) => unsubscribe());
        });

        const baseClassStr = "br-chart-timeline-grid-row",
            classStr = baseClassStr;

        /*
        let f;
        i(o.subscribe("config.components.ChartTimelineGridRowCell", (t => f = t)));
        */


        const styleMap = reactive({
                height: props.row.row.height + "px"
            }),
            cells = reactive([]);
        /*
        unsubscribes.push(props.state.subscribeAll([`$data.chart.grid.rows.${props.row.rowData.id}`, "$data.scroll.horizontal"], ({value}) => {
            const gridRow = props.state.get(`$data.chart.grid.rows.${props.row.rowData.id}`);
            const cellsData = props.gapi.getGridCells(gridRow.cells);
            cells.length = 0;
            for ( const cell of cellsData ) {
                cells.push(cell);
            }
            console.log("cells", cells);
            styleMap.height = gridRow.rowData.outerHeight + "px";

            if ( gridRow.row.style ) {
                for (const t in gridRow.row.style) styleMap[t] = gridRow.row.style[t];
            }    
        },{
            group: true
        }));
        */

        const cellsData = props.gapi.getGridCells(props.row.cells);
        cells.length = 0;
        for ( const cell of cellsData ) {
            cells.push(cell);
        }

        styleMap.height = props.row.rowData.outerHeight + "px";

        if ( props.row.row.style ) {
            for (const t in props.row.row.style) styleMap[t] = props.row.row.style[t];
        }
        
        
        return {
            classStr,
            styleMap,
            cells,
            slots,
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
        { this.cells.map(cell => (
                    <ChartTimelineGridRowCell  key={this.row.rowData.id + "-" + cell.id} cell={cell} state={this.state} gapi={this.gapi} />
                ))}
        */
        return (
            <div id={"row-" + this.row.rowData.id} class={this.classStr} style={this.styleMap}>
                {this.slots.default()}
            </div>
        );
    }
});