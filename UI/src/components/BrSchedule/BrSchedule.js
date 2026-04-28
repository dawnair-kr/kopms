import { ComponentBase, gh, getProps, isExecute, vueDefineComponent } from '@syncfusion/ej2-vue-base';
import { isNullOrUndefined, getValue } from '@syncfusion/ej2-base';
import { isUndefined } from '@syncfusion/ej2-base';
import {
    addListener,
    removeListener
} from "resize-detector";
import lodash from 'lodash';
import { Schedule } from '@syncfusion/ej2-schedule';
import { ViewsDirective, ViewDirective, ViewsPlugin, ViewPlugin } from '@syncfusion/ej2-vue-schedule/src/schedule/views.directive'
import { ResourcesDirective, ResourceDirective, ResourcesPlugin, ResourcePlugin } from '@syncfusion/ej2-vue-schedule/src/schedule/resources.directive'
import { HeaderRowsDirective, HeaderRowDirective, HeaderRowsPlugin, HeaderRowPlugin } from '@syncfusion/ej2-vue-schedule/src/schedule/headerrows.directive'
import { ToolbarItemsDirective, ToolbarItemDirective, ToolbarItemsPlugin, ToolbarItemPlugin } from '@syncfusion/ej2-vue-schedule/src/schedule/toolbaritems.directive'
import { RecurrenceEditorComponent, RecurrenceEditorPlugin } from '@syncfusion/ej2-vue-schedule/src/recurrence-editor'


export const properties = ['isLazyUpdate', 'plugins', 'agendaDaysCount', 'allowDragAndDrop', 'allowInline', 'allowKeyboardInteraction', 'allowMultiCellSelection', 'allowMultiDrag', 'allowMultiRowSelection', 'allowResizing', 'allowSwiping', 'calendarMode', 'cellHeaderTemplate', 'cellTemplate', 'cssClass', 'currentView', 'dateFormat', 'dateHeaderTemplate', 'dateRangeTemplate', 'dayHeaderTemplate', 'editorFooterTemplate', 'editorHeaderTemplate', 'editorTemplate', 'enableAdaptiveUI', 'enableAllDayScroll', 'enableHtmlSanitizer', 'enablePersistence', 'enableRecurrenceValidation', 'enableRtl', 'endHour', 'eventDragArea', 'eventSettings', 'firstDayOfWeek', 'firstMonthOfYear', 'group', 'headerIndentTemplate', 'headerRows', 'height', 'hideEmptyAgendaDays', 'locale', 'maxDate', 'minDate', 'monthHeaderTemplate', 'monthsCount', 'quickInfoOnSelectionEnd', 'quickInfoTemplates', 'readonly', 'resourceHeaderTemplate', 'resources', 'rowAutoHeight', 'selectedDate', 'showHeaderBar', 'showQuickInfo', 'showTimeIndicator', 'showWeekNumber', 'showWeekend', 'startHour', 'timeFormat', 'timeScale', 'timezone', 'timezoneDataSource', 'toolbarItems', 'views', 'weekRule', 'width', 'workDays', 'workHours', 'actionBegin', 'actionComplete', 'actionFailure', 'cellClick', 'cellDoubleClick', 'created', 'dataBinding', 'dataBound', 'destroyed', 'drag', 'dragStart', 'dragStop', 'eventClick', 'eventDoubleClick', 'eventRendered', 'hover', 'moreEventsClick', 'navigating', 'popupClose', 'popupOpen', 'renderCell', 'resizeStart', 'resizeStop', 'resizing', 'select', 'virtualScrollStart', 'virtualScrollStop'];
export const modelProps = ['currentView', 'selectedDate'];

export const testProp = getProps({props: properties});
export const props = testProp[0], watch = testProp[1], emitProbs = Object.keys(watch);
emitProbs.push('modelchanged', 'update:modelValue');
for (let props of modelProps) { emitProbs.push('update:'+props) }


//console.log("ssssss", testProp)

watch['resources.dataSource'] = {
    deep: true,
    handler(val, oldVal) {
        //console.log("watch resources.dataSource", val, oldVal, this.ej2Instances);
        if ( this.resources && this.resources.id ) {
            let fObj = this.ej2Instances.resources.find(o => {
                return o.id == this.resources.id;
            });
            if ( fObj ) {
                fObj.dataSource = val;
                return;
            }
        }
        if ( this.ej2Instances.resources.length ) {
            this.ej2Instances.resources[0].dataSource = val;
        }
        
        //this.ej2Instances.eventSettings.dataSource = val;
        //this.ej2Instances._setProperties("fields", );
    }
};
/**
 * `ej-schedule` represents the VueJS Schedule Component.
 * ```vue
 * <ejs-schedule></ejs-schedule>
 * ```
 */
export let ScheduleComponent =  vueDefineComponent({
    name: 'ScheduleComponent',
    mixins: [ComponentBase],
    props: props,
    watch: {
        ...watch,
        'eventSettings.dataSource': {
            deep: true,
            handler(val, oldVal) {
                //console.log("watch eventSettings.dataSource", val, oldVal, this.ej2Instances);
                this.ej2Instances.eventSettings.dataSource = val;
                /*
                if ( this.dataBind ) {
                    this.dataBind();
                } 
                */       
                //this.ej2Instances._setProperties("fields", );
            }
        }
    },
    emits: emitProbs,
    model: { event: 'modelchanged' },
    provide() { return { custom: this.custom } },
    data() {
        return {
            ej2Instances: new Schedule({}),
            propKeys: properties,
            models: modelProps,
            hasChildDirective: true,
            hasInjectedModules: true,
            tagMapper: {"e-views":"e-view","e-resources":"e-resource","e-header-rows":"e-header-row","e-toolbaritems":"e-toolbaritem"},
            tagNameMapper: {"e-header-rows":"e-headerRows","e-toolbaritems":"e-toolbarItems"},
            isVue3: !isExecute,
            templateCollection: {},
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
        this._resizeListener = lodash.debounce((element) => {
            if ( element &&
                element.offsetWidth > 0 &&
                element.offsetHeight > 0
            ) {
                //console.log("resize bounds", this.ej2Instances.scroller.getBounds());
                this.ej2Instances.onScheduleResize();      
                //this.ej2Instances.setSize(element.offsetWidth, element.offsetHeight);
            }
        }, 50);
        addListener(this.$el, this._resizeListener);
    },
    beforeUnmount() {
        removeListener(this.$el, this._resizeListener);
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
            //console.log("schedule",eventName, eventProp, successHandler);
            if(!isExecute) { this.models = !this.models ? this.ej2Instances.referModels : this.models }
            if ((eventName === 'change' || eventName === 'input') && this.models && (this.models.length !== 0)) {
                let key = this.models.toString().match(/checked|value/) || [];
                let propKey = key[0];
                if (eventProp && key && !isUndefined(eventProp[propKey])) {
                    if (!isExecute) {
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
            if ((this.ej2Instances && this.ej2Instances._trigger)) {
                this.ej2Instances._trigger(eventName, eventProp, successHandler); 
            }
        },

        custom() {
            this.updated();
        },
        addEvent(data) {
            return this.ej2Instances.addEvent(data);
        },
        addResource(resources, name, index) {
            return this.ej2Instances.addResource(resources, name, index);
        },
        changeCurrentView(viewName, viewIndex) {
            return this.ej2Instances.changeCurrentView(viewName, viewIndex);
        },
        closeEditor() {
            return this.ej2Instances.closeEditor();
        },
        closeQuickInfoPopup() {
            return this.ej2Instances.closeQuickInfoPopup();
        },
        closeTooltip() {
            return this.ej2Instances.closeTooltip();
        },
        collapseResource(resourceId, name) {
            return this.ej2Instances.collapseResource(resourceId, name);
        },
        deleteEvent(id, currentAction) {
            return this.ej2Instances.deleteEvent(id, currentAction);
        },
        expandResource(resourceId, name) {
            return this.ej2Instances.expandResource(resourceId, name);
        },
        exportToExcel(excelExportOptions) {
            return this.ej2Instances.exportToExcel(excelExportOptions);
        },
        exportToICalendar(fileName, customData) {
            return this.ej2Instances.exportToICalendar(fileName, customData);
        },
        generateEventOccurrences(event, startDate) {
            return this.ej2Instances.generateEventOccurrences(event, startDate);
        },
        getBlockEvents(startDate, endDate, includeOccurrences) {
            return this.ej2Instances.getBlockEvents(startDate, endDate, includeOccurrences);
        },
        getCellDetails(tdCol) {
            return this.ej2Instances.getCellDetails(tdCol);
        },
        getCurrentViewDates() {
            return this.ej2Instances.getCurrentViewDates();
        },
        getCurrentViewEvents() {
            return this.ej2Instances.getCurrentViewEvents();
        },
        getCurrentViewIndex() {
            return this.ej2Instances.getCurrentViewIndex();
        },
        getDeletedOccurrences(recurrenceData) {
            return this.ej2Instances.getDeletedOccurrences(recurrenceData);
        },
        getEventDetails(element) {
            return this.ej2Instances.getEventDetails(element);
        },
        getEventMaxID() {
            return this.ej2Instances.getEventMaxID();
        },
        getEvents(startDate, endDate, includeOccurrences) {
            return this.ej2Instances.getEvents(startDate, endDate, includeOccurrences);
        },
        getIndexFromResourceId(id, name) {
            return this.ej2Instances.getIndexFromResourceId(id, name);
        },
        getOccurrencesByID(eventID) {
            return this.ej2Instances.getOccurrencesByID(eventID);
        },
        getOccurrencesByRange(startTime, endTime) {
            return this.ej2Instances.getOccurrencesByRange(startTime, endTime);
        },
        getResourceCollections() {
            return this.ej2Instances.getResourceCollections();
        },
        getResourcesByIndex(index) {
            return this.ej2Instances.getResourcesByIndex(index);
        },
        getSelectedElements() {
            return this.ej2Instances.getSelectedElements();
        },
        hideSpinner() {
            return this.ej2Instances.hideSpinner();
        },
        importICalendar(fileContent) {
            return this.ej2Instances.importICalendar(fileContent);
        },
        isSlotAvailable(startTime, endTime, groupIndex) {
            return this.ej2Instances.isSlotAvailable(startTime, endTime, groupIndex);
        },
        openEditor(data, action, isEventData, repeatType) {
            return this.ej2Instances.openEditor(data, action, isEventData, repeatType);
        },
        openQuickInfoPopup(data) {
            return this.ej2Instances.openQuickInfoPopup(data);
        },
        print(printOptions) {
            return this.ej2Instances.print(printOptions);
        },
        refreshEvents(isRemoteRefresh) {
            return this.ej2Instances.refreshEvents(isRemoteRefresh);
        },
        refreshLayout() {
            return this.ej2Instances.refreshLayout();
        },
        refreshTemplates(templateName) {
            return this.ej2Instances.refreshTemplates(templateName);
        },
        removeResource(resourceId, name) {
            return this.ej2Instances.removeResource(resourceId, name);
        },
        resetWorkHours(dates, start, end, groupIndex) {
            return this.ej2Instances.resetWorkHours(dates, start, end, groupIndex);
        },
        saveEvent(data, currentAction) {
            return this.ej2Instances.saveEvent(data, currentAction);
        },
        scrollTo(hour, scrollDate) {
            return this.ej2Instances.scrollTo(hour, scrollDate);
        },
        scrollToResource(resourceId, groupName) {
            return this.ej2Instances.scrollToResource(resourceId, groupName);
        },
        selectResourceByIndex(groupIndex) {
            return this.ej2Instances.selectResourceByIndex(groupIndex);
        },
        setRecurrenceEditor(recurrenceEditor) {
            return this.ej2Instances.setRecurrenceEditor(recurrenceEditor);
        },
        setResourceCollections(resourceCol) {
            return this.ej2Instances.setResourceCollections(resourceCol);
        },
        setWorkHours(dates, start, end, groupIndex) {
            return this.ej2Instances.setWorkHours(dates, start, end, groupIndex);
        },
        showSpinner() {
            return this.ej2Instances.showSpinner();
        },
    }
});

//export type ScheduleComponent = InstanceType<typeof ScheduleComponent>;

export const SchedulePlugin = {
    name: 'ejs-schedule',
    install(Vue) {
        Vue.component(SchedulePlugin.name, ScheduleComponent);
        Vue.component(ViewPlugin.name, ViewDirective);
        Vue.component(ViewsPlugin.name, ViewsDirective);
        Vue.component(ResourcePlugin.name, ResourceDirective);
        Vue.component(ResourcesPlugin.name, ResourcesDirective);
        Vue.component(HeaderRowPlugin.name, HeaderRowDirective);
        Vue.component(HeaderRowsPlugin.name, HeaderRowsDirective);
        Vue.component(ToolbarItemPlugin.name, ToolbarItemDirective);
        Vue.component(ToolbarItemsPlugin.name, ToolbarItemsDirective);

    }
}

export { ViewsDirective, ViewDirective, ViewsPlugin, ViewPlugin, ResourcesDirective, ResourceDirective, ResourcesPlugin, ResourcePlugin, HeaderRowsDirective, HeaderRowDirective, HeaderRowsPlugin, HeaderRowPlugin, ToolbarItemsDirective, ToolbarItemDirective, ToolbarItemsPlugin, ToolbarItemPlugin, RecurrenceEditorComponent, RecurrenceEditorPlugin };
export * from '@syncfusion/ej2-schedule';