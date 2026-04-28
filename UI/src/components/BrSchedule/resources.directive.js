import { gh, isExecute, vueDefineComponent } from '@syncfusion/ej2-vue-base';
import { isNullOrUndefined } from '@syncfusion/ej2-base';

export let ResourcesDirective =  vueDefineComponent({
    inject: { custom: { default: null } },
    render(createElement) {
        if (!isExecute) {
            let h = !isExecute ? gh : createElement;
            let slots = null;
            if(!isNullOrUndefined((this).$slots.default)) {
                slots = !isExecute ? (this).$slots.default() : (this).$slots.default;
            }
            return h('div', { class: 'e-directive' }, slots);
        }
        return;
    },
    updated() {
        if (!isExecute && this.custom) { this.custom() }
    },
    methods: {
        getTag() {
            return 'e-resources';
        }
    }
});
export const ResourcesPlugin = {
    name: 'e-resources',
    install(Vue) {
        Vue.component(ResourcesPlugin.name, ResourcesDirective);
    }
}

/**
 * `e-resources` directive represent a resources of the VueJS Schedule. 
 * It must be contained in a Schedule component(`ejs-schedule`). 
 * ```vue
 * <ejs-schedule>
 *   <e-resources>
 *    <e-resource field='RoomId' name='Rooms'></e-resource>
 *    <e-resource field='OwnerId' name='Owners'></e-resource>
 *   </e-resources>
 * </ejs-schedule>
 * ```
 */
export let ResourceDirective =  vueDefineComponent({
    watch: {
        dataSource: {
            deep: true,
            handler(val, oldVal) {
                // console.log("watch11111111111 dataSource", val, oldVal, this.ej2Instances);
                //this.ej2Instances.eventSettings.dataSource = val;
                //this.ej2Instances._setProperties("fields", );
            }
        }
    },
    render() {
        return;
    },
    methods: {
        getTag() {
            return 'e-resource';
        }
    }
});
export const ResourcePlugin = {
    name: 'e-resource',
    install(Vue) {
        Vue.component(ResourcePlugin.name, ResourceDirective);
    }
}