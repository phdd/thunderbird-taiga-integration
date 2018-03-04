/* eslint no-undef: 'off' */

taiga.wizardpage.watchers = {

  IMAGE_PROFILE: 'chrome://taiga/skin/profile.png',

  api: null,
  model: null,
  message: null,

  gui: {
    people: () => document.querySelector('#taiga-watch-list'),
    wizard: () => document.querySelector('#taiga-wizard')
  },

  load: function (model, message, api) {
    this.api = api
    this.model = model
    this.message = message
    this.hasBeenLoaded = true
  },

  update: function () {
    ListBuilder
      .fetchEntitiesFrom(() => this.fetchContacts())
      .nameEntities(i18n('people'), i18n('people'))
      .createItemsNamed('listitem')
      .addItemsTo(this.gui.people())
      .addIconFrom(person => person.photo || this.IMAGE_PROFILE)
      .loadSelectionWith(() => [])
      .consumeSelectionWith(people => {
        this.model.watchers = people
        this.render()
      })
      .catch(error =>
        new Prompt('taiga-wizard')
          .alert(i18n('createTicket'), error)
          .then(window.close))
  },

  fetchContacts: function () {
    const members = this.model.project.members.map(getIdOrMapFromObject)
    const mailAddresses = [].concat(
      this.message.from, this.message.to, this.message.cc)

    return this.api
      .me()
      .then(me => Promise
        .all(mailAddresses
          // drop me from addresses
          .filter(mailAddress => mailAddress !== me.email)
          // search in my contacts
          .map(mailAddress => this.api.usersContacts(me, mailAddress)))

        .then(searchResult => [ me ].concat(searchResult
          // we searched for unique mail-addresses,
          // hence we assume a single entry query result
          .map(Array.shift)
          // drop empty search results
          .filter(person => person !== undefined)
          // allow project members only
          .filter(person => members.includes(person.id))))

        // set name for list builder
        .then(people =>
          people.map(person => {
            person.name = person.full_name_display || person.username

            if (person.email === me.email) {
              person.name += ' (me)' // TODO i18n
            }

            return person
          })))
  },

  render: function () {
    this.gui.wizard().getButton('next').focus()
    this.gui.wizard().canAdvance = this.model.project != null
    this.gui.wizard().canRewind = false
  },

  onPageShow: function () {
    if (this.hasBeenLoaded) {
      this.update()
    }
  }

}
