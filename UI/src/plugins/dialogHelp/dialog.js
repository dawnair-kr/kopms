/*
 * vuedl
 *
 * (c) Savaryn Yaroslav <yariksav@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { createVNode, render, defineComponent, watch, onMounted } from 'vue'
import Recordable from './mixins/recordable'
import Layoutable from './mixins/layoutable'
import returnable from './mixins/returnable'
import DefaultLayout from '../../components/Dialog/DefaultLayout.vue'
//import { ensureComponentAsyncData, hasAsyncPreload } from 'vue-asyncable'
import { reactive } from 'vue';
import {
  destroyVueElement,
  findContainer
} from './utils'
import lodash from 'lodash';
import LayoutContainer from '../../components/Dialog/LayoutContainer.vue';
import { VOverlay, VDialog } from 'vuetify/components';


function mount(component, { app, props, children, element } = {}) {
  let el = element;

  //console.log(parentVNode, "app", app);

  let vNode = createVNode(component, props, children);
  vNode.destroy = () => {
    if (el) render(null, el)
    el = null
    vNode = null
    //console.log("VNode destory", vNode)
  };

  if (app?._context) vNode.appContext = app._context;

  if (el) render(vNode, el)
  else if (typeof document !== 'undefined') render(vNode, el = document.createElement('div'))

  const destroy = () => {
    if (el) render(null, el)
    el = null
    vNode = null
  }

  return { vNode, destroy, el };
}

let seed = 1;
const snackbarsComps = reactive([]);
const dialogComps = reactive([]);
const loadingComps = reactive([]);

let curSnackBarLayoutVNode = null;
let curDialogLayoutVNode = null;
let curLayoutVNode = null;

export default class Dialog {
  constructor(component, { layout, container, context } = {}) {
    if (!component) {
      throw Error('Component was not set')
    }

    this._layout = layout || { component: DefaultLayout, options: {} };
    this._component = component;
    this._vm = null;
    this._vmDialog = null;
    this._options = {};
    this.id = ++seed;
    this._resolvers = [];
    this.container = findContainer(container);
    this.context = context;

    /*
    const that = this;
    if ( typeof component.created !== "function" ) {
      component.created = function created() {
        //console.log("created", that, this);
        this.$emit('created', { dialog: that });
      };
    }

    component.unmounted = ( ) => {
      if ( this.destroy ) {
        this.destroy();
      }
      //console.log("unmounted", that, this);
    };
    */
  }

  async show(params = {}, options = {}) {
    /*
    if (Vue.prototype.$isServer) {
      return
    }
    */

    // create dialog
    let Component = this._component;
    let compAlias = Object.keys(Component)[0];

    Component = Component[compAlias];

    if (!params.mgrName || params.mgrName.length == 0) {
      if (Array.isArray(Component.mixins)) {
        Component.mixins = [...Component.mixins, returnable];
      } else {
        Component.mixins = [returnable];
      }
    }

    // add primary key mixin
    if (Component.options && Component.options.primaryKey) {
      Component = Object.assign(Component,
        {
          mixins: [...Component.mixins, Recordable]
        }
      );
    }

    let layoutComponent = LayoutContainer;

    // 동적으로 components 생성을 위해
    //console.log(this.app._context);
    if (curLayoutVNode) {
      curLayoutVNode.$options.components[compAlias] = Component;
    } else {
      if (layoutComponent.components) {
        layoutComponent.components = { ...layoutComponent.components, [compAlias]: Component, VOverlay, VDialog };
      } else {
        layoutComponent.components = { [compAlias]: Component, VOverlay, VDialog };
      }
    }
    /*
    if ( !this.app._context.components[compAlias] ) {
      this.app.component(compAlias, Component);
    }
    */

    // this._layout.component
    if (Array.isArray(layoutComponent.mixins)) {
      layoutComponent.mixins = [...layoutComponent.mixins, Layoutable];
    } else {
      layoutComponent.mixins = [Layoutable];
    }

    /*
    if ( this._layout.component.components ) {
      this._layout.component.components = {...this._layout.component.components, [compAlias]: Component};
    } else {
      this._layout.component.components = { [compAlias] : Component};
    }
    */

    let LayoutCtor = layoutComponent;

    LayoutCtor = Object.assign(LayoutCtor, layoutComponent);
    //LayoutCtor.inheritAttrs = false;
    LayoutCtor = defineComponent({ extends: defineComponent({ ...LayoutCtor }) });

    //console.log("LayoutCtor", LayoutCtor, this._layout.component.name);

    //Component.options.inheritAttrs = false
    //params.onSubmit = this.onReturn.bind(this);
    //params.onClose = this.onClose.bind(this);
    let layoutPropsData = {};

    layoutPropsData.snackbars = snackbarsComps;
    layoutPropsData.dialogs = dialogComps;
    layoutPropsData.loaders = loadingComps;

    if (this._layout.component.name == "snackbar-layout") {

      snackbarsComps.push({
        ...params,
        transition: params.transition == null ? 'slide-y-transition' : params.transition,
        seed: this.id,
        compAlias,
        show: true,
        _loaded: false,
        _height: 0,
        onShown: (retval) => {
          this.onShown({
            ...retval,
            type: "snackbar"
          });
        },
      });
      //Layoutable.methods.removeSnackBarDialogChild = removeSnackBarDialogChild;
    } else if (this._layout.component.name == "loading-layout") {
      /*
      loadingComps.push({
        ...params,
        seed: this.id,
        show: true,
        compAlias,
      });
      */
      /*
      * Dialog가 떠 있을때는 새로운 Dialog를 안 띄우기 위해 사이즈를 체크해서
      * 있으면 안 띄운다.
      */
      // console.log(dialogComps);

      dialogComps.push({
        ...params,
        seed: this.id,
        isActive: true,
        compAlias,
        _type: "loading"
      });
      //console.log("sssssssssss", loadingComps[loadingComps.length - 1]);
      this._loading_layout = true;
    } else {
      /*
      * Dialog가 떠 있을때는 새로운 Dialog를 안 띄우기 위해 사이즈를 체크해서
      * 있으면 안 띄운다.
      */
      for (let dialogComp of dialogComps) {
        if (dialogComp.compAlias == "Confirm") return;
      }
      
      dialogComps.push({
        ...params,
        seed: this.id,
        compAlias,
        scrollable: params.scrollable === false ? params.scrollable : true,
        persistent: params.persistent === false ? params.persistent : true,
        transition: params.transition == null ? 'scale-transition' : params.transition,
        isActive: false,
        contentClass: params.contentClass == null ? null : params.contentClass,
        _loaded: false,
        _type: "dialog",
        onSubmit: (retval) => {
          this.onReturn({
            seed: this.id,
            retval,
          });
        },
        onClose: (retval) => {
          this.onClose({
            seed: this.id,
            retval,
          });
        },
        onShown: (retval) => {
          this.onShown({
            ...retval,
          });
        },

      });

      // console.log(dialogComps);
      // console.log("====", dialogComps[dialogComps.length - 1], compAlias);
    }

    params["onLayout:close"] = this.onLayout_close.bind(this);
    params["onLayout:shown"] = this.onLayout_shown.bind(this);
    params["onLayout:error"] = this.onLayout_error.bind(this);
    params["onLayout:submit"] = this.onReturn.bind(this);

    const propsData = { key: this.id, ...this._layout.options, ...layoutPropsData, "onSnackbar:close": this.onLayout_close.bind(this) };

    //console.log(this._layout.options, params, (options && options.propsData), "propsData", propsData);
    //console.log("layout.options", this._layout.options);
    //console.log("params", params);
    //console.log("options", options);

    if (curLayoutVNode == null) {
      watch(snackbarsComps, (cur, prev) => {
        cur.forEach(item => {
          if (item._loaded) {
            if (!item.show) {
              // console.log("sssssssssssss", item);
              this.onLayout_close({
                seed: item.seed,
                type: "snackbar"
              });
            }
          }

        });
      });

      let html;
      if (typeof document == "object") {
        html = document.getElementsByTagName('html')[0];
      }

      watch(dialogComps, (cur, prev) => {
        //let last_index = cur.length - 1;
        cur.forEach((item) => {
          if (item._loaded) {
            if (!item.isActive) {
              //console.log("sssssssssssss", item);
              this.onLayout_close({
                seed: item.seed
              });
            }
          }
        });

        if (html) {
          let item = dialogComps[dialogComps.length - 1];
          if (item && item.isActive) {
            if (item.fullscreen) {
              if (!html.classList.contains('full-screen')) {
                html.classList.add('full-screen');
                return;
              }
            }
          }
          if (html.classList.contains('full-screen')) {
            html.classList.remove('full-screen');
          }
        }

      });

      let ret = mount(LayoutCtor, { props: propsData, element: this.container, app: this.app });
      curLayoutVNode = ret.vNode.component.proxy;
    }

    //console.log("curLayoutVNode", curLayoutVNode);
    /*
    if ( this._layout.component.name == "snackbar-layout" ) {
      if ( curSnackBarLayoutVNode == null ) {
        watch(snackbarsComps, (cur, prev) => {
          cur.forEach(item => {
            if ( !item.show ) {
              //console.log("sssssssssssss", item);
              this.onLayout_close({
                seed: item.seed,
                type: "snackbar"
              });
            }
          });
        });
        let ret = mount(LayoutCtor, { props: propsData, element: this.container, app: this.app });
        curSnackBarLayoutVNode = ret.vNode.component.proxy;
      }
    } else {
      if ( curDialogLayoutVNode == null ) {
        watch(dialogComps, (cur, prev) => {
          cur.forEach(item => {
            if ( !item.isActive ) {
              //console.log("sssssssssssss", item);
              this.onLayout_close({
                seed: item.seed
              });
            }
          });
        });
        let ret = mount(LayoutCtor, { props: propsData, element: this.container, app: this.app });
        curDialogLayoutVNode = ret.vNode.component.proxy;
        //this._vm = ret.vNode.component.proxy;
      }
    }
    */
    //{ vNode, destroy, el };
    //this._vm = ret.vNode.component.proxy;


    //console.log(this.vm._dialogInstance);


    //console.log("ret", this._vm, this.vm._dialogInstance);
    return this;
  }

  wait() {
    return new Promise(resolve => {

      this._resolvers.push(resolve)
      console.log("dialog wait", this._resolvers, resolve);
    });
  }

  _onDestroyed() {
    this.remove()
  }

  remove() {
    
    this._onDestroyed && this._onDestroyed(this)
    this._processResultPromises()
    //destroyVueElement(this._vm)
    //destroyVueElement(this._vmDialog)
    this._vm = null
    this._vmDialog = null
  }

  _processResultPromises(result) {
    if (!this._resolvers.length) {
      return
    }
    //console.log("_processResultPromises", this._resolvers, result);
    this._resolvers.forEach(resolver => resolver(result))
    this._resolvers = []
  }

  onReturn(result) {

    let val = result ? result.retval : null;
    let seed = result ? result.seed : null;
    this._processResultPromises(val)
    this.close(seed);
  }

  onClose(result) {
    
    let val = result ? result.retval : null;
    let seed = result ? result.seed : null;
    this._processResultPromises(val);
    this.close(seed)
  }

  onLayout_close(result) {
    
    let val = result ? result.retval : null;
    let seed = result ? result.seed : null;
    if (result.type == "snackbar") {
      this.snackbar_close(seed);
    } else {
      this.close(seed);
    }
  }

  onShown(params) {
    
    if (params.type == "snackbar") {
      let findIdx = lodash.findIndex(snackbarsComps, o => {
        return o.seed == params.seed;
      });
      if (findIdx > -1) {
        const s_comp = snackbarsComps[findIdx];
        //console.log("s_comp", s_comp);
        s_comp._height = params.height;
        s_comp._width = params.width;
        s_comp._loaded = true;
        s_comp.show = true;
      }
    } else {
      let findIdx = lodash.findIndex(dialogComps, o => {
        return o.seed == params.seed;
      });
      if (findIdx > -1) {
        const d_comp = dialogComps[findIdx];
        d_comp._loaded = true;
        d_comp.isActive = true;
      }
    }
  }

  onLayout_shown() {
  }

  onLayout_error() {
  }

  loading_hide() {

    let seed = this.id;
    let findIdx = lodash.findIndex(dialogComps, o => {
      return o.seed == seed && o._type == "loading";
    });

    if (findIdx > -1) {
      // isActive:false 로 먼저 닫아야 Vuetify overlay 스택(scroll-block 카운터 등)이
      // 정상적으로 정리된다. show:false 는 v-model 바인딩과 무관한 잘못된 프로퍼티였음.
      dialogComps[findIdx].isActive = false;
      dialogComps.splice(findIdx, 1);
    }

  }

  get showed() {
    return !!this._vm && !this._vm._isDestroyed
  }

  get element() {
    return this._vm && this._vm.$el
  }

  get hasAsyncPreload() {

    //return this._component && hasAsyncPreload(this._component.options || this._component)
  }

  get vm() {
    return this._vm
  }

  get vmd() {
    return this._vmDialog
  }

  snackbar_close(seed) {

    let findIdx = lodash.findIndex(snackbarsComps, o => {
      return o.seed == seed;
    });


    if (findIdx > -1) {
      snackbarsComps.splice(findIdx, 1);
    }

    // console.log("snackbar_close", seed, findIdx, snackbarsComps);
    if (snackbarsComps.length == 0) {
      if (curSnackBarLayoutVNode) {
        curSnackBarLayoutVNode.$.vnode.destroy();
        curSnackBarLayoutVNode = null;
      }
    }
  }

  close(seed) {
    //this._vm && this._vm.close()
    //console.log("dialog close===", seed);
    let findIdx = lodash.findIndex(dialogComps, o => {
      return o.seed == seed && o._type == "dialog";
    });
    if (findIdx > -1) {
      dialogComps.splice(findIdx, 1);
    }

    if (dialogComps.length == 0) {
      if (curDialogLayoutVNode) {
        curDialogLayoutVNode.$.vnode.destroy();
        curDialogLayoutVNode = null;
      }
    }
  }
}