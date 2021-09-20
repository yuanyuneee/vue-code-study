// 1. install
// 2. state,将state变成响应式数据
// 3. 注册全局变量$store
// 4. mutation, commit方法

let Vue;
class Store {
    constructor(options) {
        this.$options = options;
        this._state = options.state;
        this._mutations = options.mutations;
        this._actions = options.actions
        this._getters = options.getters;

        let computed = {};
        this.getters = {};
        const store = this;
        Object.keys(this._getters).forEach(key => {
            const fn = store._getters[key];
            computed[key] = function () {
                return fn(store.state);
            }

            // Object.defineProperties(store.getters, {
            //     [key]: {
            //         get() {
            //             return store._vm[key];
            //         }
            //     }
            // })

            Object.defineProperty(store.getters, key, {
                get() {
                    return store._vm[key];
                }
            })
        })

        console.log(computed)

        this._vm = new Vue({
            data: function () {
                return {
                    $$state: options.state
                }
            },
            computed
        });

        // 为什么要用bind
        this.commit = this.commit.bind(this);
        this.dispatch = this.dispatch.bind(this);
    }

    get state() {
        return this._vm._data.$$state
    }

    set state(v) {
        console.error('请通过mutations修改')
    }

    commit(event, val) {
        const entry = this._mutations[event];
        if (!entry) {
            console.error('error');
            return
        }
        entry(this.state, val);
    }

    dispatch(event, val) {
        const entry = this._actions[event];
        if (!entry) {
            console.error('error');
            return
        }
        entry(this, val);
    }

}

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

export default {Store, install};
