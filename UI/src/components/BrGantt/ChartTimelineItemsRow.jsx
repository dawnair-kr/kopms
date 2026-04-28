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
    useSlots,
    provide,
} from 'vue';
import State from 'deep-state-observer';
import { ganttApi } from '../BrGanttApi.jsx';
import ChartTimelineItemsRowItem from './ChartTimelineItemsRowItem.jsx';
import lodash from 'lodash';

export default defineComponent({
    name: "br-chart-timeline-items-row",
    props: {
        state: State,
        gapi: ganttApi,
        rowInfo: {
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
    setup(props, { attrs }) {
        let unsubscribes = [];
        onBeforeUnmount(() => {
            unsubscribes.forEach((unsubscribe) => unsubscribe());
        });

        const baseClassStr = "br-chart-timeline-items-row",
            classStr = baseClassStr;

        const itemsPerRow = reactive([]),
            styleMap = reactive({
                width: "",
                height: ""
            });

        function setStyleMap(rowData = props.rowInfo.rowData, a = null) {
            const dataChart = props.state.get("$data.chart");
            styleMap.width = dataChart.dimensions.width + "px";
            if ( props.rowInfo ) {
                styleMap.height = rowData.outerHeight + "px";
                styleMap["--row-height"] = rowData.outerHeight + "px";
            } else {
                styleMap.height = "";
                styleMap["--row-height"] = "";
            } 
        }
        
        const rows = inject("rows");

        function generateItems(row, rowData) {
            if (!row || !rowData) {
                return v = true;
            }
            const itemsId = rowData.items;
            if (null === itemsId) {
                return v = true;
            }

            const items = props.gapi.getItems(itemsId);

            items.sort(((a, b) => a.time.start - b.time.start));
            
            itemsPerRow.length = 0;
            items.forEach(item => {
                itemsPerRow.push({
                    row: row,
                    item: item,
                    itemData: item ? props.gapi.getItemData(item.id) : null
                });
            });

            const rowInfoIdx = lodash.findIndex(rows, o => {
                return o.row.id == props.rowInfo.row.id;
            });

            if ( rowInfoIdx > -1 ) {
                rows[rowInfoIdx].items = items;
            }
        }
        
        setStyleMap(props.rowInfo.rowData);
        //generateItems(props.row.row, props.row.rowData);

        unsubscribes.push(props.state.subscribe("$data.chart.dimensions.width", () => {
            //generateItems(props.rowInfo.row, props.rowInfo.rowData);
            setStyleMap(props.rowInfo.rowData);
        }));

        /*
        
        unsubscribes.push(props.state.subscribe(`$data.list.rows.${props.rowInfo.rowData.id}`, value => {
            generateItems(props.rowInfo.row, props.rowInfo.rowData);
        }));
        */
        /*
        i((() => {
            p.forEach((t => t.destroy()))
        }));
        const P = a.getActions(u);
        P.push(Q);
        */
        

        //console.log("ChartTimelineItemsRow", useSlots());
        return {
            classStr,
            styleMap,
            slots: useSlots(),
            //itemsPerRow,
            //itemSlots,
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

                {this.slots.default()}

                //{this.slots.default()}

        this.itemsPerRow.map(itemInfo => (
                        <ChartTimelineItemsRowItem key={itemInfo.row.id + "---" + itemInfo.item.id} 
                            itemInfo={itemInfo} state={this.state} gapi={this.gapi} >
                                {{
                                    ...this.itemSlots
                                }}
                        </ChartTimelineItemsRowItem>
                    ))
        */
       //console.log("ssssss", this.slots)
        return (
            <div class={this.classStr} style={this.styleMap}>
                {
                    this.slots.default()                 
                }
            </div>
        );
    }
});