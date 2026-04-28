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

export default defineComponent({
    name: "br-list-toggle",
    props: {
        state: State,
        gapi: ganttApi,
    },
    data() {
        return {
            //listColumns: [],
            //styleMap: {},
            clicked: false,
        };
    },
    methods: {
        pointerDown(e) {
            this.clicked = true;
        },
        pointerUp(e) {
            if ( this.clicked ) {
                this.clicked = false;
                this.state.update("config.list.columns.percent", value => {
                    if ( 0 === value ) {
                        return 100;
                    } else {
                        return 0;
                    }
                });
            }
        }
    },
    setup(props, { attrs }) {
        let unsubscribes = [];
        onBeforeUnmount(() => {
            unsubscribes.forEach((unsubscribe) => unsubscribe());
        });

        const baseClassStr = "br-list-toggle";

        const icons = reactive({
            open: null,
            close: null
        });
        unsubscribes.push(props.state.subscribe("$data.list.toggle.icons", (value => {
            if ( value ) {
                icons.open = value.open;
                icons.close = value.close;
            }
        })));

        const styleMap = reactive({
            top: "0px"
        });

        unsubscribes.push(props.state.subscribe("$data.scroll.vertical.preciseOffset", (value => {
            styleMap.top = (-1 * Math.round(value) || 0) + "px";
        })));

        let open = ref(true);
        unsubscribes.push(props.state.subscribe("config.list.columns.percent", (value => {
            open = 0 !== value;
        })));

        return {
            classStr: baseClassStr,
            styleMap,
            icons,
            open
        };
    },
    render() {
        //console.log("render", this);
        return (
            <div class={this.classStr} style={this.styleMap} onpointerdown={this.pointerDown} onpointerup={this.pointerUp}>
                { this.open ? this.icons.close : this.icons.open }
            </div>
        );
    }
});