import { createStore } from 'vuex'
import type { MenuItem } from '@/interface'

export default createStore({
    state: {
        publicKey: '',
        path: '',
        route: {},
        userInfo: {},
    },
    mutations: {
        clear(state: any) {
            state.path = ''
            state.route = {}
            state.userInfo = {}
        },
        setPublicKey(state: any, publicKey: string) {
            state.publicKey = publicKey
        },
        setPath(state: any, path: string) {
            state.path = path
        },
        setRoute(state: any, route: MenuItem) {
            state.route = route
        },
        setUserInfo(state: any, userInfo: object) {
            state.userInfo = userInfo
        }
    },
    actions: {},
    modules: {}
})