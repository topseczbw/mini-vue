/*
 * @Author: zbw
 * @Date: 2020-03-18 21:18
 */

// 状态：data computed watch
import Observer from "./observer";
import Watcher from "./watcher";
import { Dep } from './dep'
export function initState(vm) {
  let options = vm.$options

  if (options.data) {
    initData(vm)
  }

  if (options.computed) {
    initComputed(vm, options.computed)
  }

  if (options.watch) {
    initWatch(vm)
  }
}


export function observe(data) {
  if (typeof data !== 'object' || data == null) {
    return
  }

  if (data.__ob__) {
    return data.__ob__
  }

  return new Observer(data)
}
/**
 * 将用户传入的数据通过Object.defineProperty重新定义
 */
function initData(vm) {
  let data = vm.$options.data
  data = vm._data = typeof data === 'function' ? data.call(vm) : data || {}

  // 代理 目的改为从vm上直接取值
  for(let key in data) {
    if (data.hasOwnProperty(key)) {
      proxy(vm, '_data', key)
    }
  }

  observe(vm._data)
}

/**
 * 将vm上的取值赋值操作代理到_data属性
 * 代理一层级即可
 */
function proxy(vm, source, key) {
  Object.defineProperty(vm, key, {
    get() {
      return vm[source][key]
    },
    set(newValue) {
      vm[source][key] = newValue
    }
  })
}

function createComputedGetter(vm, key) {
  console.log('用户取 computed 值时')
  // 【source/vue/observe/index.js:84】 这个watcher就是我们定义的计算属性watcher
  let watcher = vm._watchersComputed[key]
  // 只有当用户取值时才会调用这个方法
  return function (vm, key) {
    if (watcher) {
      // 如果dirty是false 不需要执行计算属性中的方法
      if (watcher.dirty) {
        watcher.evaluate()
      }
      //
      if (Dep.target) {
        watcher.depend()
      }
      return watcher.value
    }
  }
}

function initComputed(vm, computed) {
  // console.log(vm, computed)
  // 核心也是要创建一个watcher  而且要存起来
  // 创建存储计算属性的watcher的对象并放到 vm 上
  // 将计算属性的配置放到vm上
  let watchers = vm._watchersComputed = Object.create(null)

  for (let key in computed) {
    let userDef = computed[key]
    // 函数可不是用户传入的fn
    // new Watcher 是什么都不会做 只是给watcher增加了 lazy 和 dirty 两个属性
    watchers[key] = new Watcher(vm, userDef, () => {}, {
      // 表示是一个计算属性watcher，而且默认刚开始这个方法不会执行
      lazy: true
    })

    // 为了让用户可以使用 this.计算属性 取到值
    Object.defineProperty(vm, key, {
      get: createComputedGetter(vm, key)
    })
  }
}

function createWatcher(vm, key, handler, opts) {
  return vm.$watch(key, handler, opts)
}

function initWatch(vm) {
  let watch = vm.$options.watch

  for (let key in watch) {
    let userDef = watch[key]
    let handler = userDef
    if (userDef.handler) {
      handler = userDef.handler
    }
    createWatcher(vm, key, handler, {
      immediate: userDef.immediate
    })
  }
}
