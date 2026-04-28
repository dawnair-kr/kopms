import { unwrapInjected } from "../utils";
import {
  inject,
  computed,
  watchEffect,
} from "vue";
//import type { EChartsType, LoadingOptions } from "../types";
/*
export const LOADING_OPTIONS_KEY =
  "ecLoadingOptions" as unknown as InjectionKey<
    LoadingOptions | Ref<LoadingOptions>
  >;
*/

export const LOADING_OPTIONS_KEY = "ecLoadingOptions";

export function useLoading(
  chart,
  loading,
  loadingOptions
) {
  const defaultLoadingOptions = inject(LOADING_OPTIONS_KEY, {});
  const realLoadingOptions = computed(() => ({
    ...unwrapInjected(defaultLoadingOptions, {}),
    ...loadingOptions?.value
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
/*
export const loadingProps = {
  loading: Boolean,
  loadingOptions: Object as PropType<LoadingOptions>
};
*/

export const loadingProps = {
    loading: Boolean,
    loadingOptions: Object
};
