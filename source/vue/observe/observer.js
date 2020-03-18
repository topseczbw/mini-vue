/*
 * @Author: zbw
 * @Date: 2020-03-18 21:26
 */

import {observe} from "./index";
import {arrayMethods, observerArray} from "./array";

export function defineReactive(data, key, value) {

  // 如果属性是对象，递归观察
  observe(value)
  Object.defineProperty(data, key, {
    get() {
      console.log('获取数据')
      return value
    },
    set(newValue) {
      if (newValue === value) return
      console.log('设置数据')
      observe(newValue)
      value = newValue
    }
  })
}

class Observer {
  constructor(data) {


    if(Array.isArray(data)) {
      // todo 如果是数组  对新增项、原有项是对象的进行观察
      // todo 通过改变data上数组对象的原型链  使在vue实例上声明的数组属性被劫持 只有传入的数据需要被劫持
      data.__proto__ = arrayMethods

      // 对数组现有的每一项观测
      observerArray(data)
    } else {
      // 如果是对象的话
      this.walk(data)
    }
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
