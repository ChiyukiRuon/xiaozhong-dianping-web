<script setup lang="ts">
import FoodCard from '@/components/FoodCard.vue'
</script>

<template>
    <div class="container" style="height: 100%; display: flex; justify-content: center">
        <div class="main-container">
            <FoodCard
                :food-info="{ cover: 'http://cdn.dianping.chiyukiruon.top/cover/1728023617153-122232J3.jpg', name: '123', intro: '22222' }"
                size="small"
                v-for="i in 10"
                :key="i"
            />
        </div>
        <div class="side-container">
            <div>rank</div>
        </div>
    </div>
</template>

<style scoped>
.main-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    grid-gap: 0;
    align-items: start;
    grid-auto-rows: min-content;
    width: 70vw;
    max-width: 1500px;
    min-width: 300px;
    padding: 10px;
    background-color: #FFFFFF;
    overflow: scroll;
}

.side-container {
    width: 15vw;
    min-width: 200px;
    max-width: 300px;
    height: 50%;
    min-height: 300px;
    max-height: 600px;
    margin-top: 20px;
    margin-left: 20px;
    border-radius: 10px;
    background-color: #FFFFFF;
}
</style>