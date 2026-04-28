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
    defineAsyncComponent,
} from 'vue';
import { ganttApi } from '../BrGanttApi.jsx';
import State from 'deep-state-observer';
import ListColumnRow from './ListColumnRow.jsx';
import ListColumnHeader from './ListColumnHeader.jsx';

export default defineComponent({
    name: "br-list-column",
    //directives: { Resize },
    props: {
        state: State,
        column: Object,
        gapi: ganttApi,
    },
    data() {
        return {
            //visibleRows: []
        };
    },
    setup(props, { attrs }) {
        let unsubscribes = [];
        onBeforeUnmount(() => {
            unsubscribes.forEach((unsubscribe) => unsubscribe());
        });

        let curWidth, colWidth;

        const widthStyleMap = reactive({
                width: "",
                "--width": ""
            }),
            containerStyleMap = reactive({
                height: ""
            }),
            offsetStyleMap = reactive({
                "margin-top": "0px"
            });

        let additionalSpace = props.state.get("config.additionalSpace");

        unsubscribes.push(props.state.subscribeAll(["config.list.columns.percent", 
            "config.list.columns.resizer.width", 
            "$data.chart.dimensions.width", 
            "$data.chart.dimensions.heightWithoutScrollBar", 
            "$data.list.width", 
            "$data.list.visibleRowsHeight", "config.additionalSpace.top"
        ], () => {
            if ( !props.column ) return;
            const list = props.state.get("config.list");
            if (!list.columns.data[props.column.id]) return;
            colWidth = list.columns.data[props.column.id].width * list.columns.percent * .01, 
            curWidth = colWidth;
            const chartHeight = Math.round(props.gapi.getRealChartHeight());
            widthStyleMap.width = curWidth + "px", 
            widthStyleMap["--width"] = curWidth + "px", 
            offsetStyleMap.height = chartHeight + "px", 
            containerStyleMap.top = props.state.get("config.headerHeight") + additionalSpace.top + "px"

        }, {
            group: true
        }));

        unsubscribes.push(props.state.subscribe(`config.list.columns.data.${props.column.id}.width`, value => {
            widthStyleMap.width = value + "px", 
            widthStyleMap["--width"] = value + "px";
        }));

        const that = getCurrentInstance();
        const columnRows = reactive([]);

        const genVisibleRows = () => {
            if (!props.column) return;
            props.state.mute(genVisibleRows);
            const visibleRowsId = props.state.get("$data.list.visibleRows") || [],
                rows = props.gapi.getRows(visibleRowsId),
                rowsData = props.gapi.getRowsData();

            //resetReactive(rRowsData, rowsData);
            //console.log("rows", rows);
            columnRows.length = 0;
            for (const row of rows) {
                /*
                if ( H[row.id] == null ) {
                    H[row.id] = {};
                }
                */
                const columnInfo = {};
                columnInfo.column = props.column;
                columnInfo.row = row;
                columnInfo.rowData = rowsData[row.id];
                columnInfo.width = curWidth;
                columnRows.push(columnInfo);
                //console.log("row", row, o);
            }
            //console.log("listColumn", columnRows);
            /*
            for (const t in H) {
                if ( !visibleRows.includes(t) ) {
                    delete H[t];
                }
            }
            */
            //d(N, rows, (t => t && H[t.id]), f, !0), L.change(e), 
            props.state.unmute(genVisibleRows);
        };

        unsubscribes.push(props.state.subscribeAll(["$data.list.visibleRows", 
            "$data.list.visibleRowsHeight", 
            "$data.list.rows", 
            "config.list.rows", 
            "config.chart.items.*.height", 
            "config.chart.items.*.rowId", 
            "config.chart.items.*.time"], genVisibleRows, {
            group: true,
            bulkValue: false
        }));

        unsubscribes.push(props.state.subscribe("$data.scroll.vertical.preciseOffset", (t => {
            offsetStyleMap.transform = `translateY(${Math.round(t)||0}px)`;
        })));

        unsubscribes.push(props.state.subscribe("config.additionalSpace", (t => {
            additionalSpace = t;
        })));
        
        const classStr = "br-list-column",
            rowsClass = classStr + "-rows",
            rowsOffsetClass = classStr + "-rows-offset";

        //console.log("listColumn", props.column);

        const classArr = [classStr, classStr + "--" + props.column.id],
            rowsClassArr = [rowsClass, rowsClass + "--" + props.column.id],
            rowsOffsetClassArr = [rowsOffsetClass, rowsOffsetClass + "--" + props.column.id];

        return {
            classArr,
            rowsClassArr,
            rowsOffsetClassArr,
            widthStyleMap,
            containerStyleMap,
            offsetStyleMap,
            columnRows,
        };
    },
    render() {
        //console.log("render listColumn", this.columnRows);
        return (
            <div class={this.classArr} style={this.widthStyleMap}>
                <ListColumnHeader state={this.state} gapi={this.gapi} column={this.column} rowData/>
                <div class={this.rowsClassArr} style={this.containerStyleMap}>
                    <div class={this.rowsOffsetClassArr} style={this.offsetStyleMap}>
                        { this.columnRows.map(columnRow => (
                                <ListColumnRow key={columnRow.row.id} options={columnRow} state={this.state} gapi={this.gapi} />
                            )
                        ) }
                    </div>
                </div>
            </div>
        );
    }
});

