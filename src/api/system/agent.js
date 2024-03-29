import request from '@/utils/request'

export function add(data) {
  return request({
    url: 'api/merchant',
    method: 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'api/merchant',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'api/merchant',
    method: 'put',
    data
  })
}

export function getMerchantList(id) {
  return request({
    url: 'api/merchant?agentId='+id,
    method: 'get'
  })
}

export function getOrganization() {
  return request({
    url: 'api/merchant/organization',
    method: 'get'
  })
}


export default { add, edit, del,getMerchantList,getOrganization }

