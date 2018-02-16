var CreateTicket = {

	startup: function() {
		let messages = window.arguments[0];
		
		if (messages.length != 1) {
			new Prompt('taiga-create-ticket') // TODO localize
				.alert('Create Taiga Ticket', 'You need to select one message.')
				.then(window.close);
		} else {
			this.update(messages[0]);
		}
	},
	
	update: function(message) {
		console.log(message);
	}

}

Extension.onLoad(() => CreateTicket.startup());
