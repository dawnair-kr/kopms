import {
  defineComponent,
  shallowRef,
  toRefs,
  watch,
  computed,
  inject,
  onMounted,
  onBeforeUnmount,
  h,
  nextTick,
  watchEffect,
  getCurrentInstance,
  unref,
  ref,
} from 'vue';

import { init as initChart, throttle } from "echarts/core";

// import { TitleComponent, TooltipComponent, LegendComponent } from 'echarts/components';
// import { PieChart } from 'echarts/charts';

import {
  addListener,
  removeListener
} from "resize-detector";
import './chartStyle.css';


// echarts.use([TitleComponent, TooltipComponent, LegendComponent, PieChart]);

const TAG_NAME = "x-vue-echarts";

/*
class EChartsElement extends HTMLElement {
  constructor() {
      super();
  }
  __dispose() { return null }
}
*/

/*
let registered = null;

function register() {
  if (registered != null) {
    return registered;
  }

  if (
    typeof HTMLElement === "undefined" ||
    typeof customElements === "undefined"
  ) {
    return (registered = false);
  }

  try {
    // Class definitions cannot be transpiled to ES5
    // so we are doing a little trick here to ensure
    // we are using native classes. As we use this as
    // a progressive enhancement, it will be fine even
    // if the browser doesn't support native classes.
    const reg = new Function(
      "tag",
      `class EChartsElement extends HTMLElement {
  __dispose = null;

  disconnectedCallback() {
    if (this.__dispose) {
      this.__dispose();
      this.__dispose = null;
    }
  }
}

if (customElements.get(tag) == null) {
  customElements.define(tag, EChartsElement);
}
`
    );
    reg(TAG_NAME);
    console.log(reg, TAG_NAME);
  } catch (e) {
    return (registered = false);
  }

  return (registered = true);
}


const __CSP__ = null;
const wcRegistered = __CSP__ ? false : register();
*/

//console.log("app", app);
const THEME_KEY = "ecTheme";
const INIT_OPTIONS_KEY = "ecInitOptions";
const UPDATE_OPTIONS_KEY = "ecUpdateOptions";

function unwrapInjected(injection, defaultValue) {
  const value = unref(injection);

  if (value && typeof value === "object" && "value" in value) {
    return value.value || defaultValue;
  }

  return value || defaultValue;
}

const onRE = /^on[^a-z]/;
export const isOn = (key) => onRE.test(key);

export function omitOn(attrs) {
  const result = {};
  for (const key in attrs) {
    if (!isOn(key)) {
      result[key] = attrs[key];
    }
  }

  return result;
}

const METHOD_NAMES = [
  "getWidth",
  "getHeight",
  "getDom",
  "getOption",
  "resize",
  "dispatchAction",
  "convertToPixel",
  "convertFromPixel",
  "containPixel",
  "getDataURL",
  "getConnectedDataURL",
  "appendData",
  "clear",
  "isDisposed",
  "dispose"
];

function usePublicAPI(chart) {
  function makePublicMethod(name) {
    return (...args) => {
      if (!chart.value) {
        throw new Error("ECharts is not initialized yet.");
      }
      return (chart.value[name]).apply(chart.value, args);
    };
  }

  function makePublicMethods() {
    const methods = Object.create(null);
    METHOD_NAMES.forEach(name => {
      methods[name] = makePublicMethod(name);
    });

    return methods;
  }

  return makePublicMethods();
}

function useAutoresize(chart, autoresize, root) {
  let resizeListener = null;

  watch([root, chart, autoresize], ([root, chart, autoresize], _, cleanup) => {
    if (root && chart && autoresize) {
      const autoresizeOptions = autoresize === true ? {
        onResize: () => null
      } : autoresize;
      const { throttle: wait = 100, onResize } = autoresizeOptions;

      const callback = () => {
        chart.resize();
        onResize();
      };

      resizeListener = wait ? throttle(callback, wait) : callback;
      addListener(root, resizeListener);
    }

    cleanup(() => {
      if (root && resizeListener) {
        removeListener(root, resizeListener);
      }
    });
  });
}

const LOADING_OPTIONS_KEY = "ecLoadingOptions";

function useLoading(chart, loading, loadingOptions) {
  const defaultLoadingOptions = inject(LOADING_OPTIONS_KEY, {});
  const realLoadingOptions = computed(() => ({
    ...unwrapInjected(defaultLoadingOptions, {}),
    ...loadingOptions.value
  }));

  watchEffect(() => {
    const instance = chart.value;
    if (!instance) {
      return;
    }

    if (loading.value) {
      instance.showLoading(realLoadingOptions.value);
    } else {
      instance.hideLoading();
    }
  });
}


export default defineComponent({
  name: "br-chart",
  props: {
    option: Object,
    theme: {
      type: [Object, String],
    },
    initOptions: Object,
    updateOptions: Object,
    group: String,
    manualUpdate: Boolean,
    autoresize: [Boolean, Object],
    loading: Boolean,
    loadingOptions: Object,
  },
  emits: {},
  inheritAttrs: false,
  setup(props, { attrs }) {
    //const root = shallowRef(new EChartsElement());
    //const inner = shallowRef(new HTMLElement());

    //const chart = shallowRef(initChart());

    const root = ref(null);
    const chart = shallowRef(null);
    const manualOption = shallowRef(null);
    const defaultTheme = inject(THEME_KEY, null);
    const defaultInitOptions = inject(INIT_OPTIONS_KEY, null);
    const defaultUpdateOptions = inject(UPDATE_OPTIONS_KEY, null);

    const { autoresize, manualUpdate, loading, loadingOptions } = toRefs(props);

    const realOption = computed(
      () => manualOption.value || props.option || null
    );
    const realTheme = computed(
      () => props.theme || unwrapInjected(defaultTheme, {})
    );
    const realInitOptions = computed(
      () => props.initOptions || unwrapInjected(defaultInitOptions, {})
    );
    const realUpdateOptions = computed(
      () => props.updateOptions || unwrapInjected(defaultUpdateOptions, {})
    );
    const nonEventAttrs = computed(() => omitOn(attrs));

    // @ts-expect-error listeners for Vue 2 compatibility
    const that = getCurrentInstance();
    const listeners = that.proxy.$listeners;

    function init(option) {
      if (!root.value) {
        return;
      }

      const instance = (chart.value = initChart(
        root.value,
        realTheme.value,
        realInitOptions.value
      ));

      if (props.group) {
        instance.group = props.group;
      }

      let realListeners = listeners;
      if (!realListeners) {
        realListeners = {};

        Object.keys(attrs)
          .filter(key => key.indexOf("on") === 0 && key.length > 2)
          .forEach(key => {
            // onClick    -> c + lick
            // onZr:click -> z + r:click
            let event = key.charAt(2).toLowerCase() + key.slice(3);

            // clickOnce    -> ~click
            // zr:clickOnce -> ~zr:click
            if (event.substring(event.length - 4) === "Once") {
              event = `~${event.substring(0, event.length - 4)}`;
            }

            realListeners[event] = attrs[key];
          });
      }

      Object.keys(realListeners).forEach(key => {
        let handler = realListeners[key];

        if (!handler) {
          return;
        }

        let event = key.toLowerCase();
        if (event.charAt(0) === "~") {
          event = event.substring(1);
          handler.__once__ = true;
        }

        let target = instance;
        if (event.indexOf("zr:") === 0) {
          target = instance.getZr();
          event = event.substring(3);
        }

        if (handler.__once__) {
          delete handler.__once__;

          const raw = handler;

          handler = (...args) => {
            raw(...args);
            target.off(event, handler);
          };PieChart
        }

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore EChartsType["on"] is not compatible with ZRenderType["on"]
        // but it's okay here
        target.on(event, handler);
      });

      function resize() {
        if (instance && !instance.isDisposed()) {
          instance.resize();
        }
      }

      function commit() {
        const opt = option || realOption.value;
        if (opt) {
          // console.log(opt, realUpdateOptions.value);
          instance.setOption(opt, realUpdateOptions.value);
        }
      }

      if (autoresize.value) {
        // Try to make chart fit to container in case container size
        // is changed synchronously or in already queued microtasks
        nextTick(() => {
          resize();
          commit();
        });
      } else {
        commit();
      }
    }

    function setOption(option, updateOptions) {
      if (props.manualUpdate) {
        manualOption.value = option;
      }

      if (!chart.value) {
        init(option);
      } else {
        chart.value.setOption(option, updateOptions || {});
      }
    }

    function cleanup() {
      if (chart.value) {
        chart.value.dispose();
        chart.value = undefined;
      }
    }

    let unwatchOption = () => null;

    watch(
      manualUpdate,
      manualUpdate => {
        if (typeof unwatchOption === "function") {
          unwatchOption();
          unwatchOption = null;
        }

        if (!manualUpdate) {
          unwatchOption = watch(
            () => props.option,
            (option, oldOption) => {
              if (!option) {
                return;
              }
              if (!chart.value) {
                init();
              } else {
                chart.value.setOption(option, {
                  // mutating `option` will lead to `notMerge: false` and
                  // replacing it with new reference will lead to `notMerge: true`
                  notMerge: option !== oldOption,
                  ...realUpdateOptions.value
                });
              }
            },
            { deep: true }
          );
        }
      },
      {
        immediate: true
      }
    );

    watch(
      [realTheme, realInitOptions],
      () => {
        cleanup();
        init();
      },
      {
        deep: true
      }
    );

    watchEffect(() => {
      if (props.group && chart.value) {
        chart.value.group = props.group;
      }
    });
    /* */

    const publicApi = usePublicAPI(chart);

    useLoading(chart, loading, loadingOptions);

    useAutoresize(chart, autoresize, root);

    onMounted(() => {
      function check() {
        //console.log("root===>", root.value, root);
        if (!root.value) {
          setTimeout(check, 500);
        } else {
          init();

        }
      }

      check();

    });

    onBeforeUnmount(() => {
      //if (wcRegistered && root.value) {
      // For registered web component, we can leverage the
      // `disconnectedCallback` to dispose the chart instance
      // so that we can delay the cleanup after exsiting leaving
      // transition.
      //  root.value.__dispose = cleanup;
      //} else {
      cleanup();
      //}
    });

    return {
      chart,
      root,
      setOption,
      nonEventAttrs,
      ...publicApi
    };
  },
  render() {
    // Vue 3 and Vue 2 have different vnode props format:
    // See https://v3-migration.vuejs.org/breaking-changes/render-function-api.html#vnode-props-format
    //const attrs = { ...this.nonEventAttrs };
    /*
    attrs.ref = "root";
    attrs.class = attrs.class ? ["echarts"].concat(attrs.class) : "echarts";
    return h("div", attrs);
    */
    //console.log("this.nonEventAttrs", this.nonEventAttrs);
    return (
      <div {...this.nonEventAttrs} ref="root" class={this.nonEventAttrs.class ? ["echarts"].concat(this.nonEventAttrs.attrs.class) : "echarts"}>
      </div>
    );
  }

});