/* eslint no-undef: 'off' */

taiga.wizard.ticket = {

  messages: [],
  preferences: null,
  api: null,

  model: {},

  gui: {
    projects: () => document.querySelector('#taiga-wizardpage-project'),
    issue: () => document.querySelector('#taiga-wizardpage-issue'),
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

    taiga.resolveSynchronously([
      () => taiga
        .loadOverlay('wizardpage/project')
        .then((implementation) =>
          implementation.load(this.api, this.model, this.preferences)),

      () => taiga
        .loadOverlay('wizardpage/issue')
        .then((implementation) =>
          implementation.load(this.api, this.model, this.preferences))])

    .then(() => {
      // TODO set first page
      // this.gui.wizard().currentPage = this.gui.projects()
      // this.gui.wizard().onFirstPage = true
      this.gui.projects().next = 'taiga-wizardpage-issue'
    })
  }

}

taiga.onLoad(() =>
  taiga.wizard.ticket.load(window.arguments[0]))
