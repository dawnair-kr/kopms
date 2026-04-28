import { gh, isExecute, vueDefineComponent } from '@syncfusion/ej2-vue-base';
import { isNullOrUndefined } from '@syncfusion/ej2-base';
export var ImagesDirective = vueDefineComponent({
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
            return 'e-images';
        }
    }
});
export var ImagesPlugin = {
    name: 'e-images',
    install: function (Vue) {
        Vue.component(ImagesPlugin.name, ImagesDirective);
    }
};
export var ImageDirective = vueDefineComponent({
    render: function () {
        return;
    },
    methods: {
        getTag: function () {
            return 'e-image';
        }
    }
});
export var ImagePlugin = {
    name: 'e-image',
    install: function (Vue) {
        Vue.component(ImagePlugin.name, ImageDirective);
    }
};
