/* eslint no-undef: 'off' */

taiga.wizard.ticket = {

  messages: [],
  preferences: null,
  api: null,

  model: {},

  gui: {
    projects: () => document.querySelector('#taiga-project-list'),
    wizard: () => document.querySelector('#taiga-wizard')
  },

  load: function (
    messages,
    preferences = new Preferences('extensions.taiga.'),
    api = new TaigaApi()
  ) {
    this.messages = messages
    this.preferences = preferences
    this.api = api

    this.api.address = this.preferences.stringFrom('address')
    this.api.token = this.preferences.stringFrom('token')

    taiga
      .loadOverlay('wizardpage/project')
      .then((implementation) =>
        implementation.load(this.api, this.model, this.preferences))

    this.gui.wizard().getButton('back')
      .setAttribute('hidden', true)
  }

}

taiga.onLoad(() =>
  taiga.wizard.ticket.load(window.arguments[0]))
