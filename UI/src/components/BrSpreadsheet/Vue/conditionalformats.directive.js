import { gh, isExecute, vueDefineComponent } from '@syncfusion/ej2-vue-base';
import { isNullOrUndefined } from '@syncfusion/ej2-base';
export var ConditionalFormatsDirective = vueDefineComponent({
    inject: { custom: { default: null } },
    render: function (createElement) {
        if (!isExecute) {
            var h = !isExecute ? gh : createElement;
            var slots = null;
            if (!isNullOrUndefined(this.$slots.default)) {
                slots = !isExecute ? this.$slots.default() : this.$slots.default;
            }
            return h('div', { class: 'e-directive' }, slots);
        }
        return;
    },
    updated: function () {
        if (!isExecute && this.custom) {
            this.custom();
        }
    },
    methods: {
        getTag: function () {
            return 'e-conditionalformats';
        }
    }
});
export var ConditionalFormatsPlugin = {
    name: 'e-conditionalformats',
    install: function (Vue) {
        Vue.component(ConditionalFormatsPlugin.name, ConditionalFormatsDirective);
    }
};
/**
 * `e-conditionalformat` directive represent a conditionalformat of the VueJS Spreadsheet.
 * It must be contained in a `e-sheet` directive.
 * ```vue
 * <ejs-spreadsheet>
 *   <e-sheets>
 *    <e-sheet>
 *    <e-conditionalformats>
 *    <e-conditionalformat></e-conditionalformat>
 *    </e-conditionalformats>
 *    </e-sheet>
 *   </e-sheets>
 * </ejs-spreadsheet>
 * ```
 */
export var ConditionalFormatDirective = vueDefineComponent({
    render: function () {
        return;
    },
    methods: {
        getTag: function () {
            return 'e-conditionalformat';
        }
    }
});
export var ConditionalFormatPlugin = {
    name: 'e-conditionalformat',
    install: function (Vue) {
        Vue.component(ConditionalFormatPlugin.name, ConditionalFormatDirective);
    }
};
