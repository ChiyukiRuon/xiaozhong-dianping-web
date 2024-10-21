<template>
    <div class="food-card" v-if="size === 'large'" @click="openDetail(foodInfo.id)">
        <img class="cover" :src="foodInfo.cover" alt="food-cover" />
        <div class="info">
            <div class="food-title">
                <el-text size="large" type="primary" tag="b">{{ foodInfo.name }}</el-text>
            </div>
            <div class="food-intro">{{ foodInfo.intro || '暂无介绍' }}</div>
            <el-rate
                v-model="foodInfo.score"
                disabled
                show-score
                allow-half
                size="small"
                text-color="#ff9900"
            />
        </div>
    </div>
    <div class="food-card" v-else>

    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { PropType } from 'vue';
import router from '@/router'

export default defineComponent({
    name: 'FoodCard',
    props: {
        size: {
            type: String as PropType<'small' | 'large'>,
            default: 'large',
            required: true
        },
        foodInfo: {
            type: Object,
            required: true
        }
    },
    methods: {
        openDetail(id: number) {
            const url = router.resolve(`/food/${id}`).href
            window.open(url)
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
    background-color: #ffffff;
    color: #181818;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    box-shadow: 0 1px 12px 0 rgba(0, 0, 0, 0.1);
    transition: 0.5s;
}

.food-card:hover {
    box-shadow: 0 1px 12px 0 rgba(0, 0, 0, 0.2);
    cursor: pointer;
    transition: 0.5s;
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
    overflow: hidden;
    font-size: small;
    display: -webkit-box;
    line-clamp: 2;
    -webkit-line-clamp: 2;
    word-break: break-all;
    word-wrap: break-word;
    -webkit-box-orient: vertical;
    white-space: normal;
}
</style>