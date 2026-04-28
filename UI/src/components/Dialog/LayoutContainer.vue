<template>
  <v-snackbar :timeout="attrs.timeout" :model-value="attrs.show" :color="attrs.bkColor" :location="'top center'"
    :multi-line="attrs.multiLine" :vertical="attrs.vertical" :variant="attrs.variant" :rounded="attrs.rounded"
    v-for="(attrs, key) in snackbars" :key="attrs.seed" origin="top center" ref="snackbar" class="br-snackbar"
    position="absolute" :close-on-back="false"
    :style="`--br-top: ${snackbarDialogsTopOffset[key]}px; --br-half-width: ${attrs._width / 2}px; opacity: ${attrs._loaded ? 1 : 0};`"
    @update:model-value="v => snackbarModelValueChanged(v, attrs.seed)">
    <component :is="attrs.compAlias" :key="'snack-' + attrs.seed" v-bind="attrs" />
  </v-snackbar>
  <component :is="dialog._type == 'dialog' ? 'v-dialog' : 'v-overlay'" v-for="dialog in dialogs" ref="vdialog" eager
    :content-class="dialog._type == 'dialog' ? `vuedl-layout ${dialog.fullscreen ? 'full-screen' : ''} ${dialog.contentClass}` : ''"
    v-model="dialog.isActive" :fullscreen="dialog._type == 'dialog' ? dialog.fullscreen : null"
    :max-width="dialog._type == 'dialog' ? dialog.fullscreen ? '100%' : getWidth(dialog) : null"
    :persistent="dialog._type == 'dialog' ? dialog.persistent || !dialog._loaded : true"
    :scrollable="dialog._type == 'dialog' ? dialog.scrollable : null"
    :transition="dialog._type == 'dialog' ? dialog.transition : undefined"
    :hide-overlay="dialog._type == 'dialog' ? dialog.hideOverlay : null"
    :retain-focus="dialog._type == 'dialog' ? dialog.retainFocus : null" :key="dialog.seed"
    :class="dialog._type == 'loading' ? 'br-layout-content' : ''"
    :style="dialog._type == 'loading' ? `--br-loader-size: ${dialog.size / 2}px;` : ''">
    <v-btn icon="mdi-close" density="comfortable" size="x-small" variant="tonal"
      v-if="dialog._type == 'dialog' && (dialog.showClose || dialog.showClose == null) && dialog._loaded"
      class="vuedl-layout__closeBtn" @click.stop="close(dialog)"
      :style="{ top: dialog.closeBtnTop > 0 ? dialog.closeBtnTop + 'px' : null }">
    </v-btn>
    <!--
      <div
        v-if="dialog._type == 'dialog' && (dialog.showClose || dialog.showClose == null) && dialog._loaded"
        class="vuedl-layout__closeBtn"
        @click.stop="close(dialog)"
      >
            ×
      </div>
      -->
    <component :is="dialog.compAlias" :key="'dialog-' + dialog.seed" v-bind="getDialogProps(dialog)"
      @keydown.esc="dismiss(dialog)" v-model:closeBtnTop="dialog.closeBtnTop" />
  </component>
</template>

<script>
import DialogActions from './DialogActions.vue';
import lodash from 'lodash';

export default {
  props: {
    dialogs: {
      type: Array,
      default: () => {
        return [];
      }
    },
    snackbars: {
      type: Array,
      default: () => []
    },
    loaders: {
      type: Array,
      default: () => []
    }
  },
  components: {
    DialogActions,
  },
  mounted() {
    this._dialogInstance = this.$.refs;

    //this.bodyDom = document.body;
  },
  /*
  watch: {
    snackbars: {
      handler(val, oldVal) {
        let curPos = 0;
        val.forEach((v, i) => {
          //console.log("updated", i, v._height, v);
          this.snackbarDialogsTopOffset[i] = curPos;
          curPos += v._height + 10;
        });
      },
      deep: true
    } 
  },
  */
  data() {
    return {
      snackbarDialogsTopOffset: [],
      bodyDom: null
    };
  },
  updated() {
    setTimeout(() => {
      let curPos = 0;
      this.snackbars.forEach((v, i) => {
        //console.log("updated", i, v._height, v);
        this.snackbarDialogsTopOffset[i] = curPos;
        curPos += v._height + 10;
      });
    }, 0);

  },
  methods: {
    getDialogProps(params) {
      return lodash.omit(params, [
        '_type', '_loaded', 'fullscreen', 'width', '_loaded', 'scrollable', 'transition',
        'hideOverlay', 'retainFocus', 'compAlias', 'persistent', 'isActive'
      ]);
    },
    onTransitionEnd(e) {
      //console.log("onTransitionEnd", e);
      //this.$el.removeEventListener('transitionend', this.onTransitionEnd)
      //this.$destroy()
    },
    snackbarModelValueChanged(v, seed) {
      if (v === false) {
        let findIdx = lodash.findIndex(this.snackbars, o => {
          return o.seed == seed;
        });

        if (findIdx > -1) {
          const s_comp = this.snackbars[findIdx];
          //console.log("=========", v, seed, findIdx, s_comp, this)
          if (s_comp && s_comp._loaded) {
            this.$emit("snackbar:close", {
              seed,
              type: "snackbar"
            });
          }
        }
      }
    }
  }
}
</script>
<style lang="scss">
html.full-screen.v-overlay-scroll-blocked {
  overflow-y: hidden !important;
}

.br-snackbar {
  .v-snackbar__content {
    padding: 0;
  }

  .v-snackbar__wrapper {
    //top: -100% !important;
    left: calc(50% - var(--br-half-width)) !important;
    transform: translateY(var(--br-top)) !important;
    //top: var(--br-top) !important;
    transition: transform .3s ease-in-out;
  }

}

.br-slide-y-transition-enter-active,
.br-slide-y-transition-leave-active {
  transition: top 5s ease-out;

}

.br-slide-y-transition-enter-from,
.br-slide-y-transition-leave-to {
  top: var(--br-top);
}

.br-layout-content {
  .v-overlay__content {
    left: calc(50% - var(--br-loader-size));
    top: calc(50% - var(--br-loader-size));
    //display: block;
  }
}

.vuedl-layout {
  position: relative;

  &.full-screen {
    .v-sheet {
      overflow-y: auto;
    }
  }

}

.vuedl-layout__closeBtn {
  position: absolute;
  top: 15px !important;
  right: 12px;
  color: #ffffff;
  //width: 24px;
  //height: 24px;
  //font-family: -webkit-pictograph;
  //font-size: 24px;
  //opacity: 0.5;
  z-index: 10;
  //cursor: pointer;
  //line-height: 1;
}

.v-application--is-ltr .vuedl-layout__closeBtn {
  right: 14px;
}

.v-application--is-rtl .vuedl-layout__closeBtn {
  left: 14px;
}

/*
  .vuedl-layout__closeBtn:hover {
    opacity: 1;
  }
  */

.vuedl-notification-fade-enter.right {
  right: 0;
  transform: translateX(100%);
}

.vuedl-notification-fade-enter.left {
  left: 0;
  transform: translateX(-100%);
}

.vuedl-notification-fade-leave-active {
  opacity: 0;
}
</style>