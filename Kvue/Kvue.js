class Kvue {
    constructor(options) {
        this.$options = options;
        this.$data = options.data;

        observe(options.data)
        // 代理到实例上
        proxy(this)

        // 编译模板
        new Compile(options.el, this)
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
                // console.log('set', newval)
                val = newval
                // 如果直接对属性赋值为对象，如果不再次调用，则无法响应式
                observe(newval)
            }
        },
        get() {
            // console.log('get', key, ':', val)
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


class Compile {
    constructor(el, vm) {
        this.$vm = vm;
        this.$el = document.querySelector(el);

        if (this.$el) {
            this.compile(this.$el)
        }
    }


    compile(el) {
        const childNodes = el.childNodes;
        Array.from(childNodes).map(node => {
            // 是否是元素
            if (this.isELement(node)) {
                console.log('ele', node.nodeName)
                const attrs = node.attributes;
                Array.from(attrs).forEach(attr => {
                    // 是否是指令
                    const attrName = attr.name;
                    const exp = attr.value;
                    console.log(this.isDir(attrName))
                    if (this.isDir(attrName)) {
                        const dir = attrName.substring(2);
                        console.log(dir)
                        this[dir] && this[dir](exp, node);
                    }
                })
                // 递归，遍历子节点
                if (node.childNodes && node.childNodes.length > 0) {
                    this.compile(node);
                }
            } else if (this.isText(node)) { // 是否是文本
                console.log('text', node.textContent)
                this.compileText(node)
            }
        })


    }


    text(exp, node) {
        node.textContent = this.$vm[exp];
    }

    html(exp, node) {
        node.innerHTML = this.$vm[exp];
    }
    // 判断是否是动态指令
    isDir(name) {
        return name.startsWith('k-');
    }

    compileText(node) {
        console.log(this.$vm.counter)
        node.textContent = this.$vm[RegExp.$1];
    }

    // 判断是否是编译元素
    isELement(node) {
        return node.nodeType === 1;
    }

    // 判断是否是文本元素
    isText(node) {
        return node.nodeType == 3 && /\{\{(.*)\}\}/.test(node.textContent);
    }
}
