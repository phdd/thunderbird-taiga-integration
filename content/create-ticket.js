var CreateTicket = {

	startup: function() {
		let parentWindow = window.arguments[0];
		let messages = window.arguments[1];
		
		if (messages.length != 1) {
			this._invalidSelection();
		} else {
			this._update(messages[0]);
		}
	},
	
	_update: function(message) {
		//console.log(message);
	},
	
	_invalidSelection: function() {
		var promptService = Components
					.classes["@mozilla.org/embedcomp/prompt-service;1"]
					.getService(Components.interfaces.nsIPromptService);
		
		// TODO localization
		promptService.alert(parentWindow,
			'Create Taiga Ticket',
			'You need to select one message.');
		
		window.close();
	}

}

window.addEventListener("load", function(e) { CreateTicket.startup(); }, false);
