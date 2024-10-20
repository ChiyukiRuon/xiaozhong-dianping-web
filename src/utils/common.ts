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
    void router.replace('/home')
    router.addRoute({ path: '/dashboard', name: 'dashboard', component: () => import('../views/Dashboard.vue')})
}

/**
 * 用户信息更新
 *
 * @return void
 * */
export const updateUserInfo = (userInfo: object) => {
    store.commit('setUserInfo', userInfo)
    localStorage.setItem('userInfo', JSON.stringify(userInfo))
}

/**
 * 审核类型格式化
 *
 * @param type 审核类型
 * @return 格式化后的审核类型
 * @author ChiyukiRuon
 * */
export const formatVerificationType = (type: string): string => {
    switch (type) {
        case 'register':
            return '商家申请'
        case 'nickname':
            return '昵称违规'
        case 'avatar':
            return '头像违规'
        case 'intro':
            return '简介违规'
        case 'phone':
            return '手机号无效'
        case 'email':
            return '邮箱无效'
        case 'address':
            return '地址无效'
        case 'annex':
            return '资质无效'
        default:
            return type
    }
}

/**
 * 上架状态格式化
 *
 * @param status 上架状态
 * @return 格式化后的上架状态
 * @author ChiyukiRuon
 * */
export const formatStatus = (status: number|string): string|number => {
    switch (status) {
        case 0:
            return '已下架'
        case 1:
            return '已上架'
        case '已下架':
            return 0
        case '已上架':
            return 1
        default:
            return '未知'
    }
}
