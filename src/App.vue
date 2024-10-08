<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onMounted } from 'vue'
import store from '@/store'

onMounted(() => {
    const userInfo: string = localStorage.getItem('userInfo') || '{}'
    console.log(userInfo)

    if (Object.keys(JSON.parse(userInfo)).length !== 0) {
        store.commit('setUserInfo', JSON.parse(userInfo))
    }
})
</script>

<template>
    <RouterView />
</template>

<style scoped>

</style>
