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
import { ganttApi } from '../BrGanttApi.jsx';
import State from 'deep-state-observer';
import ListColumnRowExpander from './ListColumnRowExpander.jsx';

export default defineComponent({
    name: "br-list-column-row",
    //directives: { Resize },
    props: {
        state: State,
        options: {
            type: Object,
            default: () => {
                return {};
            }
        },
        gapi: ganttApi,
    },
    data() {
        return {
            //displayText: null
        };
    },
    methods: {
        getText() {
            if ( this.options.column && this.options.row && this.options.rowData ) {
                if ( "function" == typeof this.options.column.data ) {
                    return this.options.column.data({
                        row: this.options.row,
                    });
                } else if ( "function" == typeof this.options.row[this.options.column.data] ) {
                    return this.options.row[this.options.column.data]({
                        row: this.options.row,
                    });
                } else if ( this.options.row[this.options.column.data] ) {
                    if ( "function" == typeof this.options.column.data ) {
                        return this.options.column.data({
                            row: this.options.row,
                        });
                    } else {
                        return this.options.row[this.options.column.data];
                    }
                }
            }
            return null;
        },
    },
    setup(props, { attrs }) {
        let unsubscribes = [];
        onBeforeUnmount(() => {
            unsubscribes.forEach((unsubscribe) => unsubscribe());
        });

        let baseClass = "br-list-column-row";
        //const f = Object.assign({}, props.options);
        const classArr = reactive([baseClass]);
        const contentClassArr = reactive([baseClass + "-content"]);
        let g, p = false;
        //i(o.subscribe("config.components.ListColumnRowExpander", (t => g = t)));

        const styleMap = props.options.column && props.options.column.expander ? {
                height: "",
                top: "",
                "--height": "",
                "--expander-padding-width": "",
                "--expander-size": ""
            } : {
                height: "",
                top: "",
                "--height": ""
            };
            //classStr = m_classStr,
            //contentClassStr = m_classStr + "-content";

        /*
        const that = getCurrentInstance();
        
        let displayText = ref("");

        if ( props.options.column && props.options.row && props.options.rowData ) {
            if ( "function" == typeof props.options.column.data ) {
                displayText = props.options.column.data({
                    row: props.options.row,
                });
            } else if ( "function" == typeof props.options.row[props.options.column.data] ) {
                displayText = props.options.row[props.options.column.data]({
                    row: props.options.row,
                });
            } else if ( props.options.row[props.options.column.data] ) {
                if ( "function" == typeof props.options.column.data ) {
                    displayText = props.options.column.data({
                        row: props.options.row,
                    });
                } else {
                    displayText = props.options.row[props.options.column.data];
                }
            }
        }
        */
       
        const expanderInfo = props.state.get("config.list.expander");
        //for (const t in w.style) delete w.style[t];
        
        styleMap.height = props.options.rowData.outerHeight + "px";
        styleMap["--height"] = props.options.rowData.outerHeight + "px";

        if ( props.options.column.expander ) {
            styleMap["--expander-padding-width"] = expanderInfo.padding * (props.options.rowData.parents.length + 1) + "px";
        }

        const rows = props.state.get("config.list.rows");
        for (const rowId of props.options.rowData.parents) {
            const row = rows[rowId];
            if ("object" == typeof row.style && "Object" === row.style.constructor.name && "object" == typeof row.style.children) {
                const styleChildren = row.style.children;
                for (const prop in styleChildren) styleMap[prop] = styleChildren[prop];
            }
        }

        if ( props.options.row &&  props.options.row.style ) {
            for (const prop in props.options.row.style) styleMap[prop] = props.options.row.style[prop];
        }
                
        if ( props.options.row && props.options.row.classNames) {
            if (Array.isArray(props.options.row.classNames) && props.options.row.classNames.length) {
                props.options.row.classNames.forEach(c => {
                    classArr.push(c);    
                });
            } else if ("function" == typeof props.options.row.classNames) {
                const o = props.options.row.classNames({
                    row: props.options.row,
                });
                if ( Array.isArray(o) && o.length ) {
                    o.forEach(c => {
                        classArr.push(c);
                    });
                }
            }
        }

        return {
            classArr,
            contentClassArr,
            styleMap,
            //displayText
        };
    },
    render() {
        /*
                            { this.options.column && this.options.column.expander ? (
                    <div>{ 'expander' }</div>
                ) : null }
        */
        return (
            <div class={this.classArr} style={this.styleMap}>
                {this.options.column.expander ?  <ListColumnRowExpander state={this.state} gapi={this.gapi} options={this.options} /> : null}
                <div class={this.contentClassArr}>
                    { this.getText() }
                </div>
            </div>
        );
    }
});

