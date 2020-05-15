/*
 * @Author: zbw
 * @Date: 2020-03-28 18:37
 */

// 虚拟节点相关方法
export function vnode(tag, props, key, children, text) {
  return {
    tag,
    props,
    key,
    children,
    text
  }
}
