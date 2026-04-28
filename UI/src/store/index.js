import { createPinia } from 'pinia';
// import piniaPluginPersist from 'pinia-plugin-persist';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia();
// pinia.use(piniaPluginPersist);
pinia.use(piniaPluginPersistedstate);

export default pinia;

// export default createPinia();