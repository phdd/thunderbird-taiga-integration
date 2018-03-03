/* eslint no-undef: "off" */

taiga.overlay = {

  messageMapper: null,
  preferences: null,
  api: null,

  gui: {
    menu: () => document.querySelector('#mailContext-taiga-menu')
  },

  startup: function (
      preferences = false,
      api = new TaigaApi(),
      messageMapper = new MessageMapper()
  ) {
    this.messageMapper = messageMapper
    this.api = api

    this.preferences = preferences || new Preferences(
        'extensions.taiga.', () => this.validateTaigaAuthentication())

    this.validateTaigaAuthentication()
  },

  validateTaigaAuthentication: function () {
    this.api.address = this.preferences.stringFrom('address')
    this.api.token = this.preferences.stringFrom('token')

    this.api
      .me()
      .then(user => {
        this.gui.menu().disabled = false
      })
      .catch(error => {
        console.log(error)
        this.gui.menu().disabled = true
      })
  },

  createTicket: function () {
    Promise
      .all(this
        .selectedMessages()
        .map(message =>
          this.messageMapper.toJson(message)))
      .then((mappedMessages) => this
        .startDialog('wizard/ticket', mappedMessages))
      .catch(console.log)
  },

  startDialog: function (process, messages) {
    window.openDialog(
      `chrome://taiga/content/${process}.xul`,
      `taiga-${process}`,
      'chrome,centerscreen',
      messages)
  },

  selectedMessages: function () {
    return gFolderDisplay.selectedMessages
  }

}

taiga.onLoad(() => taiga.overlay.startup())
