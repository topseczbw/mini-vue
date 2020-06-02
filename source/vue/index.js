/*
 * @Author: zbw
 * @Date: 2020-03-18 21:07
 */
import {initState} from "./observe";
import Watcher from "./observe/watcher";

// todo 写成了构造函数
function Vue(options) {
  this._init(options)
}

Vue.prototype._init = function (options) {
  let vm = this
  // $options 代表用户传入的初始的配置对象
  vm.$options = options

  // mvvm原理 需要将数据重新初始化
  initState(vm)

  // 如果传递了el属性，则挂载
  if (vm.$options.el) {
    vm.$mount()
  }
}

Vue.extend = function (extendOptions) {
  const Sub = function VueComponent(options) {
    this._init(options)
  }
  Sub.prototype = Object.create(this.prototype)
  Sub.prototype.constructor = Sub

  // 合并父类和子类的options
  Sub.options = mergeOptions(this.options, extendOptions)

  return Sub
}
function mergeOptions() {
}

// 合并组件选项、指令、过滤器等
function mergeAssets(parentVal, childVal) {

  // 以父组件为原型对象，这样的话就可以实现在子组件中找不到时，可以在父组件上找
  const res = Object.create(parentVal)
  if (childVal) {
    for (let key in childVal) {
      res[key] = childVal[key]
    }
  }

  return res
}

function query(el) {
  if (typeof el === 'string') {
    return document.querySelector(el)
  }
  return el
}

const defaultRE = /{{((?:.|\r?\n)+?)}}/g
export const util = {
  getValue(vm, expr) {
    let keys = expr.split('.')
    return keys.reduce((memo, current) => {
      memo = memo[current]
      return memo
    }, vm)
  },
  compilerText(node, vm) {
    // todo 注意：当修改vm属性 再次编译文本时，此时{{}}中的已经是vm属性的值，而不是vm的key
    // 为节点增加一个自定义属性，缓存用户在模板中的写的初始文本 即vm属性的key
    if (!node.expr) {
      node.expr = node.textContent
    }
    node.textContent = node.expr.replace(defaultRE, function (...args) {
      return JSON.stringify(util.getValue(vm, args[1]))
    })
  }
}

function compiler(node, vm) {
  let childNodes = node.childNodes;
  // 将类数组转换为树组
  [...childNodes].forEach(child => {
    // 1是元素 3是文本
    if (child.nodeType === 1) {
    } else if(child.nodeType === 3) {
      util.compilerText(child, vm)
    }
  })
}

Vue.prototype._update = function () {
  // todo 用用户传入的数据去更新视图

  let vm = this
  let el = vm.$el

  // todo 创建文档碎片
  // 不要直接替换dom 可以先做一个文档碎片 为了操作内存里的dom 最后再替换到页面上
  let node = document.createDocumentFragment()
  let firstChild
  while (firstChild = el.firstChild) {
    // appendChild 具有移动的功能
    node.appendChild(firstChild)
  }

  /*
   * todo 编译节点
   * 如果是文本节点，则获取{{value}}中value，在vm上寻找对应的值替换，完成文本节点的编译
   */
  compiler(node, vm)

  // todo 在中间对文本进行编译替换
  el.appendChild(node)
}

Vue.prototype.$mount = function () {
  let vm = this
  let el = vm.$options.el
  el = vm.$el = query(el)

  // 渲染是通过watcher渲染的：渲染watcher、
  let updateComponent = () => { // 更新、渲染的逻辑
    vm._update()
  }
  new Watcher(vm, updateComponent) // 渲染watcher

  // 数据修改后需要更新
}


Vue.prototype.$watch = function (key, handler, opts) {
  // 原理也是创建一个watcher
  new Watcher(this, key, handler, {
    // 用户自己定义的watcher
    user: true,
    ...opts
  })
}

export default Vue
