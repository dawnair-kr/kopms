/* eslint-disable @typescript-eslint/no-explicit-any */

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

//type MethodName = (typeof METHOD_NAMES)[number];

//type PublicMethods = Pick<EChartsType, MethodName>;

export function usePublicAPI(chart) {
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
