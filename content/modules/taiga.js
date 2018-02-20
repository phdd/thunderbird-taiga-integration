class TaigaApi {

  me() {
    return this._entity('users/me');
  }

  projects() {
    return this._entity('projects');
  }
  
  issueTypes(projectId) {
    return this._entity(`issue-types?project=${projectId}`);
  }
  
  priorities(projectId) {
    return this._entity(`priorities?project=${projectId}`);
  }
  
  severities(projectId) {
    return this._entity(`severities?project=${projectId}`);
  }

  set address(address) {
    this._address = address;
  }
  
  set token(token) {
    this._token = token;
  }

  _entity(entity) {
    return Ajax.get(this._expandedUrlFor(entity), this._ajaxOptions());
  }
  
  _expandedUrlFor(path) {
    return `${this._address}/api/v1/${path}`
  }
  
  _ajaxOptions() {
    return {
      headers: {
        'Authorization': `Bearer ${this._token}`
      }
    }
  }

}
