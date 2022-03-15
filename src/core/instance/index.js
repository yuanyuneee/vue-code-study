import { initMixin } from './init'
import { stateMixin } from './state'
import { renderMixin } from './render'
import { eventsMixin } from './events'
import { lifecycleMixin } from './lifecycle'
import { warn } from '../util/index'

// 构造函数声明
function Vue (options) {
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  // 初始化
  this._init(options)
}

// 初始化实例方法和属性
// 实现init函数
initMixin(Vue)
// 状态相关api,$data,$props,$set,$delete,$watch
stateMixin(Vue)
// 事件相关，$on,$once,$off,$emit
eventsMixin(Vue)
// 生命周期api,_update,$forceUpdate,$destory
lifecycleMixin(Vue)
// 渲染api,_render,$nextTick
renderMixin(Vue)

export default Vue
