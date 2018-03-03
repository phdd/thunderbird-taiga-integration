/* eslint no-undef: 'off' */

taiga.wizardpage.issue = {

  model: null,
  message: null,
  api: null,
  preferences: null,

  gui: {
    wizard: () => document.querySelector('#taiga-wizard'),
    types: () => document.querySelector('#taiga-issue-type'),
    priority: () => document.querySelector('#taiga-issue-priority'),
    severity: () => document.querySelector('#taiga-issue-severity'),
    title: () => document.querySelector('#taiga-issue-title'),
    description: () => document.querySelector('#taiga-issue-description')
  },

  load: function (model, message, api, preferences) {
    this.model = model
    this.message = message
    this.api = api
    this.preferences = preferences
    this.hasBeenLoaded = true
  },

  update: function () {
    this.updateTypes()
    this.updatePriority()
    this.updateSeverity()

    if (!this.model.description) {
      this.model.description = this.message.body
    }

    if (!this.model.subject) {
      this.model.subject = this.message.subject
    }

    this.model.status = this.model.project.default_issue_status

    this.gui.title().value = this.model.subject
    this.gui.description().value = this.model.description

    this.gui.description().addEventListener('keyup', () => {
      this.model.description = this.gui.description().value
      this.render()
    })

    this.gui.title().addEventListener('keyup', () => {
      this.model.subject = this.gui.title().value
      this.render()
    })

    this.gui.title().focus()
  },

  updateTypes: function () {
    ListBuilder
      .fetchEntitiesFrom(() =>
        this.api.issueTypes(this.model.project.id))
      .nameEntities(i18n('issueType'), i18n('issueTypes'))
      .createItemsNamed('menuitem')
      .addItemsTo(this.gui.types())
      .loadSelectionWith(() => [
        this.preferences.stringFrom('lastIssueType'),
        this.model.project.default_issue_type ])
      .storeSelectionWith(id =>
        this.preferences.setString('lastIssueType', `${id}`))
      .consumeSelectionWith(type => {
        this.model.type = type
      })
      .then(() => this.render())
      .catch(error =>
        this.alertAndClose(error))
  },

  updatePriority: function () {
    ListBuilder
      .fetchEntitiesFrom(() =>
        this.api.priorities(this.model.project.id))
      .nameEntities(i18n('priority'), i18n('priorities'))
      .createItemsNamed('menuitem')
      .addItemsTo(this.gui.priority())
      .loadSelectionWith(() => [
        this.preferences.stringFrom('lastPriority'),
        this.model.project.default_priority ])
      .storeSelectionWith(id =>
        this.preferences.setString('lastPriority', `${id}`))
      .consumeSelectionWith(priority => {
        this.model.priority = priority
      })
      .then(() => this.render())
      .catch(error =>
        this.alertAndClose(error))
  },

  updateSeverity: function () {
    ListBuilder
      .fetchEntitiesFrom(() =>
        this.api.severities(this.model.project.id))
      .nameEntities(i18n('severity'), i18n('severities'))
      .createItemsNamed('menuitem')
      .addItemsTo(this.gui.severity())
      .loadSelectionWith(() => [
        this.preferences.stringFrom('lastSeverity'),
        this.model.project.default_severity ])
      .storeSelectionWith(id =>
        this.preferences.setString('lastSeverity', `${id}`))
      .consumeSelectionWith(severity => {
        this.model.severity = severity
      })
      .then(() => this.render())
      .catch(error =>
        this.alertAndClose(error))
  },

  render: function () {
    this.gui.wizard().getButton('next').focus()
    this.gui.wizard().canAdvance =
      this.model.type != null &&
      this.model.severity != null &&
      this.model.priority != null &&
      this.model.subject != null && this.model.subject.length > 2 &&
      this.model.description != null && this.model.description.length > 2
  },

  createTicket: function () {
    console.log(this.model) // TODO
  },

  onPageShow: function () {
    if (this.model.project) {
      taiga.wizardpage.issue.update()
    }
  },

  onPageAdvanced: function () {
    this.createTicket()
  },

  alertAndClose: function (error) {
    new Prompt('taiga-create-ticket')
      .alert(i18n('createTicket'), error)
      .then(window.close)
  }

}
