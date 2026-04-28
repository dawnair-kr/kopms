import { ComponentBase, gh, getProps, isExecute, vueDefineComponent } from '@syncfusion/ej2-vue-base';
import { isNullOrUndefined, getValue, compile as baseTemplateCompiler, isBlazor } from '@syncfusion/ej2-base';

import { Diagram } from './BrDiagram/index.js';
import {
    addListener,
    removeListener
} from "resize-detector";
import lodash from 'lodash';

/*
import { LayersDirective, LayerDirective, LayersPlugin, LayerPlugin } from '@syncfusion/ej2-vue-diagrams/src/diagram/layers.directive';
import { CustomCursorsDirective, CustomCursorDirective, CustomCursorsPlugin, CustomCursorPlugin } from '@syncfusion/ej2-vue-diagrams/src/diagram/customcursor.directive';
import { ConnectorFixedUserHandlesDirective, ConnectorFixedUserHandleDirective, ConnectorFixedUserHandlesPlugin, ConnectorFixedUserHandlePlugin } from '@syncfusion/ej2-vue-diagrams/src/diagram/connector-fixeduserhandle.directive';
import { ConnectorAnnotationsDirective, ConnectorAnnotationDirective, ConnectorAnnotationsPlugin, ConnectorAnnotationPlugin } from '@syncfusion/ej2-vue-diagrams/src/diagram/connector-annotation.directive';
import { ConnectorsDirective, ConnectorDirective, ConnectorsPlugin, ConnectorPlugin } from '@syncfusion/ej2-vue-diagrams/src/diagram/connectors.directive';
import { NodeFixedUserHandlesDirective, NodeFixedUserHandleDirective, NodeFixedUserHandlesPlugin, NodeFixedUserHandlePlugin } from '@syncfusion/ej2-vue-diagrams/src/diagram/node-fixeduserhandle.directive';
import { NodeAnnotationsDirective, NodeAnnotationDirective, NodeAnnotationsPlugin, NodeAnnotationPlugin } from '@syncfusion/ej2-vue-diagrams/src/diagram/node-annotation.directive';
import { PortsDirective, PortDirective, PortsPlugin, PortPlugin } from '@syncfusion/ej2-vue-diagrams/src/diagram/ports.directive';
import { NodesDirective, NodeDirective, NodesPlugin, NodePlugin } from '@syncfusion/ej2-vue-diagrams/src/diagram/nodes.directive';
*/
//import { Node, getContent } from './BrDiagram/utility/dom-util';

export * from './BrDiagram/index.js';

export var properties = ['isLazyUpdate', 'plugins', 'addInfo', 'annotationTemplate', 'backgroundColor', 'bridgeDirection', 
    'commandManager', 'connectorDefaults', 'connectors', 'constraints', 
    'contextMenuSettings', 'customCursor', 'dataSourceSettings', 'diagramSettings', 'drawingObject', 
    'enableConnectorSplit', 'enablePersistence', 'enableRtl', 'getConnectorDefaults', 'getCustomCursor', 
    'getCustomProperty', 'getCustomTool', 'getDescription', 'getNodeDefaults', 'height', 'historyManager', 'layers', 'layout', 
    'locale', 'mode', 'nodeDefaults', 'nodeTemplate', 'nodes', 'pageSettings', 'rulerSettings', 'scrollSettings', 
    'segmentThumbShape', 'selectedItems', 'serializationSettings', 'setNodeTemplate', 'snapSettings', 'tool', 
    'tooltip', 'updateSelection', 'userHandleTemplate', 'width', 'animationComplete', 'click', 'collectionChange', 
    'commandExecute', 'connectionChange', 'contextMenuBeforeItemRender', 'contextMenuClick', 'contextMenuOpen', 
    'created', 'dataLoaded', 'doubleClick', 'dragEnter', 'dragLeave', 'dragOver', 'drop', 'expandStateChange', 
    'fixedUserHandleClick', 'historyChange', 'historyStateChange', 'keyDown', 'keyUp', 'load', 'mouseEnter', 'mouseLeave', 
    'mouseOver', 'mouseWheel', 'onImageLoad', 'onUserHandleMouseDown', 'onUserHandleMouseEnter', 'onUserHandleMouseLeave', 
    'onUserHandleMouseUp', 'positionChange', 'propertyChange', 'rotateChange', 'scrollChange', 
    'segmentChange', 'segmentCollectionChange', 'selectionChange', 'sizeChange', 'sourcePointChange', 
    'targetPointChange', 'textEdit', 'elementDraw'];
export var modelProps = [];
export var testProp = getProps({ props: properties });
export var props = testProp[0], watch = testProp[1], emitProbs = Object.keys(watch);
emitProbs.push('modelchanged', 'update:modelValue');
for (var _i = 0, modelProps_1 = modelProps; _i < modelProps_1.length; _i++) {
    var props_1 = modelProps_1[_i];
    emitProbs.push('update:' + props_1);
}




//console.log("node", Node.prototype.init);
/**
 * Represents vue Diagram Component
 * ```html
 * <ejs-diagram></ejs-diagram>
 * ```
 */
export var DiagramComponent = vueDefineComponent({
    name: 'DiagramComponent',
    mixins: [ComponentBase],
    props: props,
    watch: {
        ...watch,
        "dataSourceSettings.dataSource": {
            handler(val) {
                //console.log("val", val);
                //let selectedNodes = this.ej2Instances.selectedItems.nodes;
                this.ej2Instances.dataSourceSettings = {
                    ...this.ej2Instances.dataSourceSettings,
                    dataSource: val,
                };
                /*
                setTimeout(() => {
                    this.ej2Instance.select(selectedNodes);
                }, 500);
                */
            }
        }
    },
    emits: emitProbs,
    provide: function () { return { custom: this.custom }; },
    data: function () {
        return {
            ej2Instance: new Diagram({}),
            propKeys: properties,
            models: modelProps,
            hasChildDirective: true,
            hasInjectedModules: true,
            tagMapper: { "e-layers": "e-layer", "e-cursormaps": "e-cursormap", "e-connectors": { "e-connector": { "e-connector-fixeduserhandles": "e-connector-fixeduserhandle", "e-connector-annotations": "e-connector-annotation" } }, "e-nodes": { "e-node": { "e-node-fixeduserhandles": "e-node-fixeduserhandle", "e-node-annotations": "e-node-annotation", "e-node-ports": "e-node-port" } } },
            tagNameMapper: { "e-cursormaps": "e-customCursor", "e-connector-fixeduserhandles": "e-fixedUserHandles", "e-connector-annotations": "e-annotations", "e-node-fixeduserhandles": "e-fixedUserHandles", "e-node-annotations": "e-annotations", "e-node-ports": "e-ports" },
            isVue3: !isExecute,
            templateCollection: {},
        };
    },
    created: function () {
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
                this.ej2Instances.updateViewPort();      
                this.ej2Instances.updateScrollOffset();
                //this.ej2Instances.setSize(element.offsetWidth, element.offsetHeight);
            }
        }, 50);
        addListener(this.$el, this._resizeListener);
    },
    beforeUnmount() {
        removeListener(this.$el, this._resizeListener);
    },
    render: function (createElement) {
        var h = !isExecute ? gh : createElement;
        var slots = null;
        if (!isNullOrUndefined(this.$slots.default)) {
            slots = !isExecute ? this.$slots.default() : this.$slots.default;
        }
        return h('div', slots);
    },
    methods: {
        clearTemplate: function (templateNames) {
            if (!templateNames) {
                templateNames = Object.keys(this.templateCollection || {});
            }
            if (templateNames.length && this.templateCollection) {
                for (var _i = 0, templateNames_1 = templateNames; _i < templateNames_1.length; _i++) {
                    var tempName = templateNames_1[_i];
                    var elementCollection = this.templateCollection[tempName];
                    if (elementCollection && elementCollection.length) {
                        for (var _a = 0, elementCollection_1 = elementCollection; _a < elementCollection_1.length; _a++) {
                            var ele = elementCollection_1[_a];
                            var destroy = getValue('__vue__.$destroy', ele);
                            if (destroy) {
                                ele.__vue__.$destroy();
                            }
                            if (ele.innerHTML) {
                                ele.innerHTML = '';
                            }
                        }
                        delete this.templateCollection[tempName];
                    }
                }
            }
        },
        setProperties: function (prop, muteOnChange) {
            var _this = this;
            if (this.isVue3) {
                this.models = !this.models ? this.ej2Instances.referModels : this.models;
            }
            if (this.ej2Instances && this.ej2Instances._setProperties) {
                this.ej2Instances._setProperties(prop, muteOnChange);
            }
            if (prop && this.models && this.models.length) {
                Object.keys(prop).map(function (key) {
                    _this.models.map(function (model) {
                        if ((key === model) && !(/datasource/i.test(key))) {
                            if (_this.isVue3) {
                                _this.ej2Instances.vueInstance.$emit('update:' + key, prop[key]);
                            }
                            else {
                                _this.$emit('update:' + key, prop[key]);
                                _this.$emit('modelchanged', prop[key]);
                            }
                        }
                    });
                });
            }
        },
        custom: function () {
            this.updated();
        },
        add: function (obj, group) {
            return this.ej2Instances.add(obj, group);
        },
        addChildToGroup: function (group, child) {
            return this.ej2Instances.addChildToGroup(group, child);
        },
        addChildToUmlNode: function (node, child, umlChildType) {
            return this.ej2Instances.addChildToUmlNode(node, child, umlChildType);
        },
        addConnector: function (obj) {
            return this.ej2Instances.addConnector(obj);
        },
        addConnectorLabels: function (obj, labels) {
            return this.ej2Instances.addConnectorLabels(obj, labels);
        },
        addConstraints: function (constraintsType, constraintsValue) {
            return this.ej2Instances.addConstraints(constraintsType, constraintsValue);
        },
        addCustomHistoryEntry: function (entry) {
            return this.ej2Instances.addCustomHistoryEntry(entry);
        },
        addHistoryEntry: function (entry, sourceId) {
            return this.ej2Instances.addHistoryEntry(entry, sourceId);
        },
        addLabels: function (obj, labels) {
            return this.ej2Instances.addLabels(obj, labels);
        },
        addLanes: function (node, lane, index) {
            return this.ej2Instances.addLanes(node, lane, index);
        },
        addLayer: function (layer, layerObject) {
            return this.ej2Instances.addLayer(layer, layerObject);
        },
        addNode: function (obj, group) {
            return this.ej2Instances.addNode(obj, group);
        },
        addNodeLabels: function (obj, labels) {
            return this.ej2Instances.addNodeLabels(obj, labels);
        },
        addNodeToLane: function (node, swimLane, lane) {
            return this.ej2Instances.addNodeToLane(node, swimLane, lane);
        },
        addPhases: function (node, phases) {
            return this.ej2Instances.addPhases(node, phases);
        },
        addPorts: function (obj, ports) {
            return this.ej2Instances.addPorts(obj, ports);
        },
        addProcess: function (process, parentId) {
            return this.ej2Instances.addProcess(process, parentId);
        },
        addTextAnnotation: function (annotation, node) {
            return this.ej2Instances.addTextAnnotation(annotation, node);
        },
        align: function (option, objects, type) {
            return this.ej2Instances.align(option, objects, type);
        },
        bringIntoView: function (bound) {
            return this.ej2Instances.bringIntoView(bound);
        },
        bringLayerForward: function (layerName) {
            return this.ej2Instances.bringLayerForward(layerName);
        },
        bringToCenter: function (bound) {
            return this.ej2Instances.bringToCenter(bound);
        },
        bringToFront: function () {
            return this.ej2Instances.bringToFront();
        },
        clear: function () {
            return this.ej2Instances.clear();
        },
        clearHistory: function () {
            return this.ej2Instances.clearHistory();
        },
        clearSelection: function () {
            return this.ej2Instances.clearSelection();
        },
        cloneLayer: function (layerName) {
            return this.ej2Instances.cloneLayer(layerName);
        },
        copy: function () {
            return this.ej2Instances.copy();
        },
        cut: function () {
            return this.ej2Instances.cut();
        },
        distribute: function (option, objects) {
            return this.ej2Instances.distribute(option, objects);
        },
        doLayout: function () {
            return this.ej2Instances.doLayout();
        },
        drag: function (obj, tx, ty) {
            return this.ej2Instances.drag(obj, tx, ty);
        },
        dragSourceEnd: function (obj, tx, ty) {
            return this.ej2Instances.dragSourceEnd(obj, tx, ty);
        },
        dragTargetEnd: function (obj, tx, ty) {
            return this.ej2Instances.dragTargetEnd(obj, tx, ty);
        },
        editSegment: function (editOptions) {
            return this.ej2Instances.editSegment(editOptions);
        },
        endGroupAction: function () {
            return this.ej2Instances.endGroupAction();
        },
        exportDiagram: function (options) {
            return this.ej2Instances.exportDiagram(options);
        },
        exportImage: function (image, options) {
            return this.ej2Instances.exportImage(image, options);
        },
        findElementUnderMouse: function (obj, position, diagram, padding) {
            return this.ej2Instances.findElementUnderMouse(obj, position, diagram, padding);
        },
        findObjectUnderMouse: function (objects, action, inAction) {
            return this.ej2Instances.findObjectUnderMouse(objects, action, inAction);
        },
        findObjectsUnderMouse: function (position, source) {
            return this.ej2Instances.findObjectsUnderMouse(position, source);
        },
        findTargetObjectUnderMouse: function (objects, action, inAction, position, source) {
            return this.ej2Instances.findTargetObjectUnderMouse(objects, action, inAction, position, source);
        },
        fitToPage: function (options) {
            return this.ej2Instances.fitToPage(options);
        },
        getActiveLayer: function () {
            return this.ej2Instances.getActiveLayer();
        },
        getConnectorObject: function (id) {
            return this.ej2Instances.getConnectorObject(id);
        },
        getCursor: function (action, active) {
            return this.ej2Instances.getCursor(action, active);
        },
        getDiagramAction: function (diagramAction) {
            return this.ej2Instances.getDiagramAction(diagramAction);
        },
        getDiagramBounds: function () {
            return this.ej2Instances.getDiagramBounds();
        },
        getDiagramContent: function (styleSheets) {
            return this.ej2Instances.getDiagramContent(styleSheets);
        },
        getEdges: function (args) {
            return this.ej2Instances.getEdges(args);
        },
        getHistoryStack: function (isUndoStack) {
            return this.ej2Instances.getHistoryStack(isUndoStack);
        },
        getNodeObject: function (id) {
            return this.ej2Instances.getNodeObject(id);
        },
        getObject: function (name) {
            return this.ej2Instances.getObject(name);
        },
        getParentId: function (id) {
            return this.ej2Instances.getParentId(id);
        },
        getTool: function (action) {
            return this.ej2Instances.getTool(action);
        },
        group: function () {
            return this.ej2Instances.group();
        },
        hideTooltip: function (obj) {
            return this.ej2Instances.hideTooltip(obj);
        },
        insertData: function (node) {
            return this.ej2Instances.insertData(node);
            //this.ej2Instances.dataSourceSettings.dataSource
        },
        loadDiagram: function (data, isEJ1Data) {
            return this.ej2Instances.loadDiagram(data, isEJ1Data);
        },
        moveForward: function () {
            return this.ej2Instances.moveForward();
        },
        moveObjects: function (objects, targetLayer) {
            return this.ej2Instances.moveObjects(objects, targetLayer);
        },
        moveObjectsUp: function (node, currentLayer) {
            return this.ej2Instances.moveObjectsUp(node, currentLayer);
        },
        nudge: function (direction, x, y, type) {
            return this.ej2Instances.nudge(direction, x, y, type);
        },
        pan: function (horizontalOffset, verticalOffset, focusedPoint, isInteractiveZoomPan) {
            return this.ej2Instances.pan(horizontalOffset, verticalOffset, focusedPoint, isInteractiveZoomPan);
        },
        paste: function (obj) {
            return this.ej2Instances.paste(obj);
        },
        print: function (options) {
            return this.ej2Instances.print(options);
        },
        printImage: function (image, options) {
            return this.ej2Instances.printImage(image, options);
        },
        redo: function () {
            return this.ej2Instances.redo();
        },
        remove: function (obj) {
            return this.ej2Instances.remove(obj);
        },
        removeChildFromGroup: function (group, child) {
            return this.ej2Instances.removeChildFromGroup(group, child);
        },
        removeConstraints: function (constraintsType, constraintsValue) {
            return this.ej2Instances.removeConstraints(constraintsType, constraintsValue);
        },
        removeData: function (node) {
            return this.ej2Instances.removeData(node);
        },
        removeLabels: function (obj, labels) {
            return this.ej2Instances.removeLabels(obj, labels);
        },
        removeLane: function (node, lane) {
            return this.ej2Instances.removeLane(node, lane);
        },
        removeLayer: function (layerId) {
            return this.ej2Instances.removeLayer(layerId);
        },
        removePhase: function (node, phase) {
            return this.ej2Instances.removePhase(node, phase);
        },
        removePorts: function (obj, ports) {
            return this.ej2Instances.removePorts(obj, ports);
        },
        removeProcess: function (id) {
            return this.ej2Instances.removeProcess(id);
        },
        reset: function () {
            return this.ej2Instances.reset();
        },
        resetSegments: function () {
            return this.ej2Instances.resetSegments();
        },
        rotate: function (obj, angle, pivot, rotateUsingHandle) {
            return this.ej2Instances.rotate(obj, angle, pivot, rotateUsingHandle);
        },
        sameSize: function (option, objects) {
            return this.ej2Instances.sameSize(option, objects);
        },
        saveDiagram: function () {
            return this.ej2Instances.saveDiagram();
        },
        scale: function (obj, sx, sy, pivot) {
            return this.ej2Instances.scale(obj, sx, sy, pivot);
        },
        select: function (objects, multipleSelection, oldValue) {
            return this.ej2Instances.select(objects, multipleSelection, oldValue);
        },
        selectAll: function () {
            return this.ej2Instances.selectAll();
        },
        sendBackward: function () {
            return this.ej2Instances.sendBackward();
        },
        sendLayerBackward: function (layerName) {
            return this.ej2Instances.sendLayerBackward(layerName);
        },
        sendToBack: function () {
            return this.ej2Instances.sendToBack();
        },
        setActiveLayer: function (layerName) {
            return this.ej2Instances.setActiveLayer(layerName);
        },
        setStackLimit: function (stackLimit) {
            return this.ej2Instances.setStackLimit(stackLimit);
        },
        showTooltip: function (obj) {
            return this.ej2Instances.showTooltip(obj);
        },
        startGroupAction: function () {
            return this.ej2Instances.startGroupAction();
        },
        startTextEdit: function (node, id) {
            return this.ej2Instances.startTextEdit(node, id);
        },
        unGroup: function () {
            return this.ej2Instances.unGroup();
        },
        unSelect: function (obj) {
            return this.ej2Instances.unSelect(obj);
        },
        undo: function () {
            return this.ej2Instances.undo();
        },
        updateData: function (node) {
            return this.ej2Instances.updateData(node);
        },
        updateViewPort: function () {
            return this.ej2Instances.updateViewPort();
        },
        zoom: function (factor, focusedPoint) {
            return this.ej2Instances.zoom(factor, focusedPoint);
        },
        zoomTo: function (options) {
            return this.ej2Instances.zoomTo(options);
        },
    }
});
export var DiagramPlugin = {
    name: 'ejs-diagram',
    install: function (Vue) {
        Vue.component(DiagramPlugin.name, DiagramComponent);
        /*
        Vue.component(LayerPlugin.name, LayerDirective);
        Vue.component(LayersPlugin.name, LayersDirective);
        Vue.component(CustomCursorPlugin.name, CustomCursorDirective);
        Vue.component(CustomCursorsPlugin.name, CustomCursorsDirective);
        Vue.component(ConnectorPlugin.name, ConnectorDirective);
        Vue.component(ConnectorsPlugin.name, ConnectorsDirective);
        Vue.component(ConnectorFixedUserHandlePlugin.name, ConnectorFixedUserHandleDirective);
        Vue.component(ConnectorFixedUserHandlesPlugin.name, ConnectorFixedUserHandlesDirective);
        Vue.component(ConnectorAnnotationPlugin.name, ConnectorAnnotationDirective);
        Vue.component(ConnectorAnnotationsPlugin.name, ConnectorAnnotationsDirective);
        Vue.component(NodePlugin.name, NodeDirective);
        Vue.component(NodesPlugin.name, NodesDirective);
        Vue.component(NodeFixedUserHandlePlugin.name, NodeFixedUserHandleDirective);
        Vue.component(NodeFixedUserHandlesPlugin.name, NodeFixedUserHandlesDirective);
        Vue.component(NodeAnnotationPlugin.name, NodeAnnotationDirective);
        Vue.component(NodeAnnotationsPlugin.name, NodeAnnotationsDirective);
        Vue.component(PortPlugin.name, PortDirective);
        Vue.component(PortsPlugin.name, PortsDirective);
        */
    }
};
