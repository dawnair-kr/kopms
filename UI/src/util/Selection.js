import { Event } from "./Event.js";

/****
 * export type SELECTION_TYPE = typeof CELL | typeof ITEM;
export interface TimelinePointerEvents {
    down: PointerEvent | null;
    move: PointerEvent | null;
    up: PointerEvent | null;
}
export interface TimelinePointerPoint {
    x: number;
    y: number;
}
export type TimelinePointerState = 'up' | 'down' | 'move';
export interface TimelinePointerCaptureEvents {
    up?: boolean;
    down?: boolean;
    move?: boolean;
}
export interface TimelinePointerLocked {
    up: boolean | string;
    down: boolean | string;
    move: boolean | string;
}
export interface Options {
    enabled?: boolean;
    captureEvents?: TimelinePointerCaptureEvents;
}
export interface TimelinePointerOffset {
    top: number;
    left: number;
}
export interface Movement {
    x: number;
    y: number;
}
export type TargetType = ITEM_TYPE | CELL_TYPE | '';
export interface PluginData extends Options {
    isMoving: boolean;
    pointerState: TimelinePointerState;
    currentTarget: HTMLElement | null;
    realTarget: HTMLElement | null;
    targetType: TargetType;
    targetData: any | null;
    events: TimelinePointerEvents;
    initialPosition: TimelinePointerPoint;
    currentPosition: TimelinePointerPoint;
    movement: Movement;
}
export interface ScrollPosPx {
    horizontal: number;
    vertical: number;
}
export interface TimelinePointerEvent {
    type: TimelinePointerState;
    originalEvent: PointerEvent;
    targetElement: HTMLElement;
    targetData: any;
    targetType: TargetType;
    initialScrollPosPx: ScrollPosPx;
    initialPosition: TimelinePointerPoint;
    currentPosition: TimelinePointerPoint;
    movement: Movement;
    isMoving: boolean;
    allEvents: TimelinePointerEvents;
}
export type PointerListener = (event: TimelinePointerEvent) => void;
export interface ApiPointerListeners {
    down: Set<PointerListener>;
    move: Set<PointerListener>;
    up: Set<PointerListener>;
}
export type AddPointerListener = (type: TimelinePointerState, callback: PointerListener) => void;
export type RemovePointerListener = (type: TimelinePointerState, callback: PointerListener) => void;
export declare function Plugin(options?: Options): (vidoInstance: Vido) => () => void;
 */

const CELL_TYPE = "cell";
const ITEM_TYPE = "task";


export class TimelinePointer extends Event {
    constructor(a, n) {
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
        
        /*
        this.api = n.api;
        this.state = n.state;
        this.apiPointerListeners = {
            down: new Set,
            move: new Set,
            up: new Set
        };
        */ 
        
        this.pointerDown = this.pointerDown.bind(this);
        this.pointerMove = this.pointerMove.bind(this);
        this.pointerMove = n.schedule(this.pointerMove);
        this.pointerUp = this.pointerUp.bind(this);
        this.onDestroy.push(this.state.subscribe("$data.elements.chart-timeline", (t => {
            t && (this.element = t, this.element.removeEventListener("pointerdown", this.pointerDown), this.element.addEventListener("pointerdown", this.pointerDown), document.removeEventListener("pointerup", this.pointerUp), document.addEventListener("pointerup", this.pointerUp), document.removeEventListener("pointermove", this.pointerMove), document.addEventListener("pointermove", this.pointerMove))
        })));
        
        this.apiLock = this.apiLock.bind(this);
        this.apiUnlock = this.apiUnlock.bind(this);
        this.apiIsLocked = this.apiIsLocked.bind(this);
        this.apiAddPointerListener = this.apiAddPointerListener.bind(this);
        this.apiRemovePointerListener = this.apiRemovePointerListener.bind(this);
        this.getRealPosition = this.getRealPosition.bind(this);
        this.data = e(a);
        this.classNames.cell = this.api.getClass(t);
        this.classNames.item = this.api.getClass(i);
        this.destroy = this.destroy.bind(this);
        this.api.plugins.TimelinePointer = {
            lock: this.apiLock,
            unlock: this.apiUnlock,
            isLocked: this.apiIsLocked,
            addPointerListener: this.apiAddPointerListener,
            removePointerListener: this.apiRemovePointerListener
        };
        this.onDestroy.push(this.state.subscribe(s, (t => this.data = t)));
    }

    destroy() {
        this.onDestroy.forEach((t => t()));

        this.element.removeEventListener("pointerdown", this.pointerDown);
        this.document.removeEventListener("pointerup", this.pointerUp);
        document.removeEventListener("pointermove", this.pointerMove);
        this.api.pluginDestroyed(a);
    }

    updateData() {
        this.state.update(s, (() => Object.assign({}, this.data)));
    }

    apiLock(t, i = true) {
        this.locked[t] = i;
    }

    apiUnlock(t) {
        this.locked[t] = false;
    }
    apiIsLocked(t) {
        return this.locked[t];
    }
    apiAddPointerListener(t, i) {
        this.apiPointerListeners[t].add(i);
    }

    apiRemovePointerListener(t, i) {
        this.apiPointerListeners[t].delete(i);
    }

    apiTriggerPointerListener(t, i) {
        this.apiPointerListeners[t].forEach((t => t(i)));
    }

    getRealTarget(e) {
        let a = e.target.closest("." + this.classNames.item);
        return a || (a = e.target.closest("." + this.classNames.cell), 
         a || (
                a = e.target.closest(`[data-type="${i}"]`), 
                a || (a = e.target.closest(`[data-type="${t}"]`), a || null)
            )
         );
    }
    
    getRealPosition(t) {
        const i = {
            x: 0,
            y: 0
        };
        if (this.element) {
            const e = this.element.getBoundingClientRect();
            i.x = t.clientX - e.x, i.y = t.clientY - e.y;
            const a = this.state.get("$data.scroll.vertical.preciseOffset") || 0;
            i.y -= a
        }
        return i
    }
    pointerDown(e) {
        if (!this.data.enabled) return;
        this.initialScrollPosPx.horizontal = this.state.get("$data.scroll.horizontal.handlePosPx"), this.initialScrollPosPx.vertical = this.state.get("$data.scroll.vertical.handlePosPx"), this.data.pointerState = "down", this.data.currentTarget = e.target;
        const a = this.getRealTarget(e);
        if (this.data.realTarget = a, this.data.targetType = "", this.data.targetData = null, this.data.realTarget)
            if (this.data.realTarget.classList.contains(this.classNames.item)) this.data.targetType = i, this.data.targetData = this.data.realTarget.vido.item;
            else if (this.data.realTarget.classList.contains(this.classNames.cell)) this.data.targetType = t, this.data.targetData = this.data.realTarget.vido;
        else if (this.data.realTarget.dataset.type === i) {
            this.data.targetType = i;
            const t = this.data.realTarget.dataset.gstcid;
            this.data.targetData = this.api.getItem(t)
        } else if (this.data.realTarget.dataset.type === t) {
            this.data.targetType = t;
            const i = this.data.realTarget.dataset.gstcid;
            this.data.targetData = this.state.get(`$data.chart.grid.cells.${i}`)
        }
        this.data.isMoving = !!this.data.targetType, this.data.events.down = e, this.data.events.move = e;
        const s = this.getRealPosition(e);
        this.data.initialPosition = s, this.data.currentPosition = s;
        const n = {
            type: this.data.pointerState,
            originalEvent: e,
            targetElement: a,
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
        this.apiTriggerPointerListener("down", n), this.updateData()
    }
    pointerUp(t) {
        if (!this.data.enabled) return;
        this.data.pointerState = "up", this.data.isMoving = !1, this.data.events.up = t, this.data.currentPosition = this.getRealPosition(t);
        const i = {
            type: this.data.pointerState,
            originalEvent: t,
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
        this.apiTriggerPointerListener("up", i), this.data.realTarget = null, this.data.targetData = null, this.updateData()
    }
    pointerMove(t) {
        if (!this.data.enabled || !this.data.isMoving) return;
        const i = this.state.get("$data.scroll.horizontal.handlePosPx");
        this.data.pointerState = "move", this.data.events.move = t, this.data.currentPosition = this.getRealPosition(t), this.data.movement.x = this.data.currentPosition.x - this.data.initialPosition.x, this.data.movement.y = this.data.currentPosition.y - this.data.initialPosition.y, this.data.movement.x += i - this.initialScrollPosPx.horizontal;
        const e = {
            type: this.data.pointerState,
            originalEvent: t,
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
        this.apiTriggerPointerListener("move", e), this.updateData()
    }
}


class Selection extends Event {
 
    constructor(vueComp, data) {
        super();
        this.onDestroy = [];
        this.started = false;
        this.lastAllEvents = {
            down: null,
            move: null,
            up: null
        };

        this.vueComp = vueComp;
        this.state = data.state;
        this.data = data;

    }

    

    modKeyPressed(rec, e) {
        switch (rec) {
            case "shift":
                return e.shiftKey;
            case "alt":
                return e.altKey;
            case "ctrl":
                return e.ctrlKey
        }
    }

    canSelect() {
        let enabled = this.data.enabled;
        const e = this.lastAllEvents.down;
        return e && this.data.selectKey && (enabled && this.modKeyPressed(this.data.selectKey, e)), enabled && (this.data.cells || this.data.items);
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
        return a >= 0 ? (e.x = i.x, e.width = a) : (e.x = s.x, e.width = Math.abs(a)), l >= 0 ? (e.y = i.y, e.height = l) : (e.y = s.y, e.height = Math.abs(l)), e
    }
}