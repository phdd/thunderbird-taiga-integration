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

class TaigaError extends Error {}
class NotFound extends TaigaError {}
class BadRequest extends TaigaError {}

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
    return new Promise((resolve, reject) => {
      Ajax
        .get(this.expandUrlFor(entity), this.ajaxOptions())
        .then(resolve)
        .catch((error) => reject(this.translateError(error)))
    })
  }

  postJson (entity, json) {
    return new Promise((resolve, reject) => {
      Ajax
        .post(this.expandUrlFor(entity),
          this.ajaxOptions(), JSON.stringify(json))
        .then(resolve)
        .catch((error) => reject(this.translateError(error)))
    })
  }

  postFormData (entity, data) {
    const options = this.ajaxOptions()
    // if set to multipart/form-data, boundary part will be missing
    delete options.headers['Content-Type']
    return new Promise((resolve, reject) => {
      Ajax
        .post(this.expandUrlFor(entity), options, data)
        .then(resolve)
        .catch((error) => reject(this.translateError(error)))
    })
  }

  patch (entity, json) {
    return new Promise((resolve, reject) => {
      Ajax
        .patch(this.expandUrlFor(entity),
          this.ajaxOptions(), JSON.stringify(json))
        .then(resolve)
        .catch((error) => reject(this.translateError(error)))
    })
  }

  translateError (error) {
    const message = error.statusText
    console.error(error)

    switch (error.status) {
      case 400:
        return new BadRequest(message)
      case 404:
        return new NotFound(message)
      default:
        return new TaigaError(message)
    }
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

    data.append('attached_file', this.attachment.file)
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
