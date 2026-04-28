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
import ChartTimelineGridRow from './ChartTimelineGridRow.jsx';
import ChartTimelineGridRowCell from './ChartTimelineGridRowCell.jsx';
//import { Resize } from 'vuetify/directives';

export default defineComponent({
    name: "br-chart-time-line-grid",
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
    setup(props, { attrs }) {
        let unsubscribes = [];
        onBeforeUnmount(() => {
            unsubscribes.forEach((unsubscribe) => unsubscribe());
        });

        const baseClassStr = "br-chart-timeline-grid",
            classStr = baseClassStr;

        // cell 생성시 Create 추가
        let cellOnCreate;
        unsubscribes.push(props.state.subscribe("config.chart.grid.cell.onCreate", (value => cellOnCreate = value)));
        
        const rows = reactive([]),
            gridRows = {},
            map = new Map,
            styleMap = reactive({});
    
        function getCellId(dt) {
            let month = dt.month() + 1;
            month < 10 && (month = "0" + month);
            let day = dt.date();
            day < 10 && (day = "0" + day);
            let hour = dt.hour();
            hour < 10 && (hour = "0" + hour);
            let minute = dt.minute();
            minute < 10 && (minute = "0" + minute);
            let second = dt.second();
            second < 10 && (second = "0" + second);
            return `${dt.year()}-${month}-${day}T${hour}-${minute}-${second}`;
        }

        unsubscribes.push(props.state.subscribeAll(["$data.scroll.vertical.preciseOffset", 
            "$data.chart.dimensions.width", "$data.chart.dimensions.heightWithoutScrollBar"], 
        (function() {
            const w = props.state.get("$data.chart.dimensions.width"),
                h = props.gapi.getRealChartHeight();
            styleMap.height = Math.round(h) + "px", styleMap.width = w + "px"
        }), {
            group: true
        }));

        let curVisibleRowsInfo = "",
            curLeftGlobal = 0,
            curRightGlobal = 0,
            curRowsHeightInfo = "",
            datesLen = 0,
            curRowsWidthInfo = "",
            horizontalHandlePosPx = 0,
            verticalHandlePosPx = 0;
    
        function getGridRows() {
            const gridRows = props.gapi.getGridRows();
            rows.length = 0;
            for ( const row of gridRows ) {
                rows.push(row);
            }
            //console.log("getGridRows", rows);
        }

        unsubscribes.push(props.state.subscribeAll(["$data.list.rowsHeight", "$data.list.visibleRows", 
            "$data.list.visibleRowsHeight", "$data.chart.time.levels", 
            "$data.scroll", "config.list.rows;", "config.list.rows.*;"], 
        (function(value, eventInfo) {
            const time = props.state.get("$data.chart.time"),
                dates = props.state.get(`$data.chart.time.levels.${time.level}`),
                level = time.levels[time.level];

            if (!level || !level.length) return;

            const rowsWidthInfo = time.levels[time.level].map((t => t.currentView.width)).join(",");
            
            if (!dates || 0 === dates.length) {
                props.state.update("$data.chart.grid", {
                    rows: {},
                    cells: {}
                });
                return null;
            }
            const rowsData = props.gapi.getRowsData(),
                visibleRows = props.state.get("$data.list.visibleRows"),
                rowsHeightInfo = visibleRows.map((rowId => rowsData[rowId].outerHeight)).join("|"),
                visibleRowsInfo = visibleRows.join("|"),
                dataScroll = props.state.get("$data.scroll");

            if (visibleRowsInfo === curVisibleRowsInfo && curLeftGlobal === time.leftGlobal && 
                curRightGlobal === time.rightGlobal && rowsHeightInfo === curRowsHeightInfo && 
                datesLen === dates.length && curRowsWidthInfo === rowsWidthInfo && dataScroll.horizontal.handlePosPx === horizontalHandlePosPx && 
                dataScroll.vertical.handlePosPx === verticalHandlePosPx) {
                
                return "$data.chart.time.levels" === eventInfo.path.listener ? getGridRows() : null;
            }

            horizontalHandlePosPx = dataScroll.horizontal.handlePosPx, 
            verticalHandlePosPx = dataScroll.vertical.handlePosPx, 
            curLeftGlobal = time.leftGlobal, 
            curRightGlobal = time.rightGlobal, 
            curRowsWidthInfo = rowsWidthInfo, 
            curRowsHeightInfo = rowsHeightInfo;

            let curTop = 0;

            if (visibleRowsInfo !== curVisibleRowsInfo) {
                for (const gridRowId in gridRows) delete gridRows[gridRowId];
            } else if (datesLen !== dates.length) {
                for (const gridRowId in gridRows) gridRows[gridRowId].cells.length = 0;
            }
                
            datesLen = dates.length;
            const rows = props.gapi.getAllRows(),
                gridCells = props.state.get("$data.chart.grid.cells");

            for (const cellId in gridCells) delete gridCells[cellId];

            for (const rowId of visibleRows) {
                const row = rows[rowId],
                    rowData = rowsData[rowId];

                if (!row || !rowData) continue;

                let cells, gridRow;
                if ( visibleRowsInfo !== curVisibleRowsInfo ) {
                    cells = [];
                } else {
                    cells = gridRows[rowId].cells;
                    cells.length = 0;
                }

                for (const dt of dates) {
                    let dtId;

                    if ( map.has(dt.leftGlobal) ) {
                        dtId = map.get(dt.leftGlobal);
                    } else {
                        dtId = getCellId(dt.leftGlobalDate);
                        map.set(dt.leftGlobal, dtId);
                    }
                    const cellId = row.id + "-" + dtId;
                    let gridCell;
                    if (gridCells[cellId]) {
                        gridCell = gridCells[cellId];
                        gridCell.id = cellId;
                        gridCell.time = dt; 
                        gridCell.row = row;
                        gridCell.rowData = rowData;
                        gridCell.top = curTop;
                    } else {
                        gridCell = {
                            id: cellId,
                            time: dt, 
                            row: row, 
                            rowData: rowData, 
                            top: curTop, 
                        };
                    }
                    
                    for (const cellCreate of cellOnCreate) {
                        gridCell.contnet = cellCreate(gridCell);
                    }

                    gridCells[gridCell.id] = gridCell; 
                    cells.push(gridCell.id);
                }
                if ( gridRows[rowId] ) {
                    gridRow = gridRows[rowId];
                    gridRow.row = row;
                    gridRow.rowData = rowData;
                    gridRow.cells = cells;
                    gridRow.top = curTop;
                } else {
                    gridRow = {
                        row: row,
                        rowData: rowData,
                        cells: cells,
                        top: curTop
                    };
                } 
                gridRows[rowId] = gridRow;
                curTop += rowData.outerHeight;
            }
            curVisibleRowsInfo = visibleRowsInfo;
            props.state.update("$data.chart.grid", {
                rows: gridRows,
                cells: gridCells
            });
        }), {
            group: true,
            bulkValue: false
        }));
        
        unsubscribes.push(props.state.subscribe("$data.chart.grid", getGridRows, {
            group: true
        }));

        return {
            classStr,
            styleMap,
            rows,
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
        */
        return (
            <div class={this.classStr} style={this.styleMap}>
                {
                    this.rows.map(row => (
                        <ChartTimelineGridRow key={row.rowData.id} row={row} state={this.state} gapi={this.gapi}  >
                            {{
                                default: () => {
                                    return row.cells.map(cellId => (
                                        <ChartTimelineGridRowCell  key={row.rowData.id + "-" + cellId} cellId={cellId} state={this.state} gapi={this.gapi} />
                                    ));
                                },
                            }}
                        </ChartTimelineGridRow>
                    ))
                }
            </div>
        );
    }
});