/* eslint no-undef: 'off' */
/* eslint no-unused-vars: "off" */
/* eslint padded-blocks: ["off", "never"] */

const getIdOrMapFromObject = (attribute) => {
  if (typeof attribute === 'object') {
    return attribute.id
  } else {
    return attribute
  }
}

class TaigaApi {

  me () {
    return this.get('users/me')
  }

  projects () {
    return this.get('projects')
  }

  createIssue (issueDto) {
    return this.post('issues', issueDto.json())
  }

  patchIssue (patch) {
    return this.patch(`issues/${patch.id}`, patch)
  }

  usersContacts (user, query = '') {
    return this.get(`users/${getIdOrMapFromObject(user)}/contacts?q=${query}`)
  }

  issueTypes (projectId) {
    return this.get(`issue-types?project=${projectId}`)
  }

  priorities (projectId) {
    return this.get(`priorities?project=${projectId}`)
  }

  severities (projectId) {
    return this.get(`severities?project=${projectId}`)
  }

  set address (address) {
    this._address = address
  }

  set token (token) {
    this._token = token
  }

  get (entity) {
    return Ajax.get(this.expandUrlFor(entity),
      this.ajaxOptions())
  }

  post (entity, json) {
    return Ajax.post(this.expandUrlFor(entity),
      this.ajaxOptions(), JSON.stringify(json))
  }

  patch (entity, json) {
    return Ajax.patch(this.expandUrlFor(entity),
      this.ajaxOptions(), JSON.stringify(json))
  }

  expandUrlFor (path) {
    return `${this.baseUrl()}/api/v1/${path}`
  }

  baseUrl () {
    return this._address
  }

  ajaxOptions () {
    return {
      headers: {
        'Authorization': `Bearer ${this._token}`,
        'Content-Type': 'application/json'
      }
    }
  }

}

class IssueDto {

  static createFor (ticket) {
    const dto = new IssueDto()
    dto.ticket = ticket
    dto.watchers = []
    dto.tags = []
    return dto
  }

  isAssignedTo (user) {
    this.assignTo = user
    return this
  }

  isWatchedBy (users) {
    this.watchers = users
    return this
  }

  isTaggedWith (tags) {
    this.tags = tags
    return this
  }

  json () {
    return {
      assigned_to: getIdOrMapFromObject(this.assignTo),
      description: this.ticket.description,
      project: getIdOrMapFromObject(this.ticket.project),
      status: getIdOrMapFromObject(this.ticket.status),
      severity: getIdOrMapFromObject(this.ticket.severity),
      priority: getIdOrMapFromObject(this.ticket.priority),
      type: getIdOrMapFromObject(this.ticket.type),
      subject: this.ticket.subject,
      tags: this.tags.map(tag => getIdOrMapFromObject(tag)),
      watchers: this.watchers.map(watcher => getIdOrMapFromObject(watcher))
    }
  }

}
