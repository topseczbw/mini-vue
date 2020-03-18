/*
 * @Author: zbw
 * @Date: 2020-03-19 00:34
 */

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

    this.get()
  }

  get() {
    this.getter()
  }
}


// 渲染、计算属性、watch都要用watcher
// 每次产生一个watch 都有一个唯一的标识
export default Watcher
