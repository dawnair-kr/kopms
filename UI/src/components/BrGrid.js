import { ComponentBase, gh, getProps, isExecute, vueDefineComponent } from '@syncfusion/ej2-vue-base';
import { isNullOrUndefined, getValue } from '@syncfusion/ej2-base';
import { isUndefined } from '@syncfusion/ej2-base';
import { Grid } from './BrGrid/grid/base/grid.js';
import { StackedColumnsDirective, StackedColumnDirective, StackedColumnsPlugin, StackedColumnPlugin } from '@syncfusion/ej2-vue-grids/src/grid/stacked-column.directive'
import { ColumnsDirective, ColumnDirective, ColumnsPlugin, ColumnPlugin } from '@syncfusion/ej2-vue-grids/src/grid/columns.directive'
import { AggregateColumnsDirective, AggregateColumnDirective, AggregateColumnsPlugin, AggregateColumnPlugin } from '@syncfusion/ej2-vue-grids/src/grid/aggregate-columns.directive'
import { AggregatesDirective, AggregateDirective, AggregatesPlugin, AggregatePlugin } from '@syncfusion/ej2-vue-grids/src/grid/aggregates.directive'
import lodash from 'lodash';
import State from 'deep-state-observer'; 
import { computed, ref, watch as vueWatch, reactive, getCurrentInstance, toRaw, shallowRef, toRefs, onMounted } from 'vue';

export const properties = ['isLazyUpdate', 'plugins', 'aggregates', 'allowExcelExport', 'allowFiltering', 'allowGrouping', 'allowKeyboard', 'allowMultiSorting', 'allowPaging', 'allowPdfExport', 'allowReordering', 'allowResizing', 'allowRowDragAndDrop', 'allowSelection', 'allowSorting', 'allowTextWrap', 'autoFit', 'childGrid', 'clipMode', 'columnChooserSettings', 'columnMenuItems', 'columnQueryMode', 'columns', 'contextMenuItems', 'cssClass', 'currencyCode', 'currentAction', 'currentViewData', 'dataSource', 'detailTemplate', 'editSettings', 'ej2StatePersistenceVersion', 'emptyRecordTemplate', 'enableAdaptiveUI', 'enableAltRow', 'enableAutoFill', 'enableColumnVirtualization', 'enableHeaderFocus', 'enableHover', 'enableHtmlSanitizer', 'enableImmutableMode', 'enableInfiniteScrolling', 'enablePersistence', 'enableRtl', 'enableStickyHeader', 'enableVirtualMaskRow', 'enableVirtualization', 'exportGrids', 'filterSettings', 'frozenColumns', 'frozenRows', 'gridLines', 'groupSettings', 'height', 'hierarchyPrintMode', 'infiniteScrollSettings', 'loadingIndicator', 'locale', 'pageSettings', 'pagerTemplate', 'parentDetails', 'printMode', 'query', 'queryString', 'resizeSettings', 'rowDropSettings', 'rowHeight', 'rowRenderingMode', 'rowTemplate', 'searchSettings', 'selectedRowIndex', 'selectionSettings', 'showColumnChooser', 'showColumnMenu', 'showHider', 'sortSettings', 'textWrapSettings', 'toolbar', 'toolbarTemplate', 'width', 'actionBegin', 'actionComplete', 'actionFailure', 'batchAdd', 'batchCancel', 'batchDelete', 'beforeAutoFill', 'beforeBatchAdd', 'beforeBatchDelete', 'beforeBatchSave', 'beforeCopy', 'beforeDataBound', 'beforeExcelExport', 'beforeOpenAdaptiveDialog', 'beforeOpenColumnChooser', 'beforePaste', 'beforePdfExport', 'beforePrint', 'beginEdit', 'cellDeselected', 'cellDeselecting', 'cellEdit', 'cellSave', 'cellSaved', 'cellSelected', 'cellSelecting', 'checkBoxChange', 'columnDataStateChange', 'columnDeselected', 'columnDeselecting', 'columnDrag', 'columnDragStart', 'columnDrop', 'columnMenuClick', 'columnMenuOpen', 'columnSelected', 'columnSelecting', 'commandClick', 'contextMenuClick', 'contextMenuOpen', 'created', 'dataBound', 'dataSourceChanged', 'dataStateChange', 'destroyed', 'detailDataBound', 'excelAggregateQueryCellInfo', 'excelExportComplete', 'excelHeaderQueryCellInfo', 'excelQueryCellInfo', 'exportDetailDataBound', 'exportDetailTemplate', 'exportGroupCaption', 'headerCellInfo', 'keyPressed', 'lazyLoadGroupCollapse', 'lazyLoadGroupExpand', 'load', 'pdfAggregateQueryCellInfo', 'pdfExportComplete', 'pdfHeaderQueryCellInfo', 'pdfQueryCellInfo', 'printComplete', 'queryCellInfo', 'recordClick', 'recordDoubleClick', 'resizeStart', 'resizeStop', 'resizing', 'rowDataBound', 'rowDeselected', 'rowDeselecting', 'rowDrag', 'rowDragStart', 'rowDragStartHelper', 'rowDrop', 'rowSelected', 'rowSelecting', 'toolbarClick'];
export const modelProps = ['dataSource'];

export const testProp = getProps({props: properties});
export const props = testProp[0], watch = testProp[1], emitProbs = Object.keys(watch);


emitProbs.push('modelchanged', 'update:modelValue');
for (let props of modelProps) { emitProbs.push('update:'+props) }


//console.log("watch dataSource", watch['dataSource']);
//console.log("watch", watch);
// grid Watch 가 이상하다. deep 옵션을 주면 해당 property 뿐만 아니라 property 전부 watch한다.

/*
const orgWatchHandler = watch['dataSource'];
watch['dataSource'] = {
    handler(newVal) {
        console.log("watch dataSource", this);
        this.ej2Instances.dataSource = newVal;
        if ( this.dataBind ) {
            this.dataBind();
        }
    },
    deep: true,
    onTrack(e) {
        console.log("dataSource Watch onTrack", e)
    },
};
console.log("watch dataSource", watch['dataSource']);
*/
// 전부 property들에 대한  two way binding 변수

props.modelValue = {};
props.isDirty = {};
emitProbs.push('update:isDirty');

 /**
 * edit template inject 처리
 * 행 edit template 처리시 
 * data params 를 reactive 형태로 전달 
 */


/**
 * `ejs-grid` represents the VueJS Grid Component.
 * ```vue
 * <ejs-grid :dataSource='data' allowPaging='true' allowSorting='true'></ejs-grid>
 * ```
 */
export let GridComponent =  vueDefineComponent({
    name: 'GridComponent',
    mixins: [ComponentBase],
    props: props,
    watch: watch,
    emits: emitProbs,
    model: { event: 'modelchanged' },
    provide() { return { custom: this.custom } },
    data() {
        return {
            //ej2Instances: new Grid({}),
            propKeys: properties,
            models: modelProps,
            hasChildDirective: true,
            hasInjectedModules: true,
            tagMapper: {"e-columns":{"e-column":{"e-stacked-columns":"e-stacked-column"}},"e-aggregates":{"e-aggregate":{"e-columns":"e-column"}}},
            tagNameMapper: {"e-stacked-columns":"e-columns"},
            isVue3: !isExecute,
            templateCollection: {},
            // add line by hspark
            RowDataForTemplate: {},
            //innerDataSource: [],
        }
    },
    created() {
        this.ej2Instances._trigger = this.ej2Instances.trigger;
        this.ej2Instances.trigger = this.trigger;
        this.bindProperties();
        this.ej2Instances._setProperties = this.ej2Instances.setProperties;
        this.ej2Instances.setProperties = this.setProperties;
        this.ej2Instances.clearTemplate = this.clearTemplate;
        this.updated = this.updated;
    },
    mounted() {
        /*
        this.dsState = new State({
            dataSource: this.ej2Instances.dataSource
        });
        this.subscribers = [];

        this.subscribers.push(
            this.dsState.subscribe("dataSource", (value, eventInfo) => {
              console.log("dataSource subscribe", value, eventInfo);
              //this.ej2Instances.fields.dataSource = value;
            })
        );
        */
    },
    beforeUnmount() {
        //this.subscribers.forEach((unsubscribe) => unsubscribe());
    },
    setup(props, context) {
        const vm = getCurrentInstance();
        const ej2Instances =  new Grid({});

        const { modelValue } = toRefs(props);
        /*
        let modelValueChanged = true;
        let resetModelValueChanged = true;
        let noEmitUpdate = false;
        */

        const innerDataSource = ref([]);

        if ( Array.isArray(props.dataSource) ) {
            ej2Instances.dataSource = props.dataSource;
            //innerDataSource.value = lodash.clone(toRaw(props.dataSource));
            innerDataSource.value = ej2Instances.dataSource;
        } else if ( Array.isArray(toRaw(props.modelValue)) ) {
            //ej2Instances.dataSource = lodash.clone(toRaw(props.modelValue));
            //ej2Instances.dataSource = reactive(lodash.cloneDeep(toRaw(props.modelValue)));
            ej2Instances.dataSource = props.modelValue;
            //innerDataSource.value = lodash.clone(toRaw(ej2Instances.dataSource));
            innerDataSource.value = ej2Instances.dataSource;
        } else {
            innerDataSource.value = lodash.clone(ej2Instances.dataSource);
        }

        
        /**
        * prop modelValue가 변경될 때 진입
        * prop modelValue가 변수 reference가 변경되는 경우만 invoke됨
        * 즉 변수가 array이므로 array item 이 update, insert, delete되는 경우는 invoke 되지 않음
        * invoke되면 grid 내부 dataSource가 새로 갱신되고, 내부 state(selected 상태), render가 초기화 된다.
        */

        //console.log("props.dataSource", props.dataSource)
        
        const orgDataSource = ref(lodash.clone(ej2Instances.dataSource));
        const modifiedDataSource = reactive({
            delete: [],
            add: [],
            update: [],
            lastKey: -1,
        });

        const isDirty = computed(() => {
            if ( modifiedDataSource.add.length || modifiedDataSource.delete.length || modifiedDataSource.update.length ) {
                return true;
            } else {
                return false;
            }
        });

        vueWatch(modelValue,
            (value, oldValue) => {
                /*
                console.log("watch modelValue modelValueChanged", modelValueChanged, 
                "model", lodash.cloneDeep(toRaw(value)), 
                "inner", lodash.cloneDeep(toRaw(innerDataSource.value)),
                "ej2Instances.dataSource", lodash.cloneDeep(toRaw(ej2Instances.dataSource)),
                "ej2Instances", ej2Instances
                );
                */
                
                /*
                if ( value === ej2Instances.dataSource ) return;

                console.log("watch modelValue modelValueChanged", "model", lodash.cloneDeep(toRaw(value)), 
                    value !== ej2Instances.dataSource,
                    "inner", lodash.cloneDeep(toRaw(innerDataSource.value)),
                    "ej2Instances.dataSource", lodash.cloneDeep(toRaw(ej2Instances.dataSource)),
                    "toRaw", toRaw(value)
                    ); 
                */
                if ( toRaw(value) == null ) {
                    modifiedDataSource.delete.length = 0;
                    modifiedDataSource.add.length = 0;
                    modifiedDataSource.update.length = 0;
                    modifiedDataSource.lastKey = -1;
                    ej2Instances.dataSource = reactive([]);    
                    innerDataSource.value = [];
                    orgDataSource.value = [];
                    //orgDataSource.value = lodash.clone(ej2Instances.dataSource);

                    
                } else {
                    modifiedDataSource.delete.length = 0;
                    modifiedDataSource.add.length = 0;
                    modifiedDataSource.update.length = 0;
                    modifiedDataSource.lastKey = -1;
                    innerDataSource.value = lodash.clone(toRaw(value));
                    //innerDataSource.value = value;
                    ej2Instances.dataSource = value;
                    //console.log("grid aaaa", ej2Instances.dataSource, ej2Instances);
                    
                    //orgDataSource.value = lodash.clone(ej2Instances.dataSource);
                    orgDataSource.value = lodash.clone(ej2Instances.dataSource);

                }

                /*
                if ( value !== ej2Instances.dataSource ) {
                    console.log("watch modelValue modelValueChanged", lodash.clone(value));
                    if ( toRaw(value) == null ) {
                        ej2Instances.dataSource = [];    
                        innerDataSource.value = [];
                    } else {
                        innerDataSource.value = toRaw(value);
                        ej2Instances.dataSource = value;
                    }
                    checkCallback = false;
                    //vm?.ctx.dsState.update("dataSource", value);

                } else {
                    // 변경된 것만 처리 필요
                    // 위의 것이 실행된 후에 다시 들어온다.
                    if ( checkCallback ) {
                        console.log("watch modelValue 하위 값들 변경", lodash.clone(value));
                    }

                    console.log("watch modelValue not Changed", lodash.clone(value));
                    
                }
                */
                
                
                /*
                if ( Array.isArray(value) ) { 
                    if ( isChangeData(toRaw(value), toRaw(ej2Instances.dataSource)) ) {
                        // 실질 Changed modelValue Property 
                        ej2Instances.dataSource = value;
                        noEmitUpdate = true;
                        innerDataSource.value = toRaw(value);
                    } else if ( isChangeData(toRaw(innerDataSource), toRaw(ej2Instances.dataSource)) ) {
                        ej2Instances.refresh();
                        noEmitUpdate = true;
                        innerDataSource.value = lodash.cloneDeep(toRaw(ej2Instances.dataSource));
                    }
                }
                */
            },
            {
                //deep: true,
                //onTrack(e) {
                    //console.log("modelValue Watch onTrack", e)
                //},
                //once: true
            }
        );

        const br_trigger = (eventName, eventProp, successHandler) => {
            //console.log("br_trigger", eventName, "eventProp", eventProp, 
            //    "successHandler", successHandler, "innerDataSource", innerDataSource.value, "ej2Instances.dataSource", toRaw(ej2Instances.dataSource));
            //console.log(eventName, "eventProp", lodash.clone(eventProp));
                    
            if ( eventName == "rowSelected" ) {
                /*
                console.log("rowSelected", "innerDataSource", lodash.cloneDeep(innerDataSource),
                        "dataSource", lodash.cloneDeep(ej2Instances.dataSource),
                        "rows", lodash.clone(eventProp.rows),"data", lodash.clone(eventProp.data), 
                        "rowIndex", eventProp.rowIndex
                    );
                */
                //if ( innerDataSource.value && innerDataSource.value[eventProp.rowIndex] ) {
                if ( eventProp.data ) {
                    //innerDataSource.value[eventProp.rowIndex]._isSelected = true;
                    eventProp.data._isSelected = true;
                    //vm?.emit("update:modelValue", innerDataSource);
                }
            } else if ( eventName == "rowDeselected" ) {
                /*
                console.log("rowDeselected", "innerDataSource", lodash.cloneDeep(innerDataSource),
                        "dataSource", lodash.cloneDeep(ej2Instances.dataSource),
                        "rows", lodash.clone(eventProp.rows),"data", lodash.clone(eventProp.data), 
                        "rowIndex", eventProp.rowIndex
                    );
                */
                //if ( innerDataSource.value && innerDataSource.value[eventProp.rowIndex] ) {
                if ( eventProp.data ) {
                    //innerDataSource.value[eventProp.rowIndex]._isSelected = false;
                    eventProp.data._isSelected = false;
                    //vm?.emit("update:modelValue", innerDataSource);
                }
            } else if ( eventName == "beginEdit" ) {
                //console.log("br_trigger1111", eventName, "eventProp", lodash.cloneDeep(eventProp));
                if ( eventProp.requestType == "beginEdit" ) {
                }
            } else if ( eventName == "rowDrop" ) {
                if ( eventProp.dropIndex != eventProp.fromIndex ) {
                    vm?.emit("update:modelValue", innerDataSource);
                    //console.log(innerDataSource.value)
                    vm?.emit("update:isDirty", isDirty.value);
                }
            } else if ( eventName == "actionComplete" ) {
                /*
                console.log("br_trigger", eventName, "eventProp", lodash.cloneDeep(eventProp),
                    lodash.clone(innerDataSource),
                    "dataSource", lodash.clone(ej2Instances.dataSource)
                );
                */
                /**
                 * requestType: save
                 * action: add, edit
                 * 
                 * requestType: delete
                 */
                //orgDataSource, modifiedDataSource

                if ( eventProp.requestType == "delete" ) {
                    /*
                    if ( innerDataSource.value[innerDataSource.value.length - 1] == null ) {
                        innerDataSource.value.length = innerDataSource.value.length - 1;
                    }
                    console.log("br_trigger", eventName, "eventProp", lodash.cloneDeep(eventProp),
                        lodash.clone(innerDataSource.value),
                        "dataSource", lodash.clone(ej2Instances.dataSource)
                    );
                    */
                    let delRowInfo = [];
                    lodash.forEach(eventProp.data, (rec, idx) => {
                        if ( typeof rec._key == "number" ) {
                            delRowInfo.push({
                                key: rec._key,
                                data: rec,
                            });
                        }
                    });
                    /*
                    console.log("delete", "innerDataSource", lodash.cloneDeep(innerDataSource),
                        "dataSource", lodash.cloneDeep(ej2Instances.dataSource),
                        "eventProp", lodash.clone(eventProp),"data", toRaw(eventProp.data), 
                        "rowIndex", eventProp.rowIndex, "ej2Instances", ej2Instances,
                        "delRowInfo", delRowInfo
                    );
                    */
                    lodash.forEach(delRowInfo, (rowInfo) => {
                        let fIdx = lodash.findIndex(modifiedDataSource.add, o => {
                            return rowInfo.key == o._key;
                        });
                        if ( fIdx == -1 ) {
                            modifiedDataSource.delete.push(rowInfo.data);
                        } else {
                            fIdx = lodash.findIndex(modifiedDataSource.add, o => {
                                return rowInfo.key == o._key;
                            });
                            modifiedDataSource.add.splice(fIdx, 1);
                        }
                    });
                    
                    vm?.emit("update:isDirty", isDirty.value);
                } else if ( eventProp.action == "add" && eventProp.requestType == "save" ) {
                    /*
                    console.log("add", "innerDataSource", lodash.cloneDeep(innerDataSource),
                        "dataSource", lodash.cloneDeep(ej2Instances.dataSource),
                        "eventProp", lodash.clone(eventProp), "data", toRaw(eventProp.data), 
                        "rowIndex", eventProp.rowIndex, "ej2Instances", ej2Instances
                    );
                    */
                    //innerDataSource.value = lodash.cloneDeep(toRaw(ej2Instances.dataSource));
                    //vm?.emit("update:modelValue", innerDataSource.value);
                    let key = eventProp.data._key;
                    let fidx = lodash.findIndex(modifiedDataSource.add, o => {
                        return key == o._key;
                    });

                    if ( fidx == -1 ) {
                        modifiedDataSource.add.push(eventProp.data);
                    }

                    vm?.emit("update:isDirty", isDirty.value);
                } else if ( eventProp.action == "edit" && eventProp.requestType == "save" ) {
                    
                    
                    innerDataSource.value[eventProp.rowIndex] = eventProp.data;

                    let key = eventProp.data._key;
                    let updateRec = lodash.find(modifiedDataSource.add, o => {
                        return key == o._key;
                    });

                    if ( !updateRec ) {
                        updateRec = lodash.find(modifiedDataSource.update, o => {
                            return key == o._key;
                        });
                    }

                    let newRec = lodash.omit(lodash.clone(eventProp.data), ["_isSelected", "rowIndex", "uid", "_key"]);
                    let orgRec = lodash.omit(lodash.clone(eventProp.previousData), ["_isSelected", "rowIndex", "uid", "_key"]);
                    let isChanged = !lodash.isEqual(newRec, orgRec);
                    /*
                    
                    console.log("update", "innerDataSource", lodash.cloneDeep(innerDataSource),
                        "dataSource", lodash.cloneDeep(ej2Instances.dataSource),
                        "eventProp", lodash.clone(eventProp),"data", lodash.clone(eventProp.data), 
                        "rowIndex", eventProp.rowIndex, "isChanged", isChanged, "newRec", newRec, "orgRec", orgRec,
                        "updateRec", updateRec
                    );
                    */
                    if ( isChanged ) {
                        if ( !updateRec ) {
                            modifiedDataSource.update.push(eventProp.data);
                        } else {
                            Object.assign(updateRec, lodash.clone(eventProp.data));
                        }
                    } else {
                        // 신규 Row가 아니고 최초 값 상태와 비교하여 제거 필요.
                        /*
                        let fIdx = lodash.findIndex(modifiedDataSource.update, o => {
                            return key == o._key;
                        });
                        */
                    }
                    
                    vm?.emit("update:isDirty", isDirty.value);
                    //ej2Instances.dataSource[eventProp.rowIndex] = eventProp.data;
                    //vm?.emit("update:modelValue", innerDataSource.value);
                }
            }
        };
        return {
            ej2Instances,
            br_trigger,
            modifiedDataSource,
        };
    },
    render(createElement) {
        let h = !isExecute ? gh : createElement;
        let slots = null;
        if(!isNullOrUndefined((this).$slots.default)) {
            slots = !isExecute ? (this).$slots.default() : (this).$slots.default;
        }
        return h('div', slots);
    },
    methods: {
        getModifiedRows() {
            return lodash.omit(this.modifiedDataSource, ["lastKey"]);
        },
        clearTemplate(templateNames) {
            if (!templateNames){ templateNames = Object.keys(this.templateCollection || {}) }
            if (templateNames.length &&  this.templateCollection) {
                for (let tempName of templateNames){
                    let elementCollection = this.templateCollection[tempName];
                    if(elementCollection && elementCollection.length) {
                        for(let ele of elementCollection) {
                            let destroy = getValue('__vue__.$destroy', ele);
                            if (destroy) { ele.__vue__.$destroy() }
                            if (ele.innerHTML) { ele.innerHTML = '' }
                        }
                        delete this.templateCollection[tempName];
                    }
                }
            }
        },
        setProperties(prop, muteOnChange) {
            if(this.isVue3) { this.models = !this.models ? this.ej2Instances.referModels : this.models }
            if (this.ej2Instances && this.ej2Instances._setProperties) {
                this.ej2Instances._setProperties(prop, muteOnChange);
            }
            //console.log("grid", prop, this.models);
            if (prop && this.models && this.models.length) {
                Object.keys(prop).map((key) => {
                    this.models.map((model) => {
                        if ((key === model) && !(/datasource/i.test(key))) {
                            if (this.isVue3) {
                                this.ej2Instances.vueInstance.$emit('update:' + key, prop[key]);
                            } else {
                                (this).$emit('update:' + key, prop[key]);
                                (this).$emit('modelchanged', prop[key]);
                            }
                        }
                    });
                });
            }
        },        
        trigger(eventName, eventProp, successHandler) {

            //console.log("dddd==>", eventName, lodash.clone(eventProp));
            if(!isExecute) { this.models = !this.models ? this.ej2Instances.referModels : this.models }
            if ((eventName === 'change' || eventName === 'input') && this.models && (this.models.length !== 0)) {
                let key = this.models.toString().match(/checked|value/) || [];
                let propKey = key[0];
                if (eventProp && key && !isUndefined(eventProp[propKey])) {
                    if (!isExecute) {
                        //console.log("tttt", propKey, eventProp[propKey]);
                        this.ej2Instances.vueInstance.$emit('update:' + propKey, eventProp[propKey]);
                        this.ej2Instances.vueInstance.$emit('modelchanged', eventProp[propKey]);
                        this.ej2Instances.vueInstance.$emit('update:modelValue', eventProp[propKey]);
                    } else {
                        if (eventName === 'change' || ((this).$props && !(this).$props.isLazyUpdate)) {
                            (this).$emit('update:'+ propKey, eventProp[propKey]);
                            (this).$emit('modelchanged', eventProp[propKey]);
                        }
                    }
                }
            } else if ((eventName === 'actionBegin' && eventProp.requestType === 'dateNavigate') && this.models && (this.models.length !== 0)) {
                let key = this.models.toString().match(/currentView|selectedDate/) || [];
                let propKey = key[0];
                if (eventProp && key && !isUndefined(eventProp[propKey])) {
                    if (!isExecute) {
                        this.ej2Instances.vueInstance.$emit('update:' + propKey, eventProp[propKey]);
                        this.ej2Instances.vueInstance.$emit('modelchanged', eventProp[propKey]);
                    } else {
                        (this).$emit('update:'+ propKey, eventProp[propKey]);
                        (this).$emit('modelchanged', eventProp[propKey]);
                    }
                }
            }
            
            if ( eventName == "beforeDataBound" ) {
                //console.log("this.ej2Instances._trigger", eventName, lodash.clone(eventProp));
                if ( eventProp.actionArgs && eventProp.actionArgs.type == "actionBegin" ) {
                    this._genRecordKey = false;
                } else {
                    this._genRecordKey = true;
                }
            } else if ( eventName == "rowDataBound" && eventProp.data ) {
                if ( this._genRecordKey === false ) {
                    if ( eventProp.data._key == null ) {
                        eventProp.data._key = ++this.modifiedDataSource.lastKey;    
                    }
                } else {
                    eventProp.data._key = ++this.modifiedDataSource.lastKey;
                }
                
            }
            /* 
            if ( eventProp ) {
                console.log("this.ej2Instances._trigger", eventName, eventProp.requestType, lodash.clone(eventProp));

            }
           */

            if ( eventProp && eventProp.isTemplate ) {
                /*
                console.log("this.ej2Instances._trigger", eventName, eventProp.requestType, lodash.clone(eventProp), 
                    "record", lodash.clone(this.ej2Instances.dataSource[eventProp.rowIndex]),
                    "RowDataForTemplate", this.RowDataForTemplate,
                    successHandler,
                );
                */

                /**
                * template 인 경우 변수가 bind되므로 변경된 내역이 rowData로 처리됨
                * 해서 변경된 rowData를 data로 구성하여 Grid Save Action 처리시 반영 처리
                */
                if ( eventName == "actionBegin" && eventProp.requestType == 'save' ) {
                    eventProp.data = Object.assign({}, eventProp.rowData);
                }
            }
            if ( eventName == "beginEdit" && eventProp.requestType == "beginEdit" ) {
                //console.log("templateCollection", this.templateCollection, eventProp, this.ej2Instances, successHandler);

                let isEditTemplate = this.ej2Instances.editSettings && this.ej2Instances.editSettings.properties
                && this.ej2Instances.editSettings.properties.template
                && this.ej2Instances.editSettings.properties.template.length; 

                if ( isEditTemplate ) {
                    eventProp.isTemplate = true;  
                    /**
                    * template 구성 중에 popup 창이나 popup menu 기능이 존재하면 focus 이동 처리되어 
                    * 자동으로 actionComplete 처리됨 
                    * 신규 record data 변수로 구성하여 할당 처리
                    */
                    this.RowDataForTemplate = eventProp.rowData;
                    eventProp.rowData = this.RowDataForTemplate;
                }
            }

            if ((this.ej2Instances && this.ej2Instances._trigger)) {
                //console.log("this.ej2Instances._trigger", eventName, eventProp, successHandler)
                this.ej2Instances._trigger(eventName, eventProp, successHandler); 
            }

            if ( this.br_trigger ) {
                this.br_trigger(eventName, eventProp, successHandler);
            }
            
        },

        custom() {
            this.updated();
        },
        addRecord(data, index) {
            return this.ej2Instances.addRecord(data, index);
        },
        addShimmerEffect() {
            return this.ej2Instances.addShimmerEffect();
        },
        autoFitColumns(fieldNames) {
            return this.ej2Instances.autoFitColumns(fieldNames);
        },
        batchAsyncUpdate(changes) {
            return this.ej2Instances.batchAsyncUpdate(changes);
        },
        batchUpdate(changes) {
            return this.ej2Instances.batchUpdate(changes);
        },
        calculatePageSizeByParentHeight(containerHeight) {
            return this.ej2Instances.calculatePageSizeByParentHeight(containerHeight);
        },
        changeDataSource(dataSource, columns) {
            return this.ej2Instances.changeDataSource(dataSource, columns);
        },
        clearCellSelection() {
            return this.ej2Instances.clearCellSelection();
        },
        clearFiltering(fields) {
            return this.ej2Instances.clearFiltering(fields);
        },
        clearGrouping() {
            return this.ej2Instances.clearGrouping();
        },
        clearRowSelection() {
            return this.ej2Instances.clearRowSelection();
        },
        clearSelection() {
            return this.ej2Instances.clearSelection();
        },
        clearSorting() {
            return this.ej2Instances.clearSorting();
        },
        closeEdit() {
            return this.ej2Instances.closeEdit();
        },
        copy(withHeader) {
            return this.ej2Instances.copy(withHeader);
        },
        csvExport(excelExportProperties, isMultipleExport, workbook, isBlob) {
            return this.ej2Instances.csvExport(excelExportProperties, isMultipleExport, workbook, isBlob);
        },
        dataReady() {
            return this.ej2Instances.dataReady();
        },
        deleteRecord(fieldname, data) {
            return this.ej2Instances.deleteRecord(fieldname, data);
        },
        deleteRow(tr) {
            return this.ej2Instances.deleteRow(tr);
        },
        destroyTemplate(propertyNames, index) {
            return this.ej2Instances.destroyTemplate(propertyNames, index);
        },
        detailCollapseAll() {
            return this.ej2Instances.detailCollapseAll();
        },
        detailExpandAll() {
            return this.ej2Instances.detailExpandAll();
        },
        editCell(index, field) {
            return this.ej2Instances.editCell(index, field);
        },
        enableToolbarItems(items, isEnable) {
            return this.ej2Instances.enableToolbarItems(items, isEnable);
        },
        endEdit() {
            return this.ej2Instances.endEdit();
        },
        excelExport(excelExportProperties, isMultipleExport, workbook, isBlob) {
            return this.ej2Instances.excelExport(excelExportProperties, isMultipleExport, workbook, isBlob);
        },
        extendRequiredModules(modules) {
            return this.ej2Instances.extendRequiredModules(modules);
        },
        filterByColumn(fieldName, filterOperator, filterValue, predicate, matchCase, ignoreAccent, actualFilterValue, actualOperator) {
            return this.ej2Instances.filterByColumn(fieldName, filterOperator, filterValue, predicate, matchCase, ignoreAccent, actualFilterValue, actualOperator);
        },
        getBatchChanges() {
            return this.ej2Instances.getBatchChanges();
        },
        getCellFromIndex(rowIndex, columnIndex) {
            return this.ej2Instances.getCellFromIndex(rowIndex, columnIndex);
        },
        getColumnByField(field) {
            return this.ej2Instances.getColumnByField(field);
        },
        getColumnByUid(uid) {
            return this.ej2Instances.getColumnByUid(uid);
        },
        getColumnFieldNames() {
            return this.ej2Instances.getColumnFieldNames();
        },
        getColumnHeaderByField(field) {
            return this.ej2Instances.getColumnHeaderByField(field);
        },
        getColumnHeaderByIndex(index) {
            return this.ej2Instances.getColumnHeaderByIndex(index);
        },
        getColumnHeaderByUid(uid) {
            return this.ej2Instances.getColumnHeaderByUid(uid);
        },
        getColumnIndexByField(field) {
            return this.ej2Instances.getColumnIndexByField(field);
        },
        getColumnIndexByUid(uid) {
            return this.ej2Instances.getColumnIndexByUid(uid);
        },
        getColumns(isRefresh) {
            return this.ej2Instances.getColumns(isRefresh);
        },
        getContent() {
            return this.ej2Instances.getContent();
        },
        getContentTable() {
            return this.ej2Instances.getContentTable();
        },
        getCurrentViewRecords() {
            return this.ej2Instances.getCurrentViewRecords();
        },
        getDataModule() {
            return this.ej2Instances.getDataModule();
        },
        getDataRows() {
            return this.ej2Instances.getDataRows();
        },
        getFilterUIInfo() {
            return this.ej2Instances.getFilterUIInfo();
        },
        getFilteredRecords() {
            return this.ej2Instances.getFilteredRecords();
        },
        getFooterContent() {
            return this.ej2Instances.getFooterContent();
        },
        getFooterContentTable() {
            return this.ej2Instances.getFooterContentTable();
        },
        getForeignKeyColumns() {
            return this.ej2Instances.getForeignKeyColumns();
        },
        getFrozenDataRows() {
            return this.ej2Instances.getFrozenDataRows();
        },
        getFrozenLeftColumnHeaderByIndex(index) {
            return this.ej2Instances.getFrozenLeftColumnHeaderByIndex(index);
        },
        getFrozenLeftCount() {
            return this.ej2Instances.getFrozenLeftCount();
        },
        getFrozenMode() {
            return this.ej2Instances.getFrozenMode();
        },
        getFrozenRightCellFromIndex(rowIndex, columnIndex) {
            return this.ej2Instances.getFrozenRightCellFromIndex(rowIndex, columnIndex);
        },
        getFrozenRightColumnHeaderByIndex(index) {
            return this.ej2Instances.getFrozenRightColumnHeaderByIndex(index);
        },
        getFrozenRightDataRows() {
            return this.ej2Instances.getFrozenRightDataRows();
        },
        getFrozenRightRowByIndex(index) {
            return this.ej2Instances.getFrozenRightRowByIndex(index);
        },
        getFrozenRightRows() {
            return this.ej2Instances.getFrozenRightRows();
        },
        getFrozenRowByIndex(index) {
            return this.ej2Instances.getFrozenRowByIndex(index);
        },
        getHeaderContent() {
            return this.ej2Instances.getHeaderContent();
        },
        getHeaderTable() {
            return this.ej2Instances.getHeaderTable();
        },
        getHiddenColumns() {
            return this.ej2Instances.getHiddenColumns();
        },
        getMediaColumns() {
            return this.ej2Instances.getMediaColumns();
        },
        getMovableCellFromIndex(rowIndex, columnIndex) {
            return this.ej2Instances.getMovableCellFromIndex(rowIndex, columnIndex);
        },
        getMovableColumnHeaderByIndex(index) {
            return this.ej2Instances.getMovableColumnHeaderByIndex(index);
        },
        getMovableDataRows() {
            return this.ej2Instances.getMovableDataRows();
        },
        getMovableRowByIndex(index) {
            return this.ej2Instances.getMovableRowByIndex(index);
        },
        getMovableRows() {
            return this.ej2Instances.getMovableRows();
        },
        getPager() {
            return this.ej2Instances.getPager();
        },
        getPrimaryKeyFieldNames() {
            return this.ej2Instances.getPrimaryKeyFieldNames();
        },
        getRowByIndex(index) {
            return this.ej2Instances.getRowByIndex(index);
        },
        getRowIndexByPrimaryKey(value) {
            return this.ej2Instances.getRowIndexByPrimaryKey(value);
        },
        getRowInfo(target) {
            return this.ej2Instances.getRowInfo(target);
        },
        getRows() {
            return this.ej2Instances.getRows();
        },
        getSelectedColumnsUid() {
            return this.ej2Instances.getSelectedColumnsUid();
        },
        getSelectedRecords() {
            return this.ej2Instances.getSelectedRecords();
        },
        getSelectedRowCellIndexes() {
            return this.ej2Instances.getSelectedRowCellIndexes();
        },
        getSelectedRowIndexes() {
            return this.ej2Instances.getSelectedRowIndexes();
        },
        getSelectedRows() {
            return this.ej2Instances.getSelectedRows();
        },
        getSummaryValues(summaryCol, summaryData) {
            return this.ej2Instances.getSummaryValues(summaryCol, summaryData);
        },
        getUidByColumnField(field) {
            return this.ej2Instances.getUidByColumnField(field);
        },
        getVisibleColumns() {
            return this.ej2Instances.getVisibleColumns();
        },
        goToPage(pageNo) {
            return this.ej2Instances.goToPage(pageNo);
        },
        groupCollapseAll() {
            return this.ej2Instances.groupCollapseAll();
        },
        groupColumn(columnName) {
            return this.ej2Instances.groupColumn(columnName);
        },
        groupExpandAll() {
            return this.ej2Instances.groupExpandAll();
        },
        hideColumns(keys, hideBy) {
            return this.ej2Instances.hideColumns(keys, hideBy);
        },
        hideScroll() {
            return this.ej2Instances.hideScroll();
        },
        hideSpinner() {
            return this.ej2Instances.hideSpinner();
        },
        isFrozenGrid() {
            return this.ej2Instances.isFrozenGrid();
        },
        openColumnChooser(x, y) {
            return this.ej2Instances.openColumnChooser(x, y);
        },
        pdfExport(pdfExportProperties, isMultipleExport, pdfDoc, isBlob) {
            return this.ej2Instances.pdfExport(pdfExportProperties, isMultipleExport, pdfDoc, isBlob);
        },
        print() {
            return this.ej2Instances.print();
        },
        refresh() {
            return this.ej2Instances.refresh();
        },
        refreshColumns() {
            return this.ej2Instances.refreshColumns();
        },
        refreshHeader() {
            return this.ej2Instances.refreshHeader();
        },
        removeMaskRow() {
            return this.ej2Instances.removeMaskRow();
        },
        reorderColumnByIndex(fromIndex, toIndex) {
            return this.ej2Instances.reorderColumnByIndex(fromIndex, toIndex);
        },
        reorderColumnByTargetIndex(fieldName, toIndex) {
            return this.ej2Instances.reorderColumnByTargetIndex(fieldName, toIndex);
        },
        reorderColumns(fromFName, toFName) {
            return this.ej2Instances.reorderColumns(fromFName, toFName);
        },
        reorderRows(fromIndexes, toIndex) {
            return this.ej2Instances.reorderRows(fromIndexes, toIndex);
        },
        saveCell() {
            return this.ej2Instances.saveCell();
        },
        search(searchString) {
            return this.ej2Instances.search(searchString);
        },
        selectCell(cellIndex, isToggle) {
            return this.ej2Instances.selectCell(cellIndex, isToggle);
        },
        selectCells(rowCellIndexes) {
            return this.ej2Instances.selectCells(rowCellIndexes);
        },
        selectCellsByRange(startIndex, endIndex) {
            return this.ej2Instances.selectCellsByRange(startIndex, endIndex);
        },
        selectRow(index, isToggle) {
            return this.ej2Instances.selectRow(index, isToggle);
        },
        selectRows(rowIndexes){
            return this.ej2Instances.selectRows(rowIndexes);
        },
        selectRowsByRange(startIndex, endIndex) {
            return this.ej2Instances.selectRowsByRange(startIndex, endIndex);
        },
        serverCsvExport(url) {
            return this.ej2Instances.serverCsvExport(url);
        },
        serverExcelExport(url) {
            return this.ej2Instances.serverExcelExport(url);
        },
        serverPdfExport(url) {
            return this.ej2Instances.serverPdfExport(url);
        },
        setCellValue(key, field, value) {
            return this.ej2Instances.setCellValue(key, field, value);
        },
        setGridContent(element) {
            return this.ej2Instances.setGridContent(element);
        },
        setGridContentTable(element) {
            return this.ej2Instances.setGridContentTable(element);
        },
        setGridHeaderContent(element) {
            return this.ej2Instances.setGridHeaderContent(element);
        },
        setGridHeaderTable(element) {
            return this.ej2Instances.setGridHeaderTable(element);
        },
        setGridPager(element) {
            return this.ej2Instances.setGridPager(element);
        },
        setRowData(key, rowData) {
            return this.ej2Instances.setRowData(key, rowData);
        },
        showAdaptiveFilterDialog() {
            return this.ej2Instances.showAdaptiveFilterDialog();
        },
        showAdaptiveSortDialog() {
            return this.ej2Instances.showAdaptiveSortDialog();
        },
        showColumns(keys, showBy) {
            return this.ej2Instances.showColumns(keys, showBy);
        },
        showMaskRow(axisDirection, dialogElement) {
            return this.ej2Instances.showMaskRow(axisDirection, dialogElement);
        },
        showSpinner() {
            return this.ej2Instances.showSpinner();
        },
        sortColumn(columnName, direction, isMultiSort) {
            return this.ej2Instances.sortColumn(columnName, direction, isMultiSort);
        },
        startEdit() {
            return this.ej2Instances.startEdit();
        },
        ungroupColumn(columnName) {
            return this.ej2Instances.ungroupColumn(columnName);
        },
        updateCell(rowIndex, field, value) {
            return this.ej2Instances.updateCell(rowIndex, field, value);
        },
        updateExternalMessage(message) {
            return this.ej2Instances.updateExternalMessage(message);
        },
        updateRow(index, data) {
            return this.ej2Instances.updateRow(index, data);
        },
        updateRowValue(key, rowData) {
            return this.ej2Instances.updateRowValue(key, rowData);
        },
    }
});

//export type GridComponent = InstanceType<typeof GridComponent>;

export const GridPlugin = {
    name: 'ejs-grid',
    install(Vue) {
        //console.log("vue", Vue);
        Vue.component(GridPlugin.name, GridComponent);
        Vue.component(ColumnPlugin.name, ColumnDirective);
        Vue.component(ColumnsPlugin.name, ColumnsDirective);
        
        Vue.component(StackedColumnPlugin.name, StackedColumnDirective);
        Vue.component(StackedColumnsPlugin.name, StackedColumnsDirective);
        Vue.component(AggregatePlugin.name, AggregateDirective);
        Vue.component(AggregatesPlugin.name, AggregatesDirective);

        if ( !Vue._context.components[AggregateColumnPlugin.name] ) {
            Vue.component(AggregateColumnPlugin.name, AggregateColumnDirective);
        }
        if ( !Vue._context.components[AggregateColumnsPlugin.name] ) {
            Vue.component(AggregateColumnsPlugin.name, AggregateColumnsDirective);
        }

    }
}

export * from './BrGrid/index.js';