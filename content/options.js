const IMAGE_SMILE = 'chrome://taiga/skin/smile.png';
const IMAGE_CONFUSED = 'chrome://taiga/skin/confused.png';

var Options = {
	
	preferences: null,
	taigaApi: null,
		
	startup: function(
			preferences = false,
			taigaApi = new TaigaApi()
	) {
		this.taigaApi = taigaApi;
		
		this.preferences = preferences || new Preferences(
				"extensions.taiga.", () => this.validateTaigaAuthentication());
				
		this.validateTaigaAuthentication();
	},

	validateTaigaAuthentication: function() {
		this.taigaApi.address = this.preferences.stringFrom("address");
		this.taigaApi.token = this.preferences.stringFrom("token");

		this.taigaApi
		  .me()
			.then(user => 
				this.setUser(user.email))
			.catch(error => 
				this.setError(error.statusText || 'Network issue'));
	},
	
	setUser: function(user) {
		document.querySelector("#authentication").value = user;
		document.querySelector("#state").src = IMAGE_SMILE;
	},
	
	setError: function(error) {
		document.querySelector("#authentication").value = error;
		document.querySelector("#state").src = IMAGE_CONFUSED;
	}

}

Extension.onLoad(() => Options.startup());
