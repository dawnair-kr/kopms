import {
    defineComponent,
    shallowRef,
    toRefs,
    watch,
    computed,
    inject,
    onMounted,
    onBeforeUnmount,
    nextTick,
    watchEffect,
    getCurrentInstance,
    unref,
    ref,
    reactive,
} from 'vue';
import State from 'deep-state-observer';
import { ganttApi } from '../BrGanttApi.jsx';
import ChartCalendarDate from './ChartCalendarDate.jsx';
//import { Resize } from 'vuetify/directives';

export default defineComponent({
    name: "br-chart-calendar",
    //directives: { Resize },
    props: {
        state: State,
        gapi: ganttApi,
    },
    data() {
        return {
            //listColumns: [],
            //styleMap: {},
        };
    },
    mounted() {
        this.state.update("$data.elements.chart-calendar", this.$el);
        const actions = this.gapi.getActions("br-chart-calendar");
        actions.forEach(action => {
            if ( Object.prototype.hasOwnProperty.call(action, "prototype") ) { //class
                this.calendarScroll = new action(this.$el, {
                    state: this.state,
                    gapi: this.gapi
                });
            }
        });
        
    },
    beforeUnmount() {
        if ( this.calendarScroll ) {
            this.calendarScroll.destroy(this.$el);
        }
        this.state.update("$data.elements.chart-calendar", null);
        this.unsubscribes.forEach((unsubscribe) => unsubscribe());
    },
    methods: {
    },
    setup(props, { attrs }) {
        let unsubscribes = [];
        /*
        onBeforeUnmount(() => {
            unsubscribes.forEach((unsubscribe) => unsubscribe());
        });
        */

        const baseClassStr = "br-chart-calendar",
            classStr = baseClassStr;

        const styleMap = reactive({
            height: "",
            "--headerHeight": "",
            "margin-left": ""
        });

        let headerHeight;

        unsubscribes.push(props.state.subscribe("config.headerHeight", (value => {
            headerHeight = value;
            styleMap.height = headerHeight + "px";
            styleMap["--calendar-height"] = headerHeight + "px";
        })));

        let dates = reactive([]),
            curlevelLen;

        unsubscribes.push(props.state.subscribe("$data.chart.time.levels", ((value, eventInfo) => {
            
            const levels = props.state.get("$data.chart.time.levels");
            let levelIndex = 0;
            dates.length = 0;
            //console.log("chageddddd", levels);
            if (levels.length !== curlevelLen) {
                curlevelLen = levels.length;
                //dates = [];
            }

            for (const level of levels) {
                if (!level.length) continue;
                let fmt = "YYYY-MM-DD HH";
                switch (level[0].period) {
                    case "day":
                        fmt = "YYYY-MM-DD";
                        break;
                    case "week":
                        fmt = "YYYY-MM-ww";
                        break;
                    case "month":
                        fmt = "YYYY-MM";
                        break;
                    case "year":
                        fmt = "YYYY"
                }
                const curDt = props.gapi.time.date().format(fmt);
                for ( const dt of level ) {
                    if ( !dates[levelIndex] ) {
                        dates[levelIndex] = [];
                    }
                    dates[levelIndex].push({
                        level: levelIndex,
                        date: dt,
                        currentDate: curDt,
                        currentDateFormat: fmt
                    });
                }
                levelIndex++;
            }
        })));

        //console.log("dates", dates);
        return {
            classStr,
            styleMap,
            dates,
            unsubscribes,
        };
    },
    render() {
        //console.log("render ChartCalendar", this.dates);
        // ChartCalendar
        // ChartTimeline
        // ScrollBarVertical
        // ScrollBarHorizontal
        /*
        { this.calculatedZoomMode ? null : (
            <ScrollBar type="horizontal" state={this.state} gapi={this.gapi} />
        )}
        */
        return (
            <div class={this.classStr} style={this.styleMap}>
                { this.dates.length ? this.dates.map((level, idx) => {
                    if ( level && level.length ) {
                        return (
                            <div class={this.classStr +"-dates "+ this.classStr +`-dates--level-${idx}`}>
                                {
                                    level.map(options => (
                                        <ChartCalendarDate key={options.date.id}  options={options} state={this.state} gapi={this.gapi} />
                                    ))
                                }
                            </div>
                        );
                    } else {
                        return null;
                    }
                }) : null }
            </div>
        );
    }
});