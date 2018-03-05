/* eslint no-undef: 'off' */

taiga.wizardpage.attachments = {

  api: null,
  model: null,
  message: null,

  onWizardShow: () => {},

  gui: {
    wizard: () => document.querySelector('#taiga-wizard'),
    attachmentCount: () => document.querySelector('#taiga-attachments-count'),
    attachmentSize: () => document.querySelector('#taiga-attachments-size'),
    attachmentList: () => document.querySelector('#taiga-attachments-list'),
    progressOverlay: () => document.querySelector('#taiga-attachments-progress-overlay')
  },

  load: function (model, message, api) {
    this.api = api
    this.model = model
    this.message = message
    this.hasBeenLoaded = true
  },

  update: function () {
    ListBuilder
      .fetchEntitiesFrom(this.message.attachments)
      .createItemsNamed('attachmentitem')
      .addItemsTo(this.gui.attachmentList())
      .mapEntityToItemWith((attachment, item) => {
        const name = attachment.name
        const type = attachment.contentType

        item.setAttribute('name', attachment.name)
        item.setAttribute('value', attachment.url)
        item.setAttribute('size', taiga.formatFileSize(attachment.size))
        item.setAttribute('imagesize', '32')
        item.setAttribute('image32',
           `moz-icon://${name}?size=32&amp;amp;contentType=${type}`)
      })

      .consumeSelectionWith(attachments => {
        this.gui.attachmentCount().setAttribute(
          'value', i18n('numberOfAttachments', [ attachments.length ]))

        if (attachments.length > 0) {
          this.gui.attachmentSize().setAttribute(
            'value', taiga.formatFileSize(attachments
              .map((attachment) => attachment.size)
              .reduce((a, b) => a + b)))
        } else {
          this.gui.attachmentSize().setAttribute(
            'value', taiga.formatFileSize(0))
        }

        this.model.attachments = attachments
      })
      .catch(error =>
        new Prompt('taiga-wizard')
          .alert(i18n('createTicket'), error)
          .then(window.close))

    this.gui.attachmentCount().setAttribute(
      'value', i18n('numberOfAttachments', [ 0 ]))

    this.gui.attachmentSize().setAttribute(
      'value', taiga.formatFileSize(0))
  },

  onWizardNext: function () {
    if (this.attachmentsHaveBeenUploaded) {
      return true
    } else {
      const rewindEnabled = this.gui.wizard().canRewind
      const disableWindowClose = (event) =>
        event.preventDefault()

      const reenableUsersInput = () => {
        window.removeEventListener('beforeunload', disableWindowClose)
        this.gui.progressOverlay().hidden = true
        this.gui.wizard().canAdvance = true
        this.gui.wizard().canRewind = rewindEnabled
      }

      window.addEventListener('beforeunload', disableWindowClose)
      this.gui.progressOverlay().hidden = false
      this.gui.wizard().canAdvance = false
      this.gui.wizard().canRewind = false

      this
        .uploadAttachments()
        .then(() => {
          reenableUsersInput()
          this.attachmentsHaveBeenUploaded = true
          this.gui.wizard().advance()
        })
        .catch((error) => {
          reenableUsersInput()
          console.log(error)
          new Prompt('taiga-create-ticket')
            .alert(i18n('createTicket'), i18n('errorTryAgain'))
        })

      return false
    }
  },

  onWizardCancel: function () {
    window.close()
  },

  onPageShow: function () {
    if (this.hasBeenLoaded) {
      this.update()
      this.onWizardShow()
    }
  }

}
