var Taiga = {
  
  _address: null,
  _token: null,
  
  me: function() {
    return this._get('users/me')
  },
    
  connect: function(address = false, token = false) {
    this._address = address || this._address;
    this._token = token || this._token;

    return new Promise((resolve, reject) => {
      this.me()
        .then(me => {
          resolve(me.email);
        })
        .catch(error => {
          if (!error.hasOwnProperty('statusText') || error.statusText == '') {
            reject('Network issue');
          } else {
            reject(error.statusText);
          }
        });
    });
  },
  
  _get: function(entity) {
    return Ajax.get(this._expandedUrlFor(entity), this._ajaxOptions());
  },
  
  _expandedUrlFor: function(path) {
    return `${this._address}/api/v1/${path}`
  },
  
  _ajaxOptions: function() {
    return {
      headers: {
        'Authorization': `Bearer ${this._token}`
      }
    }
  }

};
