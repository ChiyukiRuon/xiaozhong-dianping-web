<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

onMounted(() => {
    console.log('Search mounted')
    console.log(route.query)
})
</script>

<template>
    <div class="container">
        <div class="merchant-container"></div>
        <div class="food-container"></div>
    </div>
</template>

<style scoped>
.container {
    width: 70vw;
    height: 100%;
    max-width: 1500px;
    min-width: 300px;
    margin: 0 auto;
    padding: 10px;
    background-color: #FFFFFF;
    overflow: scroll;
}
</style>