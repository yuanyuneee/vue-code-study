### Vue-router

#### 需求

1. 根据路由展示对应组件
2. spa页面不能刷新
   1. history
   2. hash



#### 实现思路

1. 插件需要实现install方法
2. 实现两个全局组件
3. 注册全局变量$router
4. 数据响应式，根据地址重新渲染页面
5. 实现嵌套路由，否则router-view会一直嵌套渲染同一个组件，死循环


### install方法
```
Krouter.install = function (_vue) {
    ...
}

export default Krouter;
```

### 实现两个全局组件
### router-view
1. 自下向上递归遍历树节点，确定当前router-view的层级，标记当前深度
```js
// 每一个router-view都给一个标志
this.$vnode.data.routerView = true;
let depth = 0;
let parent = this.$parent;
// 遍历，标记当前深度
while (parent) {
    if (parent) {
        if (parent.$vnode && parent.$vnode.data.routerView) {
            depth++;
        }
    }

    parent = parent.$parent;
}

```
2. 根据嵌套组件数组显匹配组件
```js
route = this.$router.matched[depth];

if (route) {
    component = route.component;
}
return h(
    component
)
```
### router-link
1. 获取默认插槽作为链接文字
```js
this.$slots.default
```
2. 获取属性to作为跳转地址
```js
props: {
    to: {
        type: String,
        required: true
    }
}
...
return h(
'a',   // 标签名称
{
    attrs: {
        href: "#" + this.to,
    },
},
this.$slots.default,
)

```

### 注册全局变量
```js
// 全局混入目的：延迟下面逻辑到router创建完毕并且附加到选项上时才执行
// 只有创建根实例的时候创建了Router实例
Vue.mixin({
    beforeCreate() {
        // 这里的this是指根实例和组件
        // 只有根实例上有router选项，保证了只建一次
        if (this.$options.router) {
            Vue.prototype.$router = this.$options.router;
        }
    }
})
```

### 根据路径变化渲染组件

```js
// 当前路径，去掉#
this.current = window.location.hash.slice(1) || '/';
// 定义响应式的匹配数组
// router-view中使用了matched数组，依赖收集机制会在数组变化之后重新渲染router-view组件
Vue.util.defineReactive(this, 'matched', [])
this.match()


// 监听hashchange
window.addEventListener("hashchange", () => {
    this.current = window.location.hash.slice(1);
    this.matched = [];
    // 路由变化重新匹配
    this.match() 
});

match(routes) {
    let routers = routes || this.$options.routes;
    routers.map(route => {
        // 首页需要完全匹配
        if (route.path === '/' && this.current === '/') {
            this.matched.push(route);
            return;
        } else if (route.path !== '/' && this.current.indexOf(route.path) > -1) {
            this.matched.push(route);
            // 如果有嵌套循环
            if (route.children) {
                this.match(route.children);
            }
        }
    })


}
}

```

### 嵌套路由的解决
1. mathed数据响应式
2. 根据路径，在路由表中匹配层级


## vuex
### install方法
```js
class Store {}

function install(_vue) {}

export default {Store, install};

```

### state,将state变成响应式数据
```js
// 利用Vue，挂载到this._vm
this._vm = new Vue({
    data: function () {
        return {
            $$state: options.state
        }
    },
});

get state() {
    return this._vm._data.$$state
}

// state只读
set state(v) {
    console.error('请通过mutations修改')
}
```

### 注册全局变量$store
和$router一样的操作
```js
function install(_vue) {
    Vue = _vue;

    Vue.mixin({
        beforeCreate() {
            if (this.$options.store) {
                Vue.prototype.$store = this.$options.store;
            }
        }
    })
}
```

### mutation, commit方法
1. Mutation通过store.commit触发，Mutation 必须是同步函数
2. Action 通过 store.dispatch 方法触发；Action 提交的是 mutation，而不是直接变更状态，Action 可以包含任意异步操作。
```js
// store传入的参数
this._mutations = options.mutations;
this._actions = options.actions


// 绑定this,避免异步操作时找不到this
this.commit = this.commit.bind(this);
this.dispatch = this.dispatch.bind(this);
...

commit(event, val) {
    // 获取事件
    const entry = this._mutations[event];
    if (!entry) {
        console.error('error');
        return
    }
    // 传入参数并执行
    entry(this.state, val);
}

// dispatch推送一个action。
dispatch(event, val) {
    const entry = this._actions[event];
    if (!entry) {
        console.error('error');
        return
    }
    // 和commit一样的写法，但是如果actions是异步操作的话，this不知道指向谁了，需要绑定this
    entry(this, val);
}

```

### getter的实现
```js
let computed = {};
this.getters = {};
const store = this;
Object.keys(this._getters).forEach(key => {
    // 拿到方法
    const fn = store._getters[key];
    computed[key] = function () {
        // 传入参数执行，返回执行结果
        return fn(store.state);
    }
    // 设置只读属性
    Object.defineProperty(store.getters, key, {
        get() {
            return store._vm[key];
        }
    })
})


this._vm = new Vue({
    data: function () {
        return {
            $$state: options.state
        }
    },
    // 利用Vue的计算属性，需要的格式是无参函数() => {}
    computed
});
```