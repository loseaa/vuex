import { createStore } from '../vuex'
export default createStore({
  state: {
    count: 3
  },
  getters: {
    doubleCount(state) {
      return state.count * 2
    }
  },
  mutations: {
    increment(state) {
      state.count++
    }
  },
  actions: {
    incrementAsync({ commit }) {
      setTimeout(() => {
        commit('increment')
      }, 1000)
    }
  }
})
