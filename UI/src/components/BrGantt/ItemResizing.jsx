import lodash from 'lodash';
//import { TimelinePointer } from './TimelinePointer.js';

const chartTimelineItemsRowItem = "chart-timeline-items-row-item";

/*
function i(t, i = "") {
    let s = `${e}__${t}`;
    t === e && (s = e);
    return i ? `${s} ${s}--${i.replace(":","-")}` : s
}
*/
//const s = i("chart-timeline-items-row-item-resizing-handle-content-line");
/*
const a = "ItemResizing",
    n = `config.plugin.${a}`,
*/

const ItemResizingContentLineClass = "br-chart-timeline-items-row-item-resizing-handle-content-line",
    ItemResizingStateName = "config.plugin.ItemResizing", 
    resizingHandleClass = "br-chart-timeline-items-row-item-resizing-handle",
    leftSuffixClass = "--left",
    rightSuffixClass = "--right";

class ItemResizing {

    constructor(props, options) {
        this.onDestroy = [];
        this.scrollWaiting = 0;
        this.state = props.state;
        this.api = props.gapi;

        const that = this;

        this.data = function(options = {}) {
            const events = {
                    onStart: ({ items }) => items.after,
                    onResize: ({ items }) => items.after,
                    onEnd: ({ items }) => items.after
                },
                snapToTime = {
                    start: ({ startTime, time }) => that.api.time.findOrCreateMainDateAtTime(startTime.valueOf(), time).leftGlobalDate,
                    end: ({ endTime, time }) => that.api.time.findOrCreateMainDateAtTime(endTime.valueOf(), time).rightGlobalDate
                },
                handle = {
                    width: 18,
                    horizontalMargin: 0,
                    verticalMargin: 0,
                    outside: false,
                    outsideWidth: 14,
                    outsideHorizontalMargin: 6,
                    onlyWhenSelected: true
                },
                result = Object.assign({
                    enabled: true,
                    dependant: true,
                    addedDependantIds: [],
                    selectedIds: [],
                    debug: false,
                    state: "",
                    content: null,
                    bodyClass: "br-items-resizing",
                    bodyClassLeft: "br-items-resizing-left",
                    bodyClassRight: "br-items-resizing-right",
                    outsideWidthThreshold: 100,
                    movement: {
                        px: 0,
                        time: 0
                    },
                    initialItems: [],
                    initialItemsData: {},
                    initialHorizontalScroll: null,
                    leftIsMoving: false,
                    rightIsMoving: false,
                    handle: Object.assign({}, handle),
                    events: Object.assign({}, events),
                    snapToTime: Object.assign({}, snapToTime),
                    autoScroll: {
                        speed: 1,
                        edgeThreshold: 60
                    },
                    ignoreMissingDates: true,
                    allowItemsToGoOutsideTheArea: true,
                    threshold: 10,
                    thresholdReached: false
                }, options);

            if ( options.snapToTime ) {
                result.snapToTime = Object.assign(Object.assign({}, snapToTime), options.snapToTime);
            }

            if ( options.events ) {
                result.events = Object.assign(Object.assign({}, events), options.events);
            }

            if ( options.handle ) {
                result.handle = Object.assign(Object.assign({}, handle), options.handle);
            }
            if ( options.autoScroll ) {
                result.autoScroll = Object.assign(Object.assign({}, result.autoScroll), options.autoScroll);
            }
            return result;
        }(options);
        
        
        if ( !this.data.content ) {
            this.data.content = {
                left: ([<div class={ItemResizingContentLineClass}></div>, <div class={ItemResizingContentLineClass}></div>]),
                right: ([<div class={ItemResizingContentLineClass}></div>, <div class={ItemResizingContentLineClass}></div>]),
            };
        }
        
        this.getItemResizingInnerSlot = this.getItemResizingInnerSlot.bind(this);
        /*
        this.PluginItemResizingOuterSlot = this.PluginItemResizingOuterSlot.bind(this);
        */

        this.onRightPointerDown = this.onRightPointerDown.bind(this);
        this.onRightPointerMove = this.onRightPointerMove.bind(this);
        this.onRightPointerUp = this.onRightPointerUp.bind(this);
        this.onLeftPointerDown = this.onLeftPointerDown.bind(this);
        this.onLeftPointerMove = this.onLeftPointerMove.bind(this);
        this.onLeftPointerUp = this.onLeftPointerUp.bind(this);

        this.destroy = this.destroy.bind(this);
        this.updateData();

        this.onDestroy.push(this.state.subscribe("$data.elements.chart-timeline", (value => this.timelineElement = value)));

        this.onDestroy.push(this.state.subscribe(ItemResizingStateName, value => {
            if ( typeof document == "object" ) {
                if ( value.enabled ) {
                    document.body.classList.add(value.bodyClass);
                } else {
                    document.body.classList.remove(value.bodyClass);
                }
            }
            this.data = value;
        }));
        
        this.onTimelinePointerDown = this.onTimelinePointerDown.bind(this);
        this.onTimelinePointerMove = this.onTimelinePointerMove.bind(this);
        this.onTimelinePointerUp = this.onTimelinePointerUp.bind(this);
        
        //if ( !this.api.plugins.TimelinePointer ) {
            //this.timelinePointer = new TimelinePointer({}, props);
        //}
        //TimelinePointer.getInstance({}, props);
            
        this.api.plugins.TimelinePointer.addPointerListener("move", this.onTimelinePointerMove);
        this.api.plugins.TimelinePointer.addPointerListener("down", this.onTimelinePointerDown);
        this.api.plugins.TimelinePointer.addPointerListener("up", this.onTimelinePointerUp);
        
        this.state.update("config.slots.br-chart-timeline-items-row-item.inner", value => {
            if ( !value.includes(this.getItemResizingInnerSlot) ) {
                value.push(this.getItemResizingInnerSlot);
            }
            return value;
        });
        /*
        this.state.update("config.slots.chart-timeline-items-row-item.outer", value => {
            if ( !value.includes(this.PluginItemResizingOuterSlot) ) {
                value.push(this.PluginItemResizingOuterSlot);
            }
            return value;
        });
        */

    }
    destroy() {
        this.onDestroy.forEach((t => t()));
        this.api.plugins.TimelinePointer.removePointerListener("move", this.onTimelinePointerMove);
        this.api.plugins.TimelinePointer.removePointerListener("down", this.onTimelinePointerDown);
        this.api.plugins.TimelinePointer.removePointerListener("up", this.onTimelinePointerUp);

        this.state.update("config.slots.chart-timeline-items-row-item.inner", (t => t.filter((t => t !== this.getItemResizingInnerSlot))));
        this.api.pluginDestroyed("ItemResizing");

        //this.timelinePointer.destroy();
        //TimelinePointer.destroy();
        /*
        
        this.state.update("config.slots.chart-timeline-items-row-item.outer", (t => t.filter((t => t !== this.PluginItemResizingOuterSlot))));
        
        */
    }
    updateData() {
        this.state.update(ItemResizingStateName, this.data);
    }
    setUpClasses(resize = false) {
        this.leftClassName = resizingHandleClass;
        this.leftClassName += " " + this.leftClassName + leftSuffixClass;
        this.rightClassName = resizingHandleClass;
        this.rightClassName += " " + this.rightClassName + rightSuffixClass;
        if ( resize ) {
            this.leftClassName += ` ${resizingHandleClass}--left-outside`;
            this.rightClassName += ` ${resizingHandleClass}--right-outside`;
        }
    }
    getSelectedItems() {
        return this.state.get(`config.plugin.Selection.selected.${chartTimelineItemsRowItem}`).map(value => {
            return lodash.merge({}, this.api.getItem(value));
        });
    }
    getSelectedItemsData(items) {
        const res = {};
        for (const item of items) {
            res[item.id] = lodash.merge({}, this.api.getItemData(item.id));
        }
        return res;
    }
    updateRightStyleMap(item, styleMap) {
        const itemData = this.api.getItemData(item.id);
        styleMap.top = "0px";
        if ( this.data.handle.outside || itemData.actualWidth < this.data.outsideWidthThreshold ) {
            styleMap.position = "absolute";
            styleMap.left = itemData.position.actualRight + this.data.handle.outsideHorizontalMargin + "px";
            styleMap.width = this.data.handle.outsideWidth + "px";
            styleMap.top = itemData.position.actualRowTop + "px";
            this.setUpClasses(true);
        } else {
            styleMap.position = "static";
            styleMap.width = this.data.handle.width + "px";
            this.setUpClasses(false);
        }
        styleMap.height = itemData.actualHeight - 2 * this.data.handle.verticalMargin + "px";

        if ( itemData.outOfView.right ) {
            styleMap.display = "none";
        } else {
            styleMap.display = "flex";
        }
        return styleMap;
    }
    updateLeftStyleMap(item, styleMap) {
        const itemData = this.api.getItemData(item.id);
        styleMap.top = "0px";
        if ( this.data.handle.outside || itemData.actualWidth < this.data.outsideWidthThreshold ) {
            styleMap.position = "absolute";
            styleMap.left = itemData.position.actualLeft - (this.data.handle.outsideWidth + this.data.handle.outsideHorizontalMargin) + "px";
            styleMap.width = this.data.handle.outsideWidth + "px";
            styleMap.top = itemData.position.actualRowTop + "px";
            this.setUpClasses(true);
        } else {
            styleMap.position = "static";
            styleMap.left = this.data.handle.horizontalMargin + "px";
            styleMap.width = this.data.handle.width + "px";
            this.setUpClasses(false);
        }

        styleMap.height = itemData.actualHeight - 2 * this.data.handle.verticalMargin + "px";
        if ( itemData.outOfView.left ) {
            styleMap.display = "none";
        } else {
            styleMap.display = "flex";
        }
        return styleMap;
    }
    getEventArgument(itemsToMove) {
        const allItems = this.api.getAllItems(),
            items = [];
        for (const item of itemsToMove) {
            items.push(lodash.merge({}, allItems[item.id]));
        }
        return {
            items: {
                initial: this.data.initialItems,
                before: items,
                after: itemsToMove
            },
            addedDependantIds: this.data.addedDependantIds,
            selectedIds: this.data.selectedIds,
            state: this.state,
            time: this.state.get("$data.chart.time")
        };
    }
    getDependantItems(items) {
        const res = [],
            itemsData = this.api.getItemsData();
        for (const item of items) {
            for (const dependItemsId of itemsData[item.id].dependant) {
                if ( !res.includes(dependItemsId) ) {
                    res.push(dependItemsId);
                }
            }
        }
            
        const allItems = this.state.get("config.chart.items");
        return res.map((v => allItems[v])).map((v => lodash.merge({}, v)));
    }

    dispatchEvent(eventName, itemsToMove, itemsData = null) {
        if ( "onStart" === eventName ) {
            this.api.muteMethod("fixOverlapped");
            this.api.muteMethod("fullReload");
            this.api.muteMethod("recalculateRowPercents");
            this.api.muteMethod("getLastPageRowsHeight");
            this.api.muteMethod("calculateVerticalScrollArea");
            this.api.muteMethod("heightChange");
            this.api.muteMethod("calculateRowsHeight");
            this.api.muteMethod("updateVisibleItemsListener");
            this.api.muteMethod("prepareExpanded");
            if ( 0 === this.data.autoScroll.speed && 0 === this.data.autoScroll.speed ) {
                this.api.muteMethod("generateVisibleRowsAndItems");
                this.api.muteMethod("calculateVisibleRowsHeights");
                this.api.muteMethod("prepareExpanded");
            }
        }

        if ( "onEnd" === eventName ) {
            this.api.unmuteMethod("fixOverlapped");
            this.api.unmuteMethod("heightChange");
            this.api.unmuteMethod("calculateVerticalScrollArea");
            this.api.unmuteMethod("getLastPageRowsHeight");
            this.api.unmuteMethod("recalculateRowPercents");
            this.api.unmuteMethod("fullReload");
            this.api.unmuteMethod("calculateRowsHeight");
            this.api.unmuteMethod("updateVisibleItemsListener");
            this.api.unmuteMethod("prepareExpanded");
            if ( 0 === this.data.autoScroll.speed && 0 === this.data.autoScroll.speed ) {
                this.api.unmuteMethod("generateVisibleRowsAndItems");
                this.api.unmuteMethod("calculateVisibleRowsHeights");
                this.api.unmuteMethod("prepareExpanded");
            }
        }

        itemsToMove = itemsToMove.map((t => lodash.merge({}, t)));

        const resItems = this.data.events[eventName](this.getEventArgument(itemsToMove));

        let multi = this.state.multi(true);

        const items = this.state.get("config.chart.items");

        for (const item of resItems) {
            let changed = false;
            const curItem = items[item.id];
            if ( !(item.time.start === curItem.time.start && item.time.end === curItem.time.end) ) {
                changed = true;
                multi = multi.update(`config.chart.items.${item.id}.time`, item.time);
            }
            
            if ( itemsData && changed ) {
                multi = multi.update(`$data.chart.items.${item.id}`, lodash.merge({}, itemsData[item.id]));
                this.updateVueComp(item, itemsData[item.id]); 
            }
        }
        multi.done();
        
        if ( "onEnd" === eventName  ) {
            this.api.partialReload(false);
        }
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
        const modified = this.getSelectedItems()[0],
            original = this.data.initialItems.find((v => v.id === modified.id));
        return {
            modified,
            original
        }
    }
    onTimelinePointerDown(e) {
        if ( this.data.enabled ) {
            if ( !(e.targetType !== chartTimelineItemsRowItem || this.api.plugins.TimelinePointer.isLocked("down")) ) {
                this.onPointerDown(e);
            }
        }
    }
    onTimelinePointerMove(e) {
        if ( this.data.enabled ) {
            if ( e.targetType === chartTimelineItemsRowItem && 
                "item-resizing" === this.api.plugins.TimelinePointer.isLocked("move") ) {
                this.onPointerMove(e);
            }
        }
    }
    onTimelinePointerUp(e) {
        if ( this.data.enabled ) {
            if ( e.targetType === chartTimelineItemsRowItem && 
                "item-resizing" === this.api.plugins.TimelinePointer.isLocked("up") ) {
                this.onPointerUp(e);
            }
        }
    }
    onPointerDown(e) {
        const target = e.originalEvent.target.closest("." + resizingHandleClass);
        if (target && !this.api.plugins.TimelinePointer.isLocked("down")) {
            this.api.plugins.TimelinePointer.lock("down", "item-resizing");
            this.api.plugins.TimelinePointer.lock("move", "item-resizing");
            this.api.plugins.TimelinePointer.lock("up", "item-resizing");
            e.originalEvent.preventDefault();
            e.originalEvent.stopPropagation();
            if (this.data.dependant) {
                const selectItems = this.getSelectedItems();
                this.data.selectedIds = selectItems.map((v => v.id));
                const dependantItems = this.getDependantItems(selectItems).filter((v => !this.data.selectedIds.includes(v.id)));
                this.data.addedDependantIds = dependantItems.map((v => v.id));
                this.data.initialItems = [...selectItems, ...dependantItems];
            } else {
                this.data.initialItems = this.getSelectedItems();
                this.data.addedDependantIds = [];
                this.data.selectedIds = this.data.initialItems.map((v => v.id));
            }
            this.data.initialItemsData = this.getSelectedItemsData(this.data.initialItems);
            this.data.initialHorizontalScroll = lodash.merge({}, this.state.get("$data.scroll.horizontal"));
            this.data.thresholdReached = false;

            if ( !("" !== this.data.state && "end" !== this.data.state) ) {
                this.data.state = "resize";
            }

            if ( target.classList.contains(resizingHandleClass + leftSuffixClass) ) {
                this.onLeftPointerDown();
            }
            if ( target.classList.contains(resizingHandleClass + rightSuffixClass) ) {
                this.onRightPointerDown();
            }
            this.dispatchEvent("onStart", this.data.initialItems);
        }
    }
    onLeftPointerDown() {
        if ( this.data.enabled ) {
            document.body.classList.add(this.data.bodyClassLeft);
            this.data.leftIsMoving = true;
            this.updateData();
        }
    }
    onRightPointerDown() {
        if ( this.data.enabled ) {
            document.body.classList.add(this.data.bodyClassRight);
            this.data.rightIsMoving = true;
            this.updateData();
        }
    }
    scrollLeft() {
        if (!this.data.autoScroll.speed) return;
        if (this.state.get("config.chart.time.calculatedZoomMode")) return;

        this.scrollWaiting++;

        const scrollHorz = this.state.get("config.scroll.horizontal");
        if (this.data.autoScroll.speed < 0) {
            if (this.scrollWaiting - 1 < Math.abs(this.data.autoScroll.speed)) return;

            const scrollLeft = this.api.getScrollLeft();
            if ( scrollHorz.byPixels ) {
                this.api.setScrollLeft(scrollLeft.absolutePosPx - 120 * scrollHorz.multiplier);
            } else {
                this.api.setScrollLeft(scrollLeft.dataIndex - 1);
            }
        } else if (this.data.autoScroll.speed > 0) {
            const scrollLeft = this.api.getScrollLeft();
            if ( scrollHorz.byPixels ) {
                this.api.setScrollLeft(scrollLeft.absolutePosPx - 120 * this.data.autoScroll.speed * scrollHorz.multiplier);
            } else {
                this.api.setScrollLeft(scrollLeft.dataIndex - this.data.autoScroll.speed);
            }
        }
        this.scrollWaiting = 0;
    }
    scrollRight() {
        if (!this.data.autoScroll.speed) return;
        if (this.state.get("config.chart.time.calculatedZoomMode")) return;
        this.scrollWaiting++;
        const scrollHorz = this.state.get("config.scroll.horizontal");
        if (this.data.autoScroll.speed < 0) {
            if (this.scrollWaiting - 1 < Math.abs(this.data.autoScroll.speed)) return;
            const scrollLeft = this.api.getScrollLeft();
            if ( scrollHorz.byPixels ) {
                this.api.setScrollLeft(scrollLeft.absolutePosPx + 120 * scrollHorz.multiplier);
            } else {
                this.api.setScrollLeft(scrollLeft.dataIndex + 1);
            }
        } else if (this.data.autoScroll.speed > 0) {
            const scrollLeft = this.api.getScrollLeft();
            if ( scrollHorz.byPixels ) {
                this.api.setScrollLeft(scrollLeft.absolutePosPx + 120 * this.data.autoScroll.speed * scrollHorz.multiplier);
            } else {
                this.api.setScrollLeft(scrollLeft.dataIndex + this.data.autoScroll.speed);
            }
        }
        this.scrollWaiting = 0;
    }
    autoScroll(eventParams) {
        if (!this.timelineElement) return;
        const x = eventParams.currentPosition.x,
            x1 = this.timelineElement.getBoundingClientRect().width - 2;

        if ( x < this.data.autoScroll.edgeThreshold ) {
            this.scrollLeft();
        } else {
            if ( x > x1 - this.data.autoScroll.edgeThreshold ) {
                this.scrollRight();
            }
        }
    }
    onPointerMove(eventParams) {
        if (!this.data.enabled) return;
        const { original, modified } = this.getItemsForDiff();
        if ( original ) {
            this.data.movement = {
                px: eventParams.movement.x,
                time: modified.time.start - original.time.start
            };

            if ( Math.abs(eventParams.movement.x) >= this.data.threshold ) {
                this.data.thresholdReached = true;
            }

            if ( !( "resize" !== this.data.state && "start" !== this.data.state ) ) {
                this.data.state = "resize";
            }
            if ( eventParams.movement.x && this.data.thresholdReached ) {
                this.autoScroll(eventParams);
            }
            if ( this.data.thresholdReached ) {
                this.data.leftIsMoving && this.onLeftPointerMove(eventParams);
                this.data.rightIsMoving && this.onRightPointerMove(eventParams);
            }
        }
    }
    onLeftPointerMove(eventParams) {
        if (!this.data.enabled || !this.data.leftIsMoving) return;
        const selectItems = this.getSelectedItems(),
            selectItemsData = {},
            time = this.state.get("$data.chart.time"),
            { original, modified } = this.getItemsForDiff(),
            movement = this.data.movement = {
                px: eventParams.movement.x,
                time: modified.time.start - original.time.start
            },
            sdt = this.api.time.date(this.api.time.getTimeFromOffsetPx(eventParams.initialPosition.x, true, time)),
            sSnapDt = this.data.snapToTime.start({
                startTime: sdt,
                item: selectItems[0],
                time,
                movement,
            }),
            curDt = this.api.time.date(this.api.time.getTimeFromOffsetPx(eventParams.currentPosition.x, true, time)),
            offsetDt = this.api.time.getDatesDiffPx(sSnapDt, curDt, time, true);

        for (let i = 0, len = selectItems.length; i < len; i++) {
            const item = selectItems[i],
                itemData = lodash.merge({}, this.api.getItemData(item.id));

            let offset = lodash.merge({}, this.data.initialItemsData[item.id]).position.left + offsetDt;

            if ( offset > itemData.position.right - item.minWidth ) {
                offset = itemData.position.right - item.minWidth;
            }

            const dt = this.api.time.getTimeFromOffsetPx(offset, true, time),
                snapDt = this.data.snapToTime.start({
                    startTime: this.api.time.date(dt),
                    item,
                    time,
                    movement,
                });

            item.time.start = snapDt.valueOf();
            itemData.time.startDate = snapDt;

            if ((item.time.start < time.from || item.time.end > time.to) && 
                ("function" == typeof time.format.periodIncrement || !this.data.allowItemsToGoOutsideTheArea)) {
                const tmpItem = this.api.getItem(item.id);
                item.time.start = tmpItem.time.start;
                item.time.end = tmpItem.time.end;
                itemData.time.startDate = this.api.time.date(item.time.start);
                itemData.time.endDate = this.api.time.date(item.time.end);
            }
            selectItemsData[item.id] = itemData;
        }
        this.dispatchEvent("onResize", selectItems, selectItemsData);
        this.updateData();
    }
    getItemsToMove() {
        let itemsToMove, selectItemsId, dependantIds = [];
        if (this.data.dependant) {
            const selectItems = this.getSelectedItems();
            selectItemsId = selectItems.map((v => v.id));
            const dependantItems = this.getDependantItems(selectItems).filter((v => !selectItemsId.includes(v.id)));
            dependantIds = dependantItems.map((v => v.id));
            itemsToMove = [...selectItems, ...dependantItems];
        } else {
            itemsToMove = this.getSelectedItems();
        }
        return {
            itemsToMove,
            dependantIds
        };
    }
    onRightPointerMove(eventParams) {
        if (!this.data.enabled || !this.data.rightIsMoving) return;
        const { itemsToMove, dependantIds } = this.getItemsToMove(), 
            itemsData = {}, 
            time = this.state.get("$data.chart.time"), 
            { original, modified } = this.getItemsForDiff(), 
            movement = this.data.movement = {
                px: eventParams.movement.x,
                time: modified.time.start - original.time.start
            }, 
            endTime = this.api.time.date(this.api.time.getTimeFromOffsetPx(eventParams.initialPosition.x, true, time)), 
            nDt = this.data.snapToTime.end({
                endTime,
                item: null,
                time,
                movement,
            }), 
            sDt = this.api.time.date(this.api.time.getTimeFromOffsetPx(eventParams.currentPosition.x, true, time)), 
            offset = this.api.time.getDatesDiffPx(nDt, sDt, time, true);

        for (let i = 0, len = itemsToMove.length; i < len; i++) {
            const item = itemsToMove[i],
                itemData = lodash.merge({}, this.api.getItemData(item.id)),
                initialItemData = lodash.merge({}, this.data.initialItemsData[item.id]),
                dependant = dependantIds.includes(item.id);
            
            let eOffset = initialItemData.position.left + initialItemData.timeWidth + offset;

            if ( !dependant && eOffset < itemData.position.left + item.minWidth ) {
                eOffset = itemData.position.left + item.minWidth;
            }

            const tmpGlobal = this.api.time.getTimeFromOffsetPx(eOffset, true, time);

            let dt = this.api.time.date(tmpGlobal);

            if ( !dependant ) {
                dt = this.data.snapToTime.end({
                    endTime: this.api.time.date(tmpGlobal),
                    item,
                    time,
                    movement,
                });
            }

            if (dependant) {
                const tmpInitialItem = this.data.initialItems.find((v => v.dependant.includes(initialItemData.id))),
                    tmpInitialItemData = this.data.initialItemsData[tmpInitialItem.id],
                    tmpItemData = itemsData[tmpInitialItemData.id],
                    diffMs = this.api.time.getDatesDiffMs(tmpInitialItemData.time.endDate, tmpItemData.time.endDate, time, true);

                let dstDiff = -this.api.time.getDSTDiffForLevel(time.level, tmpInitialItemData.time.endDate.valueOf(), 
                        initialItemData.time.startDate.valueOf(), time),
                    tmpGlobal1 = this.api.time.addTimeFromDates(initialItemData.time.startDate.valueOf(), diffMs + dstDiff, time);
                
                dstDiff = this.api.time.getDSTDiffForLevel(time.level, tmpItemData.time.endDate.valueOf(), tmpGlobal1, time);
                tmpGlobal1 += dstDiff;

                const tmpSDt = this.api.time.date(tmpGlobal1),
                    tmpSGlobal = tmpSDt.valueOf(),
                    tmpSOffset = this.api.time.getViewOffsetPxFromDates(tmpSDt, false, time);

                let diffMs1 = -this.api.time.getDSTDiffForLevel(time.level, initialItemData.time.startDate.valueOf(), 
                    initialItemData.time.endDate.valueOf(), time);

                const tmpSOffset1 = tmpSOffset + initialItemData.timeWidth;
                let ignoreMissingDt;
                const gap = initialItemData.time.endDate.valueOf() - initialItemData.time.startDate.valueOf();

                if ( this.data.ignoreMissingDates ) {
                    ignoreMissingDt = this.api.time.date(this.api.time.getTimeFromOffsetPx(tmpSOffset1, true, time));
                } else {
                    ignoreMissingDt = this.api.time.date(tmpSDt.valueOf() + gap);
                }

                diffMs1 += this.api.time.getDSTDiffForLevel(time.level, tmpSGlobal, ignoreMissingDt.valueOf(), time);
                ignoreMissingDt = ignoreMissingDt.add(diffMs1, "ms");
                dt = ignoreMissingDt;
                item.time.start = tmpSDt.valueOf();
                itemData.time.startDate = tmpSDt;
            }
            item.time.end = dt.valueOf();
            itemData.time.endDate = dt;
            if ((item.time.start < time.from || item.time.end > time.to) && 
                ("function" == typeof time.format.periodIncrement || !this.data.allowItemsToGoOutsideTheArea)) {
                const tmpItem = this.api.getItem(item.id);
                item.time.start = tmpItem.time.start;
                item.time.end = tmpItem.time.end;
                itemData.time.startDate = this.api.time.date(item.time.start);
                itemData.time.endDate = this.api.time.date(item.time.end);
            }
            itemsData[item.id] = itemData;
        }
        this.dispatchEvent("onResize", itemsToMove, itemsData);
        this.updateData();
    }
    onEnd() {
        const { itemsToMove } = this.getItemsToMove();
        this.dispatchEvent("onEnd", itemsToMove);
    }
    onPointerUp(eventParams) {
        if ( "resize" === this.data.state ) {
            this.data.state = "end";
        }
        this.onLeftPointerUp();
        this.onRightPointerUp(); 
        this.onEnd();
        this.updateData();
        this.api.plugins.TimelinePointer.unlock("down");
        this.api.plugins.TimelinePointer.unlock("move"); 
        this.api.plugins.TimelinePointer.unlock("up");
    }
    onLeftPointerUp() {
        document.body.classList.remove(this.data.bodyClassLeft);
        if ( this.data.enabled && this.data.leftIsMoving ) {
            this.data.leftIsMoving = false;
            this.updateData();
        }
    }
    onRightPointerUp() {
        document.body.classList.remove(this.data.bodyClassRight);
        if ( this.data.enabled && this.data.rightIsMoving ) {
            this.data.rightIsMoving = false;
        }
    }
    getItemResizingInnerSlot(props) {
        let resize;

        return (data = {}, innerVNode) => {

            const {itemInfo, renderProps} = data;
            
            if (!itemInfo || !itemInfo.item) return null;

            const item = itemInfo.item;
            if (!item) return null;
            const itemData = this.api.getItemData(item.id);
            if (!itemData) return null;

            let content;

            
            resize = !itemData.detached;

            if ( this.data.handle.onlyWhenSelected ) {
                resize = resize && itemData.selected;
            }

            //console.log(renderProps)

            resize = resize && !(this.data.handle.outside || itemData.actualWidth < this.data.outsideWidthThreshold);

            //console.log("resize", item.id, itemData, this.data, "resize", resize);
            this.updateRightStyleMap(item, renderProps.resizeStyleMap.right); 
            this.updateLeftStyleMap(item, renderProps.resizeStyleMap.left);

            content = "function" == typeof this.data.content ? this.data.content({
                item,
            }) : "object" != typeof this.data.content || "left" in this.data.content ? this.data.content : {
                left: this.data.content,
                right: this.data.content
            };

            //console.log("slot", resize, content);
            return (
                <>
                    {resize ? <div class={this.leftClassName} data-brid={item.id} style={renderProps.resizeStyleMap.left}>{content.left}</div> : null}
                    {innerVNode}
                    {resize ? <div class={this.rightClassName} data-brid={item.id} style={renderProps.resizeStyleMap.right}>{content.right}</div> : null}
                </>
            );
        };
    }
    getItemResizingOuterSlot(props) {
        let resize;

        return (data = {}, outerVNode) => {
            
            const {itemInfo, renderProps} = data;

            if (!itemInfo || !itemInfo.item) return;

            const item = itemInfo.item;
            
            if (!item) return;
            
            const itemData = this.api.getItemData(item.id);
            if (!itemData) return;
            
            let content;

            resize = !itemData.detached;

            if ( this.data.handle.onlyWhenSelected ) {
                resize = resize && itemData.selected;
            }

            resize = resize && (this.data.handle.outside || itemData.actualWidth < this.data.outsideWidthThreshold);

            this.updateRightStyleMap(item, renderProps.resizeStyleMap.right);
            this.updateLeftStyleMap(item, renderProps.resizeStyleMap.left);
            
            content = "function" == typeof this.data.content ? this.data.content({
                item,
            }) : "object" != typeof this.data.content || "left" in this.data.content ? this.data.content : {
                left: this.data.content,
                right: this.data.content
            };

            return (
                <>
                    { resize ? <div class={this.leftClassName} data-type={chartTimelineItemsRowItem} data-brid={itemInfo.item.id} style={renderProps.resizeStyleMap.left}>{content.left}</div> : null}
                    {outerVNode}
                    { resize ? <div class={this.rightClassName} data-type={chartTimelineItemsRowItem} data-brid={itemInfo.item.id} style={renderProps.resizeStyleMap.right}>{content.right}</div> : null}
                </>
            );
        };
    }

}

function Plugin(options = {}) {
    return function(props) {
        const api = props.gapi;
        if (!api.isPluginInitialized("TimelinePointer")) {
            throw new Error("TimelinePointer plugin must be initialized before ItemResizing plugin.");
        }
        if (!api.isPluginInitialized("Selection")) {
            throw new Error("Selection plugin must be initialized before ItemResizing plugin.");
        }
        if (api.isPluginInitialized("ItemMovement")) {
            throw new Error("ItemResizing plugin must be initialized before ItemMovement plugin.");
        }
        const value = props.state.get(ItemResizingStateName);
        if ( value ) {
            options = lodash.merge({}, [options, value]);
        }

        const instance = new ItemResizing(props, options);
        api.pluginInitialized("ItemResizing");
        return instance.destroy;
    }
}

export {
    Plugin
};