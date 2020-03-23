/*
 * @Author: zbw
 * @Date: 2020-03-19 00:34
 */

import {popTarget, pushTarget} from "./dep";
import {observe} from "./index";

let id = 0

class Watcher {
  /**
   *
   * @param vm 当前组件实例
   * @param exprOrFn 用户传入的可能是一个表达式也可能是一个函数
   * @param cb 用户传入的回调方法 如 watch
   * @param opts 其他参数
   */
  constructor(vm, exprOrFn, cb = () => {
  }, opts = {}) {
    this.vm = vm
    this.exprOrFn = exprOrFn
    if (typeof exprOrFn === 'function') {
      this.getter = exprOrFn
    }
    this.cb = cb
    this.opts = opts
    this.id = id++

    this.deps = []
    this.depsId = new Set()

    this.get()
  }

  get() {
    // 渲染watcher Dep.target = watcher
    // 目的是 在下面调用 this.getter() 方法时 会取实例上的属性渲染dom  此时属性的getter方法能找到这个watcher
    // source/vue/observe/observer.js:17
    pushTarget(this)
    this.getter()
    // 移除 Dep.target 对应属性 getter 方法中的 【source/vue/observe/observer.js:19】 放置多次收集同一个依赖（watcher）
    popTarget()
  }

  addDep(dep) {
    // 同一个watcher 不应该记录同重复dep
    // todo 【source/vue/observe/observer.js:15】这个dep 是每个属性new 出来的， 存在唯一的id标识。此处用到了Dep实例的id
    let id = dep.id
    if (!this.depsId.has(id)) {
      this.depsId.add(id)
      this.deps.push(id)
      // 让dep记录watcher
      dep.addSub(this)
    }
  }

  update() {
    // 不要立即去调
    // this.get()

    queueWatcher(this)
  }

  run() {
    this.get()
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
    queue.push(watcher)

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
