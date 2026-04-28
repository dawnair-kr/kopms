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
    defineAsyncComponent,
} from 'vue';
import { ganttApi } from '../BrGanttApi.jsx';
import State from 'deep-state-observer';
import ListColumnHeaderResizer from './ListColumnHeaderResizer.jsx';
import ListColumnRowExpander from './ListColumnRowExpander.jsx';

export default defineComponent({
    name: "br-list-column-header",
    //directives: { Resize },
    props: {
        state: State,
        column: Object,
        gapi: ganttApi,
    },
    data() {
        return {
            //visibleRows: []
        };
    },
    setup(props, { attrs }) {
        let unsubscribes = [];
        onBeforeUnmount(() => {
            unsubscribes.forEach((unsubscribe) => unsubscribe());
        });

        let baseClassStr = "br-list-column-header";

        let classStr = baseClassStr;
        let contentClassStr = baseClassStr + "-content";

        const styleMap = reactive({
                height: "",
                "--height": "",
                "--paddings-count": ""
            });

        unsubscribes.push(props.state.subscribe("config.headerHeight", (() => {
            const t = props.state.get("config");
            styleMap.height = t.headerHeight + "px";
            styleMap["--height"] = t.headerHeight + "px";
            styleMap["--paddings-count"] = "1";
        })));
        return {
            classStr,
            contentClassStr,
            styleMap,
        };
    },
    render() {
        /*
            this.column.expander ?
                <div class={this.contentClassStr}>
                    <ListColumnRowExpander />
                    { this.column.header && this.column.header.content ? this.column.header.content : null }
                </div>
        */
        // 
        //
        return (
            <div class={this.classStr} style={this.styleMap}>
                <div class={this.contentClassStr}>
                    { this.column.expander ? <ListColumnRowExpander state={this.state} gapi={this.gapi} options={this.column} /> : null }
                    <ListColumnHeaderResizer column={this.column} state={this.state} gapi={this.gapi} />
                </div>
            </div>
        );
    }
});

