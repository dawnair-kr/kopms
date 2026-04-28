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
import { Resize } from 'vuetify/directives';
import ScrollBar from './ScrollBar.jsx';
import ChartCalendar from './ChartCalendar.jsx';
import ChartTimeline from './ChartTimeline.jsx';

export default defineComponent({
    name: "br-chart",
    directives: { Resize },
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
    methods: {
        onResize() {
            const width = this.$el.offsetWidth,
                height = this.$el.offsetHeight,
                widthWithoutScrollBar = width - this.state.get("config.scroll.horizontal.width"),
                headerHeight = this.state.get("config.headerHeight");
            
            if ( this.prevWidth !== width ) {
                this.prevWidth = width;
                this.state.update("$data.chart.dimensions", 
                    value => {
                        value.width = width;
                        value.widthWithoutScrollBar = widthWithoutScrollBar;
                        value.height = height;
                        value.innerHeight = height - headerHeight;
                        return value;
                    }
                );
            }
            //o.update("$data.elements.chart", t)
        }
    },
    setup(props, { attrs }) {
        let unsubscribes = [];
        onBeforeUnmount(() => {
            unsubscribes.forEach((unsubscribe) => unsubscribe());
        });

        const baseClassStr = "br-chart",
            classStr = baseClassStr;

        let prevWidth = 0;

        let calculatedZoomMode = false;
        unsubscribes.push(props.state.subscribe("config.chart.time.calculatedZoomMode", (value => {
            calculatedZoomMode = value;
        })));

        return {
            prevWidth,
            calculatedZoomMode,
            classStr,
        };
    },
    render() {
        //console.log("render", this);
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
            <div v-resize={this.onResize} class={this.classStr}>
                <ChartCalendar key={"chart-calendar"} state={this.state} gapi={this.gapi} />
                <ChartTimeline key={"chart-timeline"} state={this.state} gapi={this.gapi} />
                <ScrollBar type="vertical" state={this.state} gapi={this.gapi} />
                { this.calculatedZoomMode ? null : (
                    <ScrollBar type="horizontal" state={this.state} gapi={this.gapi} />
                )}
            </div>
        );
    }
});