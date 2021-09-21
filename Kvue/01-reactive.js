function defineReactive(obj, key, val) {
    // 递归嵌套对象
    observe(val);
    Object.defineProperty(obj, key, {
        set(newval) {
            if (val != newval) {
                console.log('set', newval)
                val = newval
                // 如果直接对属性赋值为对象，如果不再次调用，则无法响应式
                observe(newval)
            }
        },
        get() {
            console.log('get', key, ':', val)
            return val;
        }
    })
}

function observe(obj) {
    // 如果obj不是对象或者为空，则不进行下一层遍历
    if (typeof obj !== 'object' || obj === null) return;
    Object.keys(obj).forEach(key => {
        defineReactive(obj, key, obj[key])
    })
}

const obj = {foo:'foo',bar:'bar',baz:{a:1}}
observe(obj)

// 动态添加属性，也可以响应式
function set(obj, key, val) {
    defineReactive(obj, key, val)
}

// obj.foo
// obj.foo = 'foooooooooooo'
// obj.bar
// obj.bar = 'barrrrrrrrrrr'
// // obj.baz
// obj.baz.a
// obj.baz.a = 10 // 嵌套对象no ok
// set(obj, 'dong', 'dong')
// obj.dong
obj.baz = {
    b:2
}
obj.baz.b
