<template>
  <v-card-actions v-if="actionlist && Object.keys(actionlist).length">
    <v-spacer
      v-if="!actions.spacer"
    />
    <template v-for="action in actionlist">
      <v-spacer
        v-if="action.key === 'spacer'"
        :key="spacer"
      />
      <DialogAction
        v-else
        :key="action.key"
        v-bind="getActionProps(action)"
        :action-key="''+action.key"
        :loading="!passive && isActionInLoading(action)"
        :class="{'loading': loadingAction === action.key}"
        :disabled="isActionDisabled(action) || (!passive && Boolean(loadingAction))"
        @click="onActionClick(action)"
      />
    </template>
   </v-card-actions>
  </template>
  <script>
  
  import Actionable from '../../plugins/dialogHelp/mixins/actionable'
  import DialogAction from './DialogAction.vue'
  
  export default {
    components: {
      DialogAction,
    },
    mixins: [Actionable],
    props: {
        component: [String, Object],
        color: String,
        flat: Boolean,
        tonal: Boolean,
        plain: Boolean,
        rounded: String,
        outlined: Boolean,
        icon: String,
        block: Boolean,
        size: String,
        passive: Boolean
    },
    mounted() {
      //console.log("DialogActions", this);
    },
    data() {
      const btnProps = {};

      this.color && this.color.length && (btnProps.color = this.color);
      btnProps.flat = this.flat;
      btnProps.tonal = this.tonal;
      btnProps.plain = this.plain;
      btnProps.rounded = this.rounded;
      btnProps.outlined = this.outlined;
      btnProps.icon = this.icon;
      btnProps.block = this.block;
      btnProps.size = this.size;

      return {
         btnProps
      };
    },
    computed: {
        nestedProps () {
            return [
                'color',
                'flat',
                'tonal',
                'plain',
                'rounded',
                'outlined',
                'icon',
                'block',
                'size',
            ]
        }
    },
    methods: {
      getActionProps (action) {
        const res = {
            component: action.component || this.component,
            textVal: action.text
        }

        
        this.nestedProps.forEach(key => {

            if (action[key] || this.btnProps[key]) {
              res[key] = action[key] === undefined ? this.btnProps[key] : action[key]
            }
        });
        //console.log("actions", res, action);
        return res
      }
    }
  }
  </script>