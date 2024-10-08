<script setup lang="ts">
import { Location } from '@element-plus/icons-vue'
import { onMounted, ref } from 'vue'
import Login from '../components/Login.vue'
import { getPublicKey } from '@/request/api'
import store from '@/store'
import type { response } from '@/interface/api'

const input = ref('')
const loginView = ref(false)
const login = () => {
    loginView.value = !loginView.value
}

onMounted(() => {
    if (store.state.publicKey === '') {
        getPublicKey().then((res: response) => {
            if (res.code === 200) {
                console.log('获取密钥', res.data.key)
                store.commit('setPublicKey', res.data.key)
            }
        })
    }
})
</script>

<template>
    <el-container style="width: 100vw; height: 100vh">
        <el-header class="header">
            <div><img class="icon" src="../../public/icon.png" alt="icon" width="50vw"/></div>
            <div class="title">小众点评</div>
            <div class="location">
                <el-icon class="el-icon"><Location /></el-icon>
                <div>杭州</div>
            </div>
            <div class="search-bar">
                <el-input
                    class="search-input"
                    v-model="input"
                    placeholder="输入美食或商家名"
                >
                    <template #append>搜索</template>
                </el-input>
            </div>
            <div class="right">
                <div class="login-btn" @click.prevent="login">
                    登录/注册
                </div>
            </div>
        </el-header>
        <el-main style="height: 100%">
            <Login></Login>
        </el-main>
    </el-container>

    <el-dialog v-model="loginView" top="25vh" width="820" style="height: 430px">
        <Login style="height: 100%;"></Login>
    </el-dialog>
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

.el-icon {
    width: 1.6vw;
    display: flex;
    align-items: center;
    margin-right: 0.2vw;
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

.location {
    display: flex;
    align-items: center;
    margin-left: 1vw;
    color: #FFFFFF;
    font-size: 1.1vw;
}

.search-bar {
    width: 30vw;
    margin-left: 5vw;

    /deep/.el-input__wrapper {
        border-top-left-radius: 50px;
        border-bottom-left-radius: 50px;
    }

    /deep/.el-input-group__append {
        border-top-right-radius: 50px;
        border-bottom-right-radius: 50px;
        padding: 0 25px 0 15px;
    }
}

.right {
    margin-left: auto;
    margin-right: 2vw;
}

.login-btn {
    width: auto;
    height: 30px;
    padding: 0 20px;
    background-color: #FFFFFF;
    border-radius: 50px;
    color: var(--theme-color);
    font-size: 1vw;
    letter-spacing: 2px;
    transition: 0.5s;
}

.login-btn:hover {
    cursor: pointer;
    background-color: #B3DFFC;
    color: #FFFFFF;
    box-shadow: 2px 2px 4px 0 rgba(0, 0, 0, 0.2);
    transition: 0.5s;
}
</style>
