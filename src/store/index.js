import { createStore } from '../vuex'
let store= createStore({
  // 严格模式 开启后，任何 mutation 都必须通过 commit 函数触发，不能直接修改 state
  strict: true,
  plugins: [
    (store) => {
        let state=JSON.parse(localStorage.getItem("VUEX_PERSIST"))
        state&&store.replaceState(state)
        store.subscribe(({ type, payload },state) => {
            localStorage.setItem("VUEX_PERSIST",JSON.stringify(state))
        })
    }
  ],
  state: {
    count: 3
  },
  getters: {
    doubleCount(state) {
      return state.count * 2
    }
  },
  mutations: {
    add(state) {
      state.count++
    }
  },
  actions: {
    addAsync({ commit }) {
      setTimeout(() => {
        commit('add')
      }, 1000)
    }
  },
  modules: {
    aCount: {
      namespaced: true,
      state: {
        count: 1
      },
      mutations: {
        add(state) {
          state.count++
        }
      },
      actions: {
        addAsync({ commit }) {
          setTimeout(() => {
            commit('add')
          }, 1000)
        }
      },
      modules:{
        cCount:{
          state:{
            count: 3
          },
          mutations: {
            add(state) {
              state.count++
            }
          },
          actions: {
            addAsync({ commit }) {
              setTimeout(() => {
                commit('add')
              }, 1000)
            }
          }
        }
      }
    },
    bCount: {
      namespaced: true,
      state: {
        count: 2
      },
      mutations: {
        add(state) {
          state.count++
        }
      },
      actions: {
        addAsync({ commit }) {
          setTimeout(() => {
            commit('bCount/add')
          }, 1000)
        }
      }
      
    }
  }
})



export default store