/*
 * vuedl
 *
 * (c) Savaryn Yaroslav <yariksav@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

import Dialog from './dialog'
import Overlay from './overlay'

export default class DialogManager {
  constructor ({ app, container } = {}) {
    this._app = app || {}
    Dialog.prototype.app = app || {}
    this._components = {}
    this._layouts = {}
    this._overlays = {}
    this._container = container
    this._emitter = {};
    this._instances = []
  }

  get app () {
    return this._app
  }

  layout (name, component, options = {}) {
    this._layouts[name] = { component, options }
  }

  getLayout (layout) {
    if (typeof layout === 'function') {
      const options = layout.call(this._context)
      layout = this._layouts[options.name || 'default']
      return { ...layout, ...{ options } }
    }

    if (typeof layout === 'object' && typeof layout.render === 'function') {
      return { component: layout }
    }

    if (Array.isArray(layout)) {
      const nameTmp = layout[0]
      const optionsTmp = layout[1] || {}
      const instance =
        (typeof nameTmp === 'object' && typeof nameTmp.render === 'function')
          ? { component: nameTmp }
          : this._layouts[nameTmp]
      return instance && {
        component: instance.component,
        options: { ...instance.options, ...optionsTmp }
      }
    }
    return this._layouts[layout]
  }

  overlay (name, component) {
    if (component === undefined) {
      if (this._overlays[name]) {
        return this._overlays[name]
      } else {
        throw new Error(`Overlay "${name} not found
          Please register it by calling dialog.overlay('${name}', component)`)
      }
    }
    this._overlays[name] = new Overlay(component)
  }

  getComponent (name) {
    if (!this._components[name]) {
      throw new Error(`Component "${name}" was not found.
        Please register it by calling dialog.register('${name}', component)`)
    }
    return this._components[name]
  }

  component (name, component, options = {}) {
    if (component === undefined) {
      return this._components[name]
    }
    this._components[name] = { component, options }
    Object.defineProperty(this, name, {
      get: () => this.createFunctionWrapper(name),
      configurable: true
    })
  }

  getComponentProperty (component, name) {
    return component.options ? component.options[name] : component[name]
  }

  create (component) {
    if (!component) {
      throw new Error('Component is incorrect')
    }

    let compAlias = Object.keys(component)[0];
    const cmp = component[compAlias];
    let layout = this.getLayout(this.getComponentProperty(cmp, 'layout') || 'default');

    if ( !layout && compAlias == "Loading" ) {
      layout = {
        component: {
          name: "loading-layout"
        }
      };
    }
    
    const dlg = new Dialog(component, {
      layout,
      container: this._container,
    })

    return dlg
  }

  showLoader(component, params = {}) {
    const dlg = this.create(component);
    try {
      dlg.show(params)
      if ( dlg._loading_layout ) {
        return {
          hide: () => {
            dlg.loading_hide();
          }
        };
      }
    } catch (e) {;
      throw e
    }
  }

  async show (component, params = {}) {
    
    const dlg = this.create(component);
    try {
      await dlg.show(params)
      return params.waitForResult ? dlg.wait() : dlg
    } catch (e) {
      throw e
    }
  }

  createFunctionWrapper (name) {
    const cmp = this.getComponent(name);
    const alias = name == "snackbar" ? "Alert" : (name == "loading" ? "Loading" : "Confirm");
    //console.log("===", name)
    return (options) => {
      if ( name == "loading" ) {
        return this.showLoader({ [alias]: cmp.component }, { mgrName: name, ...cmp.options, ...options });
      }

      return this.show({ [alias]: cmp.component }, { mgrName: name, ...cmp.options, ...options })
    }
  }

  async showAndWait (component, props) {

    const dlg = await this.show(component, props)
    return dlg.wait()
  }

  on (event, callback) {
    this._emitter.$on(event, callback)
  }

  off (event, callback) {
    this._emitter.$off(event, callback)
  }

  once (event, callback) {
    this._emitter.$once(event, callback)
  }
}