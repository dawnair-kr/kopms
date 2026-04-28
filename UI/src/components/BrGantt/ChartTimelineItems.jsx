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
import ChartTimelineItemsRow from './ChartTimelineItemsRow.jsx';
import ChartTimelineItemsRowItem from './ChartTimelineItemsRowItem.jsx';
//import ChartTimelineGridRowCell from './ChartTimelineGridRowCell.jsx';
//import { Resize } from 'vuetify/directives';

export default defineComponent({
    name: "br-chart-timeline-items",
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
    mounted() {
        if ( this.$refs && this.state.get("$data.elements.chart-timeline-items") !== this.$refs.chart_timeline_items ) {
            this.state.update("$data.elements.chart-timeline-items", this.$refs.chart_timeline_items);
        }
    },
    methods: {
        update() {
            this.$forceUpdate();
        }
    },
    setup(props, { attrs }) {
        let unsubscribes = [];
        onBeforeUnmount(() => {
            unsubscribes.forEach((unsubscribe) => unsubscribe());
        });

        const baseClassStr = "br-chart-timeline-items",
            classStr = baseClassStr;

        const styleMap = reactive({});

        let debug;
        unsubscribes.push(props.state.subscribeAll(["$data.chart.dimensions.heightWithoutScrollBar", 
            "$data.chart.dimensions.width", "$data.scroll.vertical.preciseOffset"], (function() {
            const width = props.state.get("$data.chart.dimensions.width"),
                height = props.gapi.getRealChartHeight();
            styleMap.width = width + "px";
            styleMap.height = height + "px";
        }), {
            group: true
        }));
        
        unsubscribes.push(props.state.subscribe("config.debug", (t => debug = t)));

        const rows = reactive([]);

        function generateItems(row, rowData) {
            const viewItems = [];
            if (!row || !rowData) {
                return viewItems;
            }
            const itemsId = rowData.items;
            if (null === itemsId) {
                return viewItems;
            }

            const items = props.gapi.getItems(itemsId);

            items.sort(((a, b) => a.time.start - b.time.start));
            
            items.forEach(item => {
                viewItems.push({
                    row: row,
                    item: item,
                    itemData: item ? props.gapi.getItemData(item.id) : null
                });
            });
            return viewItems;
        }

        unsubscribes.push(props.state.subscribeAll(["$data.list.visibleRows", "config.list.rows", 
            //"config.components.ChartTimelineItemsRow", 
            "$data.chart.visibleItems",
            "config.chart.items", "$data.chart.items"], (function generateRows(value, eventInfo) {
            
            props.state.mute(generateRows);
            
            if ( debug ) {
                //console.log("[items.ts] Updating item & rows components.", eventInfo);
            }
            
            const visibleRowsId = props.state.get("$data.list.visibleRows") || [],
                visibleRows = props.gapi.getRows(visibleRowsId),
                rowsData = props.gapi.getRowsData();

            rows.length = 0;
            for (const row of visibleRows) {
                rows.push({
                    row: row,
                    rowData: rowsData[row.id],
                    items: generateItems(row, rowsData[row.id])
                });
            }

            //console.log(rows);
            props.state.unmute(generateRows);
            //for (const t in w) e.includes(t) || delete w[t];
            //r(p, i, (t => t ? w[t.id] : null), u, !0), n(), o.unmute(t)
        }), {
            group: true,
            bulkValue: false
        }));
        /*
        i((() => {
            p.forEach((t => t.destroy()))
        }));
        */
        //console.log("ChartTimelineItems", rows);

        const itemSlots = reactive({});

        
        
        function useRender(renderFunc) {
            const vm = getCurrentInstance();
            //console.log("ChartTimelineItems", vm);
            vm.render = renderFunc;
        }

        provide("rows", rows);

        //useRender(render);
        
        
        const slots = useSlots();
        //console.log("itemSlots", itemSlots);
        const renderProps = reactive({
            selectAreaStyleMap: {}
        });

        unsubscribes.push(props.state.subscribe("config.slots.br-chart-timeline-items-row-item", value => {
            for ( const slotName in value ) {
                //console.log("qqq", slotName, value[slotName])
                if ( Array.isArray(value[slotName]) && value[slotName].length ) {
                    //console.log(slotName, value[slotName])
                    const slotfuncs = [];
                    value[slotName].forEach(slotFunc => {
                        slotfuncs.push(slotFunc({
                            gapi: props.gapi,
                            state: props.state
                        }));
                    });

                    itemSlots[slotName] = (data, vNode) => {
                        let tmpVNode;
                        slotfuncs.forEach((slotf, i) => {
                            tmpVNode = slotf(data, i == 0 ? vNode : tmpVNode);
                        });
                        return tmpVNode;
                    };
                }
            }
        }));

        return {
            classStr,
            styleMap,
            rows,
            slots,
            renderProps,
            itemSlots,
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
            <>
            { typeof this.slots.outer == "function" ? 
              this.slots.outer({
                    renderProps: this.renderProps,
                }, (<div ref="chart_timeline_items" class={this.classStr} style={this.styleMap}>
                {
                    this.rows.map(rowInfo => (
                        <ChartTimelineItemsRow key={rowInfo.rowData.id} rowInfo={rowInfo} state={this.state} gapi={this.gapi} >
                            {{
                                default: () =>
                                    rowInfo.items.map(itemInfo => (
                                        <ChartTimelineItemsRowItem key={itemInfo.row.id + "---" + itemInfo.item.id} 
                                            itemInfo={itemInfo} state={this.state} gapi={this.gapi} >
                                                {{
                                                    ...this.itemSlots
                                                }}
                                        </ChartTimelineItemsRowItem>
                                    ))
                            }}
                        </ChartTimelineItemsRow>
                    ))
                }
                </div>)) :
                <div ref="chart_timeline_items" class={this.classStr} style={this.styleMap}>
                {
                    this.rows.map(rowInfo => (
                        <ChartTimelineItemsRow key={rowInfo.rowData.id} rowInfo={rowInfo} state={this.state} gapi={this.gapi} >
                            {{
                                default: () => 
                                    rowInfo.items.map(itemInfo => (
                                        <ChartTimelineItemsRowItem key={itemInfo.row.id + "---" + itemInfo.item.id} 
                                            itemInfo={itemInfo} state={this.state} gapi={this.gapi} >
                                                {{
                                                    ...this.itemSlots
                                                }}
                                        </ChartTimelineItemsRowItem>
                                    ))
                            }}                         
                        </ChartTimelineItemsRow>
                    ))
                }
                </div>
            }
            </>
        );
    }
});