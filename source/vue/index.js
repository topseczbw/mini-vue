/*
 * @Author: zbw
 * @Date: 2020-03-18 21:07
 */
import {initState} from "./observe";

// todo 写成了构造函数
function Vue(options) {
  this._init(options)
}

Vue.prototype._init = function (options) {
  let vm = this
  // $options 代表用户传入的参数对象
  vm.$options = options

  // mvvm原理 需要将数据重新初始化
  initState(vm)
}


export default Vue
