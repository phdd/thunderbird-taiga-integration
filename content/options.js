var Options = {
	_prefs: null,
	
	_state: {
		valid: 'chrome://taiga/skin/smile.png',
		invalid: 'chrome://taiga/skin/confused.png'
	},
	
	startup: function() {
		this._prefs = Components.classes["@mozilla.org/preferences-service;1"]
				.getService(Components.interfaces.nsIPrefService)
				.getBranch("extensions.taiga.");
		
    this._prefs.QueryInterface(Components.interfaces.nsIPrefBranch2);
		this._prefs.addObserver("", this, false);

    this.update();
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
				this.update();
				break;
		}
	},
	
  update: function() {
		var address = this._prefs.getCharPref("address"),
    		token = this._prefs.getCharPref("token");
		
		Taiga.connect(address, token)
			.then(user => this._valid(user))
			.catch(error => this._invalid(error));
  },
	
	_valid: function(user) {
		document.getElementById("authentication").value = user;
		document.getElementById("state").src = this._state.valid;
	},
	
	_invalid: function(error) {
		document.getElementById("authentication").value = error;
		document.getElementById("state").src = this._state.invalid;
	}

}

window.addEventListener("load", function(e) { Options.startup(); }, false);
window.addEventListener("unload", function(e) { Options.shutdown(); }, false);
