import request from '@/utils/http'

export interface Form {
  id: number
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

export function getPublicForm(id: number) {
  return request.get({
    url: `/form/public/${id}`
  })
}

export function deleteForm(id: number) {
  return request.del({
    url: `/form/${id}`
  })
}
