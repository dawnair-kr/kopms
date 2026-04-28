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

export default defineComponent({
    name: "br-list-column-row-expander-toggle",
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
            //displayText:
            expanded: false, 
        };
    },
    methods: {
        onClick(e) {
            //console.log("clicked expanded", this.expanded);
            //this.expanded.value = !this.expanded; 
            let expanded = !this.expanded; 
            if ( this.options.row ) {
                this.state.update(`config.list.rows.${this.options.row.id}.expanded`, expanded, {
                    data: {
                        name: "expanded",
                        rowId: this.options.row.id,
                        expanded: expanded
                    }
                });
            } else {
                this.state.update("config.list.rows", (value => {
                    for (const rowId in value) value[rowId].expanded = expanded;
                    return value;
                }), {
                    only: ["*.expanded"],
                    data: {
                        name: "expanded"
                    }
                });
            }
            //this.icons.expanded = expanded;
            //console.log("clicked expanded", this.options.rowData == null ? "header" : this.options.rowData.id, expanded);
            this.expanded = expanded;
            this.$nextTick();
        }
    },
    mounted() {
        if ( this.options.row ) {
            //expanded.value = props.options.row.expanded;
            /**/
            this.unsubscribes.push(this.state.subscribe(`config.list.rows.${this.options.row.id}.expanded`, (value => {
                this.expanded = value;  
            })));
            
            //this.expanded = this.icons.expanded;
            this.expanded = this.options.row.expanded;
        } else {
            this.unsubscribes.push(this.state.subscribe("config.list.rows.*.expanded", ((value) => {
                //console.log("1111", value);
                let expanded = this.expanded;
                for (const param of value) {
                    //console.log("==>", param);
                    if (param.value) {
                        //expanded.value = true;
                        expanded = true;
                        break;
                    }
                }
                this.expanded = expanded;
                //if ( icons.expanded ) icons.expanded = false;
            }), {
                bulk: true
            }));

            //console.log("expanded", props.options.id, icons.expanded);
        }



    },
    setup(props, { attrs }) {
        let unsubscribes = [];
        onBeforeUnmount(() => {
            unsubscribes.forEach((unsubscribe) => unsubscribe());
        });

        let baseClassStr = "br-list-column-row-expander-toggle";
        
        const actions = props.gapi.getActions(baseClassStr);

        const childClassStr = baseClassStr + "-child",
              openClassStr = baseClassStr + "-open",
              closeClassStr = baseClassStr + "-closed";

        const icons = reactive({
            child: null,
            open: null,
            closed: null,
        });
        unsubscribes.push(props.state.subscribe("$data.list.expander.icons", (value => {
            if ( value ) {
                icons.child = value.child;
                icons.open = value.open;
                icons.closed = value.closed;
            }
        })));

        return {
            classStr: baseClassStr,
            childClassStr,
            openClassStr,
            closeClassStr,
            icons,
            unsubscribes,
            //expanded,
        };
    },
    render() {
        //this.icons.open : this.icons.closed 
        //console.log("ListColumnRowExpanderToggle Render", this.options.rowData == null ? "header" : this.options.rowData.id, this.expanded);
        return (
            <div class={this.classStr} onClick={this.onClick}>
                {
                    this.icons.child ?
                       ( this.options.rowData && (null == this.options.rowData.children || this.options.rowData.children.length == 0) ) ?
                            this.icons.child : 
                         this.options.row == null ?
                            this.expanded ? this.icons.open : this.icons.closed : this.expanded ? this.icons.open : this.icons.closed : null
                }
                
            </div>
        );
    }
});

