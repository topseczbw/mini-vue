function Vue (option) {
  this._data = option.data
  observe(this._data)
  new Watcher()
  /* 在这里模拟render的过程，为了触发test属性的get函数 */
  console.log('初始化渲染组件', this._data.name);
}

function observe(data) {
  Object.keys(data).forEach(key => defineReactive(data, key, data[key]))
}

function defineReactive(obj, key ,value) {
  const dep = new Dep()
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter() {
      dep.addSub(Dep.target)
      return value
    },
    set: function reactiveSetter(newValue) {
      if (newValue === value) return
      value = newValue
      dep.notify()
      // cb(newValue)
    }
  })
}

// function cb(newValue) {
//   console.log('视图更新')
// }

class Dep {
  constructor() {
    this.subs = []
  }
  addSub(sub) {
    this.subs.push(sub)
  }
  notify() {
    console.log(this.subs)
    this.subs.forEach(sub => sub.update())
  }
}
Dep.target = null

class Watcher {
  constructor() {
    Dep.target = this
  }
  update() {
    console.log('视图更新啦')
  }
}
