// Utilities
import { defineStore } from 'pinia';

function pathAssign(obj, key, value) {

  let keys = key.split(".");
  let last = keys.pop();
  keys.forEach(key => {
      if(!obj[key]) {
        if ( !isNaN(key) && !isNaN(parseInt(key)) ) {
          obj[key] = [];
        } else {
          obj[key] = {};
        }
      }
      obj = obj[key];
  });
  obj[last] = value;
}

function getParentObjWithKey(obj, key) {
  if ( obj == null ) {
    return {
      pObj: null,
    };
  }

  // a.b.0.c
  let keys = key.split(".");
  let last = keys.pop();
  keys.some((key, index) => {
      if(obj[key]) {
        obj = obj[key];
        return;
      }

      if ( index != keys.length - 1 ) {
        obj = null;
      }
      return true;
      
  });
  if ( obj ) {
    return {
      pObj: obj,
      lastKey: last,
    };
  }
  return {
    pObj: null,
  };
}

export const useViewStore = defineStore('view', {
  state: () => ({
    views: {},
  }),
  getters: {
    getViewData: (state) => (viewName, path) => {
      if ( path == null || path.length == 0 ) {
        return state.views[viewName];
      } else {
        let res = getParentObjWithKey(state.views[viewName], path);
        if ( res.pObj ) {
          return res.pObj[res.lastKey];
        }
        return null;
      }
    },
  },
  actions: {
    setViewData(viewName, path, val) {
      if ( path == null || path.length == 0 ) {
        this.views[viewName] = val;
      } else {
        if ( !this.views[viewName] ) {
          this.views[viewName] = {};
        }
        pathAssign(this.views[viewName], path, val);
      }
    },
    removeViewData(viewName, path) {
      if ( path == null || path.length == 0 ) {
        delete this.views[viewName];
      } else {
        let res = getParentObjWithKey(this.views[viewName], path);
        if ( res.pObj ) {
          delete res.pObj[res.lastKey];
        }
      }
    }
  }
});