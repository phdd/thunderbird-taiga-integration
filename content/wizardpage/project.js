/* eslint no-undef: 'off' */

taiga.wizardpage.project = {

  IMAGE_PROJECT: 'chrome://taiga/skin/icon.png',

  api: null,
  model: null,

  gui: {
    projects: () => document.querySelector('#taiga-project-list'),
    wizard: () => document.querySelector('#taiga-wizard')
  },

  load: function (api, model, preferences) {
    this.api = api
    this.model = model
    this.preferences = preferences
    this.hasBeenLoaded = true
    this.update()
  },

  update: function () {
    if (!this.hasBeenLoaded) {
      return
    }

    ListBuilder
      .fetchEntitiesFrom(() => this.api.projects())
      .nameEntities(i18n('project'), i18n('projects'))
      .createItemsNamed('listitem')
      .addItemsTo(this.gui.projects())
      .addIconFrom(project =>
        project.logo_small_url || this.IMAGE_PROJECT)
      .addItemOnlyWhen(project =>
        project.i_am_member &&
        project.is_issues_activated &&
        project.my_permissions.includes('add_issue'))
      .loadSelectionWith(() => [ this.preferences.stringFrom('lastProject') ])
      .storeSelectionWith(id => this.preferences.setString('lastProject', `${id}`))
      .consumeSelectionWith(project => {
        this.model.project = project
        this.render()
      })
      .catch(error =>
        new Prompt('taiga-wizard')
          .alert(i18n('createTicket'), error)
          .then(window.close))
  },

  render: function () {
    this.gui.wizard().getButton('next').focus()
    this.gui.wizard().canAdvance = this.model.project != null
  }

}
