import Vue from 'vue'
import Vuex from './Kvuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    counter: 1
  },
  mutations: {
    add(state) {
      state.counter++;
    }
  },
  actions: {
    add({commit}) {
      setTimeout(() => {
        commit('add')
      }, 1000);
    }
  },
  getters: {
    double(state) {
      console.log(state.counter)
      return state.counter * 2;
    }
  }

})
