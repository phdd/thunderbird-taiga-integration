var Taiga = {
  address: null,
  token: null,
  
  configure: function(address, token) {
    this.address = address;
    this.token = token;
  },

  validateToken: function(success, failure) {
    http('get', this.address + '/api/v1/application-tokens')
      .setup(this._authorization)
			.done(function(response, status) {
        console.log(status);
        switch (status) {
          case 200:
            success(); break;
          case 401:
            failure('unauthorized'); break;
          case 0:
          default:
            failure('unreachable');
        }
			}).send();
  },
  
  _authorization: function(xhr) {
      // TODO USE  USER'S ACCESS TOKEN. APPLICATION TOKEN FLOW SUCKS!!!
      xhr.setRequestHeader("Authorization", "Application " + this.token);
  }

}
