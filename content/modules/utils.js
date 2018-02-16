class Preferences {
    
  constructor(branch = "", callback = null) {
    this.callback = callback;
    
    this.preferences = Components.classes["@mozilla.org/preferences-service;1"]
        .getService(Components.interfaces.nsIPrefService)
        .getBranch(branch);  
        
    this.preferences.QueryInterface(Components.interfaces.nsIPrefBranch2);
		this.preferences.addObserver("", this, false);
    
    Extension.onUnload(() => {
      this.preferences.removeObserver("", this)
    });
  }
  
  observe(subject, topic, data) {
		if (topic == "nsPref:changed" && this.callback != null) {
      this.callback(data);
		}
  }

  stringFrom(preference) {
    return this.preferences.getCharPref(preference);
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

class Prompt {
  
  constructor(id) {
    this.target = document.querySelector(id);
    this.promptService = Components
      .classes["@mozilla.org/embedcomp/prompt-service;1"]
      .getService(Components.interfaces.nsIPromptService);
  }
  
  alert(title, description) {
    return new Promise((resolve, reject) => {
      this.promptService.alert(this.target, title, description);
      resolve();
    });
  }

}

class MessageMapper {
  
  toJson(message) {
    let json = {};
    
    return new Promise((resolve, reject) => {
      MsgHdrToMimeMessage(message, null, function(message, mimemessage) {
        try {
          
          json.subject = message.mime2DecodedSubject; // TODO encoding
          json.headers = mimemessage.headers; // TODO cc, ...
          json.body = mimemessage.coerceBodyToPlaintext().trim();
          
          console.log(json);
          
          resolve(json);
        } catch (error) { 
          reject(error);
        }
      });
    });
  }
  
}
