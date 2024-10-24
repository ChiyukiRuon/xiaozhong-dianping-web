<script setup lang="ts">
import { onMounted, ref } from 'vue'
import Table from '@/components/Table.vue'
import { ElMessageBox } from 'element-plus'
import type { Response } from '@/interface'
import { adminAPI } from '@/request/api'
import Filter from '@/components/Filter.vue'

let showBigImage = ref(false)

let total = ref(0)
let current = ref(1)
let size = ref(10)

let bigImageUrl = ref('')
let tableData = ref([])
let filterValue = ref({
    food: '',
    merchant: ''
})

// 配置项
const columns = ref([
    { label: '美食名', prop: 'name' },
    { label: '简介', prop: 'intro', config: { showOverflowTooltip: true } },
    { label: '评分', prop: 'score' },
    { label: '商家', prop: 'merchantName' }
])
const filterOptions = ref([
    { label: '美食名', field: 'food', type: 'text' },
    { label: '商家', field: 'merchant', type: 'text' }
])

// 筛选器回调
const handleFilter = (data: any) => {
    filterValue.value = data
    getFoodList(current.value, size.value, filterValue.value.food, filterValue.value.merchant)
}
const handleFilterClear = () => {
    filterValue.value = {
        food: '',
        merchant: ''
    }
    getFoodList(current.value, size.value)
}

// 分页器回调
const handleSizeChange = (size: number) => {
    getFoodList(current.value, size)
}
const handleCurrentChange = (page: number) => {
    getFoodList(page, size.value)
}

// 刷新页面数据
const refresh = () => {
    getFoodList(current.value, size.value, filterValue.value.merchant)
}
const validateForm = (value: string): boolean => {
    return !(!value || /^\s*$/.test(value))
}


// 删除
const handleShelf = (row: any) => {
    ElMessageBox.prompt(`确定要下架美食“${row.name}”吗`, '下架美食', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        inputPlaceholder: '输入下架原因',
        inputValidator: validateForm,
        inputErrorMessage: '下架原因不能为空'
    }).then(({ value }) => {
        adminAPI.foodShelf(row.id, value).then(() => {
            refresh()
        })
    })
}
// 编辑评价详情
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
 * @param merchant 商家名
 * @return void
 * @author ChiyukiRuon
 * */
const getFoodList = (page: number = 1, pageSize: number = 10, food: string = '', merchant: string = '') => {
    adminAPI.getFoodList(page, pageSize, food, merchant).then((res: Response) => {
        tableData.value = res.data.foodList.map((item: any) => ({
            ...item,
            merchantName: item.merchant.nickname,
        }))
        total.value = res.data.total
        current.value = res.data.current
        size.value = res.data.size
    })
}

onMounted(() => {
    getFoodList(current.value, size.value)
})
</script>

<template>
    <div class="container">
        <div class="top-part">
            <Filter
                :filters="filterOptions"
                @apply-filters="handleFilter"
                @reset-filters="handleFilterClear"
            />
            <Table :columns="columns" :table-data="tableData">
                <template v-slot:action>
                    <el-table-column label="封面" width="200" align="center">
                        <template v-slot="{ row }">
                            <span v-if="!row.cover || row.cover === ''">无</span>
                            <img
                                v-else
                                style="height: 40px"
                                :src="row.cover"
                                alt="annex"
                                @click="showImage(row.cover)"
                                class="annex-img"
                            />
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="200" align="center">
                        <template v-slot="{ row }">
                            <el-link
                                type="danger"
                                @click=""
                                class="link-btn"
                                @click.prevent="handleShelf(row)"
                                >下架</el-link
                            >
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
