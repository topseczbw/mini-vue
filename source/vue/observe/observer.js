/*
 * @Author: zbw
 * @Date: 2020-03-18 21:26
 */

import {observe} from "./index";
import {arrayMethods, observerArray} from "./array";
import { Dep } from './dep'

export function defineReactive(data, key, value) {

  // 如果属性是对象，递归观察
  // todo childOb 专门服务于数组 是数组的那个dep
  let childOb = observe(value)
  // todo 注意：这是一个闭包  由于get、set方法可以获取到 defineReactive 方法作用域中的变量，因此在外部修改属性时， dep 可以一直存活，一直被访问到
  let dep = new Dep()
  Object.defineProperty(data, key, {
    get() {
      // 取数据之前 已经把 watcher 放到了target上 【source/vue/observe/watcher.js:37】
      // todo 注意：同一个属性可能会在模板中被多次取值，有可能会在dep中注册很多相同的watcher，我们希望watcher不能重复，如果重复了就会造成更新时，多次渲染
      if (Dep.target) {
        // watcher 和 Dep 互相依赖
        dep.depend() // 想让dep中 可以存watcher 还希望让这个watcher中存放dep 实现多对多关系


        // 如在使用 vm.list 时
        // 在这里不用担心对象会重新收集  因为在【source/vue/observe/watcher.js:46】方法中会判断dep唯一标识
        if(childOb) {
          childOb.dep.depend()

          // 递归收集儿子的依赖
          dependArray(value)
        }
      }
      console.log('获取数据，【渲染dom，更新试图】')
      return value
    },
    set(newValue) {
      if (newValue === value) return
      console.log('设置数据  设置vm属性')
      observe(newValue)
      value = newValue

      // 执行 该属性 订阅过的 watcher
      dep.notify()
    }
  })
}

/**
 * 递归收集数组中的依赖
 * @param value
 */
export function dependArray(value) {
  for (let i = 0; i < value.length; i++) {
    // 有可能也是一个数组
    let currentItem = value[i]
    currentItem.__ob__ && currentItem.__ob__.dep.depend()

    if (Array.isArray(currentItem)) {
      // 不停的收集数组中的依赖关系
      dependArray(currentItem)
    }
  }
}

class Observer {
  constructor(data) {

    // 这个dep专门为数组使用
    // 对象的依赖 在【source/vue/observe/observer.js:16】闭包中收集
    this.dep = new Dep()
    // 为从data开始的每个对象、数组
    // 都有一个__ob__属性，返回的就是当前的Observer实例
    Object.defineProperty(data, '__ob__', {
      get: () => this
    })
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
