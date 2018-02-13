var Options = {
	prefs: null,
	
	startup: function() {
		this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
				.getService(Components.interfaces.nsIPrefService)
				.getBranch("extensions.taiga.");
		
    this.prefs.QueryInterface(Components.interfaces.nsIPrefBranch2);
		this.prefs.addObserver("", this, false);

    this.update();
	},
	
	shutdown: function() {
		this.prefs.removeObserver("", this);
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
		var address = this.prefs.getCharPref("address"),
    		token = this.prefs.getCharPref("token");
		
		Taiga.configure(address, token);
    console.log(Taiga);
		Taiga.validateToken((data) => {
      console.log('SUCCESS');
      console.log(data);
    }, (error) => {
      console.log(error);
    });
  }

}

// Install load and unload handlers
window.addEventListener("load", function(e) { Options.startup(); }, false);
window.addEventListener("unload", function(e) { Options.shutdown(); }, false);
