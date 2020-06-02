/*
 * @Author: zbw
 * @Date: 2020-03-18 23:52
 */
// let arr = [1 ,2,3]
// // arr.splice(0, 1, 100)
// // console.log(arr)
// arr.pop()
// console.log(arr)


let a = 1
let b = {
  num: 1
}

function changeCount(count) {
  // count = 2
  // count.num = 2
  b = {
    name: 'zbw'
  }
}
changeCount(b)

console.log(b)



let vm1 = new Vue({
  data: {name: 'hello'}
})
// 将模板编译成render函数
let render1 = compileToFunction('<div id="app">{{name}}</div>')
// 在vm1为上下文中执行render函数 触发属性getter 依赖收集 生成vnode
let vnode = render1.call(vm1)
// 根据vnode 生成真实dom
let el = createEle(vnode)
document.body.appendChild(el)


let vm2 = new Vue({
  data: {name: 'zf', age: 111}
})
let render2 = compileToFunction('<div id="aaa">{{name}}{{age}}</div>')
let newVnode = render2.call(vm1)
let el2 = createEle(newVnode)
document.body.appendChild(el2)

function patch(oldVnode, newVnode) {
  if (!oldVnode) {
    // 渲染组件
    return createElm(newVnode)
  } else {
    // oldVnode是否真实节点
    const isRealElement = oldVnode.nodeType
    // 如果oldVnode是真实节点 则说明是初次渲染
    if (isRealElement) {
      const oldElm = oldVnode
      const parentElm = oldElm.parentNode

      let el = createElm(newVnode)
      parentElm.insertBefore(el, oldElm.nextSibling)
      parentElm.removeChild(oldElm)

      return el
    } else {
      // 如果oldVnode是虚拟节点 则说明这次为更新操作
      // 比对两个虚拟节点（仅供参考，不修改），操作真实dom

      if (oldVnode.tag !== newVnode.tag) {
        // vnode在创建el的过程中 createElm（vnode） 是会将真实节点映射到vnode上的 vnode.el = element
        // 用新的dom 替换 老的dom
        oldVnode.el.parentNode.replaceChild(createElm(newVnode), oldVnode.el)
      }

      // 如果标签一样
      // 优先考虑 都是文本节点的情况 tag都是undefined
      if (!oldVnode.tag) {
        if (oldVnode.text !== newVnode.text) {
          oldVnode.el.textContent = newVnode.text
        }
      }
    }
  }
}
