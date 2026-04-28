import lodash from 'lodash';
//import { TimelinePointer } from './TimelinePointer.js';

const ItemClassName = "chart-timeline-items-row-item";
const ItemMovementStateName = "config.plugin.ItemMovement";

class ItemMovement {
    constructor(props, options) {
        this.onDestroy = [];
        this.scrollWaiting = 0;
        this.state = props.state;
        this.api = props.gapi;
        
        const that = this;
        this.data = function(options = {}) {
            const events = {
                    onStart: ({ items }) => items.after,
                    onMove: ({ items }) => items.after,
                    onEnd: ({ items }) => items.after
                },
                snapToTime = {
                    start: ({ startTime, time, }) => that.api.time.findOrCreateMainDateAtTime(startTime.valueOf(), time).leftGlobalDate,
                    end: ({ endTime }) => endTime
                },
                autoScroll = {
                    speed: {
                        horizontal: 1,
                        vertical: 1
                    },
                    edgeThreshold: {
                        horizontal: 60,
                        vertical: 0
                    }
                },
                result = Object.assign({
                    enabled: true,
                    dependant: true,
                    moveDependantVertically: false,
                    addedDependantIds: [],
                    selectedIds: [],
                    debug: false,
                    state: "",
                    bodyClass: "br-items-moving",
                    itemClass: "",
                    movement: {
                        x: 0,
                        y: 0,
                        time: 0
                    },
                    threshold: {
                        horizontal: 10,
                        vertical: 10
                    },
                    initialItems: [],
                    initialItemsData: {},
                    clickedItem: null,
                    clickedItemData: null,
                    initialVerticalScroll: null,
                    initialHorizontalScroll: null,
                    initialPointerTime: null,
                    isMoving: false,
                    events: Object.assign({}, events),
                    snapToTime: Object.assign({}, snapToTime),
                    autoScroll: Object.assign({}, autoScroll),
                    ignoreMissingDates: true,
                    allowItemsToGoOutsideTheArea: true,
                    thresholdReached: {
                        horizontal: false,
                        vertical: false
                    },
                    rowChanged: false
            }, options);

            if ( options.snapToTime ) {
                result.snapToTime = Object.assign(Object.assign({}, snapToTime), options.snapToTime);
            }

            if ( options.events ) {
                result.events = Object.assign(Object.assign({}, events), options.events);
            }

            if ( options.autoScroll ) {
                result.autoScroll = Object.assign(Object.assign({}, autoScroll), options.autoScroll);
                if ( options.autoScroll.edgeThreshold ) {
                    result.autoScroll.edgeThreshold = Object.assign(Object.assign({}, autoScroll.edgeThreshold), 
                        options.autoScroll.edgeThreshold);
                }
                if ( options.autoScroll.speed ) {
                    result.autoScroll.speed = Object.assign(Object.assign({}, autoScroll.speed), options.autoScroll.speed);
                }
            }
            return result;
        }(options);
        
        if ( !this.data.itemClass ) {
            this.data.itemClass = "br-timeline-chart-items-row-item--moving";
        }
        
        this.destroy = this.destroy.bind(this);
        this.itemUpdateAction = this.itemUpdateAction.bind(this);

        this.state.update("config.actions.br-chart-timeline-items-row-item", value => {
            if ( !value.includes(this.itemUpdateAction) ) {
                value.push(this.itemUpdateAction);
            }
            return value;
        });

        this.onDestroy.push(this.state.subscribe("$data.elements.chart-timeline", (value => this.timelineElement = value)));

        this.updateData();
        
        this.onDestroy.push(this.state.subscribe("config.plugin.ItemMovement", (value => {
            if ( typeof document == "object" ) {
                if ( value.enabled && value.isMoving ) {
                    document.body.classList.add(value.bodyClass);
                } else {
                    document.body.classList.remove(value.bodyClass);
                }
            }
            this.data = value;
        })));

        this.onPointerMove = this.onPointerMove.bind(this);
        this.onPointerUp = this.onPointerUp.bind(this);
        this.onTimelinePointerDown = this.onTimelinePointerDown.bind(this); 
        this.onTimelinePointerMove = this.onTimelinePointerMove.bind(this);
        this.onTimelinePointerUp = this.onTimelinePointerUp.bind(this);

        //console.log("ItemMovement", this.api.plugins.TimelinePointer);
        //if ( !this.api.plugins.TimelinePointer ) {
            //this.timelinePointer = new TimelinePointer({}, props);
        //}
        //TimelinePointer.getInstance({}, props);

        this.api.plugins.TimelinePointer.addPointerListener("move", this.onTimelinePointerMove); 
        this.api.plugins.TimelinePointer.addPointerListener("down", this.onTimelinePointerDown);
        this.api.plugins.TimelinePointer.addPointerListener("up", this.onTimelinePointerUp);
    }
    destroy() {
        this.onDestroy.forEach((t => t()));
        this.api.plugins.TimelinePointer.removePointerListener("move", this.onTimelinePointerMove);
        this.api.plugins.TimelinePointer.removePointerListener("down", this.onTimelinePointerDown);
        this.api.plugins.TimelinePointer.removePointerListener("up", this.onTimelinePointerUp);
        this.state.update("config.actions.br-chart-timeline-items-row-item", (t => t.filter((t => t !== this.itemUpdateAction))));
        //if ( this.timelinePointer ) {
            //this.timelinePointer.destroy();
        //}
        //TimelinePointer.destroy();
    }
    updateData() {
        this.state.update(ItemMovementStateName, this.data);
    }
    getSelectedItems(e = false) {
        return this.state.get(`config.plugin.Selection.selected.${ItemClassName}`).map((itemId => {
            let item = this.api.getItem(itemId);
            if (e) {
                for (const iItem of this.data.initialItems) {
                    if (iItem.id === itemId) {
                        item = iItem;
                        break
                    }
                }
            }
            return lodash.merge({}, item);
        }));
    }
    getSelectedItemsData(items) {
        const itemsData = {};
        for (const item of items) {
            itemsData[item.id] = lodash.merge({}, this.api.getItemData(item.id));
        }
        return itemsData;
    }
    getEventArgument(t, e) {
        const i = this.api.getAllItems(),
            a = [];

        for (const e of t) {
            a.push(lodash.merge({}, i[e.id]));
        }

        return {
            items: {
                initial: this.data.initialItems,
                before: a,
                after: t,
                targetData: e.targetData
            },
            addedDependantIds: this.data.addedDependantIds,
            selectedIds: this.data.selectedIds,
            state: this.state,
            time: this.state.get("$data.chart.time")
        };
    }

    getDependantItems(t, e) {
        const i = [],
            a = this.api.getItemsData();
        for (const e of t) {
            for (const t of a[e.id].dependant) {
                if ( !i.includes(t) ) {
                    i.push(t);
                }
            }
        }
            
        const s = this.state.get("config.chart.items");
        let o;
        
        o = e ? i.map((t => this.data.initialItems.find((e => e.id === t)))) : i.map((t => s[t]));

        return o.map((t => lodash.merge({}, t)));
    }

    dispatchEvent(eventName, moveitems, e, itemDataToSave = null) {
        "onStart" === eventName && (this.api.muteMethod("fixOverlapped"), 
        this.api.muteMethod("fullReload"), 
        this.api.muteMethod("measureRows"), 
        this.api.muteMethod("getLastPageRowsHeight"), 
        this.api.muteMethod("calculateVerticalScrollArea"), 
        this.api.muteMethod("heightChange"), 
        this.api.muteMethod("calculateRowsHeight"), 
        this.api.muteMethod("calculateVisibleRowsHeights"), 
        this.api.muteMethod("updateVisibleItemsListener"), 
        this.api.muteMethod("prepareExpanded"), 
        0 === this.data.autoScroll.speed.horizontal && 0 === this.data.autoScroll.speed.vertical && 
            (this.api.muteMethod("generateVisibleRowsAndItems"), 
            this.api.muteMethod("prepareExpanded"))), 
            
        "onEnd" === eventName && (this.api.unmuteMethod("fixOverlapped"), 
        this.api.unmuteMethod("heightChange"), 
        this.api.unmuteMethod("calculateVerticalScrollArea"), 
        this.api.unmuteMethod("getLastPageRowsHeight"), 
        this.api.unmuteMethod("fullReload"), 
        this.api.unmuteMethod("measureRows"), 
        this.api.unmuteMethod("calculateRowsHeight"), 
        this.api.unmuteMethod("calculateVisibleRowsHeights"), 
        this.api.unmuteMethod("updateVisibleItemsListener"), 
        this.api.unmuteMethod("prepareExpanded"), 
        0 === this.data.autoScroll.speed.horizontal && 0 === this.data.autoScroll.speed.vertical && 
        (this.api.unmuteMethod("generateVisibleRowsAndItems"), 
        this.api.unmuteMethod("prepareExpanded"))), 
        
        moveitems = moveitems.map((t => lodash.merge({}, t)));

        const resItems = this.data.events[eventName](this.getEventArgument(moveitems, e));

        let multi = this.state.multi(true);
        const items = this.state.get("config.chart.items");
        const itemsData = this.state.get("$data.chart.items");

        for (let resItem of resItems) {
            resItem = lodash.merge({}, resItem);
            const item = items[resItem.id];

            let itemTimeChanged = false;

            if ( !(resItem.time.start === item.time.start && resItem.time.end === item.time.end) ) {
                itemTimeChanged = true;
                multi = multi.update(`config.chart.items.${resItem.id}.time`, Object.assign({}, resItem.time));
            }

            let rowChanged = false;

            if ( item.rowId !== resItem.rowId ) {
                rowChanged = true;
                multi = multi.update(`config.chart.items.${resItem.id}.rowId`, resItem.rowId);
                this.api.updateItemRowMapForItem(resItem.id, resItem.rowId);
            }

            if ( itemDataToSave && (itemTimeChanged || rowChanged) ) {
                multi = multi.update(`$data.chart.items.${resItem.id}`, lodash.merge({}, itemDataToSave[resItem.id]));
                //console.log("move", "old", item, itemsData[resItem.id], "new", resItem, this.data.initialItemsData[resItem.id]);
                //this.updateVueComp(resItem, itemsData[resItem.id]);
            }
        }
        multi.done();
        "onEnd" === eventName && this.api.partialReload(false);
    }

    updateVueComp(item, itemData) {
        const itemVueComps = this.state.get("$data.elements.chart-timeline-items-row-items");

        let selectItemVueComp = lodash.find(itemVueComps, (v) => v && v.itemInfo.item && v.itemInfo.item.id == item.id);

        if ( selectItemVueComp && selectItemVueComp.itemInfo && 
             selectItemVueComp.itemInfo.itemData ) {
                selectItemVueComp.change({
                    item,
                    itemData
                });
        }
    }

    getItemsForDiff() {
        const t = this.getSelectedItems()[0],
            e = this.data.initialItems.find((e => e.id === t.id));
        return {
            modified: t,
            original: e
        };
    }

    onTimelinePointerDown(e) {
        if ( this.data.enabled ) {
            if ( e.targetType == ItemClassName ) {
                if ( !this.api.plugins.TimelinePointer.isLocked("down") ) {
                    this.onPointerDown(e);
                }
            }
        }
    }
    onTimelinePointerMove(e) {
        if ( this.data.enabled && e.targetType === ItemClassName ) {
            if ( "item-movement" === this.api.plugins.TimelinePointer.isLocked("move") ) {
                this.onPointerMove(e);
            }
        }
    }
    onTimelinePointerUp(e) {
        if ( this.data.enabled && e.targetType === ItemClassName ) {
            if ( "item-movement" === this.api.plugins.TimelinePointer.isLocked("up") ) {
                this.onPointerUp(e);
            }
        }
    }
    onPointerDown(t) {
        document.body.classList.add(this.data.bodyClass);
        this.api.plugins.TimelinePointer.lock("down", "item-movement");
        this.api.plugins.TimelinePointer.lock("move", "item-movement");
        this.api.plugins.TimelinePointer.lock("up", "item-movement");

        this.data.isMoving = true;
        if (this.data.dependant) {
            const t = this.getSelectedItems();
            this.data.selectedIds = t.map((t => t.id));
            const e = this.getDependantItems(t, false).filter((t => !this.data.selectedIds.includes(t.id)));
            this.data.addedDependantIds = e.map((t => t.id));
            this.data.initialItems = [...t, ...e];
        } else {
            this.data.addedDependantIds = [];
            this.data.initialItems = this.getSelectedItems();
            this.data.selectedIds = this.data.initialItems.map((t => t.id));
        }
        this.data.initialItemsData = this.getSelectedItemsData(this.data.initialItems);
        this.data.clickedItem = lodash.merge({}, t.targetData);
        this.data.clickedItemData = lodash.merge({}, this.api.getItemData(this.data.clickedItem.id));
        this.data.initialVerticalScroll = lodash.merge({}, this.state.get("$data.scroll.vertical"));
        this.data.initialHorizontalScroll = lodash.merge({}, this.state.get("$data.scroll.horizontal"));
        this.data.initialPointerTime = this.api.time.date(this.api.time.getTimeFromOffsetPx(t.initialPosition.x, true));
        this.scrollWaiting = 0;
        this.data.thresholdReached.horizontal = false;
        this.data.thresholdReached.vertical = false;
        this.data.rowChanged = false;
        if ( !("" != this.data.state && "end" != this.data.state) ) {
            this.data.state = "move";
        } 
         this.dispatchEvent("onStart", this.data.initialItems, t);
         this.updateData();
    }
    scrollLeft() {
        if (!this.data.autoScroll.speed.horizontal) return;
        if (this.state.get("config.chart.time.calculatedZoomMode")) return;

        this.scrollWaiting++;

        const t = this.state.get("config.scroll.horizontal");
        if (this.data.autoScroll.speed.horizontal < 0) {
            if (this.scrollWaiting - 1 < Math.abs(this.data.autoScroll.speed.horizontal)) return;
            const e = this.api.getScrollLeft();
            if ( t.byPixels ) {
                this.api.setScrollLeft(e.absolutePosPx - 120 * t.multiplier);
            } else {
                this.api.setScrollLeft(e.dataIndex - 1);
            }
        } else if (this.data.autoScroll.speed.horizontal > 0) {
            const e = this.api.getScrollLeft();
            if ( t.byPixels ) {
                this.api.setScrollLeft(e.absolutePosPx - 120 * this.data.autoScroll.speed.horizontal * t.multiplier);
            } else {
                this.api.setScrollLeft(e.dataIndex - this.data.autoScroll.speed.horizontal);
            }
        }
        this.scrollWaiting = 0;
    }
    scrollRight() {
        if (!this.data.autoScroll.speed.horizontal) return;
        if (this.state.get("config.chart.time.calculatedZoomMode")) return;
        this.scrollWaiting++;
        const t = this.state.get("config.scroll.horizontal");
        if (this.data.autoScroll.speed.horizontal < 0) {
            if (this.scrollWaiting - 1 < Math.abs(this.data.autoScroll.speed.horizontal)) return;
            const e = this.api.getScrollLeft();
            if ( t.byPixels ) {
                this.api.setScrollLeft(e.absolutePosPx + 120 * t.multiplier);
            } else {
                this.api.setScrollLeft(e.dataIndex + 1);
            }
        } else if (this.data.autoScroll.speed.horizontal > 0) {
            const e = this.api.getScrollLeft();
            if ( t.byPixels ) {
                this.api.setScrollLeft(e.absolutePosPx + 120 * this.data.autoScroll.speed.horizontal * t.multiplier);
            } else {
                this.api.setScrollLeft(e.dataIndex + this.data.autoScroll.speed.horizontal);
            }
        }
        this.scrollWaiting = 0;
    }
    scrollTop() {
        if (this.data.autoScroll.speed.vertical) {
            this.scrollWaiting++;
            if (this.data.autoScroll.speed.vertical < 0) {
                if (this.scrollWaiting - 1 < Math.abs(this.data.autoScroll.speed.vertical)) return;
                const t = this.api.getScrollTop(),
                    e = this.state.get("config.scroll.vertical");
                if ( e.byPixels ) {
                    this.api.setScrollTop(t.absolutePosPx - 120 * e.multiplier);
                } else {
                    this.api.setScrollTop(t.dataIndex - 1);
                }
            } else if (this.data.autoScroll.speed.vertical > 0) {
                const t = this.api.getScrollTop(),
                    e = this.state.get("config.scroll.vertical");
                if ( e.byPixels ) {
                    this.api.setScrollTop(t.absolutePosPx - 120 * this.data.autoScroll.speed.vertical * e.multiplier);
                } else {
                    this.api.setScrollTop(t.dataIndex - this.data.autoScroll.speed.vertical);
                }
            }
            this.scrollWaiting = 0;
        }
    }
    scrollBottom() {
        if (this.data.autoScroll.speed.vertical) {
            this.scrollWaiting++;
            if (this.data.autoScroll.speed.vertical < 0) {
                if (this.scrollWaiting - 1 < Math.abs(this.data.autoScroll.speed.vertical)) return;
                const t = this.api.getScrollTop(),
                    e = this.state.get("config.scroll.vertical");
                if ( e.byPixels ) {
                    this.api.setScrollTop(t.absolutePosPx - 120 * e.multiplier);
                } else {
                    this.api.setScrollTop(t.dataIndex + 1);
                }
            } else if (this.data.autoScroll.speed.vertical > 0) {
                const t = this.api.getScrollTop(),
                    e = this.state.get("config.scroll.vertical");
                if ( e.byPixels ) {
                    this.api.setScrollTop(t.absolutePosPx + 120 * this.data.autoScroll.speed.vertical * e.multiplier);
                } else {
                    this.api.setScrollTop(t.dataIndex + this.data.autoScroll.speed.vertical);
                }
            }
            this.scrollWaiting = 0;
        }
    }
    autoScroll(t) {
        if (!this.timelineElement) return;
        const e = t.currentPosition.x,
            i = t.currentPosition.y,
            a = this.state.get("$data.chart.dimensions");
        
        if ( e < this.data.autoScroll.edgeThreshold.horizontal ) {
            this.scrollLeft();
        } else {
            if ( e > a.widthWithoutScrollBar - this.data.autoScroll.edgeThreshold.horizontal ) {
                this.scrollRight();
            } else {
                if ( i < this.data.autoScroll.edgeThreshold.vertical ) {
                    this.scrollTop();
                } else {
                    if ( i > a.innerHeight - this.data.autoScroll.edgeThreshold.vertical ) {
                        this.scrollBottom();
                    }
                }
            }
        }
    }

    moveItemVertically(moveItem, initialItemData, eventParams) {
        if (this.data.addedDependantIds.includes(moveItem.id) && !this.data.moveDependantVertically) return;

        const scrollVertPos = this.state.get("$data.scroll.vertical").absolutePosPx - this.data.initialVerticalScroll.absolutePosPx,
            vertMovePos = eventParams.currentPosition.y - eventParams.initialPosition.y,
            vertThreshold = this.data.threshold.vertical;

        if ( Math.abs(vertMovePos) >= vertThreshold ) {
            this.data.thresholdReached.vertical = true;
        }

        if (!this.data.thresholdReached.vertical) return;

        const moveGap = this.data.clickedItemData.position.viewTop - eventParams.initialPosition.y - this.data.clickedItemData.position.rowTop;
        let top = initialItemData.position.top + vertMovePos + scrollVertPos - moveGap;
        if ( top < 0 ) {
            top = 0;
        }
        const rowInfo = this.api.getRowInfoFromTop(top);
        if ( rowInfo.row.id !== moveItem.rowId ) {
            moveItem.rowId = rowInfo.row.id;
            initialItemData.position.viewTop = this.api.getRowViewTop(moveItem.rowId);
            initialItemData.position.rowTop = 0;
            this.data.rowChanged = true;
        }
    }

    getItemsToMove(t = false) {
        let e, i = [];
        if (this.data.dependant) {
            const a = this.getSelectedItems(t),
                s = a.map((t => t.id)),
                o = this.getDependantItems(a, t).filter((t => !s.includes(t.id)));

            i = o.map((t => t.id));
            e = [...a, ...o];
        } else {
            e = this.getSelectedItems(t);
        }

        return {
            itemsToMove: e,
            dependantIds: i
        }
    }

    calculateFinalLeftGlobal({ diffPx, initialItemData, initialItem, isDependant,
        movement, itemDataToSave, time
    }) {
        //console.log("left", initialItemData.position.left, diffPx);
        const n = initialItemData.position.left + diffPx;
        let d = this.api.time.getTimeFromOffsetPx(n, true, time);
        if (isDependant) {
            const t = this.data.initialItems.find((t => {
                    var e;
                    return null === (e = t.dependant) || void 0 === e ? void 0 : e.includes(initialItem.id)
                })),
                a = this.data.initialItemsData[t.id],
                s = itemDataToSave[a.id],
                n = this.api.time.getDatesDiffMs(a.time.endDate, s.time.endDate, time, true);
            let h = -this.api.time.getDSTDiffForLevel(time.level, a.time.endDate.valueOf(), initialItemData.time.startDate.valueOf(), time);
            d = this.api.time.addTimeFromDates(initialItemData.time.startDate.valueOf(), n + h, time);
            h = this.api.time.getDSTDiffForLevel(time.level, s.time.endDate.valueOf(), d, time);
            d += h;
        }
        const h = this.api.time.date(d);
        let r = h;

        if ( !isDependant ) {
            r = this.data.snapToTime.start({
                startTime: h,
                item: initialItem,
                time: time,
                movement: movement,
            });
        }
        return r;
    }

    calculateFinalRightGlobal({ finalLeftGlobalDate, initialItemData, initialItem,
        isDependant, movement, time
    }) {
        const l = this.api.time.getViewOffsetPxFromDates(finalLeftGlobalDate, false, time);
        let n = -this.api.time.getDSTDiffForLevel(time.level, initialItem.time.start, initialItem.time.end, time);
        const d = l + initialItemData.timeWidth;
        let h;
        const r = initialItem.time.end - initialItem.time.start;

        if ( this.data.ignoreMissingDates ) {
            h = this.api.time.date(this.api.time.getTimeFromOffsetPx(d, true, time));
        } else {
            h = this.api.time.date(finalLeftGlobalDate.valueOf() + r);
        }
        
        n += this.api.time.getDSTDiffForLevel(time.level, finalLeftGlobalDate.valueOf(), h.valueOf(), time);
        h = h.add(n, "ms");
        let m = h;
        if ( !isDependant ) {
            m = this.data.snapToTime.end({
                endTime: h,
                item: initialItem,
                time: time,
                movement: movement,
            });
        }
        return m;
    }

    onPointerMove(t) {
        if (!this.data.enabled) return;
        if (!this.data.isMoving) return;

        //console.log("ItemMovement", "onPointerMove");
        const { original, modified } = this.getItemsForDiff();
        
        if (!original) return;

        const movement = this.data.movement = Object.assign(Object.assign({}, t.movement), {
                time: modified.time.start - original.time.start
            }),
            thresholdHorz = this.data.threshold.horizontal,
            thresholdVert = this.data.threshold.vertical;

        this.data.thresholdReached.horizontal = this.data.thresholdReached.horizontal || Math.abs(movement.x) >= thresholdHorz;
        this.data.thresholdReached.vertical = this.data.thresholdReached.vertical || Math.abs(movement.y) >= thresholdVert;

        if (!this.data.thresholdReached.horizontal && !this.data.thresholdReached.vertical) return;

        "move" !== this.data.state && "start" !== this.data.state || (this.data.state = "move");

        const { itemsToMove, dependantIds } = this.getItemsToMove(true), 
            itemDataToSave = {}, 
            time = this.state.get("$data.chart.time"), 
            moveItems = [], 
            snapToTime = this.data.snapToTime.start({
                startTime: this.data.initialPointerTime,
                item: null,
                time,
                movement,
            }), 
            scrollHoriz = this.state.get("$data.scroll.horizontal"), 
            diffOffset = this.api.time.getDatesDiffPx(scrollHoriz.data.leftGlobalDate.subtract(scrollHoriz.preciseOffset * time.timePerPixel, "ms"), 
                this.data.initialHorizontalScroll.data.leftGlobalDate.subtract(this.data.initialHorizontalScroll.preciseOffset * time.timePerPixel, 
                "ms"), time, true), 
            diffTime = this.api.time.date(this.api.time.getTimeFromOffsetPx(t.currentPosition.x + diffOffset, true, time)), 
            diffPx = this.api.time.getDatesDiffPx(snapToTime, diffTime, time, true);

        for (let i = 0, len = itemsToMove.length; i < len; i++) {
            const moveItem = lodash.merge({}, itemsToMove[i]),
                initialItemData = lodash.merge({}, this.data.initialItemsData[moveItem.id]),
                isDependant = dependantIds.includes(moveItem.id);

            this.moveItemVertically(moveItem, initialItemData, t);

            if (this.data.thresholdReached.horizontal) {
                const startTime = this.calculateFinalLeftGlobal({
                        diffPx,
                        initialItemData,
                        initialItem: moveItem,
                        isDependant,
                        movement,
                        itemDataToSave,
                        time
                    }),
                    endTime = this.calculateFinalRightGlobal({
                        finalLeftGlobalDate: startTime,
                        initialItemData,
                        initialItem: moveItem,
                        isDependant,
                        movement,
                        time
                    });
                if (!(startTime.valueOf() < time.from || endTime.valueOf() > time.to) || 
                    "function" != typeof time.format.periodIncrement && 
                    this.data.allowItemsToGoOutsideTheArea) {
                        moveItem.time.start = startTime.valueOf();
                        moveItem.time.end = endTime.valueOf();
                        initialItemData.time.startDate = startTime;
                        initialItemData.time.endDate = endTime;
                } else {
                    const tmpItem = this.api.getItem(moveItem.id);
                    moveItem.time.start = tmpItem.time.start;
                    moveItem.time.end = tmpItem.time.end;
                    initialItemData.time.startDate = this.api.time.date(moveItem.time.start);
                    initialItemData.time.endDate = this.api.time.date(moveItem.time.end);
                }
            }
            itemDataToSave[moveItem.id] = initialItemData;
            moveItems.push(moveItem);
        }
        
        if ( this.data.thresholdReached.horizontal || this.data.thresholdReached.vertical ) {
            //console.log("onMove", moveItems);
            this.dispatchEvent("onMove", moveItems, t, itemDataToSave);
        }

        if ( diffPx && (this.data.thresholdReached.horizontal || this.data.thresholdReached.vertical) ) {
            this.autoScroll(t);
        }
        this.updateData();
    }

    onEnd(t) {
        const { itemsToMove } = this.getItemsToMove(false);
        this.dispatchEvent("onEnd", itemsToMove, t);
    }

    onPointerUp(t) {
        document.body.classList.remove(this.data.bodyClass);
        if ( this.data.enabled && this.data.isMoving ) {
            if ( "move" === this.data.state ) {
                this.data.state = "end";
            }
            this.data.isMoving = false;
            this.onEnd(t);
            this.updateData();
            this.api.plugins.TimelinePointer.unlock("down"); 
            this.api.plugins.TimelinePointer.unlock("move"); 
            this.api.plugins.TimelinePointer.unlock("up");
        }
    }
    itemUpdateAction(data = {}, reactiveProps) {
        const { itemInfo } = data;
        const { element } = reactiveProps;
        if ( this.data.initialItems.find((t => t.id === itemInfo.item.id)) && this.data.isMoving ) {
            element && element.classList && element.classList.add(this.data.itemClass);
        } else {
            element && element.classList && element.classList.remove(this.data.itemClass);
        }
    }
}


function Plugin(options = {}) {
    return function(props) {
        const api = props.gapi;

        if (!api.isPluginInitialized("TimelinePointer")) {
            throw new Error("TimelinePointer plugin must be initialized before ItemMovement plugin.");
        }
        if (!api.isPluginInitialized("Selection")) {
            throw new Error("Selection plugin must be initialized before ItemMovement plugin.");
        }
        
        const value = api.state.get(ItemMovementStateName);

        if ( value ) {
            options = lodash.merge({}, [options, value]);
        }
        
        const instance = new ItemMovement(props, options);
        api.pluginInitialized("ItemMovement");

        return instance.destroy;
    }
}

export {
    Plugin
};