/*
 * @Author: zbw
 * @Date: 2020-03-18 21:18
 */

// 状态：data computed watch
import Observer from "./observer";
export function initState(vm) {
  let options = vm.$options

  if (options.data) {
    initData(vm)
  }

  if (options.computed) {
    initComputed()
  }

  if (options.watch) {
    initWatch()
  }
}


export function observe(data) {
  if (typeof data !== 'object' || data == null) {
    return
  }

  if (data.__ob__) {
    return data.__ob__
  }

  return new Observer(data)
}
/**
 * 将用户传入的数据通过Object.defineProperty重新定义
 */
function initData(vm) {
  let data = vm.$options.data
  data = vm._data = typeof data === 'function' ? data.call(vm) : data || {}

  // 代理 目的改为从vm上直接取值
  for(let key in data) {
    if (data.hasOwnProperty(key)) {
      proxy(vm, '_data', key)
    }
  }

  observe(vm._data)
}

/**
 * 将vm上的取值赋值操作代理到_data属性
 * 代理一层级即可
 */
function proxy(vm, source, key) {
  Object.defineProperty(vm, key, {
    get() {
      return vm[source][key]
    },
    set(newValue) {
      vm[source][key] = newValue
    }
  })
}

function initComputed() {

}

function initWatch() {

}
