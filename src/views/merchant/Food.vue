<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import Table from '@/components/Table.vue'
import { ElButton, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import type { Response } from '@/interface'
import { formatStatus, formatVerificationType } from '@/utils/common'
import { merchantAPI } from '@/request/api'
import Filter from '@/components/Filter.vue'
import { Picture } from '@element-plus/icons-vue'
import { isNicknameValid } from '@/utils/valid'

const CDN_URL = import.meta.env.VITE_CDN_URL

let isLoading = ref(false)
let dialogVisible = ref(false)
let hoverTextVisible = ref(false)

let total = ref(0)
let current = ref(1)
let size = ref(10)
let detailFormRef = ref<FormInstance>()

let tableData = ref([])
let dialogValue = ref()
let filterValue = ref({
    name: '',
    category: null,
    status: null
})
let detailForm = reactive({
    cover: `${CDN_URL}/cover/default.jpg`,
    name: '',
    intro: '',
    category: null,
    price: 0.00,
})

// 表单合法性检查
const validateName = (rule: any, value: string, callback: any) => {
    if (!value.trim()) {
        return callback(new Error('请输入美食名称'))
    }
    if (isNicknameValid(value)) {
        callback()
    } else {
        if (value.length < 3 || value.length > 10) {
            callback(new Error('美食名称长度应在3到10个字符之间'))
        } else {
            callback(new Error('美食名称含有非法字符'))
        }
    }
}
const validateIntro = (rule: any, value: string, callback: any) => {
    if (value.length > 100) {
        callback(new Error('美食简介长度不能超过100个字符'))
    } else {
        callback()
    }
}

const detailRules = reactive<FormRules<typeof detailForm>>({
    name: [{ validator: validateName, trigger: 'blur' }],
    intro: [{ validator: validateIntro, trigger: 'blur' }],
})

// 配置项
const columns = ref([
    { label: '美食名', prop: 'name' },
    { label: '评分', prop: 'score' },
    { label: '分类', prop: 'categoryName' },
    { label: '价格', prop: 'price' },
    { label: '状态', prop: 'status' },
])
const filterOptions = ref([
    { label: '美食名', field: 'name', type: 'text' },
    {
        label: '分类',
        field: 'category',
        type: 'select',
        props: {
            options: []
        }
    },
    {
        label: '状态',
        field: 'status',
        type: 'select',
        props: {
            options: [
                { label: '上架', value: 1 },
                { label: '下架', value: 0 },
            ]
        }
    }
])

// 筛选器回调
const handleFilter = (data: any) => {
    filterValue.value = data
    getFoodList(current.value, size.value, data.name, data.category, data.status)
}
const handleFilterClear = () => {
    filterValue.value = {
        name: '',
        category: null,
        status: null
    }
    getFoodList(current.value, size.value)
}

// 分页器回调
const handleSizeChange = (size: number) => {
    getFoodList(current.value, size, filterValue.value.name, filterValue.value.category, filterValue.value.status)
}
const handleCurrentChange = (page: number) => {
    getFoodList(page, size.value, filterValue.value.name, filterValue.value.category, filterValue.value.status)
}

// 刷新页面数据
const refresh = () => {
    getFoodList(current.value, size.value, filterValue.value.name, filterValue.value.category, filterValue.value.status)
}
// 分类格式化
const formatCategory = (category: number): string => {
    const categoryItem = filterOptions.value[1].props!.options.find((item) => item.value == category)

   return categoryItem ? categoryItem.label : '无'
}

// 按钮功能
// 上架/下架
const handleShelf = (row: any, status: number) => {
    editFoodInfo('', '', '', null, row.category, status, row.id)
}
// 删除
const handleDelete = (row: any) => {
    ElMessageBox.confirm(
        `确定要删除美食“${row.name}”吗`,
        '删除美食',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        }
    )
        .then(() => {
            merchantAPI.deleteFood(row.id).then(() => {
                refresh()
            })
        })

}
// 编辑食品/食品详情
const showDetail = (row: any) => {
    dialogValue.value = row
    detailForm.name = row.name
    detailForm.intro = row.intro
    detailForm.category = row.category
    detailForm.price = row.price
    detailForm.cover = row.cover
    dialogVisible.value = true
}
// 添加美食
const showAdd = () => {
    dialogValue.value = {}
    detailForm.name = ''
    detailForm.intro = ''
    detailForm.category = null
    detailForm.price = 0.00
    detailForm.cover = `${CDN_URL}/cover/default.jpg`
    dialogVisible.value = true
}
// 提交表单
const submitDetail = (formEl: FormInstance | undefined) => {
    if (!formEl) return
    console.log(detailForm)
    formEl.validate((valid) => {
        if (valid) {
            if (detailForm.category === '无') detailForm.category = null
            editFoodInfo(detailForm.name, detailForm.intro, detailForm.cover, detailForm.price, detailForm.category??null, dialogValue.value.status?null:0, dialogValue.value.id??null)
        }
    })
}

// 请求
/**
 * 获取食品列表
 *
 * @param page 页码
 * @param pageSize 每页数量
 * @param name 搜索词
 * @param category 搜索词
 * @param status 搜索词
 * @return void
 * @author ChiyukiRuon
 * */
const getFoodList = (page: number, pageSize: number, name: string = '', category: number | null = null, status: number | null = null) => {
    merchantAPI.getFood(page, pageSize, name, category, status).then((res: Response) => {
        tableData.value = res.data.foodList.map((item: any) => ({
            ...item,
            status: formatStatus(item.status),
            price: parseFloat(item.price),
            category: item.category?parseInt(item.category):'',
            categoryName: formatCategory(item.category)
        }))
        total.value = res.data.total
        current.value = res.data.current
        size.value = res.data.size
    })
}
/**
 * 获取分类列表
 *
 * @return void
 * @author ChiyukiRuon
 * */
const getCategoryList = () => {
    merchantAPI.getAllCategory().then((res: Response) => {
        const categoryList = res.data?.categoryList || []

        filterOptions.value[1].props!.options = categoryList.map((item: any) => ({
            label: item.label,
            value: item.value
        }))
    })
}
/**
 * 编辑食物信息
 *
 * @param name 名称
 * @param intro 简介
 * @param cover 封面
 * @param price 价格
 * @param category 分类
 * @param status 上架状态
 * @param [id] 食物ID
 * @return void
 * @author ChiyukiRuon
 * */
const editFoodInfo = (name = '', intro = '', cover: string = '', price: number | null = null, category: number | null, status: number | null = null, id: number | null = null) => {
    isLoading.value = true
    merchantAPI
        .editFood(name, intro, cover, price, category, status, id)
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
 * 上传封面
 *
 * @param file 文件对象
 * @return void
 * @author ChiyukiRuon
 * */
const uploadCover = (file: any) => {
    merchantAPI.uploadFile(file.file, 'cover').then((res: Response) => {
        detailForm.cover = `${CDN_URL}${res.data.url}`
    })
}

onMounted(() => {
    getCategoryList()
    getFoodList(current.value, size.value)
})
</script>

<template>
    <div class="container">
        <div class="top-part">
            <Filter :filters="filterOptions" @apply-filters="handleFilter" @reset-filters="handleFilterClear" />
            <div class="operate-btn">
                <el-button type="primary" @click="showAdd">新增</el-button>
            </div>
            <Table :columns="columns" :table-data="tableData">
                <template v-slot:action>
                    <el-table-column label="封面" width="200" align="center">
                        <template v-slot="{ row }">
                            <img style="height: 40px" :src="row.cover" alt="cover">
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="200" align="center">
                        <template v-slot="{ row }">
                            <el-link type="primary" @click="" class="link-btn" v-if="row.status === '已下架'" @click.prevent="handleShelf(row, 1)">上架</el-link>
                            <el-link type="primary" @click="" class="link-btn" v-if="row.status === '已上架'" @click.prevent="handleShelf(row, 0)">下架</el-link>
                            <el-link type="primary" @click="showDetail(row)" class="link-btn">详情</el-link>
                            <el-link type="danger" @click="" class="link-btn" v-if="row.status === '已下架'" @click.prevent="handleDelete(row)">删除</el-link>
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

    <el-dialog
        title="美食详情"
        v-model="dialogVisible"
        width="500"
        :close-on-click-modal="false"
    >
        <el-alert v-if="dialogValue.status === '已上架'" title="已上架美食不可编辑" type="info" style="margin-bottom: 10px" />
        <el-form
            ref="detailFormRef"
            :rules="detailRules"
            :model="detailForm"
            :disabled="dialogValue.status === '已上架'"
            status-icon
            label-width="auto"
            style="width: 400px; margin-left: 35px">
            <el-form-item label="" prop="cover">
                <el-upload
                    style="display: flex;
                            flex-direction: column; width: 100%"
                    accept="image/jpeg, image/png"
                    :show-file-list="false"
                    :http-request="uploadCover"
                >
                    <template #trigger>
                        <div class="image-container"
                             @mouseover="hoverTextVisible = true"
                             @mouseleave="hoverTextVisible = false">
                            <img class="cover" :src="detailForm.cover" alt="avatar" />
                            <div class="overlay" v-if="hoverTextVisible && dialogValue.status !== '已上架'">
                                <el-icon size="20"><Picture /></el-icon>
                            </div>
                        </div>
                    </template>
                </el-upload>
            </el-form-item>
            <el-form-item label="美食名称" prop="name" class="form-item">
                <el-input v-model="detailForm.name" placeholder="美食名称" />
            </el-form-item>
            <el-form-item label="美食简介" prop="intro" class="form-item">
                <el-input
                    v-model="detailForm.intro"
                    placeholder="美食简介"
                    type="textarea"
                    maxlength="100"
                    :rows="4"
                    show-word-limit
                />
            </el-form-item>
            <el-form-item label="分类" prop="category" class="form-item">
                <el-select v-model="detailForm.category" clearable placeholder="美食分类">
                    <el-option v-for="item in filterOptions[1].props!.options" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
            </el-form-item>
            <el-form-item label="价格" prop="price" class="form-item">
                <el-input-number v-model="detailForm.price" :min="0" :precision="2" >
                    <template #prefix>
                        <span>￥</span>
                    </template>
                </el-input-number>
            </el-form-item>

        </el-form>
        <div class="btn-area">
            <el-button @click="dialogVisible = false" class="btn">取消</el-button>
            <el-button
                type="primary"
                :loading="isLoading"
                :disabled="dialogValue.status === '已上架'"
                @click="submitDetail(detailFormRef)"
                class="btn">
                确定
            </el-button>
        </div>
    </el-dialog>
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

.operate-btn {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 10px;
}

.btn-area {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
}

.link-btn {
    margin-right: 5px;
}

.link-btn:last-child {
    margin-right: 0;
}

.cover {
    width: 5vw;
    height: 5vw;
}

.image-container {
    position: relative; /* 使叠加层能够根据容器进行定位 */
    width: 5vw;
    height: 5vw;
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
</style>