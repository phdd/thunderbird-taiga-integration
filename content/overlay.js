var Overlay = {
	
	messageMapper: null,
	preferences: null,
	mailPane: null,
	taigaApi: null,
	
	startup: function(
			preferences = false,
			taigaApi = new TaigaApi(),
			messageMapper = new MessageMapper()
	) {
		this.messageMapper = messageMapper;
		this.taigaApi = taigaApi;
		
		this.preferences = preferences || new Preferences(
				"extensions.taiga.", () => this.validateTaigaAuthentication());
		
		this.mailPane = Components
		  .classes["@mozilla.org/appshell/window-mediator;1"]
			.getService(Components.interfaces.nsIWindowMediator)
			.getMostRecentWindow("mail:3pane");
		
		this.validateTaigaAuthentication();
	},
		
	validateTaigaAuthentication: function() {
		this.taigaApi.address = this.preferences.stringFrom("address");
		this.taigaApi.token = this.preferences.stringFrom("token");

		this.taigaApi
			.me()
			.then(user => 
				document.querySelector('#taiga').disabled = false)
			.catch(error => 
				document.querySelector('#taiga').disabled = true);
	},

  createTicket: function() {
		Promise
			.all(this
				.selectedMessages()
				.map(this.messageMapper.toJson))
			.then((mappedMessages) => this
				.startDialog('create-ticket', mappedMessages))
			.catch(console.log); // TODO error handling
  },
	
	startDialog: function(process, messages) {
		window.openDialog(
			`chrome://taiga/content/${process}.xul`,
			`taiga-${process}`, 
			"chrome,centerscreen",
			messages);
	},

	selectedMessages: function() {
		return this.mailPane
			.gFolderDisplay
			.selectedMessages;
	}

}

Extension.onLoad(() => Overlay.startup());
