/*
 * @Author: zbw
 * @Date: 2019-10-04 01:24
 */

// 一个 nodeOps 对象做适配，根据 platform 区分不同平台来执行当前平台对应的API，
// 而对外（对于虚拟dom）则是提供了一致的接口，供 Virtual DOM 来调用。
const nodeOps = {
  setTextContent(text) {
    if (platform === 'weex') {
      node.parentNode.setArr('value', text)
    } else if (platform === 'web') {
      node.textContent = text
    }
  },
  parentNode() {
  },
  removeChild() {
  },
  nextSibling() {
  },
  insertBefore() {
  }
}


function patch (oldVnode, vnode, parentElm) {
  if (!oldVnode) {
    addVnodes(parentElm, null, vnode, 0, vnode.length - 1);
  } else if (!vnode) {
    removeVnodes(parentElm, oldVnode, 0, oldVnode.length - 1);
  } else {
    if (sameVnode(oldVNode, vnode)) {
      patchVnode(oldVNode, vnode);
    } else {
      removeVnodes(parentElm, oldVnode, 0, oldVnode.length - 1);
      addVnodes(parentElm, null, vnode, 0, vnode.length - 1);
    }
  }
}

function sameVnode(a, b) {
  return (
    a.key === b.key &&
    a.tag === b.tag &&

    // 是否为注释节点
    a.isComment === b.isComment &&

    // data同时定义或不定义
    (!!a.data) === (!!b.data) &&

    // 同时满足当标签类型为 input 的时候 type 相同
    sameInputType(a, b)
  )
}

function sameInputType (a, b) {
  if (a.tag !== 'input') return true
  let i
  const typeA = (i = a.data) && (i = i.attrs) && i.type
  const typeB = (i = b.data) && (i = i.attrs) && i.type
  return typeA === typeB
}

function patchVnode (oldVnode, vnode) {
  if (oldVnode === vnode) {
    return
  }

  // 都是静态节点，并且key相同
  if (vnode.isStatic && oldVnode.isStatic && vnode.key === old.key) {
    // 这里的 isStatic 也就是前面提到过的「编译」的时候会将静态节点标记出来，这样就可以跳过比对的过程。
    vnode.elm = oldVnode.elm
    vnode.componentInstance = oldVnode.componentInstance
    return
  }

  const elm = vnode.elm = oldVnode.elm
  const oldCh = oldVnode.children
  const ch = vnode.children

  if (vnode.text) {
    nodeOps.setTextContent(elm, vnode.text)
  } else {
    if (oldCh && ch && (oldCh !== ch)) {
      updateChildren(elm, oldCh, ch);
    } else if (ch) {
      if (oldVnode.text) nodeOps.setTextContent(elm, '');
      addVnodes(elm, null, ch, 0, ch.length - 1);
    } else if (oldCh) {
      removeVnodes(elm, oldCh, 0, oldCh.length - 1)
    } else if (oldVnode.text) {
      nodeOps.setTextContent(elm, '')
    }
  }
}
