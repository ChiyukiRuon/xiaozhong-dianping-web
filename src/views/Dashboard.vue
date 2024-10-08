<script setup lang="ts">
import store from '../store'

console.log('store', store.state)
</script>

<template>
    <el-container style="width: 100vw; height: 100vh">
        <el-header class="header">
            <div><img class="icon" src="../../public/icon.png" alt="icon" width="50vw"/></div>
            <div class="title">小众点评</div>
            <div class="right">
                <div class="user-info" @click.prevent="">
                    {{ store.state.userInfo.nickname || store.state.userInfo.username }}
                </div>
            </div>
        </el-header>
        <el-main style="height: 100%">
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

.right {
    margin-left: auto;
    margin-right: 2vw;
}

.user-info {
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
</style>