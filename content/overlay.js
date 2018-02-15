Components.utils.import("resource://gre/modules/Services.jsm");
Components.utils.import("resource:///modules/gloda/mimemsg.js");

var Overlay = {
	_prefs: null,
	_listener: null,
	_messenger: null,
	
	startup: function() {
		this._prefs = Components.classes["@mozilla.org/preferences-service;1"]
				.getService(Components.interfaces.nsIPrefService)
				.getBranch("extensions.taiga.");
		
		this._prefs.QueryInterface(Components.interfaces.nsIPrefBranch2);
		this._prefs.addObserver("", this, false);
		
		this._listener = Components.classes["@mozilla.org/network/sync-stream-listener;1"]
				.createInstance(Components.interfaces.nsISyncStreamListener);
				
		this._messenger = Components.classes["@mozilla.org/messenger;1"]
				.createInstance(Components.interfaces.nsIMessenger);

		this._update();
	},
	
	shutdown: function() {
		this._prefs.removeObserver("", this);
	},
	
	observe: function(subject, topic, data) {
		if (topic != "nsPref:changed") {
			return;
		}

		switch(data) {
			case "address":
			case "token":
				this._update();
				break;
		}
	},
	
	_update: function() {
		var address = this._prefs.getCharPref("address"),
				token = this._prefs.getCharPref("token");
		
		Taiga.connect(address, token)
			.then(user => this._valid(user))
			.catch(error => this._invalid(error));
	},
	
	_valid: function(user) {
		document.getElementById("create-ticket").disabled = false;
	},
	
	_invalid: function(error) {
		document.getElementById("create-ticket").disabled = true;
	},
	
  createTicket: function() {		
		var win = Components.classes["@mozilla.org/appshell/window-mediator;1"].
			getService(Components.interfaces.nsIWindowMediator).
			getMostRecentWindow("mail:3pane");
			
// TODO Promises
		window.openDialog(
			"chrome://taiga/content/create-ticket.xul",
			"taiga-create-ticket", "chrome,centerscreen",
			window, win.gFolderDisplay
				.selectedMessages.map(message => this._messageMapper(message)));
  },
	
// TODO Promises
	_messageMapper: function(message) {
		var subject = null;
		var headers = {};
		var body = null;
		var attachments = null;
		
		MsgHdrToMimeMessage(message, null, function(message, mimemessage) {
			subject = message.mime2DecodedSubject; // TODO encoding
			headers = mimemessage.headers; // TODO cc, ...
			body = mimemessage.coerceBodyToPlaintext().trim();

			console.log(headers);
		});
		
		return message;
	}

}

/*window.addEventListener("load", function(e) { Overlay.startup(); }, false);
window.addEventListener("unload", function(e) { Overlay.shutdown(); }, false);*/
