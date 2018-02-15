class Preferences {
    
  constructor(branch = "", callback = null) {
    this._callback = callback;
    
    this._preferences = Components.classes["@mozilla.org/preferences-service;1"]
        .getService(Components.interfaces.nsIPrefService)
        .getBranch(branch);  
        
    this._preferences.QueryInterface(Components.interfaces.nsIPrefBranch2);
		this._preferences.addObserver("", this, false);
    
    Extension.onUnload(() => {
      this._preferences.removeObserver("", this)
    });
  }
  
  observe(subject, topic, data) {
		if (topic == "nsPref:changed" && this._callback != null) {
      this._callback(data);
		}
  }

  stringFrom(preference) {
    return this._preferences.getCharPref(preference);
  }
  
}

class Extension {
  
  static onLoad(callback) {
    window.addEventListener("load", callback, false);
  }
  
  static onUnload(callback) {
    window.addEventListener("unload", callback, false);
  }

}
