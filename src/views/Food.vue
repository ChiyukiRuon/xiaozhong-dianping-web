<script setup lang="ts">
import { useRoute } from 'vue-router'
import { onMounted, ref } from 'vue'
import { commonAPI } from '@/request/api'
import UserCard from '@/components/UserCard.vue'

const route = useRoute()

const foodId = parseInt(route.params.id!)
let foodInfo = ref<any>({})
let merchantInfo = ref<any>({})

let review = ref([])
let total = ref(0)
let current = ref(0)
let size = ref(0)
let pageSize = ref(10)

const getFoodInfo = (id: number) => {
    commonAPI.getFoodById(id).then(res => {
        foodInfo.value = res.data.food
        merchantInfo.value = res.data.food.merchant
    })
}

onMounted(() => {
    console.log(123)
    getFoodInfo(foodId)
})
</script>

<template>
    <div class="container" style="height: 100%; display: flex; justify-content: center">
        <div class="main-container">
            <div class="food-info">
                <img :src="foodInfo.cover" alt="cover" />
                <div style="margin-left: 20px">
                    <div class="food-name">{{ foodInfo.name }}</div>
                    <div class="food-intro">{{ foodInfo.intro }}</div>
                    <div>
                        <el-rate
                            v-model="foodInfo.score"
                            size="large"
                            disabled
                            allow-half
                            show-score
                            text-color="#ff9900" />
                    </div>
                </div>
            </div>
            <div class="review-container">
                <div class="review-title">
                    <div>用户评价</div>
                    <div style="font-size: medium; color: #cacaca">({{ total }})</div>
                    <div style="margin-left: auto; margin-right: 15px">
                        <el-button type="primary" @click="">发表评价</el-button>
                    </div>
                </div>
                <div class="horizontal-divider"></div>
                <div class="review-content"></div>
            </div>
        </div>
        <div class="side-container">
            <UserCard :user-info="merchantInfo" size="large" />
        </div>
    </div>
</template>

<style scoped>
.main-container {
    width: 70vw;
    max-width: 1500px;
    min-width: 300px;
    padding: 20px;
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
}

.food-info {
    display: flex;
}

.food-info img {
    width: 20vw;
    min-width: 200px;
    max-width: 500px;
    border-radius: 10px;
}

.food-name {
    width: 100%;
    font-size: xx-large;
    font-weight: bold;
}

.review-container {
    margin-top: 30px;
}

.review-title {
    font-size: x-large;
    display: flex;
    margin-bottom: 5px;
}
</style>