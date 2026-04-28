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
//import { Resize } from 'vuetify/directives';

export default defineComponent({
    name: "br-chart-calendar-date",
    //directives: { Resize },
    props: {
        state: State,
        gapi: ganttApi,
        options: {
            type: Object,
            default: () => {
                return {};
            }
        },
    },
    data() {
        return {
            //listColumns: [],
            //styleMap: {},
        };
    },
    methods: {
    },
    setup(props, { attrs }) {
        let unsubscribes = [];
        onBeforeUnmount(() => {
            unsubscribes.forEach((unsubscribe) => unsubscribe());
        });

        const baseClassStr = "br-chart-calendar-date",
            classStr = baseClassStr;

        const styleMap = reactive({
            width: "0px"
        });

        let additionalClass = ref("");
        let finalClassStr = ref("");
        let formatClassName = "";

        let oldTime;
        unsubscribes.push(props.state.subscribe("config.chart.time", (value => oldTime = value)));

        function change() {
            if (!props.options.date) return;
            const configLevel = props.state.get(`config.chart.calendarLevels.${props.options.level}`);

            styleMap.width = props.options.date.currentView.width + "px";
            styleMap.left = props.options.date.currentView.leftPx + "px";

            const configDate = configLevel.find((value => +oldTime.zoom <= +value.zoomTo));

            additionalClass = props.options.date.current ? " gstc-current" : props.options.date.next ? 
                     " gstc-next" : props.options.date.previous ? 
                          " gstc-previous" : "";
                          
            finalClassStr = baseClassStr + "-content " + baseClassStr + `-content--${props.options.date.period}` + additionalClass;
            if ( configDate.classNames && Array.isArray(configDate.classNames) ) {
                finalClassStr += " " + configDate.classNames.join(" ");
                formatClassName = " " + configDate.classNames.join(" ");
            } else {
                formatClassName = "";
            }
        }

        unsubscribes.push(props.state.subscribeAll([
            "$data.chart.time", 
            "$data.chart.time.levels", 
            "config.chart.calendarLevels"], change, {
            bulk: true
        }));

        //change();

        let changedLevel = props.options.level === oldTime.level;
        let mainClassStr = changedLevel ? baseClassStr + "--main-date " : baseClassStr + "--non-main-date ";
        
        /*
        let y = !1;
        let x, P, C;
        const $ = {
            date: e.date,
            period: e.period,
            api: a,
            state: o,
            componentName: h
        };
        l(((t, a) => {
            if (a.leave) return y = !0, D.change(t, a), n();
            y = !1, P = e.level === f.level, C = P ? m + "--main-date " : m + "--non-main-date ", e = t, $.date = e.date, $.period = e.period, x && x(), 
            x = o.subscribeAll(["$data.chart.time", "config.chart.calendarLevels"], b, {
                bulk: !0
            }), D.change(t, a)
        })), i((() => {
            x()
        })), u.includes(E) || u.push(E);
        */
        return {
            classStr,
            styleMap,
            additionalClass,
            mainClassStr,
            formatClassName,
            finalClassStr,
        };
    },
    render() {
        //console.log("render ChartCalenderDate", this.options, this);
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
            <div class={this.classStr+" "+this.classStr+`--${this.options.date.period} `+this.mainClassStr+
                this.classStr+`--level-${this.options.level}`+this.additionalClass+ this.formatClassName} 
                style={this.styleMap}>
                    <div class={this.finalClassStr}>
                        {
                            ( this.options && this.options.date && this.options.date.formatted &&
                                this.options.date.formatted()
                            )
                        }
                    </div>
            </div>
        );
    }
});