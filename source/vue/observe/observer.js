/*
 * @Author: zbw
 * @Date: 2020-03-18 21:26
 */

import {observe} from "./index";

export function defineReactive(data, key, value) {

  // 如果属性是对象，递归观察
  observe(value)
  Object.defineProperty(data, key, {
    get() {
      console.log('获取数据')
      return value
    },
    set(newValue) {
      console.log('设置数据')
      if (newValue === value) return
      value = newValue
    }
  })
}

class Observer {
  constructor(data) {
    this.walk(data)
  }

  walk(data) {
    let keys = Object.keys(data)
    for (let i = 0; i < keys.length; i++) {
      let key = keys[i]
      let value = data[keys[i]]

      defineReactive(data, key, value)
    }
  }
}

export default Observer
