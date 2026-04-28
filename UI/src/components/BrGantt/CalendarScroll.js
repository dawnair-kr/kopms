import lodash from 'lodash';

const defaultData = {
    enabled: true,
    bodyClassName: "br-scrolling"
};

const CalendarScrollStateName = "config.plugin.CalendarScroll";

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

class CalendarScroll {
    constructor(dom, props) {

        this.api = props.gapi; //n
        this.state = props.state; // o

        this.data = Object.assign({}, defaultData); // e

        this.updateData();

        this.moving = false;
        this.initialDataIndex = {
            x: 0,
            y: 0
        };
        this.pointerDown = this.pointerDown.bind(this);
        this.pointerUp = this.pointerUp.bind(this);
        this.destroy = this.destroy.bind(this);
        this.pointerMove = schedule(this.pointerMove.bind(this));
        dom.addEventListener("pointerdown", this.pointerDown);
        document.addEventListener("pointermove", this.pointerMove, {
            passive: true
        });
        document.addEventListener("pointerup", this.pointerUp);
        dom.style.cursor = "grab";
    }

    destroy(dom) {
        dom.removeEventListener("pointerdown", this.pointerDown);
        document.removeEventListener("pointermove", this.pointerMove);
        document.removeEventListener("pointerup", this.pointerUp);
    }

    updateData() {
        this.state.update(CalendarScrollStateName, (() => Object.assign({}, this.data)));
    }

    resetInitialPoint(e) {
        this.initialPoint = {
            x: e.screenX,
            y: e.screenY
        };
    }
    pointerDown(e) {
        if (!this.data.enabled) return;
        document.body.classList.add(this.data.bodyClassName);
        this.moving = true;
        this.resetInitialPoint(e);
        const dataScroll = this.state.get("$data.scroll");
        this.initialDataIndex = {
            x: dataScroll.horizontal.dataIndex || 0,
            y: dataScroll.vertical.dataIndex || 0
        };
    }
    pointerUp() {
        if ( this.data.enabled ) {
            document.body.classList.remove(this.data.bodyClassName);
            if ( this.moving ) {
                this.moving = false;
            }
        }
    }
    handleHorizontalMovement(changedPos, e) {
        const dataTime = this.state.get("$data.chart.time"),
            configScrollHorz = this.state.get("config.scroll.horizontal");

        if (changedPos.x > 0) {
            if (0 === this.initialDataIndex.x) return this.resetInitialPoint(e);

            const allDates = dataTime.allDates[dataTime.level];
            let dt, dataIdx = this.initialDataIndex.x - 1,
                pos = 0;

            for (; dataIdx > 0 && (dt = allDates[dataIdx], pos += dt.width, !(pos >= changedPos.x)); dataIdx--);

            let leftOffset = 0;
            dt && (leftOffset = dt.leftPx);
            configScrollHorz.byPixels ? this.api.setScrollLeft(leftOffset) : this.api.setScrollLeft(dataIdx);
        } else if (changedPos.x < 0) {
            let dataIdx = this.initialDataIndex.x;
            const dataScrollHorz = this.state.get("$data.scroll.horizontal"),
                allDates = dataTime.allDates[dataTime.level];

            if (dataIdx - 1 >= allDates.length - dataScrollHorz.lastPageCount) return this.resetInitialPoint(e);

            let dt, pos = 0;

            for (let len = allDates.length; dataIdx < len && (dt = allDates[dataIdx], pos += dt.width, !(-pos <= changedPos.x)); dataIdx++);

            if (dataIdx - 1 >= allDates.length - dataScrollHorz.lastPageCount) return;
            
            let leftOffset = 0;
            dt && (leftOffset = dt.leftPx);
            configScrollHorz.byPixels ? this.api.setScrollLeft(leftOffset) : this.api.setScrollLeft(dataIdx);
        }
    }
    pointerMove(e) {
        if (!this.data.enabled || !this.moving) return;

        const changedPos = {
            x: e.screenX - this.initialPoint.x,
            y: e.screenY - this.initialPoint.y
        };
        
        this.handleHorizontalMovement(changedPos, e);
    }
}

function Plugin(options = {}) {
    
    return props => {
        let tmpData = lodash.merge(defaultData, options); 
        const value = props.state.get(CalendarScrollStateName);

        if ( value ) {
            tmpData = lodash.merge({}, [tmpData, value]);
        }

        let enabled = tmpData.enabled;

        props.state.update(CalendarScrollStateName, tmpData);
        props.state.subscribe("config.plugin.CalendarScroll.enabled", (value => enabled = value));
        props.state.update("config.actions.br-chart-calendar", (value => (value.push(CalendarScroll), value)));

        props.gapi.pluginInitialized("CalendarScroll");

        return function() {
            props.state.update("config.actions.br-chart-calendar", (value => value.filter((v => v !== CalendarScroll))));
            props.gapi.pluginDestroyed("CalendarScroll");
        };
    };
}

export {
    Plugin
};