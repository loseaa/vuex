import { computed, inject, normalizeClass, reactive, watch } from "vue"

export function createStore(option){
    let store = new Store(option)
    return store
}



function normalizeOption(option){
    let root={
        state:option.state,
        _raw:option,
        _children:{},
        namespaced:option.namespaced || false
    }
    if(option.modules){
        normalizeChildren(root, option.modules)
    }
    return root
}

function normalizeChildren(parent, children){
    for(let key in children){
        let child = children[key]
        let normalizedChild = {
            state:child.state,
            _raw:child,
            _children:{},
            namespaced:child.namespaced || false
        }
        parent._children[key] = normalizedChild
        if(child.modules){
            normalizeChildren(normalizedChild, child.modules)
        }
    }
}

function parseState(root){
    let state={}
    Object.assign(state, root.state)
    for(let key in root._children){
        let child = root._children[key]
        state[key] = parseState(child)
    }
    return state
}

function parseMutation(root,state,store){
    let mutations={}
    for(let key in root._raw.mutations){
        mutations[key]?mutations[key]:mutations[key]=[]
        mutations[key].push(withCommit((payload)=>{
            root._raw.mutations[key].call(state, state, payload)
        },store))
    }
    let path=[]
    for(let key in root._children){
        parseChildMutation(root._children[key], mutations,path,key,state,store)
    }
    return mutations
}

function getState(path,state){
    let currentState=state
    for(let key of path){
        currentState=currentState[key]
    }
    return currentState
}

function withCommit(fn,store){
    return (payload)=>{
        store.isCommiting=true
        fn(payload)
        store.isCommiting=false
    }
}

function parseChildMutation(child, mutations, path,key,state,store){
    if(child.namespaced){
        path.push(key)
    }
    for(let k in child._raw.mutations){
        mutations[path.join('/')+"/"+k]?mutations[path.join('/')+"/"+k]:mutations[path.join('/')+"/"+k]=[]
        let currentState=getState(child.namespaced?path:path.concat(key),state)
        mutations[path.join('/')+"/"+k].push(withCommit((payload)=>{
            child._raw.mutations[k].call(currentState, currentState, payload)
        },store))
    }
    if(child._children){
        for(let key in child._children){
            parseChildMutation(child._children[key], mutations,path,key,state,store)
        }
    }
    path.pop()
}

function parseAction(root,store){
    let actions={}
    for(let key in root._raw.actions){
        actions[key]?actions[key]:actions[key]=[]
        actions[key].push((payload)=>{
            let res=root._raw.actions[key].call(store.state, store, payload)
            return Promise.resolve(res)
        })
    }
    let path=[]

    for(let key in root._children){
        parseChildAction(root._children[key], actions,path,key,store)
    }
    return actions
}

function parseChildAction(child, actions, path,key,store){
    if(child.namespaced){
        path.push(key)
    }
    for(let k in child._raw.actions){
        actions[path.join('/')+"/"+k]?actions[path.join('/')+"/"+k]:actions[path.join('/')+"/"+k]=[]
        let currentState=getState(child.namespaced?path:path.concat(key),store.state)
        actions[path.join('/')+"/"+k].push((payload)=>{
            let res=child._raw.actions[k].call(currentState, store, payload)
            return Promise.resolve(res)
        })
    }
    if(child._children){
        for(let key in child._children){
            parseChildAction(child._children[key], actions,path,key,store)
        }
    }
    path.pop()
}


class Store{
    constructor(option){
        // this._state=reactive({data:option.state})
        // this.getters = Object.keys(option.getters).reduce((obj, key) => {
        //     obj[key] = computed(() => option.getters[key](this.state))
        //     return obj
        // }, {})
        
        // this.actions = Object.keys(option.actions).reduce((obj, key) => {
        //     obj[key] = (payload) => option.actions[key](this, payload)
        //     return obj
        // }, {})
        let normalizedOption = normalizeOption(option)
        this.root=normalizedOption
        this._state=reactive({data:parseState(normalizedOption)})
        this.mutations = parseMutation(normalizedOption,this._state.data,this)
        this.actions=parseAction(normalizedOption,this)
        this.isCommiting=false;
        this.subscribers=[]
        this.strict=option.strict || false
        
        if(this.strict){
            watch(()=>this._state,(newState,oldState)=>{
                if(!this.isCommiting){
                    console.assert(false,"mutations must be commited by using store.commit")
                }
            },{deep:true,flush:"sync"})
        }
        option.plugins.forEach(plugin=>plugin(this))
    }

    get state(){
        return this._state.data
    }
    install(app, name="default"){
        app.config.globalProperties.$store = this
        app.provide(name, this)
    }
    dispatch=(type, payload)=>{
        for(let action of this.actions[type]){
            action(payload)
        }
    }
    commit=(type, payload)=>{        
        for(let mutation of this.mutations[type]){
            mutation(payload)
        }
        this.subscribers.forEach(fn=>fn({type,payload},this.state))
    }

    subscribe=(fn)=>{
        this.subscribers.push(fn)
    }

    replaceState=(newState)=>{
        withCommit(()=>{
            this._state.data=newState
        },this)()
    }

    registerModule=(path,module)=>{
        let normalizedModule=normalizeOption(module)
        let target=this.root._children
        let tar=path.slice(0,-1).reduce((obj,key)=>{
            obj[key]?obj[key]:obj[key]={_children:{}}
            return obj[key]._children
        },target)
        tar[path[path.length-1]]=normalizedModule
        withCommit(()=>{
            updateState(path,module,this._state.data)
        },this)()
        this.mutations = parseMutation(this.root,this._state.data,this)
        this.actions=parseAction(this.root,this)
       debugger
        
    }
}
function updateState(path,module,state){
    let currentState=getState(path.slice(0,-1),state)
    currentState[path[path.length-1]]=module.state
}



export function useStore(name="default"){
    return inject(name)
}

