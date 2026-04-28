import { unref } from "vue";

// Copied from
// https://github.com/vuejs/vue-next/blob/5a7a1b8293822219283d6e267496bec02234b0bc/packages/shared/src/index.ts#L40-L41
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

export function unwrapInjected(injection, defaultValue) {
  const value = unref(injection);

  if (value && typeof value === "object" && "value" in value) {
    return value.value || defaultValue;
  }

  return value || defaultValue;
}
