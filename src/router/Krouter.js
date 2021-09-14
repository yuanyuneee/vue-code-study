// 1. install
// 2. 注册两个组件
// 3. 注册全局变量
//
let Vue;
class Krouter {
    constructor(options) {
        this.$options = options;

        // 初始变量
        const initial = window.location.hash.slice(1) || '/';
        // 把current变成响应式数据
        Vue.util.defineReactive(this, 'current', initial)

        // 监听hashchange
        window.addEventListener("hashchange", () => {
            this.current = window.location.hash.slice(1);
        });
    }
}

Krouter.install = function (_vue) {
    Vue =  _vue;

    // 全局混入目的：延迟下面逻辑到router创建完毕并且附加到选项上时才执行
    // 只有创建根实例的时候创建了Router实例
    Vue.mixin({
        beforeCreate() {
            if (this.$options.router) {
                Vue.prototype.$router = this.$options.router;
            }
        }
    })

    Vue.component('router-view', {
        render: function (h) {
            let component = null;
            const routes = this.$router.$options.routes;
            const route = routes.find(i => i.path == this.$router.current);
            if (route) {
                component = route.component;
            }
            return h(
                component
            )
        }
    });

    Vue.component('router-link', {
        render: function (h) {
            return h(
                'a',   // 标签名称
                {
                    attrs: {
                        href: "#" + this.to,
                    },
                },
                this.$slots.default,
            )
        },
        props: {
            to: {
                type: String,
                required: true
            }
        }
    });
};

export default Krouter;
