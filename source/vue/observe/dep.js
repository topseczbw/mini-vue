/*
 * @Author: zbw
 * @Date: 2020-03-19 10:22
 */

let id = 0
// 每个属性有一个dep
export class Dep {
  constructor() {
    this.id = id++
    this.subs = []
  }
  addSub(watcher) {
    // 订阅
    this.subs.push(watcher)
  }
  notify() {
    // 发布
    this.subs.forEach(watcher => watcher.update())
  }
  depend() {
    if (Dep.target) {
      // 希望可以在watcher中记忆dep
      Dep.target.addDep(this)
    }
  }
}

// 后进先出
let stack = []
// 进栈
export function pushTarget(watcher) {
  Dep.target = watcher
  stack.push(watcher)
}
// 出栈
export function popTarget(watcher) {
  stack.pop()
  Dep.target = stack[stack.length - 1]
}
