<script setup lang="ts">
import { onMounted, ref } from 'vue'
import FoodCard from '@/components/FoodCard.vue'
import { commonAPI } from '@/request/api'

let total = ref(0)
let current = ref(1)
let size = ref(5)

let foodList = ref([])
let rankList = ref([])

let hideSkeleton = ref(true)

const getIndex = (page: number = 1, pageSize: number = 10) => {
    commonAPI.getIndex(page, pageSize).then(res => {
        foodList.value = page === 1
            ? res.data.list
            : [...foodList.value, ...res.data.list]
        total.value = res.data.total
        current.value = res.data.current
        size.value = res.data.size

        hideSkeleton.value = current.value >= Math.ceil(total.value / size.value)
    })
}

const loadMore = () => {
    if (current.value < Math.ceil(total.value / size.value)) {
        getIndex(current.value + 1, size.value)
    } else {
        hideSkeleton.value = true
    }
}

const getRank = () => {
    commonAPI.getRank().then(res => {
        rankList.value = res.data.rank
    })
}

onMounted(() => {
    getIndex(1, size.value)
    getRank()
})
</script>

<template>
    <div class="container" style="height: 100%; display: flex; justify-content: center">
        <div class="main-container">
            <FoodCard
                :food-info="food"
                size="large"
                v-for="(food, i) in foodList"
                :key="`food-${i}`"
            />
            <FoodCard
                v-for="i in size"
                :key="`skeleton-${i}`"
                size="skeleton"
                v-if="!hideSkeleton"
                v-intersect="i === 1 ? loadMore : null"
            />
        </div>
        <div class="side-container">
            <el-text style="margin: 0 auto" size="large" type="primary" tag="b">评价排行</el-text>
            <div v-for="(item, i) in rankList" :key="i">
                <FoodCard :food-info="item" size="small" />
            </div>
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
    max-width: 1000px;
    min-width: 300px;
    padding: 10px;
    background-color: #FFFFFF;
    overflow: auto;
    scrollbar-width: none;
}

.main-container::-webkit-scrollbar {
    display: none;
}

.side-container {
    width: 15vw;
    min-width: 200px;
    max-width: 300px;
    margin-top: 20px;
    margin-left: 20px;
    padding: 10px;
    border-radius: 10px;
    background-color: #FFFFFF;
    display: flex;
    flex-direction: column;
    align-self: flex-start;
}
</style>