/*
 * @Author: zbw
 * @Date: 2020-03-18 20:59
 */
import Vue from 'vue'

let vm = new Vue({
  el: '#app',
  data() {
    return {
      // Object.defineProperty()
      msg: 'hello zbw',
      school: {
        name: 'zf'
      },
      arr: [{name: 'zbw'}, 2, 4],
      list: [1,2,3],
      list2: [[1],2,3]
    }
  },
  computed: {},
  watch: {
    // msg(newValue, oldValue) {
    //   console.log(newValue)
    //   console.log(oldValue)
    // },
    msg: {
      handler: (newValue, oldValue) => {
        console.log(newValue, oldValue)
      },
      immediate: true
    }
  }
})

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
vm.msg = 'hahaha'
