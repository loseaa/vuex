<script setup>
  import { useStore } from './vuex'
  const store = useStore("my")
  
</script>

<template>
  hello
      count{{ $store.state.count }}
    <br>
    doubleCount{{ store.getters.doubleCount }}
  <div>

  </div>
  <div>
    <button @click="$store.commit('increment')">
      increment
    </button>
    <button @click="store.dispatch('incrementAsync')">
      incrementAsync
    </button>
  </div>
</template>

