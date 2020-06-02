/*
 * @Author: zbw
 * @Date: 2020-03-19 00:34
 */

import {popTarget, pushTarget} from "./dep";
import {observe} from "./index";
import {util} from "../index";

let id = 0

class Watcher {
  /**
   *
   * @param vm 当前组件实例
   * @param exprOrFn 用户传入的可能是一个表达式也可能是一个函数
   * @param cb 用户传入的回调方法 如 watch
   * @param opts 其他参数
   */

  // vm , () => {return `${this.msg} world`} , () => {}, {lazy: true}
  constructor(vm, exprOrFn, cb = () => {
  }, opts = {}) {
    this.vm = vm
    this.exprOrFn = exprOrFn
    if (typeof exprOrFn === 'function') {
      this.getter = exprOrFn
    } else {
      // 如果不是函数  我就把表达式变成函数
      this.getter = function () {
        return util.getValue(vm, exprOrFn)
      }
    }

    if (opts.user) {
      this.user = opts.user
    }
    // 如果这个值为true 说明他是计算属性
    this.lazy = opts.lazy
    // 用这个属性去做缓存
    this.dirty = this.lazy
    this.cb = cb
    this.opts = opts
    this.id = id++

    this.immediate = opts.immediate

    this.deps = []
    this.depsId = new Set()

    // todo 创建watcher的时候  我们先把表达式的值取出来 （老值）
    // todo 同时 会把网点 watcher 回调 加入该属性的 dep中 成为 除了渲染 watcher 外的第二个watcher
    // 如果当前是计算属性的话  不会默认调用get方法 即第一次不会走，什么时候在页面（模板）中用他的时候 才会走
    this.value = this.lazy ? undefined : this.get()


    // todo 如果有immediate 就直接执行用户定义的函数
    if (this.immediate) {
      this.cb(this.value)
    }
  }

  get() {
    // 渲染watcher Dep.target = watcher
    // 目的是 在下面调用 this.getter() 方法时 会取实例上的属性渲染dom  此时属性的getter方法能找到这个watcher
    // source/vue/observe/observer.js:17
    pushTarget(this)
    // 【source/vue/observe/index.js:89】 编译模板时 也会走到computed的方法
    // todo 函数调用时，计算属性函数用到的实例属性就会将计算属性watcher存起来
    // let value = this.getter()
    let value = this.getter.call(this.vm)
    // 移除 Dep.target 对应属性 getter 方法中的 【source/vue/observe/observer.js:19】 放置多次收集同一个依赖（watcher）
    popTarget()

    return value
  }

  evaluate() {
    // 将计算属性的watcher 放到了stack中
    this.value = this.get()
    // 值求过了  下次渲染的时候不用球了
    // 什么时候需要再求呢 ？  source/vue/observe/watcher.js:110
    // 计算属性的值变化了  稍微取值时 在取即可
    this.dirty = false
  }

  addDep(dep) {
    // 同一个watcher 不应该记录同重复dep
    // todo 【source/vue/observe/observer.js:15】这个dep 是每个属性new 出来的， 存在唯一的id标识。此处用到了Dep实例的id
    let id = dep.id
    if (!this.depsId.has(id)) {
      this.depsId.add(id)
      this.deps.push(dep)
      // 让dep记录watcher
      dep.addSub(this)
    }
  }

  depend() {
    let i = this.deps.length
    while(i--) {
      this.deps[i].depend()
    }
  }

  update() {
    // 不要立即去调
    // this.get()

    // 如果是计算属性  实例属性数据一变就需要更新了
    if (this.lazy) {
      // dirty 的作用是为了表示一下这个值是否需要更新
      this.dirty = true
    } else {
      queueWatcher(this)
    }
  }

  run() {
    // 获取执行后的新值
    let value = this.get()

    if (this.value !== value) {
      this.cb(value, this.value)
    }
  }
}

let has = {}
let queue = []
// 清空watcher队列
function flushQueue() {
  queue.forEach(watcher => watcher.run())

  has = {}
  queue = []
}
function queueWatcher(watcher) {
  let id = watcher.id
  if (has[id] == null) {
    has[id] = true
    // 批量
    queue.push(watche r)

    // 延迟清空队列
    // 再此之前  先将 vm 属性修改操作都存起来 使用宏任务 延迟触发
    nextTick(flushQueue)
  }
}

// todo 注意：由于支持用户使用 Vue.nextTick(() => {}) 在回调函数中 操作dom，所以我们需要把用户传入的操作dom的回调放在 flushQueue 之后执行 所以还需要一个callbacks
let callbacks = []
function flushCallbacks() {
  callbacks.forEach(cb => cb())
}
function nextTick(cb) {
  callbacks.push(cb)

  // 要异步刷新这个callbacks。所以需要获取一个异步方法  4步
  // 微任务：promise  mutationObserver    宏任务：setImmediate setTimeout
  let timeFunc = () => {
    flushCallbacks()
  }
  if (Promise) {
    return Promise.resolve().then(timeFunc)
  }
  if (MutationObserver) {
    let observer = new MutationObserver(timeFunc)
    let textNode = document.createTextNode(1)
    observer.observe(textNode, {characterData: true})
    // 触发dom节点修改  触发timeFunc
    textNode.textContent = 2
    return
  }
  // IE支持
  if (setImmediate) {
    return setImmediate(timeFunc)
  }
  setTimeout(timeFunc, 0)
}


// 渲染、计算属性、watch都要用watcher
// 每次产生一个watch 都有一个唯一的标识
export default Watcher
