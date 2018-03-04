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

    taiga.wizardpage.project
      .load(this.model, this.api, this.preferences)

    taiga.wizardpage.issue
      .load(this.model, this.messages[0], this.api, this.preferences)

    taiga.wizardpage.issue.onIssueCreated = this.onIssueCreated
  },

  onIssueCreated: function () {
    const ref = this.model.ref
    const slug = this.model.project.slug
    const url = `${this.api.baseUrl()}/project/${slug}/issue/${ref}`
    const extra = this.gui.wizard().getButton('extra1')

    extra.hidden = false
    extra.disabled = false
    extra.label = i18n('showInTaiga')

    extra.addEventListener('command', () => taiga.openUrl(url))
  },

  onWizardNext: function () {
    switch (this.gui.wizard().currentPage) {
      case this.gui.issue():
        return taiga.wizardpage.issue.onWizardNext()

      default:
        return true
    }
  },

  onWizardCancel: function () {
    switch (this.gui.wizard().currentPage) {
      case this.gui.issue():
        return taiga.wizardpage.issue.onWizardCancel()

      default:
        return true
    }
  }

}

taiga.onLoad(() =>
  taiga.wizard.ticket.load(window.arguments[0]))
