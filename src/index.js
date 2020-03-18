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
      msg: 'hello',
      school: {
        name: 'zf'
      },
      arr: [{name: 'zbw'}, 2, 3]
    }
  },
  computed: {},
  watch: {}
})

// 代理
// console.log(vm._data.msg)
// console.log(vm.msg)

// 只有获取 没有设置set
// console.log(vm.arr.push(6))

// todo 如果数组新增的项是对象，我们需要对这个对象再次观察
// console.log(vm.arr.push({name: 'zbw'}))
// console.log(vm.arr[3].name)

// 对数组对象本身  数组里的每一项也需要观测
console.log(vm.arr[0]['name'] = 'ls')

// todo 监控的两个缺点：不能对数组的索引监控 / length--不能对length进行监控 我们是观测不到的
