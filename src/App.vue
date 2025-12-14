<script setup>
  import { useStore } from './vuex'
  const store = useStore("my")
  store.subscribe(({type,payload})=>{
    console.log(type,payload)
  })
  
</script>

<template>
  hello
      count{{ $store.state.count }}
    <br>
    <!-- doubleCount{{ store.getters.doubleCount }} -->
  <div>

  </div>
  <div>
    <button @click="$store.commit('add');console.log($store.state.count);">
      increment
    </button>
    <button @click="store.dispatch('addAsync')">
      addAsync
    </button>
    <button @click="$store.state.count--">
      错误的修改(直接修改不用commit)
    </button>
  </div>
  <br><h2>module</h2>
  acount:{{ $store.state.aCount.count }}
  <br>
  <button @click="$store.commit('aCount/add')">
    aCount/increment
  </button>
  <button @click="store.dispatch('aCount/addAsync')">
    aCount/addAsync
  </button>
  bcount:{{ $store.state.bCount.count }}
  <br>
  <button @click="$store.commit('bCount/add')">
    bCount/increment
  </button>
  <button @click="store.dispatch('bCount/addAsync')">
    bCount/addAsync
  </button>
  ccount:{{ $store.state.aCount.cCount.count }}
  <br>
  <button @click="$store.commit('aCount/cCount/add')">
    cCount/increment
  </button>
  <button @click="store.dispatch('aCount/cCount/addAsync')">
    cCount/addAsync
  </button>
  <hr>
  <button @click="$store.registerModule(['bCount','dCount'],{
    namespaced:true,
    state:{
      count: 666
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
  });console.log($store.state)"> 动态导入</button>
  dcount:{{ $store.state.bCount.dCount }}
  <button @click="$store.commit('bCount/dCount/add')">
    dCount/increment
  </button>
</template>

