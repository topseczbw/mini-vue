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
      arr: [1,2,3]
    }
  },
  computed: {
  },
  watch: {
  }
})

// 代理
// console.log(vm._data.msg)
console.log(vm.msg)
