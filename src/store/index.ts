import { createStore } from 'vuex'

export default createStore({
    state: {
        publicKey: '',
        userInfo: {},
    },
    mutations: {
        setPublicKey(state: any, publicKey: string) {
            state.publicKey = publicKey
        },
        setUserInfo(state: any, userInfo: object) {
            state.userInfo = userInfo
        }
    },
    actions: {},
    modules: {}
})