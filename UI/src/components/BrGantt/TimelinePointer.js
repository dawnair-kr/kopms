const chartTimelineGridRowCell = "chart-timeline-grid-row-cell",
    chartTimelineItemsRowItem = "chart-timeline-items-row-item";

function timelinePointerData(options = {}) {
    const data = {
        enabled: true,
        isMoving: false,
        pointerState: "up",
        currentTarget: null,
        realTarget: null,
        targetType: "",
        targetData: null,
        captureEvents: {
            down: false,
            up: false,
            move: false
        },
        initialPosition: {
            x: 0,
            y: 0
        },
        currentPosition: {
            x: 0,
            y: 0
        },
        movement: {
            x: 0,
            y: 0
        },
        events: {
            down: null,
            move: null,
            up: null
        }
    };
    if ( options.captureEvents ) {
        data.captureEvents = Object.assign(Object.assign({}, data.captureEvents), options.captureEvents);
    }
    return data;
}

function schedule(func) {
    let frame = 0;
    return function(args) {
        if ( !frame ) {
            frame = requestAnimationFrame((function() {
                frame = 0;
                func.apply(null, [args]);
            }));
        }
    }
}

const pluginName = "TimelinePointer";
const timelinePointerStateName = "config.plugin.TimelinePointer";


class TimelinePointer {

    constructor(options, props) {

        this.locked = {
            up: false,
            move: false,
            down: false
        };
        
        this.initialScrollPosPx = {
            horizontal: 0,
            vertical: 0
        };
        this.onDestroy = [];
        this.classNames = {
            cell: "",
            item: ""
        };

        this.api = props.gapi;
        this.state = props.state;
        this.apiPointerListeners = {
            down: new Set,
            move: new Set,
            up: new Set
        };

        this.data = timelinePointerData(options);
        this.state.update(timelinePointerStateName, this.data);

        this.pointerDown = this.pointerDown.bind(this);
        this.pointerMove = this.pointerMove.bind(this);
        this.pointerMove = schedule(this.pointerMove);
        this.pointerUp = this.pointerUp.bind(this);

        this.onDestroy.push(this.state.subscribe("$data.elements.chart-timeline", (value => {
            if ( value && value instanceof HTMLElement ) {
                this.element = value;
                this.element.removeEventListener("pointerdown", this.pointerDown);
                this.element.addEventListener("pointerdown", this.pointerDown);
                document.removeEventListener("pointerup", this.pointerUp);
                document.addEventListener("pointerup", this.pointerUp);
                document.removeEventListener("pointermove", this.pointerMove);
                document.addEventListener("pointermove", this.pointerMove);
            }
        })));
        
        this.apiLock = this.apiLock.bind(this);
        this.apiUnlock = this.apiUnlock.bind(this);
        this.apiIsLocked = this.apiIsLocked.bind(this);
        this.apiAddPointerListener = this.apiAddPointerListener.bind(this);
        this.apiRemovePointerListener = this.apiRemovePointerListener.bind(this);
        this.getRealPosition = this.getRealPosition.bind(this);

        this.classNames.cell = "br-chart-timeline-grid-row-cell";
        this.classNames.item = "br-chart-timeline-items-row-item";
        this.destroy = this.destroy.bind(this);

        this.api.plugins.TimelinePointer = {
            lock: this.apiLock,
            unlock: this.apiUnlock,
            isLocked: this.apiIsLocked,
            addPointerListener: this.apiAddPointerListener,
            removePointerListener: this.apiRemovePointerListener
        };
        this.onDestroy.push(this.state.subscribe(timelinePointerStateName, (value => this.data = value)))
    }
    destroy() {
        this.onDestroy.forEach((t => t()));

        this.element.removeEventListener("pointerdown", this.pointerDown);
        document.removeEventListener("pointerup", this.pointerUp);
        document.removeEventListener("pointermove", this.pointerMove);
        this.element = null;
        this.api.pluginDestroyed(pluginName);
        
    }
    updateData() {
        this.state.update(timelinePointerStateName, (() => Object.assign({}, this.data)));
    }
    apiLock(type, value = true) {
        this.locked[type] = value;
    }
    apiUnlock(type) {
        this.locked[type] = false;
    }
    apiIsLocked(type) {
        return this.locked[type];
    }
    apiAddPointerListener(eventName, handler) {
        this.apiPointerListeners[eventName].add(handler);
    }
    apiRemovePointerListener(eventName, handler) {
        this.apiPointerListeners[eventName].delete(handler);
    }
    apiTriggerPointerListener(eventName, eventParams) {
        this.apiPointerListeners[eventName].forEach((handler => handler(eventParams)));
    }
    getRealTarget(e) {
        // closest  위 방향으로 dom select
        let target = e.target.closest("." + this.classNames.item); 
        if ( !target ) {
            target = e.target.closest("." + this.classNames.cell);
            if ( !target ) {
                target = e.target.closest(`[data-type="${chartTimelineItemsRowItem}"]`);
                if ( !target ) {
                    target = e.target.closest(`[data-type="${chartTimelineGridRowCell}"]`);
                    if ( !target ) return null;
                }
            }
        }
        return target;
    }
    getRealPosition(e) {
        const pos = {
            x: 0,
            y: 0
        };
        if (this.element) {
            const rect = this.element.getBoundingClientRect();
            pos.x = e.clientX - rect.x;
            pos.y = e.clientY - rect.y;
            const vOffset = this.state.get("$data.scroll.vertical.preciseOffset") || 0;
            pos.y -= vOffset;
        }
        return pos;
    }

    pointerDown(e) {
        if (!this.data.enabled) return;
        this.initialScrollPosPx.horizontal = this.state.get("$data.scroll.horizontal.handlePosPx");
        this.initialScrollPosPx.vertical = this.state.get("$data.scroll.vertical.handlePosPx");
        this.data.pointerState = "down";
        this.data.currentTarget = e.target;

        const target = this.getRealTarget(e);

        this.data.realTarget = target;
        this.data.targetType = "";
        this.data.targetData = null;

        if (this.data.realTarget) {
            if (this.data.realTarget.classList.contains(this.classNames.item)) {
                this.data.targetType = chartTimelineItemsRowItem;
                const itemId = this.data.realTarget.dataset.brid;
                this.data.targetData = this.api.getItem(itemId);
                //console.log("itemId", itemId);
            } else if (this.data.realTarget.classList.contains(this.classNames.cell)) {
                this.data.targetType = chartTimelineGridRowCell;
                const cellId = this.data.realTarget.dataset.brid;
                this.data.targetData = this.state.get(`$data.chart.grid.cells.${cellId}`)
                //console.log("down", this.data.targetData);
            } else if (this.data.realTarget.dataset.type === chartTimelineItemsRowItem) {
                this.data.targetType = chartTimelineItemsRowItem;
                const itemId = this.data.realTarget.dataset.brid;
                this.data.targetData = this.api.getItem(itemId);
            } else if (this.data.realTarget.dataset.type === chartTimelineGridRowCell) {
                this.data.targetType = chartTimelineGridRowCell;
                const cellId = this.data.realTarget.dataset.brid;
                this.data.targetData = this.state.get(`$data.chart.grid.cells.${cellId}`)
            }
        } 

        this.data.isMoving = !!this.data.targetType;
        this.data.events.down = e;
        this.data.events.move = e;
        
        const pos = this.getRealPosition(e);
        
        this.data.initialPosition = pos;
        this.data.currentPosition = pos;

        const eventParams = {
            type: this.data.pointerState,
            originalEvent: e,
            targetElement: target,
            targetData: this.data.targetData,
            targetType: this.data.targetType,
            initialPosition: this.data.initialPosition,
            currentPosition: this.data.currentPosition,
            movement: {
                x: 0,
                y: 0
            },
            initialScrollPosPx: this.initialScrollPosPx,
            isMoving: this.data.isMoving,
            allEvents: this.data.events
        };
        this.apiTriggerPointerListener("down", eventParams);
        this.updateData();
    }
    pointerUp(e) {
        if (!this.data.enabled) return;
        this.data.pointerState = "up";
        this.data.isMoving = false;
        this.data.events.up = e;
        this.data.currentPosition = this.getRealPosition(e);

        const eventParams = {
            type: this.data.pointerState,
            originalEvent: e,
            targetElement: this.data.realTarget,
            targetData: this.data.targetData,
            targetType: this.data.targetType,
            initialPosition: this.data.initialPosition,
            currentPosition: this.data.currentPosition,
            movement: this.data.movement,
            initialScrollPosPx: this.initialScrollPosPx,
            isMoving: this.data.isMoving,
            allEvents: this.data.events
        };
        this.apiTriggerPointerListener("up", eventParams);
        this.data.realTarget = null;
        this.data.targetData = null;
        this.updateData();
    }
    pointerMove(e) {
        //console.log("pointerMove", this);
        if (!this.data.enabled || !this.data.isMoving) return;

        const horzHandlePosPx = this.state.get("$data.scroll.horizontal.handlePosPx");
        this.data.pointerState = "move";
        this.data.events.move = e;
        this.data.currentPosition = this.getRealPosition(e);
        this.data.movement.x = this.data.currentPosition.x - this.data.initialPosition.x;
        this.data.movement.y = this.data.currentPosition.y - this.data.initialPosition.y;
        this.data.movement.x += horzHandlePosPx - this.initialScrollPosPx.horizontal;

        const eventParams = {
            type: this.data.pointerState,
            originalEvent: e,
            targetElement: this.data.realTarget,
            targetData: this.data.targetData,
            targetType: this.data.targetType,
            initialPosition: this.data.initialPosition,
            currentPosition: this.data.currentPosition,
            movement: this.data.movement,
            initialScrollPosPx: this.initialScrollPosPx,
            isMoving: this.data.isMoving,
            allEvents: this.data.events
        };

        this.apiTriggerPointerListener("move", eventParams);
        this.updateData();
    }
}

function Plugin(options = {}) {

    return function(props) {
        const api = props.gapi,
            value = props.state.get(timelinePointerStateName);

        if ( value ) {
            options = lodash.merge(lodash.merge({}, options), value);
        }

        const pluginValue = timelinePointerData(value);

        props.state.update(timelinePointerStateName, pluginValue);

        const timelinePointer = new TimelinePointer(options, props);

        api.pluginInitialized(pluginName);

        return timelinePointer.destroy;
    }
}

export {
    chartTimelineGridRowCell as CELL, 
    chartTimelineItemsRowItem as ITEM, 
    Plugin
};

