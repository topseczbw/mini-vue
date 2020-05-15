/*
 * @Author: zbw
 * @Date: 2020-03-18 20:59
 */
import Vue from 'vue'
import {h} from "../source/vue/vdom/h";
import {patch, render} from "../source/vue/vdom";

// let vm = new Vue({
//   el: '#app',
//   data() {
//     return {
//       // Object.defineProperty()
//       msg: 'hello',
//       school: {
//         name: 'zf'
//       },
//       arr: [{name: 'zbw'}, 2, 4],
//       list: [1,2,3],
//       list2: [[1],2,3]
//     }
//   },
//   computed: {
//     fullName() {
//       return `${this.msg} world`
//     }
//   },
//   watch: {
//     msg(newValue, oldValue) {
//       console.log(newValue)
//       console.log(oldValue)
//     },
//     msg: {
//       handler: (newValue, oldValue) => {
//         console.log(newValue, oldValue)
//       },
//       immediate: true
//     }
//   }
// })

// setTimeout(() => {
//
// }, 1000)


// 代理
// console.log(vm._data.msg)
// console.log(vm.msg)

// 只有获取 没有设置set
// console.log(vm.arr.push(6))

// todo 如果数组新增的项是对象，我们需要对这个对象再次观察
// console.log(vm.arr.push({name: 'zbw'}))
// console.log(vm.arr[3].name)

// 对数组对象本身  数组里的每一项也需要观测
// console.log(vm.arr[0]['name'] = 'ls')

// todo 监控的两个缺点：不能对数组的索引监控 / length--不能对length进行监控 我们是观测不到的


// todo 【批量】【异步】更新
// vm.msg = '你好1'   // dep   [渲染watcher]
// vm.msg = '你好2'   // dep   [渲染watcher]
// vm.msg = '你好3'   // dep   [渲染watcher]
// vm.school.name = '北京'   // dep   [渲染watcher]
// 如果是同步的话  只要改值会不停的重复调  同一个watcher

// todo 数组的更新
setTimeout(() => {
  // 修改数组中对象的属性是会触发更新的，是因为我们对数组的每一项进行了观察，如果项是对象的话，这个对象就会被观察
  // vm.arr[0].name = 'ls'

  // console.log(vm)

  // todo vm.list 语句触发 如果对象属性的value是数组 也会触发该属性的getter方法  此时将依赖收集起来
  // todo .push语句触发数组的dep的notify 更新视图
  // 通过 Observer 作为中间对象 将dep放在Observer实例上 拿到dep
  // vm.list.push(4)

  // todo 递归收集儿子的依赖
  // vm.list2[0].push(2)
  //
}, 500)



// watch
// vm.msg = 'hahaha'


// computed
// 更改计算属性
// 为什么不会立即刷新 因为当前msg属性只有一个watcher是计算属性watcher  因为页面里并没有对msg渲染，所以没有渲染watcher
setTimeout(() => {
  // vm.msg = '修改后'
}, 1000)



// todo 虚拟dom
// let oldVnode = h('div', {id: 'container', key: 1, class: 'main'},
//   h('span', {style: { color: 'red'}}, 'hello'),
//   'zf'
// )


// todo diff

// let oldVnode = h('div', {id: 'container', style: {background: 'red'}},
//   h('span', {style: { color: 'red'}}, 'hello'),
//   'zf'
// )
// let newVnode = h('div', {id: 'aaaaaa', style: {background: 'yellow'}},
//   h('span', {style: {color: 'green'}}, 'world'),
//   'px'
// )
//
// let oldVnode = h('div', {id: 'container', style: {background: 'red'}}
// )
// let newVnode = h('div', {id: 'aaaaaa', style: {background: 'yellow'}},
//   h('span', {style: {color: 'green'}}, 'world'),
//   'px'
// )

// let oldVnode = h('div', {id: 'container'}, 'aaaa')
// let newVnode = h('div', {id: 'container'}, 'bbbb')


// 新 vnode 往后添加元素
// let oldVnode = h('div', {id: 'container'},
//   h('li', {style: { background: 'red'}, key: 'a'}, 'a'),
//   h('li', {style: { background: 'yellow'}, key: 'b'}, 'b'),
//   h('li', {style: { background: 'blue'}, key: 'c'}, 'c'),
//   h('li', {style: { background: 'pink'}, key: 'd'}, 'd'),
// )
// let newVnode = h('div', {id: 'aaaaaa'},
//   h('li', {style: { background: 'red'}, key: 'a'}, 'a'),
//   h('li', {style: { background: 'yellow'}, key: 'b'}, 'b'),
//   h('li', {style: { background: 'blue'}, key: 'c'}, 'c'),
//   h('li', {style: { background: 'pink'}, key: 'd'}, 'd'),
//   h('li', {style: { background: '#ccc'}, key: 'e'}, 'e'),
// )


// let oldVnode = h('div', {id: 'container'},
//   h('li', {style: { background: 'red'}, key: 'a'}, 'a'),
//   h('li', {style: { background: 'yellow'}, key: 'b'}, 'b'),
//   h('li', {style: { background: 'blue'}, key: 'c'}, 'c'),
//   h('li', {style: { background: 'pink'}, key: 'd'}, 'd'),
// )
// let newVnode = h('div', {id: 'aaaaaa'},
//   h('li', {style: { background: '#ccc'}, key: 'e'}, 'e'),
//   h('li', {style: { background: '#ccc'}, key: 'f'}, 'f'),
//   h('li', {style: { background: 'red'}, key: 'a'}, 'a'),
//   h('li', {style: { background: 'yellow'}, key: 'b'}, 'b'),
//   h('li', {style: { background: 'blue'}, key: 'c'}, 'c'),
//   h('li', {style: { background: 'pink'}, key: 'd'}, 'd')
// )

// let oldVnode = h('div', {id: 'container'},
//   h('li', {style: { background: 'red'}, key: 'a'}, 'a'),
//   h('li', {style: { background: 'yellow'}, key: 'b'}, 'b'),
//   h('li', {style: { background: 'blue'}, key: 'c'}, 'c'),
//   h('li', {style: { background: 'pink'}, key: 'd'}, 'd'),
// )
// let newVnode = h('div', {id: 'aaaaaa'},
//   h('li', {style: { background: 'pink'}, key: 'd'}, 'd'),
//   h('li', {style: { background: 'blue'}, key: 'c'}, 'c'),
//   h('li', {style: { background: 'yellow'}, key: 'b'}, 'b'),
//   h('li', {style: { background: 'red'}, key: 'a'}, 'a')
// )

//
// let oldVnode = h('div', {id: 'container'},
//   h('li', {style: { background: 'red'}, key: 'a'}, 'a'),
//   h('li', {style: { background: 'yellow'}, key: 'b'}, 'b'),
//   h('li', {style: { background: 'blue'}, key: 'c'}, 'c'),
//   h('li', {style: { background: 'pink'}, key: 'd'}, 'd'),
// )
// let newVnode = h('div', {id: 'aaaaaa'},
//   h('li', {style: { background: 'pink'}, key: 'd'}, 'd'),
//   h('li', {style: { background: 'red'}, key: 'a'}, 'a'),
//   h('li', {style: { background: 'yellow'}, key: 'b'}, 'b'),
//   h('li', {style: { background: 'blue'}, key: 'c'}, 'c')
// )

let oldVnode = h('div', {id: 'container'},
  h('li', {style: { background: 'red'}, key: 'a'}, 'a'),
  h('li', {style: { background: 'yellow'}, key: 'b'}, 'b'),
  h('li', {style: { background: 'blue'}, key: 'c'}, 'c'),
  h('li', {style: { background: 'pink'}, key: 'd'}, 'd'),
)
let newVnode = h('div', {id: 'aaaaaa'},
  h('li', {style: { background: 'pink'}, key: 'e'}, 'e'),
  h('li', {style: { background: 'red'}, key: 'a'}, 'a'),
  h('li', {style: { background: 'yellow'}, key: 'f'}, 'f'),
  h('li', {style: { background: 'blue'}, key: 'c'}, 'c'),
  h('li', {style: { background: 'blue'}, key: 'n'}, 'n')
)

// 用新的虚拟节点 和老的节点 作对比 更新真实dom元素

let container = document.getElementById('app')

console.log(oldVnode)
render(oldVnode, container)
//
setTimeout(() => {
  patch(oldVnode, newVnode)
}, 1000)
