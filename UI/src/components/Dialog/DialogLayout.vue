<template>
  <v-dialog ref="vdialog" eager content-class="vuedl-layout" v-model="dialog.isActive" :fullscreen="dialog.fullscreen"
    :max-width="getWidth(dialog)" :persistent="dialog.persistent || dialog.loading" :scrollable="dialog.scrollable"
    :transition="dialog.transition" :hide-overlay="dialog.hideOverlay" :retain-focus="false"
    @keydown.esc="dismiss(dialog)" v-for="dialog in dialogs" :key="dialog.seed">
    <div class="v-dialog-wrapper">
      <div v-if="(dialog.showClose || dialog.showClose == null) && !dialog.persistent && !dialog.loading"
        class="vuedl-layout__closeBtn" @click.stop="close(dialog)">
        ✕
      </div>
      <component :is="dialog.compAlias" ref="dialog" v-bind="dialog" />
    </div>
  </v-dialog>
</template>
  
<script>
import { ref } from 'vue';

export default {
  props: {
    dialogs: {
      type: Array,
      default: () => {
        return [];
      }
    }
    /*
    fullscreen: Boolean,
    scrollable: Boolean,
    hideOverlay: Boolean,
    transition: {
      type: [String, Boolean],
      default: 'dialog-transition'
    },
    showClose: {
      type: Boolean,
      default: () => true
    },
    comp_name: String
    */
  },
  //emits: ["created", "submit", "shown", "error", "loading", "destroyed"],
  mounted() {
    //console.log("dialog layout mounted", this.$.refs, "$attrs", this.$attrs, this);
    this._dialogInstance = this.$.refs;
  },
  data() {
    return {
      component: this.comp_name,
    };
  },
  methods: {
    _destroy() {
      // Allow to draw transition, cause vuetify doesn't have onClose method
      setTimeout(() => {
        //this.$destroy()
      }, 1000)
      // this.$refs.vdialog.$refs.dialog.addEventListener('transitionend', this.onTransitionEnd)
    }
    // onTransitionEnd (event) {
    //   if (['opacity', 'z-index'].indexOf(event.propertyName) >= 0) {
    //     this.$refs.vdialog.$refs.dialog.removeEventListener('transitionend', this.onTransitionEnd)
    //     this.$destroy()
    //   }
    // }
  }
}
</script>
<style lang="scss">
.vuedl-layout {
  position: relative;
}

.vuedl-layout__closeBtn {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
  color: rgba(0, 0, 0, 0.65) !important;
  background-color: rgba(255, 255, 255, 0.88) !important;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  transition: background-color 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 1) !important;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.28);
  }
}


.v-dialog>.v-overlay__content>.v-card>.v-card-item {
  background-color: #1976D2;
  color: #ffffff;
  padding: 14px 24px 14px 24px;
}

</style>