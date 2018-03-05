/* eslint no-unused-vars: 'off' */
/* eslint no-undef: 'off' */

// cannot reference from XUL oncommand attribute
// if defined as const :(
var taiga = {

  wizard: {},
  wizardpage: {},

  onLoad: function (callback) {
    window.addEventListener('load', callback, false)
  },

  openUrl: function (url) {
    Components.classes['@mozilla.org/uriloader/external-protocol-service;1']
      .getService(Components.interfaces.nsIExternalProtocolService)
      .loadUrl(Services.io.newURI(url, null, null))
  },

  mergeSimplePropertiesFrom: function (a) {
    return {
      into: (b) => {
        for (let attribute in a) {
          if (typeof b[attribute] === 'object' && typeof a[attribute] !== 'object') {
            continue
          }

          b[attribute] = a[attribute]
        }
      }
    }
  }

}
