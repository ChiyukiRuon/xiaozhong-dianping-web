<script setup lang="ts">
import { onMounted, ref } from 'vue'
import Table from '@/components/Table.vue'
import type { Response } from '@/interface'
import { merchantAPI } from '@/request/api'
import Filter from '@/components/Filter.vue'

let showBigImage = ref(false)

let total = ref(0)
let current = ref(1)
let size = ref(10)

let bigImageUrl = ref('')
let tableData = ref([])
let filterValue = ref({
    food: null,
})

// 配置项
const columns = ref([
    { label: '内容', prop: 'content' },
    { label: '评分', prop: 'score' },
    { label: '用户', prop: 'user' },
    { label: '美食', prop: 'foodName' },
    // { label: '匿名', prop: 'anonymityString' }
])
const filterOptions = ref([
    {
        label: '美食',
        field: 'food',
        type: 'select',
        props: {
            options: []
        }
    }
])

// 筛选器回调
const handleFilter = (data: any) => {
    filterValue.value = data
    getReviewList(current.value, size.value, filterValue.value.food)
}
const handleFilterClear = () => {
    filterValue.value = {
        food: null,
    }
    getReviewList(current.value, size.value)
}

// 分页器回调
const handleSizeChange = (size: number) => {
    getReviewList(current.value, size)
}
const handleCurrentChange = (page: number) => {
    getReviewList(page, size.value)
}

// 按钮功能

// 显示大图
const showImage = (imgUrl: string) => {
    bigImageUrl.value = imgUrl
    showBigImage.value = true
}
const closeImage = () => {
    showBigImage.value = false
}

// 请求
/**
 * 获取历史评论列表
 *
 * @param page 页码
 * @param pageSize 每页数量
 * @param food 美食名
 * @return void
 * @author ChiyukiRuon
 * */
const getReviewList = (page: number = 1, pageSize: number = 10, food: number|null =null) => {
    merchantAPI.getReviewList(page, pageSize, food).then((res: Response) => {
        tableData.value = res.data.reviewList.map((item: any) => ({
            ...item,
            user: item.user.nickname,
            foodName: item.food.name,
        }))
        total.value = res.data.total
        current.value = res.data.current
        size.value = res.data.size
    })
}
const getAllFood = () => {
    merchantAPI.getAllFood().then((res: Response) => {
        filterOptions.value[0].props!.options = res.data.foodList.map((item: any) => ({
            label: item.label,
            value: item.value
        }))
    })
}

onMounted(() => {
    getReviewList(current.value, size.value)
    getAllFood()
})
</script>

<template>
    <div class="container">
        <div class="top-part">
            <Filter :filters="filterOptions" @apply-filters="handleFilter" @reset-filters="handleFilterClear" />
            <Table :columns="columns" :table-data="tableData">
                <template v-slot:action>
                    <el-table-column label="附件" width="200" align="center">
                        <template v-slot="{ row }">
                            <span v-if="!row.annex || row.annex === ''">无</span>
                            <img
                                v-else
                                style="height: 40px"
                                :src="row.annex"
                                alt="annex"
                                @click="showImage(row.annex)"
                                class="annex-img"
                            />
                        </template>
                    </el-table-column>
                </template>
            </Table>
        </div>
        <div class="bottom-part">
            <el-pagination
                :current-page="current"
                :page-size="size"
                :page-sizes="[10, 20, 30, 40, 50]"
                :disabled="false"
                layout="total, sizes, prev, pager, next"
                :total="total"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
            />
        </div>
    </div>

    <div v-if="showBigImage" class="big-image-overlay" @click="closeImage">
        <img :src="bigImageUrl" class="big-image" alt="Big View" />
    </div>
</template>

<style scoped>
.container {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.bottom-part {
    margin-top: auto;
    margin-left: auto;
}

.link-btn {
    margin-right: 5px;
}

.link-btn:last-child {
    margin-right: 0;
}
.annex-img:hover {
    cursor: pointer;
}

.big-image-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999;
}

.big-image {
    max-width: 90%;
    max-height: 90%;
}
</style>
