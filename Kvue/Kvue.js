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
    const dep = new Dep();
    Object.defineProperty(obj, key, {
        set(newval) {
            if (val != newval) {
                // console.log('set', newval)
                val = newval
                // 如果直接对属性赋值为对象，如果不再次调用，则无法响应式
                observe(newval)
                dep.notify()
            }
        },
        get() {
            // console.log('get', key, ':', val)
            Dep.target && dep.addDep(Dep.target)
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
                    console.log('attrName',attrName,this.isEvent(attrName))
                    // 以k-开头
                    if (this.isDir(attrName)) {
                        const dir = attrName.substring(2);
                        console.log(dir)
                        this[dir] && this[dir](exp, node);
                    }
                    // 以@开头
                    if (this.isEvent(attrName)) {
                        const dir = attrName.substring(1);
                        this.eventHandler(exp, node, dir);
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

    // 传入节点,指令名，使用的key
    update(node, dir, exp) {
//    1. 第一次视图渲染
        const fn = dir + 'Update';
        this[fn] && this[fn](node, this.$vm[exp])

   // 2. new watcher，为响应式更新视图更新做准备
        new Watcher(this.$vm, exp, (val) => {
            // 闭包，可以继续使用此处的node节点
            // console.log('this', this)
            this[fn] && this[fn](node, val)
        })
    }

    text(exp, node) {
        this.update(node, 'text', exp)
    }

    textUpdate(node, val) {
        node.textContent = val;
    }

    html(exp, node) {
        node.innerHTML = this.$vm[exp];
    }

    eventHandler(exp, node, dir) {
        node.addEventListener(dir, () => {
            this.$vm.$options.methods[exp].apply(this.$vm)
        })
    }

    // 判断是否是动态指令
    isDir(name) {
        return name.startsWith('k-');
    }

    // 判断是否是事件
    isEvent(name) {
        return name.startsWith('@');
    }

    // 解析动态属性
    compileText(node) {
        this.update(node, 'text', RegExp.$1)
        // node.textContent = this.$vm[RegExp.$1];
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

// 每一个视图都对应一个watcher
class Watcher {
    constructor(vm, key, updateFn) {
        this.$vm = vm;
        this.key = key;
        this.updateFn = updateFn;

        Dep.target = this;
        this.$vm[key];
        Dep.target = null
    }
    update() {
        // 绑定this为$vm,传入val
        // this为什么要指向this.$vm，去掉好像也行?
        // this.updateFn.call(this.$vm, this.$vm[this.key])
        this.updateFn(this.$vm[this.key])
    }
}

class Dep {
    constructor() {
        this.deps = [];
    }

    addDep(dep) {
        this.deps.push(dep)
    }

    // 通知视图更新
    notify() {
        this.deps.forEach(dep => {
            console.log(dep)
            dep.update()
        })
    }
}
