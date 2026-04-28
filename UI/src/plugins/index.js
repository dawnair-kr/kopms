// Plugins
import vuetify from './vuetify';
import pinia from '../store';
import { createRouter } from '../router';
import Dialog from './dialogHelp';
import vueAxios from './vue-axios.js';

import i18n from './i18n.js'      // 다국어

export function registerPlugins(app) {

  app
    .use(i18n)
    .use(vuetify)
    .use(pinia)
    .use(Dialog, {
      snackbar: { timeout: 2000 }
    })
    .use(vueAxios);

  const router = createRouter();
  app.use(router);

  app.config.globalProperties.$vuetify = vuetify;

  return {
    router,
    pinia
  };
}

