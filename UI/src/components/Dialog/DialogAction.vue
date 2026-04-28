<template>
  <component :is="component" :class="{ button: true, loading: loading }" :disabled="disabled"
    @click="$emit('click', this)" v-bind="$attrs" :icon="!textVal && Boolean(icon)" ref="okBtn">
    <v-icon auto-focus v-if="icon && !icon.right" v-bind="icon" v-text="icon.text" />
    {{ actionText }}
    <v-icon v-if="icon && icon.right" v-bind="icon" v-text="icon.text" />

  </component>
</template>
<script>
import { VIcon, VBtn } from 'vuetify/components';

export default {
  components: {
    VIcon,
    VBtn
  },
  props: {
    attrs: Object,
    component: {
      type: [String, Object],
      default: () => 'v-btn'
    },
    textVal: [String, Function],
    disabled: Boolean,
    flat: Boolean,
    icon: Object,
  },
  data() {
    return {
      loading: false
    };
  },
  computed: {
    actionText() {
      //console.log("text", this.textVal);
      return typeof this.textVal === 'function' ? this.textVal() : this.textVal
    }
  },
  mounted() {
    // console.log("mounted :: ", this.$refs);
    // this.$nextTick(() => this.$refs.okBtn.$el.focus());
  }
}
</script>