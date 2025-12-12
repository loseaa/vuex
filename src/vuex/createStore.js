import { computed, inject, reactive } from "vue"

export function createStore(option){
    let store = new Store(option)

    return store
}

class Store{
    constructor(option){
        this.state = reactive(option.state)
        this.getters = Object.keys(option.getters).reduce((obj, key) => {
            obj[key] = computed(() => option.getters[key](this.state))
            return obj
        }, {})
        this.mutations = Object.keys(option.mutations).reduce((obj, key) => {
            obj[key] = (payload) => option.mutations[key](this.state, payload)
            return obj
        }, {})
        this.actions = Object.keys(option.actions).reduce((obj, key) => {
            obj[key] = (payload) => option.actions[key](this, payload)
            return obj
        }, {})
        
    }
    install(app, name="default"){
        app.config.globalProperties.$store = this
        app.provide(name, this)
    }
    dispatch=(type, payload)=>{
        this.actions[type](payload)
    }
    commit=(type, payload)=>{
        this.mutations[type](payload)
    }
}

export function useStore(name="default"){
    return inject(name)
}

