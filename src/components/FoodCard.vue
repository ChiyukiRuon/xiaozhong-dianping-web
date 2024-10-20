<template>
    <div class="food-card" v-if="size === 'small'">
        <img class="cover" :src="foodInfo.cover" alt="food-cover" />
        <div class="info">
            <div class="food-title">{{ foodInfo.name }}</div>
            <div class="food-intro">{{ foodInfo.intro }}</div>
        </div>
    </div>
    <div class="food-card" v-if="size === 'large'">

    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { PropType } from 'vue';

export default defineComponent({
    name: 'FoodCard',
    props: {
        size: {
            type: String as PropType<'small' | 'large'>,
            required: true
        },
        foodInfo: {
            type: Object,
            required: true
        }
    }
})
</script>

<style scoped>
.food-card {
    width: 200px;
    margin: 5px;
    padding-bottom: 10px;
    border-radius: 10px;
    background-color: #FFFFFF;
    color: #181818;
    box-shadow: #dcdcdc 1px 1px 10px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    transition: 0.5s;
}

.food-card:hover {
    box-shadow: #a6a6a6 2px 2px 15px;
    transition: 0.5s;
    cursor: pointer;
}

.cover {
    width: 100%;
    border-radius: 10px 10px 0 0;
}

.info {
    width: 100%;
    padding: 0 5px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
}

.food-title {
    font-size: large;
    font-weight: bold;
    width: 100%;
    color: #181818;
}

.food-intro {
    word-wrap: break-word;
    word-break: break-all;
    white-space: normal;
}
</style>