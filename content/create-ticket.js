/* eslint no-undef: 'off' */
/* eslint promise/param-names: 'off' */

Cu.import('resource://gre/modules/osfile.jsm')

const IMAGE_PROJECT = 'chrome://taiga/skin/icon.png'

var CreateTicket = {

  messages: [],
  taigaApi: null,

  ticket: {
    project: null,
    type: null,
    severity: null,
    priority: null,
    status: null,
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
    attachments: () => document.querySelector('#attachment-list'),
    finalMessage: () => document.querySelector('#final-message'),
    finalMessageLabel: () => document.querySelector('#final-message label'),
    finalPane: () => document.querySelector('#final-pane'),
    progressIndicator: () => document.querySelector('#progress-indicator'),
    attachmentCount: () => document.querySelector('#attachmentCount'),
    attachmentSize: () => document.querySelector('#attachmentSize')
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
        this.gui.wizard().getButton('next').focus()
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

    this.ticket.status = this.ticket.project.default_issue_status

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

    if (this.messages[0].attachments.length === 0) {
      this.gui.wizard().currentPage.next = 'page-final'
    }

    this.gui.title().focus()
  },

  showAttachments: function () {
    ListBuilder
      .fetchEntitiesFrom(this.messages[0].attachments)
      .createItemsNamed('attachmentitem')
      .addItemsTo(this.gui.attachments())
      .mapEntityToItemWith((entity, item) => {
        item.setAttribute('name', entity.name.replace(/(.)\1{9,}/g, '$1…$1'))
        item.setAttribute('value', entity.url)
        item.setAttribute('size', Extension.formatFileSize(entity.size))
        item.setAttribute('image32',
           `moz-icon://${entity.name}?size=32&amp;amp;contentType=${entity.contentType}`)
        item.setAttribute('imagesize', '32')
      })

      .consumeSelectionWith(attachments => {
        this.gui.attachmentCount().setAttribute(
          'value', i18n('numberOfAttachments', [ attachments.length ]))

        if (attachments.length > 0) {
          this.gui.attachmentSize().setAttribute(
            'value', Extension.formatFileSize(attachments
              .map((attachment) => attachment.size)
              .reduce((a, b) => a + b)))
        } else {
          this.gui.attachmentSize().setAttribute(
            'value', Extension.formatFileSize(0))
        }

        this.ticket.attachments = attachments
      })

      .catch(error =>
        this.alertAndClose(error))

    this.gui.attachmentCount().setAttribute(
      'value', i18n('numberOfAttachments', [ 0 ]))

    this.gui.attachmentSize().setAttribute(
      'value', Extension.formatFileSize(0))
  },

  showFinal: function () {
    const wizard = this.gui.wizard()
    const extra = wizard.getButton('extra1')
    const cancel = wizard.getButton('cancel')
    const finish = wizard.getButton('finish')
    const disableWindowClose = (event) => event.preventDefault()

    wizard.canRewind = false
    extra.setAttribute('disabled', true)
    finish.setAttribute('disabled', true)
    window.addEventListener('beforeunload', disableWindowClose)

    this
      .createTicket()
      .then((issue, messages = []) => {
        finish.setAttribute('disabled', false)
        window.removeEventListener('beforeunload', disableWindowClose)
        this.gui.progressIndicator().setAttribute('hidden', true)
        this.gui.finalMessage().setAttribute('hidden', false)

        const url = `${this.taigaApi.baseUrl()}/project/${this.ticket.project.slug}/issue/${issue.ref}`

        extra.setAttribute('disabled', false)
        extra.addEventListener('command', () => Extension.openUrl(url))

        this.gui.finalMessageLabel().setAttribute(
          'value', i18n('ticketNumberCreated', [ issue.ref ]))

        for (let message in messages) {
          const messageDescription = document.createElement('description')
          messageDescription.setAttribute('value', `… ${message}`)
          this.gui.finalPane().appendChild(messageDescription)
        }
      })

      .catch(error =>
        this.alertAndClose(error))

    cancel.setAttribute('hidden', 'true')
    extra.setAttribute('hidden', 'false')
    extra.setAttribute('label', i18n('showInTaiga'))
  },

  createTicket: function () {
    const taiga = this.taigaApi
    const message = this.messages[0]
    const participants = [].concat(message.from, message.to, message.cc)
    const members = this.ticket.project.members.map(getIdOrMapFromObject)
    const errors = []

    return new Promise((resolveTicketCreation, rejectTicketCreation) =>
      taiga
        .me()
        .catch(rejectTicketCreation) // TODO e.g. 'Error: Not Found' :(
        .then(me => Promise
          // Aggregate issue watchers
          // TODO this should be optional!
          .all(participants
            .filter(participant =>
              participant !== me.email)

            .map(participant => taiga
              .usersContacts(me, participant)))

          .catch(rejectTicketCreation) // TODO e.g. 'Error: Not Found' :(

          // Build issue DTO
          .then(contactSearchResults => IssueDto
            .createFor(this.ticket)
            .isAssignedTo(me)
            .isWatchedBy([ me.id ].concat(contactSearchResults

              // we searched for unique mail-addresses,
              // hence we assume a single entry query result
              .map(Array.shift)

              // drop empty results
              .filter(contact =>
                contact !== undefined)

              // members only
              .filter(contact =>
                members.includes(contact.id)))))

          // Create issue
          .then(dto => taiga
            .createIssue(dto)
            .catch(rejectTicketCreation) // TODO e.g. 'Error: Not Found' :(

            // attach files
            .then(issue => new Promise((resolveAttachmentUpload) => Promise
              .all(this.ticket.attachments
                .map(attachment =>
                  Extension.download(attachment)))

              .then(attachments => Promise
                .all(attachments
                  .map(attachment => AttachmentDto
                    .createFor(attachment)
                    .targeting(issue)
                    .within(this.ticket.project))
                  .map(dto =>
                    taiga.postIssueAttachment(dto))))

              .catch(() =>
                errors.push('uploading attachments failed')) // TODO i18n

              .then(() => resolveAttachmentUpload(issue))))

            // Patch issue watchers
            .then(issue => new Promise((resolveWatcherCreation) => {
              const intendedWatchers = dto.json().watchers
              const allIntendedWatchersAreWatching =
                intendedWatchers.every(intentedWatcher =>
                  issue.watchers.includes(intentedWatcher))

              // this seems to be a Taiga bug:
              // original post does not include watchers
              if (!allIntendedWatchersAreWatching) {
                taiga
                  .patchIssue({
                    id: issue.id,
                    version: issue.version,
                    watchers: intendedWatchers })

                  .catch(() =>
                    errors.push('adding watchers failed')) // TODO i18n
              }

              resolveWatcherCreation(issue)
            }))

            .then(resolveTicketCreation))))
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
