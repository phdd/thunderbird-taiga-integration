const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;

Cu.import("resource:///modules/mailServices.js");
Cu.import("resource:///modules/iteratorUtils.jsm");
Cu.import("resource:///modules/Services.jsm");
Cu.import("resource:///modules/gloda/mimemsg.js");
Cu.import("resource:///modules/FileUtils.jsm");

class Preferences {
    
  constructor(branch = "", callback = null) {
    this.callback = callback;
    
    this.preferences = Cc["@mozilla.org/preferences-service;1"]
        .getService(Ci.nsIPrefService)
        .getBranch(branch);  
        
    this.preferences.QueryInterface(Ci.nsIPrefBranch2);
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
    this.promptService = Cc["@mozilla.org/embedcomp/prompt-service;1"]
      .getService(Ci.nsIPromptService);
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
      MsgHdrToMimeMessage(message, null, function(message, mime) {
        try {
          
          json.subject = message.mime2DecodedSubject; // TODO encoding
          json.headers = mime.headers; // TODO cc, ...
          json.body = mime.coerceBodyToPlaintext().trim();
          
          json.attachments = mime.allUserAttachments.map((attachment) => {
            return {
              url: attachment.url,
              type: attachment.contentType,
              name: attachment.name,
            };
          });
          
          console.log(json);
          
          resolve(json);
        } catch (error) { 
          reject(error);
        }
      }, true /* allowDownload */, {
        partsOnDemand: true,
        examineEncryptedParts: true 
      });
    });
  }

}

class AttachmentMapper {

  constructor(directory) {
    this.directory = directory;
  }

  static toFile(attachment) {
    let ioService = Cc["@mozilla.org/network/io-service;1"]
      .getService(Ci.nsIIOService);

    let attURL = ioService.newURI(attachment.url, null, null);
    attURL.QueryInterface(Ci.nsIMsgMessageUrl);
    let uri = attURL.uri;

    let file = FileUtils.getFile(this.directory, [attachment.name]);
    file.createUnique(Ci.nsIFile.NORMAL_FILE_TYPE, FileUtils.PERMS_FILE);

    let messenger = Cc["@mozilla.org/messenger;1"]
      .createInstance(Ci.nsIMessenger);
      
    messenger
      .saveAttachmentToFile(
        file, attachment.url,
        uri, attachment.type, null);
  }

}
