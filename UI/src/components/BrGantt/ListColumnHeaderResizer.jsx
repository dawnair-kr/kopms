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

export default defineComponent({
    name: "br-list-column-header-resizer",
    //directives: { Resize },
    props: {
        state: State,
        column: {
            type: Object,
            default: () => {
                return {};
            }
        },
        gapi: ganttApi,
    },
    data() {
        return {
            //visibleRows: []
            asc: true,
            sortActive: false,
        };
    },
    mounted() {
        if ( this.resizer ) {
            document.addEventListener("pointermove", this.onMove);
            document.addEventListener("pointerup", this.pointerUp);
        }
        //let asc = ref(true);
    
        //let sortActive = ref(false);
        this.unsubscribes.push(this.state.subscribe("config.list.sort", (value => {
            if (value.activeColumnId === this.column.id) {
                
                this.asc = value.asc;
                this.sortActive = true;
                //console.log("ssssss", value, "sortActive", this.sortActive, "asc", this.asc);
                return;
            }
            this.sortActive = false;
        })));

        //document.addEventListener("pointermove", this.onMove);
    },
    beforeUnmount() {
        this.unsubscribes.forEach((unsubscribe) => unsubscribe());
        if ( this.resizer ) {
            document.removeEventListener("pointermove", this.onMove);
            document.addEventListener("pointerup", this.pointerUp);
        }
        //
    },
    methods: {
        onMove(e) {
            if ( !this.moving ) return;

            //console.log("onMove 0000", this.resizer, e.movementX);
            if (!this.resizer) return;

            if ( e.movementX ) {
                e.preventDefault();
                e.stopPropagation();
            }
            let minWidth = this.state.get("config.list.columns.minWidth");
            if ( "number" == typeof this.column.minWidth ) {
                minWidth = this.column.minWidth;
            }
            this.curWidth += e.movementX;
            if ( this.curWidth < minWidth ) {
                this.curWidth = minWidth;
            }
            //console.log("onMove", this.curWidth, this.resizerInRealTime);
            if ( this.resizerInRealTime ) {
                this.state.update(`config.list.columns.data.${this.column.id}.width`, this.curWidth);
                //console.log("onMove11111", this.state.get(`config.list.columns.data.${this.column.id}.width`));
            }
        },
        pointerDown(e) {
            this.moving = true;
        },
        pointerUp(e) {
            this.moving = false;
            //console.log("pointerUp");
        },
        onLabelClick() {
            if ( this.column.sortable ) {
                this.asc = !this.asc;
                this.state.update("config.list.sort", (value => {
                    value.activeColumnId = this.column.id;
                    value.asc = this.asc;
                    //console.log("onLabelClick", value, "asc", this.asc);
                    return value;
                }));
            }
        }
    },
    setup(props, { attrs }) {
        let unsubscribes = [];
        /*
        onBeforeUnmount(() => {
            unsubscribes.forEach((unsubscribe) => unsubscribe());
        });
        */

        let baseClassStr = "br-list-column-header-resizer";

        const icons = {
            up: null,
            down: null
        };

        let classStr = ref(""), 
            containerClassStr = ref(""), 
            dotsClassStr = ref(""), 
            dotClassStr = ref("");

        unsubscribes.push(props.state.subscribe("config.list.sort.icons", (value => {
            icons.up = value.up; 
            icons.down = value.down;
        })));
        
        classStr = baseClassStr;
        containerClassStr = baseClassStr + "-container";
        dotsClassStr = baseClassStr + "-dots";
        dotClassStr = baseClassStr + "-dots-dot";

        const iconClassStr = baseClassStr + "-sort-icon";

        let width;
        const styleMap = reactive({});
        let resizerInRealTime = ref(false);

        let resizer = ref(true),
            curWidth = ref(0);
    
        function changeWidth() {
            if (!props.column.id) return;
            classStr = baseClassStr + " " + baseClassStr + "--" + props.column.id;
            containerClassStr = baseClassStr + "-container " + baseClassStr + "-container--" + props.column.id;
            dotsClassStr = baseClassStr + "-dots " + baseClassStr + "-dots--" + props.column.id; 
            dotClassStr = baseClassStr + "-dots-dot " + baseClassStr + "-dots-dot--" + props.column.id;

            resizer = !("resizer" in props.column) || props.column.resizer;
            const configList = props.state.get("config.list");
            width = props.column.width * configList.columns.percent * .01;
            curWidth = width;
            styleMap["--width"] = configList.columns.resizer.width + "px", 
            resizerInRealTime = configList.columns.resizer.inRealTime; 
            //console.log("resssss", resizerInRealTime, width);
            props.state.update("$data.list.width", width);
            //$.change(e), n()
        }

        unsubscribes.push(props.state.subscribeAll(["config.list.columns.percent", 
            "config.list.columns.resizer.width", "config.list.columns.resizer.inRealTime"], changeWidth, {
            group: true
        }));
        
        let dots = ref([]);
        unsubscribes.push(props.state.subscribe("config.list.columns.resizer.dots", (value => {
            for (let i = 0; i < value; i++) dots.value.push(i);
        })));

        
        return {
            classStr,
            containerClassStr,
            dotsClassStr,
            dotClassStr,
            iconClassStr,
            styleMap,
            icons,
            resizerInRealTime,
            resizer,
            curWidth,
            dots,
            unsubscribes,
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
        const text = () => {
            return !this.column ? null : "function" == typeof this.column.header.content ? this.column.header.content({
                column: this.column,
            }) : this.column.header.content;
        }

        //console.log("listColumnHeaderResizer Render", this.column, "sortActive", this.sortActive, "asc", this.asc, this.icons);
        return (
            <div class={this.classStr}>
                {
                    this.resizer ? (
                        [<div class={this.containerClassStr} onclick={this.onLabelClick} >
                            {text()}
                            { this.column && this.column.sortable && this.sortActive && (
                                this.asc ? this.icons.down : this.icons.up
                            ) }
                        </div>,
                        <div class={this.dotsClassStr} style={this.styleMap} onpointerdown={this.pointerDown}>{
                            this.dots.map(() => (<div class={this.dotClassStr}></div>))
                        }</div>]
                    ) :
                    (
                        <div class={this.containerClassStr} onClick={this.onLabelClick}>
                            {text()}
                            { this.column && this.column.sortable && this.sortActive && (
                                this.asc ? this.icons.down : this.icons.up
                            ) }
                        </div>
                    )
                }
            </div>
        );
    }
});

