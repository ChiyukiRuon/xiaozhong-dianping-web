<script setup lang="ts">
import store from '../store'
import * as ElIcon from '@element-plus/icons-vue'
import type { MenuItem, UserInfo } from '@/interface'
import { logout } from '@/utils/common'
import { onMounted } from 'vue'
import router from '@/router'
import { ElMessage } from 'element-plus'

const userRoute: MenuItem[] = store.state.route
const userInfo: UserInfo = store.state.userInfo

try {
    userRoute.forEach((route: MenuItem) => {
        router.addRoute('dashboard', {
            path: route.path,
            name: route.title,
            component: () => import('../views/' + userInfo.role + '/' + route.component + '.vue')
        })
    })
} catch (error) {
    console.error('获取路由失败:', error)
}

onMounted(() => {
    const token = localStorage.getItem('token')

    if (!token) {
        ElMessage.warning('未登录，请先登录')
        router.push('/')
    } else if (store.state.path !== '/') {
        router.push(store.state.path)
    }
})
</script>

<template>
    <el-container style="width: 100vw; height: 100vh">
        <el-header class="header">
            <div><img class="icon" src="../../public/icon.png" alt="icon" width="50vw"/></div>
            <div class="title">小众点评</div>
            <div class="sub-title">
                <div v-if="userInfo.role === 'admin'">管理后台</div>
                <div v-else>商家后台</div>
            </div>
            <el-popover :offset="-5">
                <template #reference>
                    <div class="right">
                        <div class="user-info" @click.prevent="">
                            {{ store.state.userInfo.nickname || store.state.userInfo.username }}
                        </div>
                        <img class="avatar" :src="store.state.userInfo.avatar" alt="avatar" width="45vw"/>
                    </div>
                </template>
                <template #default>
                    <el-button type="danger" @click="logout()" style="width: 100%">退出</el-button>
                </template>
            </el-popover>
        </el-header>
        <el-main style="height: 100%; padding: 0">
            <el-container style="height: 100%">
                <el-aside class="aside">
                    <el-menu router>
                        <el-menu-item
                            v-for="(route, index) in userRoute"
                            :key="index"
                            :index="'/dashboard/'+route.path"
                            class="menu-item"
                        >
                            <component :is="ElIcon[route.icon as keyof typeof ElIcon]" class="menu-icon" />
                            <span>{{ route.title }}</span>
                        </el-menu-item>
                    </el-menu>
                </el-aside>
                <el-main>
                    <router-view />
                </el-main>
            </el-container>
        </el-main>
    </el-container>
</template>

<style scoped>
.header {
    display: flex;
    background-color: #7CB8F2;
    color: #333;
    line-height: 70px;
}

.header div {
    display: flex;
    align-items: center;
}

.icon {
    margin-left: 1vw;
    filter: drop-shadow(1px 1px 1px rgba(0, 0, 0, 0.5));
}

.title {
    margin-left: 1vw;
    font-size: 1.5vw;
    font-weight: bold;
    color: #FFFFFF;
}

.sub-title {
    margin-left: 1vw;
    font-size: 1vw;
    color: #FFFFFF;
}

.right {
    margin-left: auto;
    margin-right: 1vw;
}

.user-info {
    width: auto;
    height: 30px;
    padding: 0 2vw 0 20px;
    background-color: #FFFFFF;
    border-radius: 50px;
    color: var(--theme-color);
    font-size: 1vw;
    letter-spacing: 2px;
    transition: 0.5s;
    z-index: 1;
}

.right img {
    position: relative;
    right: 1.5vw;
    border: 2px solid #FFFFFF;
    border-radius: 100%;
    z-index: 4;
}

.aside {
    width: 10vw;
    min-width: 150px;
    background-color: #FFFFFF
}

.menu-item {
    display: flex;
    align-items: center;
}

.menu-icon {
    width: 15px;
    margin-right: 0.2vw;
}
</style>