import request from '@/utils/http'

export interface Form {
  id: number
  uuid: string
  name: string
  description?: string
  schema: any
  create_time: string
  update_time: string
  creator_id?: number
  creator?: {
    id: number
    real_name: string
  }
}

export function createForm(data: any) {
  return request.post({
    url: '/form/create',
    data
  })
}

export function updateForm(id: number, data: any) {
  return request.put({
    url: `/form/${id}`,
    data
  })
}

export function getFormList(params: any) {
  return request.get({
    url: '/form/list',
    params
  })
}

export function getForm(id: number) {
  return request.get({
    url: `/form/${id}`
  })
}

export function getPublicForm(uuid: string) {
  return request.get({
    url: `/form/public/${uuid}`
  })
}

export function submitForm(uuid: string, data: any) {
  return request.post({
    url: `/form/submit/${uuid}`,
    data: { data }
  })
}

export function saveFormDraft(uuid: string, data: any) {
  return request.post({
    url: `/form/draft/${uuid}`,
    data: { data, is_draft: true }
  })
}

export function getFormDraft(uuid: string) {
  return request.get({
    url: `/form/draft/${uuid}`,
    showErrorMessage: false
  })
}

export function getFormSubmissions(id: number) {
  return request.get({
    url: `/form/${id}/submissions`
  })
}

export function deleteForm(id: number) {
  return request.delete({
    url: `/form/${id}`
  })
}
