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
import ListColumn from './ListColumn.jsx';
import { ganttApi } from '../BrGanttApi.jsx';
//import { Resize } from 'vuetify/directives';
import {
    addListener,
    removeListener
} from "resize-detector";


export default defineComponent({
    name: "br-list",
    //directives: { Resize },
    components: { ListColumn },
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
            let width = this.state.get("$data.dimensions.width");
            console.log("list Resize", this.$el.offsetWidth, width);
            this.state.update("$data.list.width", this.$el.offsetWidth);
            this.state.update("$data.chart.dimensions.width", width - this.$el.offsetWidth);
        }
    },
    setup(props, { attrs }) {
        let unsubscribes = [];
        onBeforeUnmount(() => {
            unsubscribes.forEach((unsubscribe) => unsubscribe());
        });

        const list = ref(null);

        watch([list], ([list], _, cleanup) => {
            let callback;
            if (list) {
              /*
              const autoresizeOptions = autoresize === true ? {
                onResize: () => null
              } : autoresize;
              const { throttle: wait = 100, onResize } = autoresizeOptions;
              */
              callback = () => {
                //chart.resize();
                let width = props.state.get("$data.dimensions.width");
                //console.log("list Resize", list.offsetWidth, width);
                props.state.update("$data.list.width", list.offsetWidth);
                props.state.update("$data.chart.dimensions.width", width - list.offsetWidth);
                //onResize();
              };
              
              //resizeListener = wait ? throttle(callback, wait) : callback;
              //addListener(root, resizeListener);
              addListener(list, callback);
            }
        
            cleanup(() => {
              if (list && callback) {
                removeListener(list, callback);
              }
            });
        });

        

        let m, f;
            const g = {
                list: m,
                percent: f,
            };
            !(() => {
                const t = props.state.get("config.list.expander.icons"),
                    e = {};
                for (const o in t) {
                    const i = t[o];
                    e[o] = i;
                }
                props.state.update("$data.list.expander.icons", e);
            })(),
            (() => {
                const t = {
                        open: "",
                        close: ""
                    },
                    e = props.state.get("config.list.toggle.icons");
                for (const o in e) {
                    const i = e[o];
                    t[o] = i;
                }
                props.state.update("$data.list.toggle.icons", t)
            })();
            
            unsubscribes.push(props.state.subscribe("config.list", () => {
                m = props.state.get("config.list");
                f = m.columns.percent;
                g.list = m;
                g.percent = f;
                //n()
            }));

            const listColumns = reactive([]);
            const that = getCurrentInstance();

            unsubscribes.push(props.state.subscribe("config.list.columns.data", (function(value) {
                const columnsInfo = Object.values(value).filter((v => !v.hidden))
                    .sort(((a, b) => "number" == typeof a.position && "number" == typeof b.position ? a.position - b.position : 0));

                listColumns.length = 0;
                columnsInfo.forEach(col => {
                    listColumns.push(col);
                });
                //that.listColumns = listColumns;    
                /*
                l(y, e, (t => ({
                    column: t
                })), p, !0), n()
                */
            })));

            //console.log("listColumns", listColumns);

            const style = reactive({
                height: ref(""),
                "--expander-padding-width": ref(""),
                "--expander-size": ref("")
            });

            let x;

            function P(t) {
                x || (x = t.offsetWidth, 0 === f && (x = 0), this.state.update("$data.list.width", x))
            }

            unsubscribes.push(props.state.subscribeAll(["$data.height", "config.list.expander"], (() => {
                const t = props.state.get("config.list.expander");
                style.height = props.state.get("$data.height") + "px";
                style["--expander-padding-width"] = t.padding + "px";
                style["--expander-size"] = t.size + "px";
                //n()
                //that.styleMap = style;
                //console.log("0000000", props.state.get("$data.height"), style);
                
            }), {
                group: true
            }));
            
            //console.log("11112222", props.state, style);
            //that.styleMap = style;
        return {
            styleMap: style,
            classStr: "br-list",
            listColumns,
            list,
        };
    },
    render() {
        //console.log("render", this);
        return (
            <div ref="list" class={this.classStr} style={this.styleMap}>
                { this.listColumns.map(column => {
                    return (
                        <ListColumn key={column.id} state={this.state} gapi={this.gapi} column={column}></ListColumn>
                    );
                }) }
            </div>
        );
    }
});