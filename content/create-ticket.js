/* eslint no-undef: 'off' */

const IMAGE_PROJECT = 'chrome://taiga/skin/icon.png'

var CreateTicket = {

  messages: [],
  taigaApi: null,

  ticket: {
    project: null,
    type: null,
    severity: null,
    priority: null,
    subject: null,
    description: null,
    attachments: []
  },

  gui: {
    projects: () => document.querySelector('#projects'),
    wizard: () => document.querySelector('#taiga-create-ticket'),
    types: () => document.querySelector('#ticket-type'),
    priority: () => document.querySelector('#ticket-priority'),
    severity: () => document.querySelector('#ticket-severity'),
    title: () => document.querySelector('#title'),
    description: () => document.querySelector('#description'),
    attachments: () => document.querySelector('#attachment-list')
  },

  startup: function (
    preferences = false,
    taigaApi = new TaigaApi()
  ) {
    this.messages = window.arguments[0]

    this.taigaApi = taigaApi
    this.preferences = preferences || new Preferences('extensions.taiga.')

    this.taigaApi.address = this.preferences.stringFrom('address')
    this.taigaApi.token = this.preferences.stringFrom('token')

    if (this.messages.length !== 1) {
      new Prompt('taiga-create-ticket')
        .alert(i18n('createTicket'), i18n('selectOneMessage'))
        .then(window.close)
    }

    this.ticket.attachments = this.messages[0].attachments
    this.updateGui()
  },

  showProjects: function () {
    ListBuilder
      .fetchEntitiesFrom(() => this.taigaApi.projects())
      .nameEntities(i18n('project'), i18n('projects'))
      .createItemsNamed('listitem')
      .addItemsTo(this.gui.projects())
      .addIconFrom(project =>
        project.logo_small_url || IMAGE_PROJECT)
      .addItemOnlyWhen(project =>
        project.i_am_member &&
        project.is_issues_activated &&
        project.my_permissions.includes('add_issue'))
      .loadSelectionWith(() => [ this.preferences.stringFrom('lastProject') ])
      .storeSelectionWith(id => this.preferences.setString('lastProject', `${id}`))
      .consumeSelectionWith(project => {
        this.ticket.project = project
        this.updateGui()
      })
      .catch(error =>
        this.alertAndClose(error))
  },

  showDetails: function () {
    ListBuilder
      .fetchEntitiesFrom(() =>
        this.taigaApi.issueTypes(this.ticket.project.id))
      .nameEntities(i18n('issueType'), i18n('issueTypes'))
      .createItemsNamed('menuitem')
      .addItemsTo(this.gui.types())
      .loadSelectionWith(() => [
        this.preferences.stringFrom('lastIssueType'),
        this.ticket.project.default_issue_type ])
      .storeSelectionWith(id =>
        this.preferences.setString('lastIssueType', `${id}`))
      .consumeSelectionWith(type => {
        this.ticket.type = type
      })
      .then(() => this.updateGui())
      .catch(error =>
        this.alertAndClose(error))

    ListBuilder
      .fetchEntitiesFrom(() =>
        this.taigaApi.priorities(this.ticket.project.id))
      .nameEntities(i18n('priority'), i18n('priorities'))
      .createItemsNamed('menuitem')
      .addItemsTo(this.gui.priority())
      .loadSelectionWith(() => [
        this.preferences.stringFrom('lastPriority'),
        this.ticket.project.default_priority ])
      .storeSelectionWith(id =>
        this.preferences.setString('lastPriority', `${id}`))
      .consumeSelectionWith(priority => {
        this.ticket.priority = priority
      })
      .then(() => this.updateGui())
      .catch(error =>
        this.alertAndClose(error))

    ListBuilder
      .fetchEntitiesFrom(() =>
        this.taigaApi.severities(this.ticket.project.id))
      .nameEntities(i18n('severity'), i18n('severities'))
      .createItemsNamed('menuitem')
      .addItemsTo(this.gui.severity())
      .loadSelectionWith(() => [
        this.preferences.stringFrom('lastSeverity'),
        this.ticket.project.default_severity ])
      .storeSelectionWith(id =>
        this.preferences.setString('lastSeverity', `${id}`))
      .consumeSelectionWith(severity => {
        this.ticket.severity = severity
      })
      .then(() => this.updateGui())
      .catch(error =>
        this.alertAndClose(error))

    if (!this.ticket.description) {
      this.ticket.description = this.messages[0].body
    }

    if (!this.ticket.subject) {
      this.ticket.subject = this.messages[0].subject
    }

    this.gui.title().value = this.ticket.subject
    this.gui.description().value = this.ticket.description

    this.gui.description().addEventListener('keyup', () => {
      this.ticket.description = this.gui.description().value
      this.updateGui()
    })

    this.gui.title().addEventListener('keyup', () => {
      this.ticket.subject = this.gui.title().value
      this.updateGui()
    })

    if (this.ticket.attachments === 0) {
      this.gui.wizard().currentPage.next = 'page-final'
    }

    this.gui.title().focus()
  },

  showAttachments: function () {
    ListBuilder
      .fetchEntitiesFrom(this.ticket.attachments)
      .createItemsNamed('attachmentitem')
      .addItemsTo(this.gui.attachments())
      .mapEntityToItemWith((entity, item) => {
        item.setAttribute('name', entity.displayName)
        item.setAttribute('value', entity.url)
        item.setAttribute('size', Extension.formatFileSize(entity.size))
        item.setAttribute('image32',
           `moz-icon://${entity.name}?size=32&amp;amp;contentType=${entity.contentType}`)
        item.setAttribute('imagesize', '32')
      })
      .consumeSelectionWith(attachments => {
        this.ticket.attachments = attachments
      })
      .catch(error =>
        this.alertAndClose(error))
  },

  showFinal: function () {
    const wizard = this.gui.wizard()
    const extra = wizard.getButton('extra1')
    const cancel = wizard.getButton('cancel')
    const finish = wizard.getButton('finish')

    wizard.canRewind = false

    extra.setAttribute('disabled', true)
    finish.setAttribute('disabled', true)

    // TODO replace dummy implementation
    window.addEventListener('beforeunload', (event) => event.preventDefault())

    cancel.setAttribute('hidden', 'true')
    extra.setAttribute('hidden', 'false')
    extra.setAttribute('label', i18n('showInTaiga'))
  },

  alertAndClose: function (error) {
    new Prompt('taiga-create-ticket')
      .alert(i18n('createTicket'), error)
      .then(window.close)
  },

  updateGui: function () {
    switch (this.gui.wizard().currentPage.id) {
      case 'page-project':
        this.gui.wizard().canAdvance = this.ticket.project != null
        break
      case 'page-details':
        this.gui.wizard().canAdvance =
          this.ticket.type != null &&
          this.ticket.severity != null &&
          this.ticket.priority != null &&
          this.ticket.subject != null && this.ticket.subject.length > 2 &&
          this.ticket.description != null && this.ticket.description.length > 2
        break
    }
  }

}

Extension.onPageShow('wizardpage', () => CreateTicket.startup())
