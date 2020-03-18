/*
 * @Author: zbw
 * @Date: 2020-03-18 23:16
 */

// 拦截用户调用的push、shift、unshift、pop、reverse、sort、splice
// 以上方法导致原数组发生变化
// 像concat slice 不会导致原数组发生变化

import {observe} from "./index";

let oldArrayProtoMethods = Array.prototype

export let arrayMethods = Object.create(oldArrayProtoMethods)

let methods = ['push', 'pop', 'unshift', 'shift', 'reverse', 'sort', 'splice']

export function observerArray(inserted) {
  for (let i = 0; i < inserted.length; i++) {
    // todo 只是对数组中的项是对象的情况做了监控 没有对数组的索引进行监控
    // todo 即如果数组的这一项是对象的话  进行了改写
    observe(inserted[i])
  }
}

methods.forEach(method => {
  arrayMethods[method] = function (...args) {
    let result = oldArrayProtoMethods[method].apply(this, args)

    console.log('调用了数组劫持')

    let inserted
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args
        break
      case 'splice':
        inserted = args.slice(2)
        break
      default:
        break
    }
    if (inserted) {
      observerArray(inserted)
    }

    return result
  }
})
