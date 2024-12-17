<script setup lang="ts">
import { useRoute } from 'vue-router'
import { onMounted, ref } from 'vue'
import { commonAPI } from '@/request/api';
import { Dish, Tickets } from '@element-plus/icons-vue'
import FoodCard from '@/components/FoodCard.vue'
import { removeEmptySpans } from '@/utils/common'

interface Food {
    id: number
    merchant: number
    name: string
    price: number
    intro: string
    cover: string
    categoryName: string
    score: number
    status: number
}

const route = useRoute()
const isLoading = ref(false)
const CDN_PREFIX = import.meta.env.VITE_CDN_URL

const uid = parseInt(route.params.uid!)
let foodInfo = ref<Food[]>([])
let singleFoodInfo = ref<Food>({} as Food)
let merchantInfo = ref<any>({})
let merchantStatistic = ref<any>({})
let merchantCategory = ref<any[]>([])

const getMerchantInfo = (uid: number) => {
    commonAPI.getMerchant(uid).then(res => {
        merchantInfo.value = res.data
    })
}
const getAllFood = (uid: number) => {
    commonAPI.getAllFood(uid).then(res => {
        foodInfo.value = res.data.food
    })
}
const getStatistic = (uid: number) => {
    commonAPI.getStatistic(uid).then(res => {
        merchantStatistic.value = res.data
    })
}
const getCategory = (uid: number) => {
    commonAPI.getCategory(uid).then(res => {
        merchantCategory.value = res.data.category
    })
}

onMounted(() => {
    getMerchantInfo(uid)
    getAllFood(uid)
    getStatistic(uid)
    getCategory(uid)

    const root = document.querySelector('.merchant-main')
    if (root) {
        // 移除空的 span 元素
        const emptySpans = root.querySelectorAll('span:empty')
        emptySpans.forEach(span => span.remove())
    }
})
</script>

<template>
    <div class="merchant-main">
        <div class="merchant-info">
            <img :src="merchantInfo.avatar" alt="avatar" />
            <div class="merchant-detail">
                <div style="display: flex; align-items: center;">
                    <div class="merchant-name">{{ merchantInfo.nickname }}</div>
                    <div class="merchant-statistic">
                        <div class="merchant-statistic-item" style="display: flex; align-items: center">
                            <el-icon style="margin-right: 3px"><Dish /></el-icon>
                            {{ merchantStatistic.foodCount }}
                        </div>
                        <div class="merchant-statistic-item" style="display: flex; align-items: center">
                            <el-icon style="margin-right: 3px"><Tickets /></el-icon>
                            {{ merchantStatistic.reviewCount }}
                        </div>
                    </div>
                </div>
                <div class="merchant-intro">简介：{{ merchantInfo.intro || '无' }}</div>
                <div class="merchant-contact">
                    <div class="merchant-phone">电话：{{ merchantInfo.phone }}</div>
                    <div class="merchant-address">地址：{{ merchantInfo.address }}</div>
                </div>
            </div>
        </div>
        <div class="main-container">
            <el-tabs tab-position="left" @tab-click="removeEmptySpans" style="height: 100%; display: flex; justify-content: center">
                <el-tab-pane label="全部" style="height: 100%; display: flex; justify-content: center; overflow: hidden">
                    <div class="food-container">
                        <FoodCard v-for="food in foodInfo" :food-info="food" :size="'large'"/>
                    </div>
                </el-tab-pane>
                <el-tab-pane v-for="(category, i) in merchantCategory" :key="i" :label="category.label" style="height: 100%; display: flex; justify-content: center">
                    <div class="food-container">
                        <span v-for="(food, j) in foodInfo">
                            <FoodCard v-if="food.categoryName == category.label" :food-info="food" :size="'large'" :key="j" />
                        </span>
                    </div>
                </el-tab-pane>
            </el-tabs>
        </div>
    </div>
</template>

<style scoped>
.merchant-main {
    width: 70vw;
    max-width: 1000px;
    min-width: 300px;
    height: 100%;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.merchant-info {
    width: 100%;
    display: flex;
    margin-top: 10px;
    padding: 20px;
    border-radius: 10px;
    background-color: #ffffff;
}

.merchant-info img {
    width: 140px;
    border-radius: 10px;
}

.merchant-detail {
    width: 100%;
    margin-left: 10px;
}

.merchant-name {
    font-size: x-large;
    color: #7CB8F2;
    font-weight: bold;
}

.merchant-statistic {
    width: 100px;
    display: flex;
    margin-left: auto;
}

.merchant-statistic-item {
    display: flex;
    align-items: center;
    margin-right: 10px;
    padding: 1px 9px;
    border-radius: 5px;
    background-color: #e6e6e6;
}

.merchant-statistic-item:last-child {
    margin-right: 0;
}

.merchant-intro {
    font-size: medium;
    height: 50px;
    color: #676767;
    word-break: break-all;
    line-height: 1.2;
}

.merchant-contact {
    color: #858585;
}

.main-container {
    width: 70vw;
    max-width: 1000px;
    min-width: 300px;
    height: 100%;
    margin-top: 10px;
    border-radius: 10px 10px 0 0;
    padding: 20px 5px;
    background-color: #ffffff;
    overflow: hidden;
}

.food-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    grid-gap: 0;
    align-items: start;
    grid-auto-rows: min-content;
    width: 70vw;
    max-width: 1000px;
    min-width: 300px;
    padding: 10px;
    background-color: #FFFFFF;
    overflow: auto;
    scrollbar-width: none;
}
</style>