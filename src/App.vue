<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onMounted } from 'vue'
import store from '@/store'
import router from '@/router'
import { getPublicKey, getRoute } from '@/request/api'
import type { Response } from '@/interface'

onMounted(() => {
    const token: string = localStorage.getItem('token') || ''
    const userInfo: string = localStorage.getItem('userInfo') || '{}'
    console.log(userInfo)

    if (store.state.publicKey === '') {
        getPublicKey().then((res: Response) => {
            if (res.code === 200) {
                console.log('获取密钥', res.data.key)
                store.commit('setPublicKey', res.data.key)
            }
        })
    }

    if (Object.keys(JSON.parse(userInfo)).length !== 0 && token) {
        getRoute().then((res: Response) => {
            console.log(res)
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
