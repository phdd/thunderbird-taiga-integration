'use strict';

const IMAGE_SMILE = 'chrome://taiga/skin/smile.png';
const IMAGE_CONFUSED = 'chrome://taiga/skin/confused.png';

class Options {
		
	constructor(preferences = false) {
		this._preferences = preferences || new Preferences(
				"extensions.taiga.", () => this.connectToTaiga());
				
		this.connectToTaiga();
	}

	connectToTaiga() {
		var address = this._preferences.stringFrom("address"),
				token = this._preferences.stringFrom("token");
		
		Taiga.connect(address, token)
			.then(user => this._valid(user))
			.catch(error => this._invalid(error));
	}
	
	_valid(user) {
		document.getElementById("authentication").value = user;
		document.getElementById("state").src = IMAGE_SMILE;
	}
	
	_invalid(error) {
		document.getElementById("authentication").value = error;
		document.getElementById("state").src = IMAGE_CONFUSED;
	}

}
