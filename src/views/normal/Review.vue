<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import Table from '@/components/Table.vue'
import { ElButton, ElMessage, ElMessageBox } from 'element-plus'
import type { Response } from '@/interface'
import { userAPI } from '@/request/api'
import Filter from '@/components/Filter.vue'
import { Delete, Loading, Plus } from '@element-plus/icons-vue'
import FoodCard from '@/components/FoodCard.vue'

const CDN_URL = import.meta.env.VITE_CDN_URL

let isLoading = ref(false)
let isUploading = ref(false)
let showBigImage = ref(false)
let dialogVisible = ref(false)
let hoverTextVisible = ref(false)

let total = ref(0)
let current = ref(1)
let size = ref(10)

let bigImageUrl = ref('')
let tableData = ref([])
let dialogValue = ref({})
let filterValue = ref({
    content: '',
    food: '',
    merchant: '',
    status: null
})
let detailForm = reactive({
    content: '',
    score: 0,
    annex: '',
    status: 0,
    remark: '',
    anonymity: false
})
let foodDetail = ref({})

// 配置项
const columns = ref([
    { label: '内容', prop: 'content' },
    { label: '评分', prop: 'score' },
    { label: '美食名', prop: 'foodName' },
    { label: '商家', prop: 'merchantName' },
    { label: '状态', prop: 'statusString' },
    // { label: '匿名', prop: 'anonymityString' }
])
const filterOptions = ref([
    { label: '内容', field: 'content', type: 'text' },
    { label: '美食名', field: 'food', type: 'text' },
    { label: '商家', field: 'merchant', type: 'text' },
    {
        label: '状态',
        field: 'status',
        type: 'select',
        props: {
            options: [
                { label: '正常', value: 0 },
                { label: '审核删除', value: 2 },
            ]
        }
    }
])

// 筛选器回调
const handleFilter = (data: any) => {
    filterValue.value = data
    getReviewList(current.value, size.value, filterValue.value.content, filterValue.value.food, filterValue.value.merchant, filterValue.value.status)
}
const handleFilterClear = () => {
    filterValue.value = {
        content: '',
        food: '',
        merchant: '',
        status: null
    }
    getReviewList(current.value, size.value)
}

// 分页器回调
const handleSizeChange = (size: number) => {
    getReviewList(current.value, size, filterValue.value.content, filterValue.value.food, filterValue.value.merchant, filterValue.value.status)
}
const handleCurrentChange = (page: number) => {
    getReviewList(page, size.value, filterValue.value.content, filterValue.value.food, filterValue.value.merchant, filterValue.value.status)
}

// 刷新页面数据
const refresh = () => {
    getReviewList(current.value, size.value, filterValue.value.content, filterValue.value.food, filterValue.value.merchant, filterValue.value.status)
}
const formatStatus = (status: number): string => {
    switch (status) {
        case 0:
            return '正常'
        case 1:
            return '隐藏'
        case 2:
            return '审核删除'
        default:
            return '未知'
    }
}

// 按钮功能
// 删除
const handleDelete = (row: any) => {
    ElMessageBox.confirm(`确定要删除评价“${row.content}”吗`, '删除美食', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {
        userAPI.deleteReview(row.id).then(() => {
            refresh()
        })
    })
}
// 编辑评价详情
const showDetail = (row: any) => {
    dialogValue.value = row
    detailForm.content = row.content
    detailForm.score = row.score
    detailForm.annex = row.annex
    detailForm.status = row.status
    detailForm.remark = row.remark
    detailForm.anonymity = !!row.anonymity
    foodDetail.value = row.target
    dialogVisible.value = true
}
const showImage = (imgUrl: string) => {
    bigImageUrl.value = imgUrl
    showBigImage.value = true
}
const closeImage = () => {
    showBigImage.value = false
}

// 对话框
// 关闭对话框
const handleClose = () => {
    dialogVisible.value = false
    foodDetail.value = {}
    detailForm = {
        content: '',
        score: 0,
        anonymity: false,
        status: 0,
        remark: '',
        annex: ''
    }
    dialogValue.value = {}
}
// 删除附件
const handleRemove = () => {
    if (detailForm.status !== 0) return
    detailForm.annex = ''
}
// 提交表单
const commitEdit = () => {
    if (detailForm.content === '') {
        ElMessage.error('评价内容不能为空')
        return
    } else if (detailForm.content.length < 5) {
        ElMessage.error('评价内容过短')
        return
    } else if (detailForm.content.length > 200) {
        ElMessage.error('评价内容过长')
        return
    }
    if (detailForm.score === 0) {
        ElMessage.error('请填写评分')
        return
    }

    editReview(
        detailForm.content,
        detailForm.score,
        detailForm.annex,
        detailForm.anonymity,
        dialogValue.value.id
    )
}

// 请求
/**
 * 获取历史评论列表
 *
 * @param page 页码
 * @param pageSize 每页数量
 * @param content 评论内容
 * @param food 美食名
 * @param merchant 商家名
 * @param status 状态
 * @return void
 * @author ChiyukiRuon
 * */
const getReviewList = (page: number, pageSize: number, content: string = '', food: string = '', merchant: string = '', status: number|null = null) => {
    userAPI.getReviewHistory(page, pageSize, content, food, merchant, status).then((res: Response) => {
        tableData.value = res.data.reviewList.map((item: any) => ({
            ...item,
            foodName: item.target.name,
            merchantName: item.merchant.nickname,
            statusString: formatStatus(item.status),
            anonymityString: item.anonymity ? '是' : '否'
        }))
        total.value = res.data.total
        current.value = res.data.current
        size.value = res.data.size
    })
}
/**
 * 编辑评价
 *
 * @param content 评论内容
 * @param score 评分
 * @param [annex] 附件
 * @param anonymity 是否匿名
 * @param [id] 食物ID
 * @return void
 * @author ChiyukiRuon
 * */
const editReview = (
    content: string,
    score: number,
    annex: string = '',
    anonymity: boolean = false,
    id: number
) => {
    isLoading.value = true
    let isAnonymous = anonymity ? 1 : 0
    userAPI
        .review(content, score, null, null, annex, isAnonymous, null, id)
        .then(() => {
            dialogVisible.value = false
            isLoading.value = false
            refresh()
        })
        .catch(() => {
            isLoading.value = false
        })
}
/**
 * 上传附件
 *
 * @param file 文件对象
 * @return void
 * @author ChiyukiRuon
 * */
const uploadAnnex = (file: any) => {
    userAPI.uploadFile(file.file, 'annex').then((res: Response) => {
        detailForm.annex = `${CDN_URL}${res.data.url}`
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
                            <span v-if="row.annex === ''">无</span>
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
                            <el-link type="primary" @click="showDetail(row)" class="link-btn"
                                >详情</el-link
                            >
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

    <el-dialog v-model="dialogVisible" title="编辑评价" width="500" :before-close="handleClose">
        <el-alert v-if="detailForm.status === 2" :title="'审核删除: '+detailForm.remark" type="warning" style="margin-bottom: 10px" />
        <el-input
            v-model="detailForm.content"
            type="textarea"
            placeholder="请输入评价内容"
            :minlength="5"
            :maxlength="200"
            show-word-limit
            :disabled="detailForm.status !== 0"
            :rows="5"
        />
        <el-rate v-model="detailForm.score" allow-half show-score text-color="#ff9900" :disabled="detailForm.status !== 0" />
        <div style="width: 140px; margin-right: auto;">
            <el-upload
                style="display: flex; flex-direction: column; width: 100%"
                accept="image/jpeg, image/png"
                :show-file-list="false"
                :limit="1"
                :http-request="uploadAnnex"
                :disabled="detailForm.status !== 0"
            >
                <template #trigger>
                    <div class="upload-container" v-if="detailForm.annex === ''">
                        <el-icon size="20" v-if="!isUploading"><Plus /></el-icon>
                        <el-icon size="20" v-else><Loading /></el-icon>
                    </div>
                    <div
                        class="image-container"
                        @mouseover="hoverTextVisible = true"
                        @mouseleave="hoverTextVisible = false"
                        v-else
                    >
                        <img class="upload-annex" :src="detailForm.annex" alt="annex" />
                        <div class="overlay" v-if="hoverTextVisible" @click.prevent="handleRemove">
                            <el-icon size="20"><Delete /></el-icon>
                        </div>
                    </div>
                </template>
            </el-upload>
        </div>
<!--        <div>-->
<!--            <el-checkbox v-model="detailForm.anonymity" label="匿名评价" />-->
<!--        </div>-->
        <FoodCard :food-info="foodDetail" size="small" :shadow="true" />
        <template #footer v-if="detailForm.status === 0">
            <div class="dialog-footer">
                <el-button @click="handleClose" :disabled="isLoading">取消</el-button>
                <el-button type="primary" @click="commitEdit" :loading="isLoading">
                    确定
                </el-button>
            </div>
        </template>
    </el-dialog>

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

.image-container {
    position: relative; /* 使叠加层能够根据容器进行定位 */
    width: 140px;
    height: 140px;
}

.upload-annex {
    width: 140px;
    height: 140px;
    border-radius: 10px;
}

.overlay {
    position: absolute; /* 叠加层的定位 */
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6); /* 半透明的黑色背景 */
    color: white;
    display: flex; /* 使文字居中对齐 */
    align-items: center; /* 垂直居中 */
    justify-content: center; /* 水平居中 */
    opacity: 0; /* 默认隐藏叠加层 */
    transition: opacity 0.3s ease; /* 平滑的淡入效果 */
}

.image-container:hover .overlay {
    opacity: 1; /* 当鼠标悬停在图片上时显示叠加层 */
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
