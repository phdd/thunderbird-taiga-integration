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
    return this.postJson('issues', issueDto.json())
  }

  patchIssue (patch) {
    return this.patch(`issues/${patch.id}`, patch)
  }

  postIssueAttachment (attachmentDto) {
    console.log(attachmentDto) // XXX
    return this.postFormData('issues/attachments', attachmentDto.formData())
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
    return Ajax.get(this.expandUrlFor(entity), this.ajaxOptions())
  }

  postJson (entity, json) {
    return Ajax.post(this.expandUrlFor(entity),
      this.ajaxOptions(), JSON.stringify(json))
  }

  postFormData (entity, data) {
    const options = this.ajaxOptions()
    // if set to multipart/form-data, boundary part will be missing
    delete options.headers['Content-Type']
    return Ajax.post(this.expandUrlFor(entity), options, data)
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

class AttachmentDto {

  static createFor (attachment) {
    const dto = new AttachmentDto()
    dto.attachment = attachment
    dto.is_deprecated = 'False'
    dto.from_comment = 'False'
    return dto
  }

  targeting (target) {
    this.target = target
    return this
  }

  within (project) {
    this.project = project
    return this
  }

  formData () {
    const data = new FormData()
    const blob = new Blob([ this.attachment.bytes ],
      { type: this.attachment.contentType })

    data.append('attached_file', blob, this.attachment.name)
    data.append('from_comment', this.from_comment)
    data.append('object_id', getIdOrMapFromObject(this.target))
    data.append('project', getIdOrMapFromObject(this.project))

    return data
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
