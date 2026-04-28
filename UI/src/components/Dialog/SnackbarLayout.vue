<template>
  <v-snackbar
      :timeout="-1"
      v-model="attrs.show"
      :color="attrs.bkColor"
      :location="attrs.location"
      :multi-line="attrs.multiLine"
      :vertical="attrs.vertical"
      :variant="attrs.variant"
      :rounded="attrs.rounded"
      :transition="'v-slide-y-transition'"
      v-for="(attrs, key) in snackbars"
      :key="attrs.seed"
      :style="`margin-top:${dialogsTopOffset[key]}px;`"
      ref="snackbar"
      class="br-snackbar"
    >
      <component :is="attrs.compAlias"
          ref="dialog"
          v-bind="attrs"
        />
  </v-snackbar>
  </template>
<style lang="scss">
  .br-snackbar {
    .v-snackbar__content {
      padding: 0;
    }
  }

</style>

  <script>
  import Colorable from '../../plugins/dialogHelp/mixins/colorable'
  //import { VSnackbar } from 'vuetify/lib'
  //import Confirmable from '../../plugins/dialogHelp/mixins/confirmable'
  import DialogActions from './DialogActions.vue';
  
  //Toast, ToastOpenArgs, ToastCloseArgs, ToastBeforeOpenArgs
  
  export default {
    name: "snackbar-layout",
    components: {
      //VSnackbar,
      DialogActions,
    },
    mixins: [Colorable],
    props: {
      /*
      bkColor: String,
      location: String,
      multiLine: Boolean,
      vertical: Boolean,
      transition: Boolean,
      variant: String,
      rounded: [Boolean, String, Number],
      */
      snackbars: {
        type: Array,
        default: () => []
      }
    },
    data () {
      //let closeActions = this.actions;
      
      return {
        //closeActions,
        dialogsTopOffset: [],
        show: null
      }
    },
    //emits: ["submit", "shown", "error", "loading"],
    mounted() {
      this._dialogInstance = this.$.refs;
      // console.log("snackbar layout mounted", this);
    },
    computed() {
      return {
        offset: (i) => {
          let o = 0;
          this.dialogsTopOffset.forEach(v => {
            if ( typeof v == "number" ) {
              o += v + 10;
            }
          });
          return o;
        }
      };
    },
    updated() {
      let curPos = 0;
      if ( this.$.refs.dialog ) {
        this.$.refs.dialog.forEach((v, i) => {
        //console.log("updated", i, v.$el.offsetHeight);
        this.dialogsTopOffset[i] = curPos;
        curPos += v.$el.offsetHeight + 10;
      });
      }
      
    },
    methods: {
      /*
      _destroy () {
        setTimeout(() => {
          this.$.vnode.destroy();
        }, 500)
      }
      */
    }
  }
  </script>

