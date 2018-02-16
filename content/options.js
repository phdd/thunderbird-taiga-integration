const IMAGE_SMILE = 'chrome://taiga/skin/smile.png';
const IMAGE_CONFUSED = 'chrome://taiga/skin/confused.png';

var Options = {
	
	_preferences: null,
	_taigaApi: null,
		
	startup: function(preferences = false, taigaApi = false) {
		this._taigaApi = taigaApi || new TaigaApi();
		this._preferences = preferences || new Preferences(
				"extensions.taiga.", () => this.validateTaigaAuthentication());
				
		this.validateTaigaAuthentication();
	},

	validateTaigaAuthentication: function() {
		this._taigaApi.address = this._preferences.stringFrom("address");
		this._taigaApi.token = this._preferences.stringFrom("token");

		this._taigaApi
		  .me()
			.then(user => 
				this.setUser(user.email))
			.catch(error => 
				this.setError(error.statusText || 'Network issue'));
	},
	
	setUser: function(user) {
		document.getElementById("authentication").value = user;
		document.getElementById("state").src = IMAGE_SMILE;
	},
	
	setError: function(error) {
		document.getElementById("authentication").value = error;
		document.getElementById("state").src = IMAGE_CONFUSED;
	}

}

Extension.onLoad(() => Options.startup());
