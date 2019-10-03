/*
 * @Author: zbw
 * @Date: 2019-10-03 14:11
 */

// —————————————————————————————————————————————————————背景—————————————————————————————————————————————————————
let demoHtml = '<div :class="c" class="demo" v-if="isShow"><span v-for="item in sz">{{item}}</span></div>'

// 编译完成最后AST的样子
const AST_RESULT = {
  /* 标签属性的map，记录了标签上属性 */
  'attrsMap': {
    ':class': 'c',
    'class': 'demo',
    'v-if': 'isShow'
  },
  /* 解析得到的:class */
  'classBinding': 'c',
  /* 标签属性v-if */
  'if': 'isShow',
  /* v-if的条件 */
  'ifConditions': [
    {
      'exp': 'isShow'
    }
  ],
  /* 标签属性class */
  'staticClass': 'demo',
  /* 标签的tag */
  'tag': 'div',
  /* 子标签数组 */
  'children': [
    {
      'attrsMap': {
        'v-for': "item in sz"
      },
      /* for循环的参数 */
      'alias': "item",
      /* for循环的对象 */
      'for': 'sz',
      /* for循环是否已经被处理的标记位 */
      'forProcessed': true,
      'tag': 'span',
      'children': [
        {
          /* 表达式，_s是一个转字符串的函数 */
          'expression': '_s(item)',
          'text': '{{item}}'
        }
      ]
    }
  ]
}

// 真是vue.js编译结果
// AST 转化生成 render 函数字符串时  被期待的结果
// _c => createElement 函数
// with(this){
//   return (isShow) ?
//     _c(
//       'div',
//       {
//         staticClass: "demo",
//         class: c
//       },
//       _l(
//         (sz),
//         function(item){
//           return _c('span',[_v(_s(item))])
//         }
//       )
//     )
//     : _e()
// }

// 源版
// render () {
//   return isShow ? (new VNode('div', {
//     'staticClass': 'demo',
//     'class': c
//   }, [ /*这里还有子节点*/ ])) : createEmptyVNode();
// }

// —————————————————————————————————————————————————————解析—————————————————————————————————————————————————————

let index = 0
const stack = [];
let currentParent, root;

/**
 * 更新html字符串
 * @param n
 */
function advance(n) {
  index += n
  html = html.slice(n)
}

/**
 * 解析html为AST抽象语法树对象
 * @return {*}
 */
function parseHtml() {
  while(html) {
    // 获取html字符串中第一个标签位置
    let textEnd = html.indexOf('<')

    // 如果是0 说明当前需要解析是标签
    if (textEnd === 0) {

      // 处理结束标签如 </div>
      if (html.match(endTag)) {
        const endTagMatch = html.match(endTag)
        if (endTagMatch) {
          advance(endTagMatch[0].length)
          parseEndTag(endTagMatch[1])
          continue
        }
      }

      // 处理起始标签如 <div>
      if (html.match(startTagOpen)) {
        const startTagMatch = parseStartTag()

        // 我们将 startTagMatch 得到的结果首先封装成 element ，这个就是最终形成的 AST 的节点，
        // 标签节点的 type 为 1
        const element = {
          type: 1,
          tag: startTagMatch.tagName,
          lowerCasedTag: startTagMatch.tagName.toLowerCase(),
          attrsList: startTagMatch.attrs,
          attrsMap: makeAttrsMap(startTagMatch.attrs),
          parent: currentParent,
          children: []
        }

        processIf(element)
        processFor(element)

        if (!root) {
          root = element
        }

        if (currentParent) {
          currentParent.children.push(element)
        }

        stack.push(element)
        currentParent = element
        continue
      }
    } else {
      // 如果不是0 则说明当前需要解析的是文本
      let text = html.substring(0, textEnd)
      advance(textEnd)
      let expression
      if (expression = parseText(text)) {
        // 表达式 如 {{ name }}
        currentParent.children.push({
          type: 2,
          text,
          expression
        })
      } else {
        // 普通文本
        currentParent.children.push({
          type: 3,
          text
        })
      }
      continue
    }
  }
  return root
}

/**
 * 处理html字符串中的文本中的for语法
 * @param el
 */
function processFor(el) {
  let exp
  if ((exp = getAndRemoveAttr(el, 'v-for'))) {
    const inMatch = exp.match(forAliasRE)
    el.for = inMatch[2].trim()
    el.alias = inMatch[1].trim()
  }
}

/**
 * 处if理html字符串中的文本中的语法
 * @param el
 */
function processIf(el) {
  const exp = getAndRemoveAttr(el, 'v-if')
  if (exp) {
    el.if = exp
    if (!el.ifConditions) {
      el.ifConditions = []
    }
    el.ifConditions.push({
      exp: exp,
      block: el
    })
  }
}

/**
 * 根据key获取标签上的属性，这里的属性是AST规范的
 * @param el
 * @param name
 * @return {*}
 */
function getAndRemoveAttr(el, name) {
  // 从 el 的 attrsMap 属性或是 attrsList 属性中取出 name 对应值，并且从attrsList中移除这一项
  let val
  if ((val = el.attrsMap[name]) != null) {
    const list = el.attrsList
    for (let i =0, l = list.length; i < l; i++) {
      if (list[i].name === name) {
        // 移除
        list.splice(i, 1)
        break
      }
    }
  }
  return val
}

/**
 * 解析html字符串中的文本
 * @param text
 * @return {string}
 */
function parseText(text) {
  // 如text为  'hello,{{name}}.'
  // 如果利用正则证明文本字符串内含有表达式，才继续往下执行
  if (!defaultTagRE.test(text)) return

  // 既然文本中即含有表达式，又含有普通文本，那就一并处理
  // 使用一个 tokens 数组来存放解析结果
  const tokens = []

  // 由于defaultTagRE是带有全局匹配标识的，故此需要重置lastIndex
  let lastIndex = defaultTagRE.lastIndex = 0
  let match, index
  // 注意不要再while循环中，定义全局搜索的正则表达式，以为lastIndex会重置，使程序陷入死循环
  while((match = defaultTagRE.exec(text))) {
    index = match.index

    // 6 > 0
    if (index > lastIndex) {
      // 将普通文本push如token中
      tokens.push(JSON.stringify(text).slice(lastIndex, index))
    }

    // match[1]是{{name}}
    // 获取文本内的表达式
    const exp = match[1].trim()
    // 把表达式格式化
    // 如 将 {{ name }} 格式化为 _s(name) 再放入数组中
    tokens.push(`_s(${exp})`)
    lastIndex = index + match[0].length
  }

  if (lastIndex < text.length) {
    tokens.push(JSON.stringify(text.slice(lastIndex)))
  }

  // 最终通过 join 返回表达式。
  // 'hello' + _s(name) + '.';
  return tokens.join('+')
}

/**
 * 解析html字符串中的尾标签
 * @param tagName
 */
function parseEndTag(tagName) {
  // 解析尾标签，它会从 stack 栈中取出最近的跟自己标签名一致的那个元素，将 currentParent 指向那个元素，并将该元素之前的元素都从 stack 中出栈。
  let pos
  for (pos = stack.length - 1; pos >= 0; pos--) {
    if (stack[pos].lowerCasedTag === tagName.toLowerCase()) {
      break
    }
  }
  // 至此已经找到pos,即当前尾标签对应的起始标签在栈中的位置
  if (pos >= 0) {
    // 在栈中删除目标起始标签以上的所有标签
    stack.length = pos
    currentParent = stack[pos]
  }
}

/**
 * 将attrs数组转换成map
 * @param attrs
 */
function makeAttrsMap(attrs) {
  const map = {}
  for (let i = 0, l = attrs.length; i < l; i++) {
    map[attrs[i].name] = attrs[i].value
  }
  return map
}

/**
 * 解析html字符串中的头标签
 * @return {{tagName: string | *, attrs: Array, start: number}}
 */
function parseStartTag() {
  // 首先用 startTagOpen 正则得到标签的头部，可以得到 tagName（标签名称），同时我们需要一个数组 attrs 用来存放标签内的属性。
  const start = html.match(startTagOpen)
  if (start) {
    const match = {
      tagName: start[1],
      attrs: [],
      start: index
    }

    advance(start[0].length)


    // 接下来使用 startTagClose 与 attribute 两个正则分别用来解析标签结束以及标签内的属性。
    // 这段代码用 while 循环一直到匹配到 startTagClose 为止，解析内部所有的属性。
    let end
    let attr
    while(
      !(end = html.match(startTagClose)) &&
      (attr = html.match(attribute))
      ) {
      advance(attr[0].length)
      match.attrs.push({
        name: attr[1],
        value: attr[3]
      })
    }

    // 解析到 起始标签的末尾
    if (end) {
      match.unarySlash = end[1]
      advance(end[0].length)
      match.end = index
      return match
    }
  }
}

function parse () {
  return parseHtml();
}




// —————————————————————————————————————————————————————优化—————————————————————————————————————————————————————
/**
 * 优化AST语法树
 * @param rootAst
 */
function optimize(rootAst) {
  markStatic(rootAst)
  markStaticRoots(rootAst)
}

/**
 * 判断当前节点是否是静态节点
 * @param node
 * @return {boolean}
 */
function isStatic(node) {
  // 表达式节点 不是静态节点
  if (node.type === 2) {
    return false
  }
  // 纯文本节点 是静态节点
  if (node.type === 3) {
    return true
  }
  // 如果表达式中 存在 v-if 或者 v-for 则该节点不是静态节点
  return (!node.if && !node.for)
}

/**
 * 标记当前节点是否是静态节点
 * @param node
 */
function markStatic(node) {
  node.static = isStatic(node)

  // 该节点由头标签产生，一定有children属性，即子节点
  if (node.type === 1) {
    for (let i = 0, l = node.children.length; i < l; i++) {
      const child = node.children[i]
      markStatic(child)
      if (!child.static) {
        // 标记由头标签产生的节点对象 type === 1 的
        node.static = false
      }
    }
  }
}

/**
 * 根据条件标记静态根
 * @param node
 */
function markStaticRoots(node) {
  if (node.type === 1) {
    if (
      node.static &&
      node.children.length &&
      !(
        node.children.length === 1 &&
        node.children[0].type === 3
      )
    ) {
      node.staticRoot = true
      return
    } else {
      node.staticRoot = false
    }
  }
}

// —————————————————————————————————————————————————————生成—————————————————————————————————————————————————————

const AST_RESULT2 = {
  /* 标签属性的map，记录了标签上属性 */
  'attrsMap': {
    ':class': 'c',
    'class': 'demo',
    'v-if': 'isShow'
  },
  /* 解析得到的:class */
  'classBinding': 'c',
  /* 标签属性v-if */
  'if': 'isShow',
  /* v-if的条件 */
  'ifConditions': [
    {
      'exp': 'isShow'
    }
  ],
  /* 标签属性class */
  'staticClass': 'demo',
  /* 标签的tag */
  'tag': 'div',
  /* 子标签数组 */
  'children': [
    {
      'attrsMap': {
        'v-for': "item in sz"
      },
      /* for循环的参数 */
      'alias': "item",
      /* for循环的对象 */
      'for': 'sz',
      /* for循环是否已经被处理的标记位 */
      'forProcessed': true,
      'tag': 'span',
      'children': [
        {
          /* 表达式，_s是一个转字符串的函数 */
          'expression': '_s(item)',
          'text': '{{item}}'
        }
      ]
    }
  ]
}

// 渲染目标 简版

// with(this){
//   return (isShow) ?
//     _c(
//       'div',
//       {
//         staticClass: "demo",
//         class: c
//       },
//       _l(
//         (sz),
//         function(item){
//           return _c('span',[_v(_s(item))])
//         }
//       )
//     )
//     : _e()
// }

// 渲染目标 完整版

// function renderList (val, render) {
//   let ret = new Array(val.length);
//   for (i = 0, l = val.length; i < l; i++) {
//     ret[i] = render(val[i], i);
//   }
// }
//
// render () {
//   return isShow ? (new VNode('div', {
//       'staticClass': 'demo',
//       'class': c
//     },
//     /* begin */
//     renderList(sz, (item) => {
//       return new VNode('span', {}, [
//         createTextVNode(item);
//     ]);
//     })
//     /* end */
//   )) : createEmptyVNode();
// }


function genIf(el) {
  // '_e()' => createEmptyVNode();
  el.ifProcessed = true
  if (!el.ifConditions.length) {
    return '_e()'
  }
  // block九十rootAst对象
  return `(${el.ifConditions[0].exp}) ? ${genElement(el.ifConditions[0].block)} : _e()`
}

// 'alias': "item",
// 'for': 'sz',
function genFor(el) {
  el.forProcessed = true

  const exp = el.for
  const alias = el.alias
  const iterator1 = el.iterator1 ? `,${el.iterator1}` : ''
  const iterator2 = el.iterator2 ? `,${el.iterator2}` : ''

  return`_l((${exp}),` + `function(${alias}${iterator1}${iterator2}){` + `return ${genElement(el)}` + `})`
}

/**
 * 为AST语法树对象中的文本节点 type= 2 | 3 的生成render函数字符串
 * @param el
 * @return {string}
 */
function genText(el) {
  return `_v(${el.expression})`
}

function genElement(el) {
  if (el.if && !el.ifProcessed) {
    return genIf(el)
  }else if (el.for && !el.forProcessed) {
    return genFor(el)
  } else {
    const children = genChildren(el)
    let code
    code = `_c('${el.tag},'{staticClass: ${el.attrsMap && el.attrsMap['class']},class: ${el.attrsMap && el.attrsMap[':class']},}${children ? `,${children}` : ''})`
    return code
  }
}

/**
 * 为AST语法树对象中的children属性生成render函数字符串
 * @param el
 * @return {string}
 */
function genChildren(el) {
  const children = el.children

  if (children && children.length > 0) {
    return `${children.map(genNode).join(',')}`
  }
}

/**
 * 生成节点render字符串
 * @param el
 * @return {string}
 */
function genNode(el) {
  // 节点类型有两种：标签、文本
  if (el.type === 1) {
    return genElement(el)
  } else {
    return genText(el)
  }
}

function generate(rootAst) {
  const code = rootAst ? genElement(rootAst) : '_c("div")'
  return {
    render: `with(this){return ${code}}`,
  }
}

var html = '<div :class="c" class="demo" v-if="isShow"><span v-for="item in sz">{{ item }}</span></div>';
const ast = parse();
optimize(ast);
console.log('ast抽象语法树对象', ast)
const code = generate(ast);
console.log('render函数字符串', code)
