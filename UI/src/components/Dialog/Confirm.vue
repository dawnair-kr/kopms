<template>
    <v-card tile class="br-alert">
        <v-toolbar
            v-if="title"
            :dark="Boolean(getColor)"
            :color="getTitleBkColor"
            dense
            flat
        >
            <v-toolbar-title :style="`color: ${getTitleColor};`">
                {{ title }}
            </v-toolbar-title>
        </v-toolbar>
        <v-card-text
            class="body-1 pt-4 pb-2"
            :class="{ 'pt-4': !title }"
            v-html="text"
        />
        <DialogActions
            v-bind="$attrs"
            :actions="getActionOptions"
        />
    </v-card>
  </template>
  
  <script>
  import Confirmable from '../../plugins/dialogHelp/mixins/confirmable'
  import lodash from 'lodash';
  import DialogActions from './DialogActions.vue';
  import Colorable from '../../plugins/dialogHelp/mixins/colorable'
  import Iconable from '../../plugins/dialogHelp/mixins/iconable'
  export default {
    components: {
      DialogActions,
    },
    layout: ['default', { width: 450 }],
    mixins: [Iconable, Confirmable, Colorable],
    props: {
      actionOptions: Object,
      text: {
        type: [String, Function],
        required: true,
        default: ''
      },
      closeBtnTop: null,
    },
    emits: ['update:closeBtnTop'],
    computed: {
      getText () {
        return typeof this.text === 'function' ? this.text() : this.text
      },
      getTitleBkColor () {
        switch (this.type) {
          case 'info':
          case 'confirm':
            return '#f1f1f1';
          case 'error':
          case 'warning':
            return '#f64747';
        }
      },
      getTitleColor () {
        switch (this.type) {
          case 'info':
          case 'confirm':
            return '#000000';
          case 'error':
          case 'warning':
            return '#ffffff';
        }
      },
      getDefaultActionOptions () {
        switch (this.type) {
          case 'info':
            return {
              true: {
                text: 'OK',
                depressed: true,
                color: 'primary',
              }
            };
          case 'confirm':
            return {
              false: {
                text: 'Cancel',
                color: 'secondary',
                outlined: true,
              },
              true: {
                text: 'OK',
                depressed: true,
                color: 'primary',
              }
            };
          case 'error':
            return {
              true: {
                text: 'OK',
                depressed: true,
                color: 'wg-red lighten-1',
              }
            };
          case 'warning':
            return {
              false: {
                text: 'Cancel',
                color: 'secondary',
                outlined: true,
              },
              true: {
                text: 'OK',
                depressed: true,
                color: 'wg-red lighten-1',
              }
            };
        }
      },
      getActionOptions() {
        const resolved = typeof this.actions === 'function' ? this.actions(this) : this.actions;
        const keys = lodash.keys(resolved);
        const actions = resolved;
        let newActions = {};
        lodash.forEach(keys, (k) => {
          if ( lodash.isString(actions[k]) ) {
            newActions[k] = {
              text: actions[k]
            };
          } else {
            newActions[k] = actions[k];
          }
        });

        //console.log("Confirm", this, newActions);
        return lodash.defaultsDeep(newActions, this.getDefaultActionOptions);
      }
    }
  }
  </script>
  
  <style lang="scss">
    .br-alert {
        .v-toolbar__title {
            font-size: 16px;
            font-weight: bold;
            font-stretch: normal;
            font-style: normal;
            line-height: 1.5;
            letter-spacing: normal;
        }
        .v-btn:not(.v-btn--outlined).wg-red.lighten-1 {
          color: #FFFFFF;
        }
    }
  </style>