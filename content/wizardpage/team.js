/* eslint no-undef: 'off' */

taiga.wizardpage.team = {

  api: null,
  model: null,
  message: null,
  preferences: null,

  onWizardShow: () => {},

  options: {
    assignToMe: false,
    meWatching: true,
    participantsWatching: true
  },

  gui: {
    wizard: () => document.querySelector('#taiga-wizard'),
    progressOverlay: () => document.querySelector('#taiga-team-progress-overlay'),
    assignToMe: () => document.querySelector('#taiga-assign-to-me'),
    meWatching: () => document.querySelector('#taiga-me-watching'),
    participantsWatching: () => document.querySelector('#taiga-participants-watching')
  },

  load: function (model, message, api, preferences) {
    this.api = api
    this.model = model
    this.message = message
    this.preferences = preferences
    this.hasBeenLoaded = true
  },

  update: function () {
    ['assignToMe', 'meWatching', 'participantsWatching'].forEach((option) => {
      const checkbox = this.gui[option]()

      if (this.preferences.hasUserValue(option)) {
        const isChecked = this.preferences.boolFrom(option)
        checkbox.checked = isChecked
        this.options[option] = isChecked
      }
    })
  },

  fetchContacts: function () {
    const members = this.model.project.members
      .map(getIdOrMapFromObject)

    const mailAddresses = [].concat(
      this.message.from, this.message.to, this.message.cc)

    return this.api
      .me()
      .then((me) => Promise
        .all(mailAddresses
          // drop me from addresses
          .filter(mailAddress => mailAddress !== me.email)
          // search in my contacts
          .map(mailAddress => this.api.usersContacts(me, mailAddress)))

        .then(searchResult => searchResult
          // we searched for unique mail-addresses,
          // hence we assume a single entry query result
          .map(Array.shift)
          // drop empty search results
          .filter(person => person !== undefined)
          // allow project members only
          .filter(person => members.includes(person.id))))
  },

  setOption: function (option, isChecked) {
    this.preferences.setBool(option, isChecked)
    this.options[option] = isChecked
  },

  patchIssue: function () {
    const patch = {
      id: this.model.id,
      version: this.model.version,
      watchers: this.model.watchers
    }

    return this.api
      .me()
      .then(me => {
        if (this.options.assignToMe) {
          patch.assigned_to = me.id
        } else {
          patch.assigned_to = null
        }

        if (this.options.meWatching) {
          patch.watchers.push(me.id)
        }
      })

      .then(() => {
        if (this.options.participantsWatching) {
          return this
            .fetchContacts()
            .then((contacts) => patch.watchers.concat(contacts))
        }
      })

      .then(() => this.api
        .patchIssue(patch))
      .then((issue) =>
        taiga.mergeSimplePropertiesFrom(issue).into(this.model))
  },

  onWizardNext: function () {
    if (this.optionsHaveBeenSet) {
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
        .patchIssue()
        .then(() => {
          reenableUsersInput()
          this.optionsHaveBeenSet = true
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
