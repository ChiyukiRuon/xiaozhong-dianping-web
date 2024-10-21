<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import UserCard from '@/components/UserCard.vue'
import { commonAPI } from '@/request/api'
import FoodCard from '@/components/FoodCard.vue'

const route = useRoute()

let userTotal = ref(0)
let userCurrent = ref(1)
let userSize = ref(10)
let userList = ref([])
let foodTotal = ref(0)
let foodCurrent = ref(1)
let foodSize = ref(10)
let foodList = ref([])

const searchMerchant = (term: string, page: number = 1, size: number = 10) => {
    commonAPI.searchMerchant(term, page, size).then(res => {
        userTotal.value = res.data.total
        userList.value = res.data.list
        userCurrent.value = res.data.current
        userSize.value = res.data.size
    })
}
const searchFood = (term: string, page: number = 1, size: number = 10) => {
    commonAPI.searchFood(term, page, size).then(res => {
        foodTotal.value = res.data.total
        foodList.value = res.data.list
        foodCurrent.value = res.data.current
        foodSize.value = res.data.size
    })
}

onMounted(() => {
    if (route.query.term) {
        searchMerchant(route.query.term)
        searchFood(route.query.term)
    }
})

watch(() => route.query.term, (newTerm) => {
    if (newTerm) {
        searchMerchant(newTerm as string)
        searchFood(newTerm as string)
    }
})
</script>

<template>
    <div class="container">
        <div class="merchant-container">
            <UserCard :user-info="user" size="small" v-for="(user, i) in userList" :key="i"/>
        </div>
        <div class="food-container">
            <FoodCard :food-info="food" size="large" v-for="(food, i) in foodList" :key="i"/>
        </div>
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