import lodash from 'lodash';

const TimeBookmarksStateName = "config.plugin.TimeBookmarks", //TimeBookmarksStateName
    TimeBookmarksSlotName = "config.slots.br-chart-timeline-items.outer"; //TimeBookmarksSlotName

class TimeBookmarks {
    constructor(options, props) {
        this.unsub = [];
        this.options = function(options) {
            return Object.assign({
                enabled: true,
                className: ""
            }, options);
        }(options);

        this.state = props.state;
        this.api = props.gapi;

        this.className = ["br-chart-time-bookmark"];

        if ( Array.isArray(this.options.className) ) {
            this.className = this.className.concat(this.options.className);
        } else if ( this.options.className && this.options.className.length ) {
            this.className.push(this.options.className);
        }

        this.getTimeBookmarksSlot = this.getTimeBookmarksSlot.bind(this);
        this.destroy = this.destroy.bind(this);

        this.state.update(TimeBookmarksStateName, this.options);
        this.state.update(TimeBookmarksSlotName, (value => {
            if ( !value.includes(this.getTimeBookmarksSlot) ) {
                value.push(this.getTimeBookmarksSlot);
            }
            return value;
        }));

        this.unsub.push(this.state.subscribe(TimeBookmarksStateName, (value => this.options = value)));
    }
    destroy() {
        this.unsub.forEach((t => t()));
        this.state.update(TimeBookmarksSlotName, (t => t.filter((t => t !== this.getTimeBookmarksSlot))));
        this.api.pluginDestroyed("TimeBookmarks");
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

    getTimeBookmarksSlot(props) {
        const {
            state,
            gapi,
        } = props;

        const bookmarks = [];
        state.subscribeAll([TimeBookmarksStateName, "$data.chart.time", "$data.scroll.horizontal.dataIndex"], (() => {
            let orgStyle;
            const time = state.get("$data.chart.time"),
                pluginData = state.get(TimeBookmarksStateName);

            bookmarks.length = 0;
            for (const bookmarkId in pluginData.bookmarks) {
                const bookmarkDt = gapi.time.date(pluginData.bookmarks[bookmarkId].time);
                if (!gapi.time.isInCurrentView(bookmarkDt, time)) continue;
                const bookmark = Object.assign(Object.assign({}, pluginData.bookmarks[bookmarkId]), {
                    id: bookmarkId,
                    leftViewPx: 0,
                    absoluteLeftPx: 0,
                    visible: false,
                    date: null,
                    styleMap: Object.assign(null !== (orgStyle = pluginData.bookmarks[bookmarkId].style) && null != orgStyle ? orgStyle : {}, {
                        left: "",
                        height: ""
                    })
                });

                bookmark.styleMap.background = bookmark.styleMap.background || bookmark.color || "#3498DB";
                bookmark.id = bookmarkId;
                bookmark.date = bookmarkDt; 
                bookmark.leftViewPx = gapi.time.getViewOffsetPxFromDates(bookmarkDt, false, time);
                bookmark.absoluteLeftPx = gapi.time.getGlobalOffsetPxFromDates(bookmark.date, false, time);
                bookmark.visible = bookmark.absoluteLeftPx >= time.leftPx && bookmark.absoluteLeftPx <= time.rightPx;
                bookmarks.push(bookmark);
            }
            this.updateVueChartTimelineItems();
        }), {
            group: true
        });

        let chartWidth = 0,
            vertOffset = 0;
        state.subscribe("$data.scroll.vertical", (value => {
            chartWidth = Math.round(gapi.getRealChartHeight());
            vertOffset = Math.round(-value.preciseOffset);
            this.updateVueChartTimelineItems();
        }));

        let leftClassName = [],
              innerLeftClassName = this.className.slice(0),
              rightClassName = this.className.slice(0),
              innerRightClassName = this.className.slice(0);
        
        //console.log("lefClassName", leftClassName);
        
        const leftBookMark = t => (<div
            class={(leftClassName = [], leftClassName.push(this.className[0] + "-line"), leftClassName.push(this.className[0] + `-line--${t.id}`), leftClassName.push(t.className ? t.className : null), leftClassName)}
            style={`left:${t.leftViewPx}px;top: ${vertOffset}px;`}
        >
            <div
                class={(innerLeftClassName = [], innerLeftClassName.push(this.className[0] + "-line-content"), innerLeftClassName.push(`${this.className[0]}-line-content--${t.id}`), innerLeftClassName)}
                style={`border-left: 1px solid ${t.styleMap.background};`}
            ></div>
        </div>),
              rightBookMark = t => (<div
            class={(rightClassName = [], rightClassName.push(this.className[0] + "-label"), rightClassName.push(`${this.className[0]}-label--${t.id}`), rightClassName.push(t.className ? t.className : null), rightClassName)}
            style={`left:${t.leftViewPx}px;top: ${vertOffset}px;`}
        >
            <div
                class={(innerRightClassName = [], innerRightClassName.push(this.className[0] + "-label-content"), innerRightClassName.push(`${this.className[0]}-label-content--${t.id}`), innerRightClassName)}
                style={t.styleMap}
            >
                ${t.label}
            </div>
        </div>);

        return (data = {}, outerVNode) => {
            const leftMainClass = [this.className[0] + "s"],
                  rightMainClass = [this.className[0] + "s"];
            return (
                <>
                <div class={(leftMainClass.push(this.className[0] + "s--lines"), leftMainClass)} style={`height: ${chartWidth}px;`}>
                    {bookmarks.filter((t=>t.visible)).map((t=>leftBookMark(t)))}
                </div>
                {outerVNode}
                <div class={(rightMainClass.push(this.className[0] + "s--labels"), rightMainClass)} style={`height: ${chartWidth}px;`}>
                    {bookmarks.filter((t=>t.visible)).map((t=>rightBookMark(t)))}
                </div>
                </>
            );
        };
    }
}

function Plugin(options = {}) {
    return function(props) {
        const value = props.state.get(TimeBookmarksStateName);
        value && (options = lodash.merge({}, [options, value]));
        const instance = new TimeBookmarks(options, props);
        props.gapi.pluginInitialized("TimeBookmarks");
        return instance.destroy;
    }
}

export {
    Plugin
};