// use
import lodash from 'lodash';
//import { TimelinePointer } from './TimelinePointer.js';

const chartTimelineGridRowCell = "chart-timeline-grid-row-cell",
    chartTimelineItemsRowItem = "chart-timeline-items-row-item";
const selectionStateName = "config.plugin.Selection";

function selectionData(options) {
    return Object.assign({
        enabled: true,
        showOverlay: true,
        isSelecting: false,
        pointerState: "up",
        selectKey: "",
        multiKey: "shift",
        multipleSelection: true,
        targetType: "",
        targetData: null,
        initialPosition: {
            x: 0,
            y: 0
        },
        currentPosition: {
            x: 0,
            y: 0
        },
        selectionAreaLocal: {
            x: 0,
            y: 0,
            width: 0,
            height: 0
        },
        selectionAreaGlobal: {
            x: 0,
            y: 0,
            width: 0,
            height: 0
        },
        selecting: {
            [chartTimelineGridRowCell]: [],
            [chartTimelineItemsRowItem]: []
        },
        selected: {
            [chartTimelineGridRowCell]: [],
            [chartTimelineItemsRowItem]: []
        },
        lastSelected: {
            [chartTimelineGridRowCell]: [],
            [chartTimelineItemsRowItem]: []
        },
        lastSelecting: {
            [chartTimelineGridRowCell]: [],
            [chartTimelineItemsRowItem]: []
        },
        automaticallySelected: {
            [chartTimelineGridRowCell]: [],
            [chartTimelineItemsRowItem]: []
        },
        events: {
            onStart() {},
            onSelecting: t => t,
            onEnd: t => t
        },
        pointerEvents: {
            down: null,
            move: null,
            up: null
        }
    }, options);
}

export class Selection {
    constructor(props, options) {
        this.onDestroy = [];
        this.started = false;
        this.lastAllEvents = {
            down: null,
            move: null,
            up: null
        };
        this.state = props.state;
        this.api = props.gapi;
        this.merge = lodash.merge;
        this.state.update(selectionStateName, selectionData(options));
        this.data = selectionData(options);
        
        this.selectAreaClassName = "br-chart-selection";
        this.selectAreaStyleMap = {
            display: "none"
        };

        this.slot = this.slot.bind(this);
        this.destroy = this.destroy.bind(this);
        this.setSlot();

        this.onCellCreate = this.onCellCreate.bind(this);
        this.apiGetSelection = this.apiGetSelection.bind(this);
        this.apiGetSelecting = this.apiGetSelecting.bind(this);
        this.apiGetSelected = this.apiGetSelected.bind(this);
        this.apiSetSelection = this.apiSetSelection.bind(this);
        this.apiSelectCells = this.apiSelectCells.bind(this);
        this.apiSelectItems = this.apiSelectItems.bind(this);

        this.api.plugins.Selection = {
            ITEM: chartTimelineItemsRowItem,
            CELL: chartTimelineGridRowCell,
            selectAreaClassName: this.selectAreaClassName,
            canSelect: this.canSelect.bind(this),
            getSelection: this.apiGetSelection,
            getSelected: this.apiGetSelected,
            getSelecting: this.apiGetSelecting,
            setSelection: this.apiSetSelection,
            selectCells: this.apiSelectCells,
            selectItems: this.apiSelectItems
        };

        this.state.update("config.chart.grid.cell.onCreate", value => {
            if ( !value.includes(this.onCellCreate) ) {
                value.push(this.onCellCreate);
            }
            return value;
        });
        this.updateData();

        this.onDestroy.push(this.state.subscribe(selectionStateName, (value => {
            this.data = value;
        })));

        this.selectedAction = this.selectedAction.bind(this);

        this.state.update("config.actions.br-chart-timeline-grid-row-cell", value => { 
            if ( !value.includes(this.selectedAction) ) {
                value.push(this.selectedAction);
            }
            return value;
        });

        this.state.update("config.actions.br-chart-timeline-items-row-item", value => {
            if ( !value.includes(this.selectedAction) ) {
                value.push(this.selectedAction);
            }
            return value;
        });
        
        this.onDestroy.push(this.state.subscribe("config.chart.items.*;", (() => {
            const items = this.api.getAllItems();
            this.data.selected[chartTimelineItemsRowItem] = this.data.selected[chartTimelineItemsRowItem].filter((id => !!items[id]));
            this.data.selecting[chartTimelineItemsRowItem] = this.data.selecting[chartTimelineItemsRowItem].filter((id => !!items[id]));

            const itemsData = this.api.getItemsData();

            for (const itemId in itemsData) {
                const itemData = itemsData[itemId];
                itemData.selected = this.data.selected[chartTimelineItemsRowItem].includes(itemId);
                itemData.selecting = this.data.selecting[chartTimelineItemsRowItem].includes(itemId);
            }
        }), {
            bulk: true,
            bulkValue: false
        }));

        this.onTimelinePointerDown = this.onTimelinePointerDown.bind(this);
        this.onTimelinePointerMove = this.onTimelinePointerMove.bind(this);
        this.onTimelinePointerUp = this.onTimelinePointerUp.bind(this);

        //console.log("Selection", this.api.plugins.TimelinePointer);
        //if ( !this.api.plugins.TimelinePointer ) {
            //this.timelinePointer = new TimelinePointer({}, props);
        //}
        //TimelinePointer.getInstance({}, props);

        this.api.plugins.TimelinePointer.addPointerListener("move", this.onTimelinePointerMove);
        this.api.plugins.TimelinePointer.addPointerListener("down", this.onTimelinePointerDown);
        this.api.plugins.TimelinePointer.addPointerListener("up", this.onTimelinePointerUp);
    }
    setSlot() {
        this.state.update("config.slots.br-chart-timeline-items.outer", (v => (v.includes(this.slot) || v.push(this.slot), v)));
    }
    slot(props) {
        let inVisible = true;
        return (data = {}, outerVNode) => {
            inVisible = true;
            
            const selectAreaStyleMap = data.renderProps.selectAreaStyleMap;
            //this.selectAreaClassName = "br-chart-selection";
        //this.selectAreaStyleMap = {
        //    display: "none"
        //};
            if ( this.canSelect() && this.data.isSelecting && this.data.showOverlay 
                 && this.data.multipleSelection && this.data.rectangularSelection ) {
                    selectAreaStyleMap.display = "block";
                    selectAreaStyleMap.left = this.data.selectionAreaLocal.x + "px";
                    selectAreaStyleMap.top = this.data.selectionAreaLocal.y + "px";
                    selectAreaStyleMap.width = this.data.selectionAreaLocal.width + "px";
                    selectAreaStyleMap.height = this.data.selectionAreaLocal.height + "px";
                    inVisible = false;
            } else {
                selectAreaStyleMap.display = "none";
            }

            //selectAreaStyleMap.vi
            return (
                <>
                    {outerVNode}
                    {selectAreaStyleMap.display != "block" ? null : <div class={this.selectAreaClassName} style={selectAreaStyleMap}></div>}
                </>
            );
        };
    }
    destroy() {
        this.api.plugins.TimelinePointer.removePointerListener("move", this.onTimelinePointerMove);
        this.api.plugins.TimelinePointer.removePointerListener("down", this.onTimelinePointerDown);
        this.api.plugins.TimelinePointer.removePointerListener("up", this.onTimelinePointerUp);
        
        //this.state.update("config.slots.chart-timeline-items.outer", (t => t.filter((t => t !== this.slot))));

        this.state.update("config.actions.br-chart-timeline-grid-row-cell", (t => t.filter((t => t !== this.selectedAction))));
        this.state.update("config.actions.br-chart-timeline-items-row-item", (t => t.filter((t => t !== this.selectedAction))));
        this.state.update("config.chart.grid.cell.onCreate", (t => t.filter((t => t !== this.onCellCreate))));
        this.onDestroy.forEach((t => t()));
    }
    updateData() {
        this.state.update(selectionStateName, Object.assign({}, this.data));
        //this.vido.update()
    }
    apiSetSelection(t) {
        this.data.selected = lodash.merge({}, t);
        let multi = this.state.multi(true);
        multi = this.updateCells(multi);
        multi = this.updateItems(multi);
        multi.done();
        this.updateData();
    }
    apiSelectCells(e) {
        this.data.selected[t] = [...e];
        let i = this.state.multi(!0);
        i = this.updateCells(i);
        i.done();
        this.updateData();
    }
    apiSelectItems(t) {
        this.data.selected[e] = [...t];
        let i = this.state.multi(!0);
        i = this.updateItems(i);
        i.done();
        this.updateData();
    }
    apiGetSelection() {
        return {
            selecting: this.getSelectionWithData(this.data.selecting),
            selected: this.getSelectionWithData(this.data.selected)
        };
    }
    apiGetSelecting() {
        return this.getSelectionWithData(this.data.selecting);
    }
    apiGetSelected() {
        return this.getSelectionWithData(this.data.selected);
    }
    modKeyPressed(modKey, e) {
        switch (modKey) {
            case "shift":
                return e.shiftKey;
            case "alt":
                return e.altKey;
            case "ctrl":
                return e.ctrlKey
        }
    }
    canSelect() {
        let t = this.data.enabled;
        const e = this.lastAllEvents.down;

        return e && this.data.selectKey && (t = t && this.modKeyPressed(this.data.selectKey, e)), 
            t && (this.data.cells || this.data.items);
    }
    getSelectionAreaLocal(t) {
        const e = {
                x: 0,
                y: 0,
                width: 0,
                height: 0
            },
            i = Object.assign({}, t.initialPosition),
            s = Object.assign({}, t.currentPosition),
            a = s.x - i.x,
            l = s.y - i.y;
        return a >= 0 ? (e.x = i.x, e.width = a) : (e.x = s.x, e.width = Math.abs(a)), 
            l >= 0 ? (e.y = i.y, e.height = l) : (e.y = s.y, e.height = Math.abs(l)), 
            e;
    }
    translateAreaLocalToGlobal(t) {
        const e = this.state.get("$data.chart.time.leftPx"),
            i = this.state.get("$data.scroll.vertical.absolutePosPx");
        return Object.assign(Object.assign({}, t), {
            x: t.x + e,
            y: t.y + i
        });
    }
    collectLinkedItems(t, e = this.api.getItemsData()) {
        if (!e[t]) {
            throw console.error('"config.chart.items"', this.state.get("config.chart.items")), console.error('"$data.chart.items"', this.state.get("$data.chart.items")), new Error(`Item with id "${t}" does not exists in "$data.chart.items".`);
        }
        return [t, ...e[t].linkedWith];
    }
    getSelectedItem(t) {
        let i, 
            s = this.data.automaticallySelected[chartTimelineItemsRowItem].slice();

        const a = this.collectLinkedItems(t.id);

        if (this.data.selected[chartTimelineItemsRowItem].find((e => e === t.id))) {
            i = this.data.selected[chartTimelineItemsRowItem];
            if (s.find((e => e === t.id))) {
                const e = s,
                    a = i.find((i => t.linkedWith.includes(i) && !e.includes(i)));
                s = s.filter((e => e !== t.id));
                s.push(a);
            } else {
                s = this.data.automaticallySelected[chartTimelineItemsRowItem];
            }
        } else {
            if ( this.isMulti() ) {
                i = Array.from(new Set([...this.data.selected[chartTimelineItemsRowItem], ...a]));
            } else {
                i  = a;
            }
            s = a.filter((e => e !== t.id));
        }

        i = i.map((e => (t = this.api.getItem(e), e)));

        return {
            selected: i,
            automaticallySelected: s
        };
    }
    isItemVerticallyInsideArea(t, e) {
        if (!e.width || !e.height) return !1;
        const i = e.y + e.height,
            s = t.position.viewTop,
            a = s + t.actualHeight;
        return s >= e.y && s <= i || a >= e.y && a <= i || s >= e.y && a <= i || s <= e.y && a >= i;
    }
    isItemHorizontallyInsideArea(t, e) {
        if (!e.width || !e.height) return !1;
        const i = e.x + e.width;
        return t.position.actualLeft >= e.x && t.position.actualLeft <= i || 
            t.position.actualRight >= e.x && t.position.actualRight <= i || 
            t.position.actualLeft <= e.x && t.position.actualRight >= i || 
            t.position.actualLeft >= e.x && t.position.actualRight <= i;
    }
    isMulti() {
        const t = this.lastAllEvents.move;
        return t && this.data.multiKey && this.modKeyPressed(this.data.multiKey, t);
    }
    getItemsUnderSelectionArea(t) {
        const e = this.state.get("$data.chart.visibleItems"),
            i = this.api.getItems(e),
            s = [],
            a = [];
        for (let e of i) {
            e = this.merge({}, e);
            const i = this.api.getItemData(e.id);
            if (this.isItemVerticallyInsideArea(i, t) && this.isItemHorizontallyInsideArea(i, t)) {
                s.find((t => t === e.id)) || s.push(e.id);
                const t = this.collectLinkedItems(e.id);
                for (const e of t) {
                    const t = this.api.getItem(e);
                    s.find((e => e === t.id)) || (s.push(t.id), a.push(t.id))
                }
            }
        }
        return {
            selectedItems: s,
            automaticallySelectedItems: a
        };
    }
    isCellVerticallyInsideArea(t, e) {
        if (!e.width || !e.height) return !1;
        const i = e.y + e.height,
            s = t.top,
            a = s + t.rowData.actualHeight;
        return s >= e.y && s <= i || 
            a >= e.y && a <= i || 
            s >= e.y && a <= i || 
            s <= e.y && a >= i;
    }
    isCellHorizontallyInsideArea(t, e) {
        if (!e.width || !e.height) return !1;
        const i = e.x + e.width,
            s = t.time.currentView.leftPx,
            a = t.time.currentView.rightPx;
        return s >= e.x && s <= i || 
            a >= e.x && a <= i || 
            s <= e.x && a >= i || 
            s >= e.x && a <= i;
    }
    getCellsUnderSelectionArea(t) {
        const e = this.state.get("$data.chart.grid.cells"),
            i = [];
        for (const s in e) {
            const a = e[s];
            this.isCellVerticallyInsideArea(a, t) && 
            this.isCellHorizontallyInsideArea(a, t) && 
            (i.find((t => t === a.id)) || i.push(a.id));
        }
        return {
            selectedCells: i
        }
    }
    updateItems(t) {
        if (!this.data.items) return t;
        const i = this.api.getAllItems(),
            s = Array.from(new Set([...this.data.selecting[chartTimelineItemsRowItem], ...this.data.selected[chartTimelineItemsRowItem]]));
        return t = t.update("$data.chart.items", (t => {
            for (const a in t)
                if (a in i)
                    if (s.includes(a)) {
                        const i = this.data.selecting[chartTimelineItemsRowItem].includes(a),
                            s = this.data.selected[chartTimelineItemsRowItem].includes(a);
                        t[a].selected = s;
                        t[a].selecting = i;
                    } else {
                        t[a].selected = !1;
                        t[a].selecting = !1;
                    }
            return t;
        }), {
            data: "selection"
        });
    }
    updateCurrentItems(t) {
        if (!this.data.items) return t;
        const i = this.state.get("$data.chart.items"),
            s = Array.from(new Set([...this.data.lastSelecting[chartTimelineItemsRowItem], 
                ...this.data.selecting[chartTimelineItemsRowItem], 
                ...this.data.selected[chartTimelineItemsRowItem]]));
        for (const t of s) {
            i[t].selecting = this.data.selecting[chartTimelineItemsRowItem].includes(t);
            i[t].selected = this.data.selected[chartTimelineItemsRowItem].includes(t);
        }
        return t;
    }
    updateCells(multi) {
        if (!this.data.cells) return multi;
        
        const allCells = this.api.getAllGridCells();

        multi.update("$data.chart.grid.cells", (cells => {
            for (const cellId in cells) {
                if (!(cellId in allCells)) continue;
                const cell = cells[cellId];
                cell.selected = this.data.selected[chartTimelineGridRowCell].includes(cell.id);
                cell.selecting = this.data.selecting[chartTimelineGridRowCell].includes(cell.id);
            }
            return cells;
        }));
        return multi;
    }

    updateVueChartTimelineItems() {
        const element = this.state.get("$data.elements.chart-timeline-items");
        if ( element && element instanceof HTMLElement ) {
            if ( element.__vnode && element.__vnode.ctx && element.__vnode.ctx.ctx ) {
                const vueComp = element.__vnode.ctx.ctx;
                if ( typeof vueComp.$forceUpdate == "function" ) {
                    //console.log("ssssss", vueComp)
                    vueComp.$forceUpdate();
                }
            }
        }
    }

    updateCurrentCells(e) {
        
        if (!this.data.cells) return e;
        const i = Array.from(new Set([...this.data.lastSelecting[chartTimelineGridRowCell], 
            ...this.data.selecting[chartTimelineGridRowCell], ...this.data.selected[chartTimelineGridRowCell]]));
        for (const s of i) {
            e = e.update(`$data.chart.grid.cells.${s}`,(e => {
                e.selected = this.data.selected[chartTimelineGridRowCell].includes(s);
                e.selecting = this.data.selecting[chartTimelineGridRowCell].includes(s);
                return e;
            }));
        }
        return e;
    }
    deselectItems() {
        if (!this.data.items) return;
        this.data.selected[chartTimelineItemsRowItem].length = 0;
        this.data.selecting[chartTimelineItemsRowItem].length = 0;
        let t = this.state.multi(!0);
        t = this.updateItems(t);
        t.done();
    }
    deselectCells() {
        if (!this.data.cells) return;
        this.data.selecting[chartTimelineGridRowCell].length = 0;
        this.data.selected[chartTimelineGridRowCell].length = 0;
        let e = this.state.multi(!0);
        e = this.updateCells(e);
        e.done();
    }
    getSelectionWithData(selectedItems) {
        //console.log("getSelectionWithData", selectedItems);
        const s = this.state.get("config.chart.items"),
            a = this.state.get("$data.chart.grid.cells");
        return {
            [chartTimelineGridRowCell]: selectedItems[chartTimelineGridRowCell].map((t => a[t] ? a[t] : t)),
            [chartTimelineItemsRowItem]: selectedItems[chartTimelineItemsRowItem].map((t => s[t] ? s[t] : t))
        };
    }
    onSelecting(selectedCells, selectedItems) {
        //console.log("onSelecting", selectedCells, selectedItems);
        const cells = this.getSelectionWithData(selectedCells),
            items = this.getSelectionWithData(selectedItems);
        if ( !this.started ) {
            this.data.events.onStart(items);
            this.started = true;
            this.api.muteMethod("fullReload");
            this.api.muteMethod("prepareExpanded");
            this.api.muteMethod("calculateRowsHeight");
            this.api.muteMethod("recalculateRowPercents");
            this.api.muteMethod("getLastPageRowsHeight");
            this.api.muteMethod("calculateVerticalScrollArea");
            this.api.muteMethod("calculateVisibleRowsHeights");
            this.api.muteMethod("generateVisibleRowsAndItems");
            this.api.muteMethod("recalculateTimes");
            this.api.muteMethod("heightChange");
        }
        this.updateVueChartTimelineItems();
        const n = this.data.events.onSelecting(cells, items);
        return {
            [chartTimelineGridRowCell]: n[chartTimelineGridRowCell].map((t => "string" != typeof t ? t.id : t)),
            [chartTimelineItemsRowItem]: n[chartTimelineItemsRowItem].map((t => "string" != typeof t ? t.id : t))
        };
    }
    onSelected(i, s) {
        const a = this.getSelectionWithData(i),
            l = this.getSelectionWithData(s),
            n = this.data.events.onEnd(a, l);
        
        this.started = !1;
        this.api.unmuteMethod("heightChange");
        this.api.unmuteMethod("recalculateTimes");
        this.api.unmuteMethod("generateVisibleRowsAndItems");
        this.api.unmuteMethod("calculateVisibleRowsHeights");
        this.api.unmuteMethod("calculateVerticalScrollArea");
        this.api.unmuteMethod("getLastPageRowsHeight");
        this.api.unmuteMethod("recalculateRowPercents");
        this.api.unmuteMethod("calculateRowsHeight");
        this.api.unmuteMethod("prepareExpanded");
        this.api.unmuteMethod("fullReload");
        return {
            [chartTimelineGridRowCell]: n[chartTimelineGridRowCell].map((t => "string" != typeof t ? t.id : t)),
            [chartTimelineItemsRowItem]: n[chartTimelineItemsRowItem].map((t => "string" != typeof t ? t.id : t))
        };
    }
    updateBodyClass() {
        this.data.isSelecting ? 
            document.body.classList.add(this.data.bodySelectingClassName) : 
            document.body.classList.remove(this.data.bodySelectingClassName);

        this.data.selected[chartTimelineGridRowCell].length || this.data.selected[chartTimelineItemsRowItem].length ? 
            document.body.classList.add(this.data.bodySelectedClassName) : 
            document.body.classList.remove(this.data.bodySelectedClassName);
    }
    selectMultipleCellsAndItems(eventParams) {
        if (!this.canSelect()) return;
        if (!this.data.multipleSelection) {
            this.deselectItems(); 
            this.deselectCells();
            this.updateData();
            return null;
        }
        this.data.isSelecting = true;
        this.data.selectionAreaLocal = this.getSelectionAreaLocal(eventParams);
        this.data.selectionAreaGlobal = this.translateAreaLocalToGlobal(this.data.selectionAreaLocal);
        const s = {
                [chartTimelineGridRowCell]: [],
                [chartTimelineItemsRowItem]: []
            },
            a = this.isMulti();

        if (this.data.cells) {
            const {
                selectedCells
            } = this.getCellsUnderSelectionArea(this.data.selectionAreaLocal);

            if ( 0 === selectedCells.length ) {
                s[chartTimelineGridRowCell].length = 0;
                a || (this.data.selected[chartTimelineGridRowCell].length = 0);
            } else {
                s[chartTimelineGridRowCell] = selectedCells;
            }
        }
        if (this.data.items) {
            const {
                selectedItems,
                automaticallySelectedItems
            } = this.getItemsUnderSelectionArea(this.data.selectionAreaLocal);
            this.data.automaticallySelected[chartTimelineItemsRowItem] = automaticallySelectedItems;
            if ( 0 === selectedItems.length ) {
                s[chartTimelineItemsRowItem].length = 0;
                a || (this.data.selected[chartTimelineItemsRowItem].length = 0);
            } else {
                s[chartTimelineItemsRowItem] = selectedItems;
            }
        }
        if (this.data.cells || this.data.items) {
            this.data.lastSelecting = {
                [chartTimelineItemsRowItem]: [...this.data.selecting[chartTimelineItemsRowItem]],
                [chartTimelineGridRowCell]: [...this.data.selecting[chartTimelineGridRowCell]]
            };
            this.data.selecting = this.onSelecting(s, lodash.merge({}, this.data.lastSelected));

            let i = this.state.multi(!0);
            this.data.cells && (i = this.updateCurrentCells(i));
            this.data.items && (i = this.updateCurrentItems(i));
            i.done();
        }
    }
    selectItemsIndividually(i) {
        this.data.isSelecting = !1;
        this.data.selectionAreaLocal = this.getSelectionAreaLocal(i);
        this.data.currentPosition = i.currentPosition;
        this.data.initialPosition = i.initialPosition;

        if (!this.data.items) return;
        if (!this.canSelect()) return;
        if (!i.targetData) return;

        const s = this.merge({}, i.targetData),
            a = this.api.getItemData(s.id);
        if (!a) {
            console.error('"config.chart.items"', this.state.get("config.chart.items"));
            console.error('"$data.chart.items"', this.state.get("$data.chart.items"));
            throw new Error(`Item with id "${s.id}" does not exists in "$data.chart.items". TIP: For performance reasons, state is mutable, so try not to modify items from the "state.get" method before you copy them (with "gstc.api.clone(items)" for example).`);
        }

        if (this.data.selected[chartTimelineItemsRowItem].includes(s.id)) return;

        let {
            selected,
            automaticallySelected
        } = this.getSelectedItem(s);

        if ( selected.length > 1 && !this.data.multipleSelection ) {
            selected = [s.id];
            automaticallySelected = [];
        }

        if ( this.isMulti() ) {
           if ( a.selected ) {
            this.data.selected[chartTimelineItemsRowItem] = selected.filter((t => t !== s.id && !automaticallySelected.includes(t)));
           } else {
            this.data.selected[chartTimelineItemsRowItem] = selected;
           }
        } else {
            this.data.selected[chartTimelineItemsRowItem] = selected;
            this.data.selected[chartTimelineGridRowCell].length = 0;
        }

        this.data.automaticallySelected[chartTimelineItemsRowItem] = automaticallySelected;
        this.data.lastSelecting = {
            [chartTimelineItemsRowItem]: [...this.data.selected[chartTimelineItemsRowItem]],
            [chartTimelineGridRowCell]: [...this.data.selected[chartTimelineGridRowCell]]
        };
        
        this.data.selected = this.onSelected(lodash.merge({}, this.data.selected), 
            lodash.merge({}, this.data.lastSelected));

        let c = this.state.multi(!0);
        c = this.updateCells(c);
        c = this.updateItems(c); 
        c.done();
    }
    removeMultiUnselected(t) {
        const e = this.data.selected[t].filter((e => this.data.selecting[t].includes(e))),
            i = [...this.data.selected[t], ...this.data.selecting[t]];
        return Array.from(new Set(i.filter((t => !e.includes(t)))));
    }
    finishSelection() {
        if (!this.canSelect()) return;

        let i;
        i = this.isMulti() ? {
            [chartTimelineGridRowCell]: this.data.cells ? this.removeMultiUnselected(chartTimelineGridRowCell) : [],
            [chartTimelineItemsRowItem]: this.data.items ? this.removeMultiUnselected(chartTimelineItemsRowItem) : []
        } : {
            [chartTimelineGridRowCell]: this.data.cells ? [...this.data.selecting[chartTimelineGridRowCell]] : [],
            [chartTimelineItemsRowItem]: this.data.items ? [...this.data.selecting[chartTimelineItemsRowItem]] : []
        };
        
        this.data.selected = this.onSelected(i, lodash.merge({}, this.data.lastSelected));
        this.data.lastSelected = lodash.merge({}, this.data.selected);
        this.data.cells && (this.data.selecting[chartTimelineGridRowCell].length = 0);
        this.data.items && (this.data.selecting[chartTimelineItemsRowItem].length = 0);
        let s = this.state.multi(!0);
        s = this.updateItems(s);
        s = this.updateCells(s);
        s.done();
    }
    onPointerData(eventParams) {
        this.lastAllEvents = eventParams.allEvents;

        if ( eventParams.isMoving && 
            eventParams.targetType === chartTimelineGridRowCell && 
            this.data.rectangularSelection ) {
            if ( !this.isMulti() && "down" === eventParams.type) {
                this.deselectCells();
            }
            this.selectMultipleCellsAndItems(eventParams);
        } else if ( eventParams.isMoving && 
            eventParams.targetType === chartTimelineGridRowCell && 
            !this.data.rectangularSelection ) {
            this.deselectItems();
        } else if ( eventParams.targetType === chartTimelineItemsRowItem ) {
            this.selectItemsIndividually(eventParams);
        } else {
            if ( !eventParams.isMoving ) {
                if ( this.data.isSelecting ) {
                    this.finishSelection();
                    this.data.isSelecting = false;
                }
            }
            if ( eventParams.isMoving && 
                eventParams.targetType !== chartTimelineGridRowCell && 
                eventParams.targetType !== chartTimelineItemsRowItem ) {
                this.deselectItems();
            }
            this.data.pointerState = eventParams.type;
            this.data.targetType = eventParams.targetType;
            this.data.targetData = eventParams.targetData;
        }

        if ( "down" === this.data.pointerState) {
            //console.log("down");
            let t = this.state.multi(true);
            t = this.updateItems(t);
            t = this.updateCells(t);
            t.done();
        }
        this.updateData();
        this.updateBodyClass();
    }
    onTimelinePointerDown(eventParams) {
        //console.log("down", eventParams);
        this.data.enabled && this.onPointerData(eventParams);
    }
    onTimelinePointerMove(eventParams) {
        this.data.enabled && this.onPointerData(eventParams);
    }
    onTimelinePointerUp(eventParams) {
        this.data.enabled && this.onPointerData(eventParams);
    }
    selectedAction(data, reactiveProps) {
        if ( data ) {

            const { itemInfo, cell } = data;
            //item
            if ( itemInfo ) {
                //console.log("selectedAction", itemInfo.itemData, reactiveProps);
        
                if ( reactiveProps.classArr ) {
                    if ( itemInfo.itemData.selecting ) {
                        if ( !reactiveProps.classArr.includes(this.data.selectingClassName) ) {
                            reactiveProps.classArr.push(this.data.selectingClassName);
                        }
                        if ( reactiveProps.classArr.includes(this.data.selectedClassName) ) {
                            lodash.remove(reactiveProps.classArr, v => v == this.data.selectedClassName);
                        }
                    } else {
                        if ( reactiveProps.classArr.includes(this.data.selectingClassName) ) {
                            lodash.remove(reactiveProps.classArr, v => v == this.data.selectingClassName);
                        }
                        if ( itemInfo.itemData.selected ) {
                            if ( !reactiveProps.classArr.includes(this.data.selectedClassName) ) {
                                reactiveProps.classArr.push(this.data.selectedClassName);
                            }
                        } else {
                            if ( reactiveProps.classArr.includes(this.data.selectedClassName) ) {
                                lodash.remove(reactiveProps.classArr, v => v == this.data.selectedClassName);
                            }
                        }
                    }
                }
            } else {
                //console.log(data, cell, reactiveProps); // ==> cell
                if ( reactiveProps.classArr ) {
                    if ( cell.selecting ) {
                        if ( !reactiveProps.classArr.includes(this.data.selectingClassName) ) {
                            reactiveProps.classArr.push(this.data.selectingClassName);
                        }
                        if ( reactiveProps.classArr.includes(this.data.selectedClassName) ) {
                            lodash.remove(reactiveProps.classArr, v => v == this.data.selectedClassName);
                        }
                    } else {
                        if ( reactiveProps.classArr.includes(this.data.selectingClassName) ) {
                            lodash.remove(reactiveProps.classArr, v => v == this.data.selectingClassName);
                        }
                        if ( cell.selected ) {
                            if ( !reactiveProps.classArr.includes(this.data.selectedClassName) ) {
                                reactiveProps.classArr.push(this.data.selectedClassName);
                            }
                        } else {
                            if ( reactiveProps.classArr.includes(this.data.selectedClassName) ) {
                                lodash.remove(reactiveProps.classArr, v => v == this.data.selectedClassName);
                            }
                        }
                    }
                }
            }
        }
    }
    onCellCreate(gridCell) {
        gridCell.selected = !!this.data.selected[chartTimelineGridRowCell].find((t => t === gridCell.id));
        gridCell.selecting = !!this.data.selecting[chartTimelineGridRowCell].find((t => t === gridCell.id));
        return gridCell.content;
    }
}

function Plugin(options = {}) {

    options = function(options) {

        !function(t) {
            if ( !t.events ) {
                t.events = {};
            }
            t.onStart && (t.events.onStart = t.onStart);
            t.onSelecting && (t.events.onSelecting = t.onSelecting);
            t.onSelected && (t.events.onEnd = t.onSelected);
        }(options);

        const defaultOptions = {
            enabled: true,
            cells: true,
            items: true,
            showOverlay: true,
            rectangularSelection: true,
            multipleSelection: true,
            selectedClassName: "br-selected",
            selectingClassName: "br-selecting",
            bodySelectedClassName: "br-is-selected",
            bodySelectingClassName: "br-is-selecting",
            events: {
                onStart() {},
                onSelecting: t => t,
                onEnd: t => t
            }
        };

        options.events = Object.assign(Object.assign({}, defaultOptions.events), options.events);

        return Object.assign(Object.assign({}, defaultOptions), options);
        
    }(options);

    return function(props) {
            const api = props.gapi;

            if (!api.isPluginInitialized("TimelinePointer")) {
                throw new Error("TimelinePointer plugin must be initialized before Selection plugin.");
            }

            const value = props.state.get(selectionStateName);
            if ( value ) {
                options = lodash.merge({}, [options, value]);
            }

            const selection = new Selection(props, options);

            api.pluginInitialized("Selection");

            return selection.destroy;
        }
}

export {
    Plugin
};