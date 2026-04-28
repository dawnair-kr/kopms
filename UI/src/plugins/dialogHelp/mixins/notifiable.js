const notifications = []

const gap = 10

const insertNotification = (vm) => {
  const position = vm.position
  let verticalOffset = gap
  notifications.filter(item => item.position === position).forEach(item => {
    verticalOffset += item.$el.offsetHeight + gap
  })
  notifications.push(vm)
  vm.vertOffset = verticalOffset
  vm.overlayShow = true;
}

const deleteNotification = (vm) => {
  const index = notifications.findIndex(instance => instance === vm)
  if (index < 0) {
    return
  }
  notifications.splice(index, 1)
  const len = notifications.length
  const position = vm.position
  if (!len) {
    vm.overlayShow = false;
    return
  }

  let verticalOffset = gap
  notifications.filter(item => item.position === position).forEach(item => {
    item.vertOffset = verticalOffset
    verticalOffset += item.$el.offsetHeight + gap
  })
}

export default {
  props: {
    verticalOffset: Number,
    showClose: {
      type: Boolean,
      default: () => true
    },
    position: {
      type: String,
      default: () => 'top-right'
    },
    timeout: {
      type: [Number, Boolean],
      default: () => 4500
    },
    width: {
      type: Number,
      default: () => 330
    },
    zIndex: {
      type: Number,
      default: () => 2000
    }
  },
  data () {
    return {
      activeTimeout: null,
      isActive: true,
      vertOffset: this.verticalOffset,
      overlayShow: false,
    }
  },
  computed: {
    horizontalClass () {
      return this.position.indexOf('right') > -1 ? 'right' : 'left'
    },
    verticalProperty () {
      return /^top-/.test(this.position) ? 'top' : 'bottom'
    },
    getStyle () {
      
      const ss = {
        [this.verticalProperty]: `${this.vertOffset}px`,
        'max-width': `${this.width}px`,
        'z-index': this.zIndex
      };
      
      return ss;
    }
  },
  methods: {
    _destroy () {
      this.$el.addEventListener('transitionend', this.onTransitionEnd)
    },
    onTransitionEnd () {
      this.$el.removeEventListener('transitionend', this.onTransitionEnd)
      //this.$destroy()
    },
    clearTimer () {
      clearTimeout(this.activeTimeout)
    },
    startTimer () {
      if (this.timeout > 0) {
        this.activeTimeout = setTimeout(this.close, this.timeout)
      }
    },
    keydown (e) {
      if (e.keyCode === 46 || e.keyCode === 8) {
        this.clearTimer() // delete key
      } else if (e.keyCode === 27) { // esc key
        this.close()
      } else {
        this.startTimer() // any key
      }
    },
    close () {
      this.isActive = false
    }
  },
  watch: {
    isActive (val) {
      if (val) {
        insertNotification(this)
      } else {
        deleteNotification(this)
      }
    }
  },
  mounted () {
    this.startTimer()
    document.addEventListener('keydown', this.keydown)
  },
  beforeDestroy () {
    document.removeEventListener('keydown', this.keydown)
  }
}