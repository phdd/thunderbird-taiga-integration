/* eslint no-undef: 'off' */

taiga.wizard.ticket = {

  message: null,
  preferences: null,
  api: null,

  model: {},

  gui: {
    projects: () => document.querySelector('#taiga-wizardpage-project'),
    issue: () => document.querySelector('#taiga-wizardpage-issue'),
    team: () => document.querySelector('#taiga-wizardpage-team'),
    attachments: () => document.querySelector('#taiga-wizardpage-attachments'),
    wizard: () => document.querySelector('#taiga-wizard')
  },

  load: function (
    messages,
    preferences = new Preferences('extensions.taiga.'),
    api = new TaigaApi()
  ) {
    this.message = messages[0] // handles only one message at a time
    this.preferences = preferences
    this.api = api

    this.api.address = this.preferences.stringFrom('address')
    this.api.token = this.preferences.stringFrom('token')

    this.setup()
  },

  setup: function () {
    taiga.wizardpage.project
      .load(this.model, this.api, this.preferences)

    taiga.wizardpage.issue
      .load(this.model, this.message, this.api, this.preferences)

    taiga.wizardpage.team
      .load(this.model, this.message, this.api, this.preferences)

    taiga.wizardpage.issue.onIssueCreated = this.onIssueCreated.bind(this)
    taiga.wizardpage.team.onWizardShow = this.onWizardShow.bind(this)
    taiga.wizardpage.project.projectFilter = this.projectFilter

    if (this.hasNoAttachments()) {
      this.gui.wizard().removeChild(this.gui.attachments())
    } else {
      taiga.wizardpage.attachments
        .load(this.model, this.message, this.api)

      taiga.wizardpage.attachments.onWizardShow = this.onWizardShow.bind(this)
    }
  },

  hasNoAttachments: function () {
    return this.message.attachments.length < 1
  },

  onIssueCreated: function () {
    const ref = this.model.ref
    const host = this.api.baseUrl()
    const slug = this.model.project.slug
    const url = `${host}/project/${slug}/issue/${ref}`
    const extra = this.gui.wizard().getButton('extra1')

    extra.hidden = false
    extra.disabled = false
    extra.label = i18n('showInTaiga')

    extra.addEventListener('command', () => taiga.openUrl(url))
  },

  projectFilter: function (project) {
    return project.i_am_member &&
      project.is_issues_activated &&
      project.my_permissions.includes('add_issue')
  },

  onWizardNext: function () {
    switch (this.gui.wizard().currentPage) {
      case this.gui.issue():
        return taiga.wizardpage.issue.onWizardNext()

      case this.gui.team():
        if (this.hasNoAttachments()) {
          // kinda hacky, but found no other option without final page
          this.gui.wizard().advance = this.gui.wizard().cancel
        }
        return taiga.wizardpage.team.onWizardNext()

      default:
        return true
    }
  },

  onWizardCancel: function () {
    switch (this.gui.wizard().currentPage) {
      case this.gui.issue():
        return taiga.wizardpage.issue.onWizardCancel()

      case this.gui.team():
        return taiga.wizardpage.team.onWizardCancel()

      default:
        return true
    }
  },

  onWizardShow: function () {
    switch (this.gui.wizard().currentPage) {
      case this.gui.team():
        this.gui.wizard().canRewind = false

        if (this.hasNoAttachments()) {
          this.gui.wizard()
            .getButton('next').label = i18n('finish')
        }
        break

      case this.gui.attachments():
        this.gui.wizard().canRewind = false

        this.gui.wizard()
          .getButton('next').label = i18n('finish')
        break
    }
  }

}

taiga.onLoad(() =>
  taiga.wizard.ticket.load(window.arguments[0]))
