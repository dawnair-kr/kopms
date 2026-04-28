import { gh, isExecute, vueDefineComponent } from '@syncfusion/ej2-vue-base';
import { isNullOrUndefined } from '@syncfusion/ej2-base';
export var ChartsDirective = vueDefineComponent({
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
            return 'e-charts';
        }
    }
});
export var ChartsPlugin = {
    name: 'e-charts',
    install: function (Vue) {
        Vue.component(ChartsPlugin.name, ChartsDirective);
    }
};
export var ChartDirective = vueDefineComponent({
    render: function () {
        return;
    },
    methods: {
        getTag: function () {
            return 'e-chart';
        }
    }
});
export var ChartPlugin = {
    name: 'e-chart',
    install: function (Vue) {
        Vue.component(ChartPlugin.name, ChartDirective);
    }
};
