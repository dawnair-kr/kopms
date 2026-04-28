import { watch } from "vue";
import { throttle } from "echarts/core";
import {
  addListener,
  removeListener,
} from "resize-detector";
/*
type AutoresizeProp =
  | boolean
  | {
      throttle?: number;
      onResize?: () => void;
    };
*/

export function useAutoresize(
  chart,
  autoresize,
  root
) {
  let resizeListener = null;

  watch([root, chart, autoresize], ([root, chart, autoresize], _, cleanup) => {
    if (root && chart && autoresize) {
      const autoresizeOptions = autoresize === true ? {} : autoresize;
      const { throttle: wait = 100, onResize } = autoresizeOptions;

      const callback = () => {
        chart.resize();
        onResize?.();
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
/*
export const autoresizeProps = {
  autoresize: [Boolean, Object] as PropType<AutoresizeProp>
};
*/
export const autoresizeProps = {
    autoresize: [Boolean, Object]
};
