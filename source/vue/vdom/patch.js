/*
 * @Author: zbw
 * 这个文件除了第一次的初始化渲染外，还要做比对操作
 * @Date: 2020-03-28 18:40
 */


// 让虚拟节点生成真实的节点
export function render(vnode, container) {
  // console.log(vnode)
  // console.log(container)
  let el = createElm(vnode)
  container.appendChild(el)
}

// 创建元素
// 递归创建

/**
 * 使用虚拟节点创建真实dom
 * @param vnode
 * @return {*}
 */
function createElm(vnode) {
  let {tag, children, key, props, text} = vnode

  // 是标签
  if (typeof tag === 'string') {
    // todo 并不是所有的tag是字符串的都是html标签  ,也有可能是vue组件 vue-component-1-my-component

    // if (createComponent(vnode)) {
    //   return
    // }

    // 将虚拟节点对应的真实节点存起来
    vnode.el = document.createElement(tag)

    // 更新属性
    updateProperties(vnode)
    children.forEach(child => {
      return render(child, vnode.el)
    })
  } else {
    // undefined 是文本
    // 创建文本节点返回
    vnode.el = document.createTextNode(text)
  }
  return vnode.el

}

// 虚拟dom/js对象 通过属性 与真实dom对象 关联 比对虚拟dom对象 修改真实dom
export function patch(oldVnode, newVnode) {
  // console.log(oldVnode, newVnode)
  // 1） 先比对标签是否一样
  if (oldVnode.tag !== newVnode.tag) {
    oldVnode.el.parentNode.replaceChild(createElm(newVnode), oldVnode.el)
  }

  // 如果标签一样
  // 优先考虑 都是文本节点的情况 tag都是undefined
  if (!oldVnode.tag) {
    if (oldVnode.text !== newVnode.text) {
      oldVnode.el.textContent = newVnode.text
    }
  }

  // 标签一样 属性不一样 复用dom  标签复用
  let el = newVnode.el = oldVnode.el
  updateProperties(newVnode, oldVnode.props)


  // 比对孩子
  // vue 规定必须要有一个根节点
  let oldChildren = oldVnode.children || []
  let newChildren = newVnode.children || []

  // todo 三种情况
  // 1. 老的有孩子 新的有孩子
  // 2. 老的有孩子 新的没孩子
  // 3. 老的没孩子 新的有孩子
  if(oldChildren.length > 0 && newChildren.length > 0) {
    // 用老的孩子和新的孩子比对出来的区别 去 更新真实dom
    updateChildren(el, oldChildren, newChildren)
  } else if (oldChildren.length) {
    // 老的有孩子 新的无孩子
    el.innerHTML = ''
  } else if (newChildren.length) {
    // 老的无孩子 新的有孩子 直接将孩子虚拟节点转化为真实节点 插入即可
    for (let i = 0; i < newChildren.length; i++) {
      let child = newChildren[i];
      el.appendChild(createElm(child))
    }
  }
}

// 更新属性和样式 先删除老的 再增加新的
function updateProperties(vnode, oldProps = {}) {
  let newProps = vnode.props || {}
  let el = vnode.el // 当前真实节点

  // todo 先删除老的：属性和样式
  // 老的有 新的没有 style 删除这个样式
  let newStyle = newProps.style || {}
  let oldStyle = oldProps.style || {}
  for (let key in oldStyle) {
    if (!newStyle[key]) {
      // 删除元素的样式 或者 removeAttr删除
      el.style[key] = ''
    }
  }
  // 老的有 新的没有 删除这个属性
  for (let key in oldProps) {
    if (!newProps[key]) {
      delete el[key]
    }
  }

  // todo 再添加新的：属性和样式
  // 新的属性附上去就行
  // 特殊情况 class 和 style
  for (let key in newProps) {
    // 对不同的dom属性做不同的处理
    if (key === 'style') {
      for (let styleName in newProps.style) {
        el.style[styleName] = newProps.style[styleName]
      }
    } else if (key === 'class') {
      el.className = newProps[key]
    } else {
      // 给这个元素添加属性 如 id
      el[key] = newProps[key]
    }
  }
}

function updateChildren(parent, oldChildren, newChildren) {
  // vue中增加了很多优化策略 因为在浏览器中操作dom最常见的方法是 开头 结尾插入  正序 倒序

  // 老的
  let oldStartIndex = 0
  let oldStartVnode = oldChildren[0]
  let oldEndIndex = oldChildren.length - 1
  let oldEndVnode = oldChildren[oldEndIndex]

  // 新的
  let newStartIndex = 0
  let newStartVnode = newChildren[0]
  let newEndIndex = newChildren.length - 1
  let newEndVnode = newChildren[newEndIndex]

  function makeIndexByKey(children) {
    let map = {}
    children.forEach((item, index) => {
      map[item.key] = index
    })
    return map
  }

  let map = makeIndexByKey(oldChildren)

  // 只有当老节点指针不重合 并且 新节点指针也不重合时 才进行比对 有一方指针先重合 就结束
  while(oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
    // 暴力比对时，当前vnode可能有空的
    if (!oldStartVnode) {
      oldStartVnode = oldChildren[++oldStartIndex]
    } else if (!oldEndVnode) {
      oldEndVnode = oldChildren[--oldEndIndex]
      // todo 四种优化比较策略 比较是否同一个节点
    } else if(isSameNode(oldStartVnode, newStartVnode)) {
      // todo 优化向前插入 头头比
      // A B C D
      // A B C D E
      // 如果老的节点和新的节点是【一个节点】，则只需要根据新老节点更新属性和样式
      patch(oldStartVnode, newStartVnode)

      // 把下一个取出来
      oldStartVnode = oldChildren[++oldStartIndex]
      newStartVnode = newChildren[++newStartIndex]
    } else if (isSameNode(oldEndVnode, newEndVnode)) {
      // todo 优化向后插入 尾尾比
      // A B C D
      // E A B C D
      // 用新的属性 来更新 老的属性
      patch(oldEndVnode, newEndVnode)

      oldEndVnode = oldChildren[--oldEndIndex]
      newEndVnode = newChildren[--newEndIndex]
    } else if (isSameNode(oldStartVnode, newEndVnode)) {
      // todo 头尾比
      // D A B C
      // A B C D
      // 用新的属性 来更新 老的属性
      patch(oldStartVnode, newEndVnode)

      // 将D插入到C后面
      parent.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling)
      oldStartVnode = oldChildren[++oldStartIndex]
      newEndVnode = newChildren[--newEndIndex]
    } else if (isSameNode(oldEndVnode, newStartVnode)) {
      // todo 尾头比
      // A B C D
      // D A B C
      // 用新的属性 来更新 老的属性
      patch(oldEndVnode, newStartVnode)

      parent.insertBefore(oldEndVnode.el, oldStartVnode.el)
      oldEndVnode = oldChildren[--oldEndIndex]
      newStartVnode = newChildren[++newStartIndex]
    } else {
      // todo 暴力比对 能复用的就复用，不能复用的就创建出来 插入当前oldVnode头指针的前面去
      // todo 新根据老节点的key 做一个映射表 拿新的节点去映射表中找， 如果可以找到，则进行移动操作，移动到老节点的start指针节点 的 dom元素 前面位置， 如果找不到则直接将元素插入即可
      // Q A B C
      // E A F C N
      let moveIndex = map[newStartVnode.key]
      if (moveIndex === undefined) {
        parent.insertBefore(createElm(newStartVnode), oldStartVnode.el)
      } else {
        let moveVnode = oldChildren[moveIndex]
        patch(moveVnode, newStartVnode)
        oldChildren[moveIndex] = undefined
        parent.insertBefore(moveVnode.el, oldStartVnode.el)
      }
      newStartVnode = newChildren[++newStartIndex]
    }
  }

  // todo 当有一方指针先重合后，才会走到这里

  // oldVnode指针重合了   追加newVnode剩下的元素
  if (newStartIndex <= newEndIndex) {
    // 把剩余的元素都插进入
    for (let i = newStartIndex; i <= newEndIndex; i++) {
      // 可能是往前面插入 也有可能是往后面插入
      // 不管是哪个方向  insertbefore 如果是null 就等于appendChild
      // 获取参考节点
      let ele = newChildren[newEndIndex + 1] == null ? null : newChildren[newEndIndex + 1].el
      parent.insertBefore(createElm(newChildren[i]), ele)
    }
  }

  // newVnode指针重合了  删除oldVnode剩下的元素
  if (oldStartIndex <= oldEndIndex) {
    for (let i = oldStartIndex; i <= oldEndIndex; i++) {
      let child = oldChildren[i]
      if (child !== undefined) {
        parent.removeChild(child.el)
      }
    }
  }
}

// 判断是不是同一个节点
function isSameNode(oldVnode, newVnode) {
  // 如果两个人的标签 和 key都一样 我们就认为是同一个节点
  return (oldVnode.tag === newVnode.tag) && (oldVnode.key === newVnode.key)
}
