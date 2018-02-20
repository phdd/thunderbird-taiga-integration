var CreateTicket = {

	messages: [],
	taigaApi: null,
	
	ticket: {
		project: null,
		type: null
	},
	
	gui: {
		projects: () => document.querySelector('#projects'),
		wizard: () => document.querySelector('#taiga-create-ticket'),
		types: () => document.querySelector('#ticket-type'),
		title: () => document.querySelector('#title')
	},

	startup: function(
		preferences = false,
		taigaApi = new TaigaApi()
	) {
		this.messages = window.arguments[0];

		this.taigaApi = taigaApi;
		this.preferences = preferences || new Preferences("extensions.taiga.");

		this.taigaApi.address = this.preferences.stringFrom("address");
		this.taigaApi.token = this.preferences.stringFrom("token");

		if (this.messages.length != 1) 
			new Prompt('taiga-create-ticket')
				.alert(i18n('createTicket'), i18n('selectOneMessage'))
				.then(window.close);

		this.updateGui();
	},

	showProjects: function() {		
		ListBuilder
			.fetchEntitiesFrom(() => this.taigaApi.projects())
			.nameEntities(i18n('project'), i18n('projects'))
			.createItemsNamed('listitem')
			.addItemsTo(this.gui.projects())
			.addItemOnlyWhen(project => 
				project.i_am_member && 
				project.is_issues_activated && 
				project.my_permissions.includes('add_issue'))
			.loadSelectionWith(() => this.preferences.stringFrom("lastProject"))
			.storeSelectionWith(id => this.preferences.setString("lastProject", `${id}`))
			.consumeSelectionWith(project => {
				this.ticket.project = project;
				this.updateGui();
			})
			.catch(error => 
				this.alertAndClose(error));
	},
	
	showDetails: function() {
		ListBuilder
			.fetchEntitiesFrom(() => 
				this.taigaApi.issueTypes(this.ticket.project.id))
			.nameEntities(i18n('issueType'), i18n('issueTypes'))
			.createItemsNamed('menuitem')
			.addItemsTo(this.gui.types())
			.loadSelectionWith(() => 
				this.preferences.stringFrom("lastIssueType") || 
				this.ticket.project.default_issue_type)
			.storeSelectionWith(id => this.preferences.setString("lastIssueType", `${id}`))
			.consumeSelectionWith(type => {
				this.ticket.type = type;
				this.updateGui();
			})
			.catch(error => 
				this.alertAndClose(error));
		
		this.gui.title().focus();
	},
	
	alertAndClose: function(error) {
		new Prompt('taiga-create-ticket') 
			.alert(i18n('createTicket'), error)
			.then(window.close);
	},

	updateGui: function() {
		switch (this.gui.wizard().currentPage.id) {
			case 'page-project':
				this.gui.wizard().canAdvance = this.ticket.project != null;
				break;
		}
	}
	
};

Extension.onPageShow('wizardpage', () => CreateTicket.startup());
