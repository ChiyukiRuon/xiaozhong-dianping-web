<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onMounted } from 'vue'
import store from '@/store'
import router from '@/router'
import { authAPI } from '@/request/api'
import type { Response } from '@/interface'

onMounted(() => {
    const token: string = localStorage.getItem('token') || ''
    const userInfo: string = localStorage.getItem('userInfo') || '{}'

    if (store.state.publicKey === '') {
        authAPI.getPublicKey().then((res: Response) => {
            if (res.code === 200) {
                store.commit('setPublicKey', res.data.key)
            }
        })
    }

    if (Object.keys(userInfo).length === 0 && Object.keys(JSON.parse(userInfo)).length !== 0 && token) {
        authAPI.getRoute().then((res: Response) => {
            store.commit('setPath', res.data.path)
            store.commit('setRoute', res.data.route)
            router.push(res.data.path)
        })
        store.commit('setUserInfo', JSON.parse(userInfo))
    }
})
</script>

<template>
    <RouterView />
</template>

<style scoped>

</style>
