var CreateTicket = {

	messages: [],
	taigaApi: null,
	
	ticket: {
		project: null,
	},
	
	gui: {
		projects: () => document.querySelector('#projects'),
		wizard: () => document.querySelector('#taiga-create-ticket')
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
				// TODO localize
				.alert('Create Taiga Ticket', 'You need to select one message.')
				.then(window.close);

		this.updateGui();
	},

	showProjects: function() {
		ProjectList
			.connect(this.taigaApi)
			.populate(this.gui.projects())

			.load((projectId) => {
				this.ticket.project = projectId;
				
				if (projectId !== null)
					this.preferences.setString("lastProject", `${projectId}`);

				this.updateGui();
			})
			
			.then((projectItemMapping) => {
				const lastProject = this.preferences.stringFrom("lastProject");

				if (lastProject !== null &&
						Object.keys(projectItemMapping).includes(lastProject))
					this.gui.projects().selectItem(projectItemMapping[lastProject]);
			})

			.catch((error) => {
				new Prompt('taiga-create-ticket') 
				  // TODO localize
					.alert('Create Taiga Ticket', error)
					.then(window.close); 
			});
	},
	
	updateGui: function() {
		switch (this.gui.wizard().currentPage.id) {
			case 'page-project':
				this.gui.wizard().canAdvance = this.ticket.project != null;
				break;
		}
	}
	
};

// showProjects triggered before startup when using load-event
window.addEventListener("pageshow", (event) => {
	if (event.target.nodeName == 'wizardpage')
		CreateTicket.startup();
}, false);
