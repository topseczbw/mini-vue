/*
 * @Author: zbw
 * @Date: 2019-10-03 10:40
 */

const app = new Vue({
  data: {
    name: 'zbw',
    age: 17
  }
})
function reactiveRender() {
  app._data.name = 'ls'
}

// 修改实例上的数据，进行响应式视图更新






