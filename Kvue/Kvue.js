class Kvue {
    constructor(options) {
        this.$options = options;
        this.$data = options.data;

        observe(options.data)
        // 代理到实例上
        proxy(this)
    }
}

function proxy(vm) {
    Object.keys(vm.$data).forEach(key => {
        defineReactive(vm, key, vm.$data[key])
    })

}

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
