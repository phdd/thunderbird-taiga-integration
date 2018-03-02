/* eslint no-unused-vars: 'off' */
/* eslint no-undef: 'off' */

const taiga = {

  wizard: {},
  wizardpage: {},

  onLoad: function (callback) {
    window.addEventListener('load', callback, false)
  },

  loadOverlay: function (path) {
    return new Promise((resolve, reject) => {
      try {
        document.loadOverlay(
          `chrome://taiga/content/${path}.xul`, () => {
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
    let implementation = taiga

    while (namespace) {
      implementation = implementation[namespace]
      namespace = namespaces.shift()

      if (!implementation) {
        throw Error(`There's no implementation for ${overlayPath}`)
      }
    }

    return implementation
  }

}
