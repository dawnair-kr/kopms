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
} from 'vue';
import State from 'deep-state-observer';
import { ganttApi } from '../BrGanttApi.jsx';
import lodash from 'lodash';

//import ChartCalendarDate from './ChartCalendarDate.jsx';
//import { Resize } from 'vuetify/directives';

export default defineComponent({
    name: "br-chart-timeline-items-row-item",
    //directives: { Resize },
    props: {
        state: State,
        gapi: ganttApi,
        itemInfo: {
            type: Object,
            default: () => {
                return {};
            }
        },
        resizeR: Object
    },
    data() {
        return {
            //listColumns: [],
            //styleMap: {},
        };
    },
    mounted() {
        let changed = false,
            elements = this.state.get("$data.elements.chart-timeline-items-row-items");

        if ( elements == null ) {
            elements = [];
            changed = true;
        }
        if ( !elements.includes(this) ) {
            elements.push(this);
            changed = true;
        }

        if ( changed ) {
            this.state.update("$data.elements.chart-timeline-items-row-items", elements, {
                only: null
            });
        }

        this.renderProps.element = this.$el;
        this.actions({
            itemInfo: this.itemInfo
        }, this.renderProps);
        /*
        this.unsubscribes.push(this.state.subscribeAll(["$data.chart.time", 
            "$data.chart.visibleItems",
            `$data.chart.items.${this.item.item.id}`,
            ], () => {
                this.change();
                this.$forceUpdate();
            }));
        */
    },
    beforeUnmount() {
        //console.log("beforeUnmount", this.tmpEl, this.item.item.id);
        this.state.update(`$data.chart.items.${this.itemInfo.item.id}`, value => {
            value.detached = true;
            return value;
        });
        //const that = this;
        
        this.state.update("$data.elements.chart-timeline-items-row-items", 
        value => {
            return value.filter(v => v !== this);
        }, {
            only: null
        });
        
        this.unsubscribes.forEach((unsubscribe) => unsubscribe());
    },
    methods: {
        getContent(labelClassName) {
            if ( this.itemInfo.item ) {
                let content = null;
                if ( this.slots && typeof this.slots.content == "function" ) {
                    content = this.slots.content({ itemInfo: this.itemInfo }, 
                            (
                                <>
                                {
                                    "function" == typeof this.itemInfo.item.label ?
                                    this.itemInfo.item.label({ item: this.itemInfo.item}) :
                                    this.itemInfo.item.label
                                }
                                </> 
                            )
                        );
                } else {
                    content = (
                        <>
                        {
                            "function" == typeof this.itemInfo.item.label ?
                            this.itemInfo.item.label({ item: this.itemInfo.item}) :
                            this.itemInfo.item.label
                        }
                        </> 
                    );
                }

                return (
                    <div class={labelClassName}>
                        { content }
                    </div>
                );
                
            }
            return null;
        }
    },
    setup(props, options) {
        //console.log(options);

        let unsubscribes = [];
        let selectUnsubscribes = [];
        /*
        onBeforeUnmount(() => {
            unsubscribes.forEach((unsubscribe) => unsubscribe());
            selectChangeUnsubscribes();
        });
        */


        const baseClassStr = "br-chart-timeline-items-row-item";
        const classArr = reactive([baseClassStr]);

        const labelClassName = baseClassStr + "-label";

        const styleMap = reactive({});
        const leftStyleMap = reactive({
            display: "none"
        });
        const rightStyleMap = reactive({
            display: "none"
        });

        const renderProps = reactive({
            styleMap: {},
            classArr: [baseClassStr],
            labelClassName: labelClassName,
            leftStyleMap: {
                display: "none"
            },
            rightStyleMap: {
                display: "none"
            },
            resizeStyleMap: {
                left: {},
                right: {}
            },
            leftSpace: 0,
            rightSpace: 0,
            detached: false,
        });

        let leftSpace = 0,
            rightSpace = 0;
        
        unsubscribes.push(props.state.subscribe("config.chart.spacing", (value => {
            if ( "number" == typeof value ) {
                rightSpace = value;
                leftSpace = 0;
                renderProps.rightSpace = value;
                renderProps.leftSpace = 0;
            } else {
                if ( "number" == typeof value.left ) {
                    leftSpace = value.left;
                    renderProps.leftSpace = value.left;
                }
                if ( "number" == typeof value.right ) {
                    rightSpace = value.right;
                    renderProps.rightSpace = value.right;
                }
            }
        })));

        let left = 0,
            width = 0;
            
        let cutIcons = {}, detached = false;
        const changedResize = reactive({});

        const slots = useSlots();
        //console.log("ChartTimeLineItemsRowItem slots", slots);
        
        const rowsInfo = inject("rows");

        const actions = props.gapi.getActions(baseClassStr);

        const actionsCall = (data = {}, reactiveProps = {}) => {
            actions.forEach(action => {
                if ( Object.prototype.hasOwnProperty.call(action, "prototype") ) {

                } else if ( typeof action == "function" ) {
                    action(data, reactiveProps);
                }
                
            });
        };

        const curItemData = reactive({});

        //console.log("ChartTimelineItemsRowItems setup", props.itemInfo);

        function change(itemInfo) {
            const time = props.state.get("$data.chart.time");

            
            Object.assign(curItemData, itemInfo.itemData);
            
            //console.log("change", itemInfo.item.id, itemInfo);

            if (!itemInfo.item || !itemInfo.itemData) {
                detached = true;
                itemInfo.itemData.detached = detached;
                curItemData.detached = detached;
                renderProps.detached = detached;
                //selectChangeUnsubscribes();
                actionsCall({itemInfo}, renderProps);
                return null;
            }

            //console.log("aaa", itemInfo.item.id, props.itemInfo.item.rowId, itemInfo.item.rowId);
            if  ( itemInfo.item.rowId ) {

                if (!props.state.get("$data.chart.visibleItems").includes(itemInfo.item.id)) {
                    detached = true;
                    itemInfo.itemData.detached = detached;
                    curItemData.detached = detached;
                    renderProps.detached = detached;
                    actionsCall({itemInfo}, renderProps);
                    //selectChangeUnsubscribes();
                    return null;
                }
            }

            /*
            if ( itemInfo.item.rowId != props.itemInfo.row.id ) {
                console.log("change Row", itemInfo.item.id, "old Row", props.itemInfo.row.id, "new Row", itemInfo.item.rowId);
                detached = true;
                itemInfo.itemData.detached = detached;
                curItemData.detached = detached;
                renderProps.detached = detached;
                const rowInfoIdx = lodash.findIndex(rowsInfo, o => {
                    return o.row.id == itemInfo.item.rowId;
                });
                if ( rowInfoIdx > -1 ) {
                    const itemsId = rowsInfo[rowInfoIdx].rowData.items;
                    console.log(rowsInfo[rowInfoIdx].row.id, itemsId);
                }
                //itemsPerRow.
                return;
            }
            */
            const itemData = itemInfo.itemData;
            
            left = itemData.position.actualLeft + leftSpace;
            width = itemData.actualWidth - rightSpace - leftSpace;
            //console.log(props.item.item, width, time);
            //if (props.item.item.time.end < time.leftGlobal || props.item.item.time.start > time.rightGlobal || width <= 0) {
            if (itemInfo.item.time.end < time.leftGlobal || itemInfo.item.time.start > time.rightGlobal || width <= 0) {
                detached = true;
                itemData.detached = detached;
                curItemData.detached = detached;
                renderProps.detached = detached;
                actionsCall({itemInfo}, renderProps);
                //selectChangeUnsubscribes();
                return null;
            }
            //y = $;
            if ( itemInfo.item.time.start < time.leftGlobal ) {
                leftStyleMap.display = "flex";
                renderProps.leftStyleMap.display = "flex";
                let idx = classArr.indexOf(baseClassStr + "--left-cut");
                if ( idx == -1 ) {
                    classArr.push(baseClassStr + "--left-cut");
                    renderProps.classArr.push(baseClassStr + "--left-cut");
                }
            } else {
                leftStyleMap.display = "none";
                renderProps.leftStyleMap.display = "none";
                let idx = classArr.indexOf(baseClassStr + "--left-cut");
                if ( idx > -1 ) {
                    classArr.splice(idx, 1);
                    renderProps.classArr.splice(idx, 1);
                }
            }
            
            if ( itemInfo.item.time.end > time.rightGlobal ) {
                rightStyleMap.display = "flex";
                renderProps.rightStyleMap.display = "flex";
                let idx = classArr.indexOf(baseClassStr + "--right-cut");
                if ( idx == -1 ) {
                    classArr.push(baseClassStr + "--right-cut");
                    renderProps.classArr.push(baseClassStr + "--right-cut");
                }
            } else {
                rightStyleMap.display = "none";
                renderProps.rightStyleMap.display = "none";
                let idx = classArr.indexOf(baseClassStr + "--right-cut");
                if ( idx > -1 ) {
                    classArr.splice(idx, 1);
                    renderProps.classArr.splice(idx, 1);
                }
            }
                
            if (itemInfo.item.classNames) {
                if (Array.isArray(itemInfo.item.classNames) && itemInfo.item.classNames.length) {
                    itemInfo.item.classNames.forEach(c => {
                        let idx = classArr.indexOf(c);
                        if ( idx == -1 ) {
                            classArr.push(c);
                            renderProps.classArr.push(c);
                        }       
                    });
                    //classArr.push(...props.item.item.classNames);
                } else if ("function" == typeof props.item.item.classNames) {
                    const a = itemInfo.item.classNames({
                        item: itemInfo.item,
                    });
                    if ( Array.isArray(a) ) {
                        a.forEach(c => {
                            let idx = classArr.indexOf(c);
                            if ( idx == -1 ) {
                                classArr.push(c);
                                renderProps.classArr.push(c);
                            }       
                        });
                        //classArr.push(...a);
                    }
                }
            }
            const isInView = props.gapi.isItemInViewport(itemInfo.item, time.leftGlobal, time.rightGlobal);
            detached = !isInView;
            itemData.detached = detached;
            curItemData.detached = detached;
            renderProps.detached = detached;
            if ( isInView ) {
                //console.log(props.item.item.id, isInView, styleMap);
                styleMap.width = width + "px";
                styleMap.left = left + "px";
                styleMap.top = itemData.position.actualRowTop + "px";
                styleMap.height = itemData.actualHeight + "px";
                
                renderProps.styleMap.width = width + "px";
                renderProps.styleMap.left = left + "px";
                renderProps.styleMap.top = itemData.position.actualRowTop + "px";
                renderProps.styleMap.height = itemData.actualHeight + "px";
                
                //console.log(itemData.id, itemData, selectChange);
                //selectUnsubscribes.push(props.state.subscribe(`$data.chart.items.${props.item.itemData.id}`, selectChange));
                
            }

            actionsCall({itemInfo}, renderProps);
            if ( detached ) {
                //selectChangeUnsubscribes();
            }
            
            if ( itemInfo.item && itemInfo.item.style ) {
                for (const t in itemInfo.item.style) {
                    styleMap[t] = itemInfo.item.style[t];
                    renderProps.styleMap[t] = itemInfo.item.style[t];
                }
            }
        }

        unsubscribes.push(props.state.subscribe("config.chart.item.cutIcons", (value => {
            cutIcons.left = value.left;
            cutIcons.right = value.right;
        })));

        unsubscribes.push(props.state.subscribeAll(["$data.chart.time", 
            "$data.chart.visibleItems",
            ], () => {
                change(props.itemInfo);
        }));
        
        /**/
        unsubscribes.push(props.state.subscribe(`$data.chart.items.${props.itemInfo.item.id}`,
                    //row 정보 필요
                (value) => {
                change(props.itemInfo);
        }));
        
        let template;
        unsubscribes.push(props.state.subscribe("config.templates.br-chart-timeline-items-row-item", value => {
            template = value;
        }));

        const resizeStyleMap = reactive({
            left: {},
            right: {}
        });

        return {
            classArr,
            labelClassName,
            styleMap,
            leftStyleMap,
            rightStyleMap,
            actions: actionsCall,
            cutIcons,
            changedResize,
            change,
            //selectChange,
            unsubscribes,
            slots,
            template,
            resizeStyleMap,
            curItemData,
            renderProps,
        };
    },
    render() {
        //console.log("ChartTimelineItemsRowItem Render", this.itemInfo.item.id, this.itemInfo);

        return ( this.renderProps.detached ? null :
            typeof this.template == "function" ? 
                        this.template({
                            className: this.classArr, 
                            labelClassName: this.labelClassName, 
                            actions: this.actions, 
                            styleMap: this.styleMap,
                            cutterLeft: (<div 
                                class={this.classArr[0] + "-cut " + this.classArr[0] + "--left-cut-icon"}
                                style={this.leftStyleMap}
                            >
                                { this.cutIcons.left }
                            </div>), 
                            cutterRight: (<div 
                                class={this.classArr[0] + "-cut " + this.classArr[0] + "--right-cut-icon"}
                                style={this.rightStyleMap}
                            >
                                { this.cutIcons.right }
                            </div>),
                            getContent: (labelClassName) => {
                                return typeof this.slots.inner == "function" ?
                                this.slots.inner({
                                    itemInfo: this.itemInfo, 
                                    renderProps: this.renderProps
                                }, this.getContent(labelClassName)) :
                                this.getContent();
                            },
                            props: {
                                gapi: this.gapi,
                                state: this.state,
                                itemInfo: this.itemInfo,
                                renderProps: this.renderProps
                            },
                            slotInner: this.slots.inner
                        }) :
                    <div class={this.renderProps.classArr} style={this.renderProps.styleMap} data-brid={this.itemInfo.item.id}>
                        { typeof this.slots.inner == "function" ?
                            this.slots.inner({
                                itemInfo: this.itemInfo, 
                                renderProps: this.renderProps
                            }, this.getContent(this.labelClassName)) :
                            this.getContent()
                         }
                    </div>
        );
    }

});