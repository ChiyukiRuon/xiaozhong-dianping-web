import store from '@/store'
import router from '@/router'

/**
 * 用户登出
 *
 * @return void
 * @author ChiyukiRuon
 * */
export const logout = () => {
    localStorage.clear()
    store.commit('clear')
    void router.replace('/')
    router.addRoute({ path: '/dashboard', name: 'dashboard', component: () => import('../views/Dashboard.vue')})
}
