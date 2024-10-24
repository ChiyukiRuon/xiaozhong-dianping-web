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
    nickname: '',
    food: '',
    merchant: ''
})

// 配置项
const columns = ref([
    { label: '内容', prop: 'content' },
    { label: '评分', prop: 'score' },
    { label: '用户', prop: 'user' },
    { label: '美食名', prop: 'foodName' },
    { label: '商家', prop: 'merchantName' },
    // { label: '匿名', prop: 'anonymityString' }
])
const filterOptions = ref([
    { label: '用户昵称', field: 'nickname', type: 'text' },
    { label: '美食名', field: 'food', type: 'text' },
    { label: '商家', field: 'merchant', type: 'text' }
])

// 筛选器回调
const handleFilter = (data: any) => {
    filterValue.value = data
    getReviewList(current.value, size.value, filterValue.value.nickname, filterValue.value.food, filterValue.value.merchant)
}
const handleFilterClear = () => {
    filterValue.value = {
        nickname: '',
        food: '',
        merchant: ''
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

// 刷新页面数据
const refresh = () => {
    getReviewList(current.value, size.value, filterValue.value.nickname, filterValue.value.food, filterValue.value.merchant)
}
const validateForm = (value:string):boolean => {
    return !(!value || /^\s*$/.test(value));
}

// 按钮功能
// 删除
const handleDelete = (row: any) => {
    ElMessageBox.prompt(`确定要删除评价“${row.content}”吗`, '删除评价', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        inputPlaceholder: '输入删除原因',
        inputValidator: validateForm,
        inputErrorMessage: '删除原因不能为空'
    }).then(({ value }) => {
        adminAPI.deleteReview(row.id, row.food.id, value).then(() => {
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
 * @param nickname 用户昵称
 * @param food 美食名
 * @param merchant 商家
 * @return void
 * @author ChiyukiRuon
 * */
const getReviewList = (page: number = 1, pageSize: number = 10, nickname: string = '', food: string = '', merchant: string = '') => {
    adminAPI.getReviewList(page, pageSize, nickname, food, merchant).then((res: Response) => {
        tableData.value = res.data.reviewList.map((item: any) => ({
            ...item,
            user: item.user.nickname,
            foodName: item.food.name,
            merchantName: item.merchant.nickname,
            anonymityString: item.anonymity ? '是' : '否'
        }))
        total.value = res.data.total
        current.value = res.data.current
        size.value = res.data.size
    })
}

onMounted(() => {
    getReviewList(current.value, size.value)
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
                    <el-table-column label="操作" width="200" align="center">
                        <template v-slot="{ row }">
<!--                            <el-link type="primary" @click="showDetail(row)" class="link-btn"-->
<!--                            >详情</el-link-->
<!--                            >-->
                            <el-link
                                type="danger"
                                @click=""
                                class="link-btn"
                                @click.prevent="handleDelete(row)"
                            >删除</el-link
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
