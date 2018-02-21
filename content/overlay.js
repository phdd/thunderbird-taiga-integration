/* eslint no-undef: "off" */

var Overlay = {

  messageMapper: null,
  preferences: null,
  taigaApi: null,

  gui: {
    menu: () => document.querySelector('#mailContext-taiga-menu')
  },

  startup: function (
      preferences = false,
      taigaApi = new TaigaApi(),
      messageMapper = new MessageMapper()
  ) {
    this.messageMapper = messageMapper
    this.taigaApi = taigaApi

    this.preferences = preferences || new Preferences(
        'extensions.taiga.', () => this.validateTaigaAuthentication())

    this.validateTaigaAuthentication()
  },

  validateTaigaAuthentication: function () {
    this.taigaApi.address = this.preferences.stringFrom('address')
    this.taigaApi.token = this.preferences.stringFrom('token')

    this.taigaApi
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
        .startDialog('create-ticket', mappedMessages))
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

Extension.onLoad(() => Overlay.startup())
