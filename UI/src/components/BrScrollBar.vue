<template>
    <div>

    </div>
</template>
<script>

export default {
    props: {
        type: {
            type: String,
            default: "horizontal"
        },
        state: {
            type: Object,
            default: () => {
                return {};
            }
        }
    },
    data () {
        return {
            moving: false,
        };
    },
    methods: {
        dataChanged() {

        },
        limitPosition(pos) {
            let maxHandlePosPx = 0;
            if ( this.state.scroll && this.state.scroll[this.type] ) {
                maxHandlePosPx = this.state.scroll[this.type].maxHandlePosPx;
            }
            return Math.max(Math.min(pos, maxHandlePosPx), 0);
        },
        pointerDown(e) {
            e.stopPropagation();
            e.preventDefault();
            //n.muteMethod("calculateRowsHeight");
            //document.body.classList.add(this.bodyClassName);
            
            requestAnimationFrame(() => {
                this.moving = true;
                this.initialPointerPos = "horizontal" === this.type ? e.screenX : e.screenY;
                //this.initialHandlePos = o.get(`$data.scroll.${e.type}.handlePosPx`);
                //g = " " + n.getClass(h) + "-inner--active";
                //f = " " + n.getClass(h) + "--active";
                //parentUpdate();
            });
        },
        pointerUp(e) {
            if ( this.moving ) {
                //n.unmuteMethod("calculateRowsHeight");
                e.preventDefault();
                e.stopPropagation();
                //document.body.classList.remove(this.bodyClassName);
            } else {
                this.moving = false;
                //g = "";
                //f = "";
                //parentUpdate();
            }
        },
        pointerMoveRead(e) {
            this.currentPointerPos = "horizontal" === this.type ? e.screenX : e.screenY;
        },
        pointerMoveWrite() {
            const t = o.get(`config.scroll.${e.type}`),
                  a = o.get(`$data.scroll.${e.type}`),
                  changePos = this.currentPointerPos - this.initialPointerPos;

            this.currentPos = this.limitPosition(this.initialHandlePos + changePos);

            const timeLineData = o.get("$data.chart.time");
            if (!timeLineData.allDates.length) return;

            const dates = timeLineData.allDates[timeLineData.level],
                  r = this.currentPos / a.maxHandlePosPx * a.absoluteSizeWithoutLastPage,
                  c = Math.round(r);

            if ("horizontal" === this.type) {
                let e, a = 0,
                    o = 0,
                    i = 0;
                for (let t = dates.length; a < t && (e = dates[a], i = Math.round(e.rightPx), !(i > c)); a++);

                    t.precise && i !== c && (o = e.leftPx - r), a || (a = 0), e || (e = l[0]), this.dataIndex = a, this.lastDate = l[a], t.byPixels ? n.setScrollLeft(r) : n.setScrollLeft(e.id, o), this.lastDataIndex = a, this.lastOffset = o
                } else {
                    const {
                        dataIndex: e,
                        row: a,
                        rowData: o
                    } = n.getRowInfoFromTop(r);
                    let i = 0;
                    t.precise && o.position.top !== r && (i = o.position.top - r), this.dataIndex = e, this.previousRowId = a.id, t.byPixels ? n.setScrollTop(r) : n.setScrollTop(e, i), this.lastDataIndex = e, this.lastOffset = i
                }
            },
            pointerMove(t) {
                this.moving && (t.stopPropagation(), t.preventDefault(), requestAnimationFrame((() => {
                    this.pointerMoveRead(t)
                })), requestAnimationFrame((() => {
                    this.pointerMoveWrite()
                })))
            }

    }
};

</script>
<style lang="scss">
    .br__scroll-bar {
        overflow: hidden;
        position: absolute;
        background: rgba(253,253,253,0.471);
        cursor: grab;
    }

    .br__scroll-bar--vertical {
        flex-shrink: 0;
        right: 0px;
    }

    .br__scroll-bar--horizontal {
        bottom: 0px;
    }

    .br__scroll-bar-inner {
        background: rgba(0,0,0,0.16);
        border-radius: 4px;
        position: absolute;
        touch-action: none;
    }

    .br__scroll-bar-inner:hover, .br__scroll-bar-inner--active {
        background: rgba(0,0,0,0.25);
    }
</style>