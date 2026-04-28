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
import ListColumnRowExpanderToggle from './ListColumnRowExpanderToggle.jsx';

export default defineComponent({
    name: "br-list-column-row-expander",
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

        const baseClassStr = "br-list-column-row-expander";

        

        return {
            classStr: baseClassStr,
        };
    },
    render() {
        //console.log("render", this);
        return (
            <div class={this.classStr}>
                <ListColumnRowExpanderToggle state={this.state} gapi={this.gapi} options={this.options} />
            </div>
        );
    }
});