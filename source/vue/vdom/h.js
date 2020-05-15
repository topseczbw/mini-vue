/*
 * @Author: zbw
 * @Date: 2020-03-28 18:36
 */
import {vnode} from "./create-element";

/**
 * 生成虚拟dom
 * @param tag
 * @param props
 * @param children
 * @return {{tag, props, key, children, text}}
 */
export function h (tag, props, ...children) {
  let key = props.key
  delete props.key
  // console.log(children)
  children = children.map(child => {
    if (typeof child === 'object') {
      return child
    } else {
      return vnode(undefined, undefined, undefined, undefined, child)
    }
  })
  // console.log(vnode(tag, props, key, children))
  return vnode(tag, props, key, children)
}



