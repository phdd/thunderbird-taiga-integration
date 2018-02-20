var CreateTicket = {

	messages: [],
	taigaApi: null,
	
	ticket: {
		project: null,
		type: null,
		severity: null,
		priority: null,
		subject: null,
		description: null
	},
	
	gui: {
		projects: () => document.querySelector('#projects'),
		wizard: () => document.querySelector('#taiga-create-ticket'),
		types: () => document.querySelector('#ticket-type'),
		priority: () => document.querySelector('#ticket-priority'),
		severity: () => document.querySelector('#ticket-severity'),
		title: () => document.querySelector('#title'),
		description: () => document.querySelector('#description')
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
			.loadSelectionWith(() => [ this.preferences.stringFrom("lastProject") ])
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
			.loadSelectionWith(() => [
				this.preferences.stringFrom("lastIssueType"), 
				this.ticket.project.default_issue_type ])
			.storeSelectionWith(id => 
				this.preferences.setString("lastIssueType", `${id}`))
			.consumeSelectionWith(type => 
				this.ticket.type = type)
			.then(() => this.updateGui())
			.catch(error =>
				this.alertAndClose(error));
	
		ListBuilder
			.fetchEntitiesFrom(() => 
				this.taigaApi.priorities(this.ticket.project.id))
			.nameEntities(i18n('priority'), i18n('priorities'))
			.createItemsNamed('menuitem')
			.addItemsTo(this.gui.priority())
			.loadSelectionWith(() => [
				this.preferences.stringFrom("lastPriority"), 
				this.ticket.project.default_priority ])
			.storeSelectionWith(id => 
				this.preferences.setString("lastPriority", `${id}`))
			.consumeSelectionWith(priority => 
				this.ticket.priority = priority)
			.then(() => this.updateGui())
			.catch(error =>
				this.alertAndClose(error));
	
		ListBuilder
			.fetchEntitiesFrom(() => 
				this.taigaApi.severities(this.ticket.project.id))
			.nameEntities(i18n('severity'), i18n('severities'))
			.createItemsNamed('menuitem')
			.addItemsTo(this.gui.severity())
			.loadSelectionWith(() => [
				this.preferences.stringFrom("lastSeverity"), 
				this.ticket.project.default_severity ])
			.storeSelectionWith(id => 
				this.preferences.setString("lastSeverity", `${id}`))
			.consumeSelectionWith(severity => 
				this.ticket.severity = severity)
			.then(() => this.updateGui())
			.catch(error =>
				this.alertAndClose(error));
		
		if (!this.ticket.description)
			this.ticket.description = this.messages[0].body
		
		if (!this.ticket.subject)
			this.ticket.subject = this.messages[0].subject
		
		this.gui.title().value = this.ticket.subject;
		this.gui.description().value = this.ticket.description;

		this.gui.description().addEventListener('keyup', () => {
			this.ticket.description = this.gui.description().value;
			this.updateGui();
		});

		this.gui.title().addEventListener('keyup', () => {
			this.ticket.subject = this.gui.title().value;
			this.updateGui();
		});

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
			case 'page-details':
				this.gui.wizard().canAdvance = 
					this.ticket.type != null && 
					this.ticket.severity != null && 
					this.ticket.priority != null &&
					this.ticket.subject != null && this.ticket.subject.length > 2 && 
					this.ticket.description != null && this.ticket.description.length > 2;
				break;
		}
	}
	
};

Extension.onPageShow('wizardpage', () => CreateTicket.startup());
