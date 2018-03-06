/* eslint no-undef: "off" */

taiga.overlay = {

  messageMapper: null,
  preferences: null,
  api: null,

  hasValidConnection: false,

  gui: {
    messageMenu: () => document.querySelector('#messageMenuPopup-taiga-menu'),
    contextMenu: () => document.querySelector('#mailContext-taiga-menu')
  },

  load: function (
    preferences = false,
    api = new TaigaApi(),
    messageMapper = new MessageMapper()
  ) {
    this.messageMapper = messageMapper
    this.api = api

    this.preferences = preferences || new Preferences(
      'extensions.taiga.', () => this.update())

    this.update()
  },

  update: function () {
    this.api.address = this.preferences.stringFrom('address')
    this.api.token = this.preferences.stringFrom('token')

    this.api
      .me()
      .then(user => this.setValidConnection(false))
      .catch(() => this.setValidConnection(true))
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

  setValidConnection: function (valid) {
    this.gui.messageMenu().disabled = valid
    this.gui.contextMenu().disabled = valid
  },

  updateMenu: function (name) {
    const isSingleMessageSelected = this.selectedMessages().length === 1
    const get = (idSuffix) =>
      document.querySelector(`[id$="${name}_taiga-${idSuffix}"]`)

    get('create-ticket').disabled = !isSingleMessageSelected
    get('create-user-story').disabled = true // TODO
    get('create-task').disabled = true // TODO
    get('comment').disabled = true // TODO
    get('attach').disabled = true // TODO
  },

  onPopupShowing: function (menuName) {
    this.updateMenu(menuName)
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

taiga.onLoad(() => taiga.overlay.load())
