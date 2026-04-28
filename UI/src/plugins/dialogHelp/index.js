import { getCurrentInstance, defineComponent, createVNode, render, inject } from 'vue'
import DialogManager from './manager'
import Overlay from '../../components/Dialog/DialogOverlay.vue'
import DialogLayout from '../../components/Dialog/DialogLayout.vue'
import Confirm from '../../components/Dialog/Confirm.vue'
//import Toast from '../../components/Dialog/Toast.vue'
import Alert from '../../components/Dialog/Alert.vue'
import SnackbarLayout from '../../components/Dialog/SnackbarLayout.vue'
import Prompt from '../../components/Dialog/Prompt.vue'
import Loading from '../../components/Dialog/Loading.vue'
import DialogActions from '../../components/Dialog/DialogActions.vue'
import DialogCard from '../../components/Dialog/DialogCard.vue'
//import NotificationLayout from '../../components/Dialog/NotificationLayout.vue'

let property;

function install (app, options = {}) {
  if (install.installed) return
  install.installed = true
  if (!options.container) {
    options.container = '[data-app=true]'
  }
  property = options.property || '$dialog'
  const actionsFn = options.actions || (() => {
    return {
      false: 'Cancel',
      true: {
        text: 'OK',
        color: 'primary'
      }
    }
  })
  const actionOptions = options.actionOptions || {
    flat: true
  }

  //console.log("dailog help index", app);
  options.app = app;
  const manager = new DialogManager(options)
  manager.overlay('default', Overlay);

  if (!app.config.globalProperties[property]) {
    Object.defineProperty(app.config.globalProperties, property, {
      get () {
        return manager
      },
      configurable: true
    })
  } else {
    console.warn(`Property ${property} is already defined in Vue prototype`)
  }

  manager.layout('default', DialogLayout)
  manager.layout('snackbar', SnackbarLayout)
  //manager.layout('notification', NotificationLayout)
  app.component('DialogActions', DialogActions)
  app.component('DialogCard', DialogCard)

  app.provide(property, manager);

  // console.log("ddd", property);

  manager.component('confirm', Confirm, {
    waitForResult: true,
    actions: actionsFn,
    actionOptions: actionOptions,
    ...options.confirm
  })

  manager.component('warning', Confirm, {
    type: 'warning',
    waitForResult: true,
    actions: actionsFn,
    actionOptions: actionOptions,
    persistent: false,
    ...options.warning,
  })

  manager.component('error', Confirm, {
    type: 'error',
    waitForResult: true,
    actionOptions: actionOptions,
    persistent: false,
    ...options.error
  })

  manager.component('info', Confirm, {
    type: 'info',
    waitForResult: true,
    actionOptions: actionOptions,
    persistent: false,
    ...options.info
  })

  manager.component('loading', Loading, {
    waitForResult: false,
    location: "center center",
    ...options.loading
  });
/*
  manager.loader = {
    show: manager.loading({ ...options })
  };
*/
  manager.withLoading = function (options, callback) {
    return manager.loading(options).then(dlg => {
      callback()
        .then(res => {
          dlg.close()
          return res
        })
        .catch(e => {
          dlg.close()
          throw e
        })
    })
  }

  manager.component('snackbar', Alert, {
    waitForResult: true,
    location: "top center",
    transition: true,
    ...options.snackbar
  })

  manager.message = {
    info: (message, options) => manager.snackbar({ text: message, alertType: 'info', bkColor: 'info', ...options }),
    error: (message, options) => manager.snackbar({ text: message, alertType: 'error', bkColor: 'error', ...options }),
    success: (message, options) => manager.snackbar({ text: message, alertType: 'success', bkColor: 'success', ...options }),
    warning: (message, options) => manager.snackbar({ text: message, alertType: 'warning', bkColor: 'warning', ...options })
  }

  /*
  manager.component('notification', Alert, {
    waitForResult: true,
    ...options.notify
  })
  manager.notify = {
    info: (message, options) => manager.notification({ text: message, color: 'info', ...options }),
    error: (message, options) => manager.notification({ text: message, color: 'error', ...options }),
    success: (message, options) => manager.notification({ text: message, color: 'success', ...options }),
    warning: (message, options) => manager.notification({ text: message, color: 'warning', ...options })
  }
  */

  manager.component('prompt', Prompt, {
    waitForResult: true,
    actions: actionsFn,
    ...options.prompt
  })
}

export function useDialog() {
    return inject(property);
}

const Plugin = {
  install
}

export default Plugin