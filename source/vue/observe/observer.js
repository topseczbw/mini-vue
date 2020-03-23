/*
 * @Author: zbw
 * @Date: 2020-03-18 21:26
 */

import {observe} from "./index";
import {arrayMethods, observerArray} from "./array";
import { Dep } from './dep'

export function defineReactive(data, key, value) {

  // 如果属性是对象，递归观察
  observe(value)
  // todo 注意：这是一个闭包  由于get、set方法可以获取到 defineReactive 方法作用域中的变量，因此在外部修改属性时， dep 可以一直存活，一直被访问到
  let dep = new Dep()
  Object.defineProperty(data, key, {
    get() {
      // 取数据之前 已经把 watcher 放到了target上 【source/vue/observe/watcher.js:37】
      // todo 注意：同一个属性可能会在模板中被多次取值，有可能会在dep中注册很多相同的watcher，我们希望watcher不能重复，如果重复了就会造成更新时，多次渲染
      if (Dep.target) {
        // watcher 和 Dep 互相依赖
        dep.depend() // 想让dep中 可以存watcher 还希望让这个watcher中存放dep 实现多对多关系

        // 已删除
        // dep.addSub(Dep.target)
      }
      console.log('获取数据')
      return value
    },
    set(newValue) {
      if (newValue === value) return
      console.log('设置数据')
      observe(newValue)
      value = newValue

      // 执行 该属性 订阅过的 watcher
      dep.notify()
    }
  })
}

class Observer {
  constructor(data) {


    if(Array.isArray(data)) {
      // 对现有数组的每一项进行观察
      observerArray(data)

      // 对未来某一刻  数组可能会有插入操作  那么对插入的每项也进行观察
      // todo 如果是数组  对新增项、原有项是对象的进行观察
      // todo 通过改变data上数组对象的原型链  使在vue实例上声明的数组属性被劫持 只有传入的数据需要被劫持
      data.__proto__ = arrayMethods
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
