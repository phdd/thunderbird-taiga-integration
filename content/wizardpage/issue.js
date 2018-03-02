/* eslint no-undef: 'off' */

taiga.wizardpage.issue = {

  api: null,
  model: null,

  gui: {
    wizard: () => document.querySelector('#taiga-wizard')
  },

  load: function (api, model, preferences) {
    this.api = api
    this.model = model
    this.preferences = preferences
    this.update()
  },

  update: function () {

  },

  render: function () {
    this.gui.wizard().getButton('next').focus()
  }

}
