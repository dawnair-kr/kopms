//import Activable from './activable'

export default {
  name: 'Layoutable',
  //mixins: [Activable],
  inheritAttrs: false,

  data () {
    return {
      loading: false
    }
  },
  computed: {
    isLayout () {
      return true
    },
    getWidth () {
      return (item) => {
        item.width == null && (item.width = 450);
        return typeof item.width === 'string' ? item.width : item.width + 'px';
      };
    }
  },

  mounted () {
    //this.isActive = true
  },
  emits: ["layout:close", "layout:shown", "layout:error", "layout:submit", "snackbar:close"],
  methods: {
    dismiss (item) {
      if (!item.persistent && item._loaded) {
        item.isActive = false;
      }
    },
    close (item) {
      item.isActive = false;
      // onClose 콜백 호출 → Dialog._processResultPromises() → showAndWait Promise resolve
      if (typeof item.onClose === 'function') {
        item.onClose();
      }
    }
  },
/*
  beforeDestroy () {
    if (typeof this.$el.remove === 'function') {
      this.$el.remove()
    } else if (this.$el.parentNode) {
      this.$el.parentNode.removeChild(this.$el)
    }
  }
  */
}