import request from '@/utils/request'

export function add(data) {
  return request({
    url: 'api/orders',
    method: 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'api/orders',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'api/orders',
    method: 'put',
    data
  })
}

export function updateStatus(data) {
  return request({
    url: 'api/orders/status',
    method: 'put',
    data
  })
}


export function transfer(data) {
  return request({
    url: 'api/orders/transfer',
    method: 'post',
    data
  })
}

export function preTransfer(data) {
  return request({
    url: 'api/orders/preTransfer',
    method: 'post',
    data
  })
}


export default { add, edit, del, updateStatus,transfer,preTransfer}

