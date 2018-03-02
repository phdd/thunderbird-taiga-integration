/* eslint no-unused-vars: 'off' */
/* eslint no-undef: 'off' */

const taiga = {

  wizard: {},
  wizardpage: {},

  onLoad: function (callback) {
    window.addEventListener('load', callback, false)
  },

  // Be shure you use 'resolveSynchronously' on this one
  // since you have to wait for each execution.
  // This crap has been brought to you by
  // https://bugzilla.mozilla.org/show_bug.cgi?id=330458
  loadOverlay: function (path) {
    return new Promise((resolve, reject) => {
      try {
        document.loadOverlay(
          `chrome://taiga/content/${path}.xul`, (a) => {
            resolve(this.overlayImplementationFor(path))
          })
      } catch (error) {
        reject(error)
      }
    })
  },

  overlayImplementationFor: function (overlayPath) {
    let namespaces = overlayPath.split('/')
    let namespace = namespaces.shift()
    let implementation = this

    while (namespace) {
      implementation = implementation[namespace]
      namespace = namespaces.shift()

      if (!implementation) {
        throw Error(`There's no implementation for ${overlayPath}`)
      }
    }

    return implementation
  },

  resolveSynchronously: function (methods) {
    return new Promise((resolve, reject) => {
      methods.reduce((p, method) => p.then(() => method()),
        Promise.resolve()).then(resolve)
    })
  }

}
