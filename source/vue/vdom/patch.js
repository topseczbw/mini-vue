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
function createElm(vnode) {
  let {tag, children, key, props, text} = vnode

  // 是标签
  if (typeof tag === 'string') {

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

// 更新属性
function updateProperties(vnode, oldProps = {}) {
  let newProps = vnode.props || {}
  let el = vnode.el // 当前真实节点


  // style的更新
  let newStyle = newProps.style || {}
  let oldStyle = oldProps.style || {}
  for (let key in oldStyle) {
    if (!newStyle[key]) {
      // 删除元素的样式 或者 removeAttr删除
      el.style[key] = ''
    }
  }


  // 下次更新时，我应该用新的属性去更新老的节点
  // 如果老的中有属性，新的中没有，如id这中类型的属性
  for (let key in oldProps) {
    if (!newProps[key]) {
      delete el[key]
    }
  }

  // 我要先考虑下 以前有没有
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

// 虚拟dom/js对象 通过属性 与真实dom对象 关联 比对虚拟dom对象 修改真实dom
export function patch(oldVnode, newVnode) {
  console.log(oldVnode, newVnode)
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

  // 标签一样 属性不一样  标签复用
  let el = newVnode.el = oldVnode.el
  updateProperties(newVnode, oldVnode.props)


  // vue 规定必须要有一个根节点
  // 比较孩子
  let oldChildren = oldVnode.children || []
  let newChildren = newVnode.children || []

  // 老的有孩子 新的有孩子
  if(oldChildren.length > 0 && newChildren.length > 0) {
    updateChildren(el, oldChildren, newChildren)
  } else if (oldChildren.length) {
    // 老的有孩子 新的无孩子
    el.innerHTML = ''
  } else if (newChildren.length) {
    // 老的无孩子 新的有孩子
    for (let i = 0; i < newChildren.length; i++) {
      let child = newChildren[i];
      el.appendChild(createElm(child))
    }
  }
}

function isSameNode(oldVnode, newVnode) {
  // 如果两个人的标签 和 key都一样 我们就认为是同一个节点
  return (oldVnode.tag === newVnode.tag) && (oldVnode.key === newVnode.key)
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

  // 如果他们两个有一个越界了  就结束了
  while(oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
    if (!oldStartVnode) {
      oldStartVnode = oldChildren[++oldStartIndex]
    } else if (!oldEndVnode) {
      oldEndVnode = oldChildren[--oldEndIndex]
    } else if(isSameNode(oldStartVnode, newStartVnode)) {
      // 如果老的节点和新的节点是【一个节点】
      // 用新的属性 来更新 老的属性
      patch(oldStartVnode, newStartVnode)

      oldStartVnode = oldChildren[++oldStartIndex]
      newStartVnode = newChildren[++newStartIndex]
    } else if (isSameNode(oldEndVnode, newEndVnode)) {
      // 用新的属性 来更新 老的属性
      patch(oldEndVnode, newEndVnode)

      oldEndVnode = oldChildren[--oldEndIndex]
      newEndVnode = newChildren[--newEndIndex]
    } else if (isSameNode(oldStartVnode, newEndVnode)) {
      // 用新的属性 来更新 老的属性
      patch(oldStartVnode, newEndVnode)

      parent.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling)
      oldStartVnode = oldChildren[++oldStartIndex]
      newEndVnode = newChildren[--newEndIndex]
    } else if (isSameNode(oldEndVnode, newStartVnode)) {
      // 用新的属性 来更新 老的属性
      patch(oldEndVnode, newStartVnode)

      parent.insertBefore(oldEndVnode.el, oldStartVnode.el)
      oldEndVnode = oldChildren[--oldEndIndex]
      newStartVnode = newChildren[++newStartIndex]
    } else {
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

  if (newStartIndex <= newEndIndex) {
    // 把剩余的元素都插进入
    for (let i = newStartIndex; i <= newEndIndex; i++) {
      // 可能是往前面插入 也有可能是往后面插入
      // 不管是哪个方向  insertbefore 如果是null 就等于appendChild
      // 获取参考节点
      let ele = newChildren[newEndIndex + 1] == null ? null : newChildren[newEndIndex + 1].el
      parent.insertBefore(createElm(newChildren[i]), ele)
      // parent.appendChild(createElm(newChildren[i]))
    }
  }

  if (oldStartIndex <= oldEndIndex) {
    for (let i = oldStartIndex; i <= oldEndIndex; i++) {
      let child = oldChildren[i]
      if (child !== undefined) {
        parent.removeChild(child.el)
      }
    }
  }
}
