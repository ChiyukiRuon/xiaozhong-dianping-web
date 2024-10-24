<script setup lang="ts">
import { ElButton, ElMessageBox } from 'element-plus'
import Table from '@/components/Table.vue'
import Filter from '@/components/Filter.vue'
import { onMounted, ref } from 'vue'
import { merchantAPI } from '@/request/api'

let isLoading = ref(false)
let dialogVisible = ref(false)

let total = ref(0)
let current = ref(1)
let size = ref(10)

let tableData = ref([])
let dialogValue = ref()
let filterValue = ref({
    name: '',
})

// 配置项
const columns = ref([
    { label: '分类名', prop: 'name' },
    { label: '美食数', prop: 'count' },
])
const filterOptions = ref([
    { label: '分类名', field: 'name', type: 'text' },
])

// 筛选器回调
const handleFilter = (data: any) => {
    filterValue.value = data
    getCategoryList(current.value, size.value, data.name)
}
const handleFilterClear = () => {
    filterValue.value = {
        name: '',
    }
    getCategoryList(current.value, size.value)
}

// 分页器回调
const handleSizeChange = (size: number) => {
    getCategoryList(current.value, size, filterValue.value.name)
}
const handleCurrentChange = (page: number) => {
    getCategoryList(page, size.value, filterValue.value.name)
}

// 按钮
// 新增
const handleAdd = () => {
    ElMessageBox.prompt('请输入分类名', '新增分类', {
        confirmButtonText: '添加',
        cancelButtonText: '取消',
        inputValidator: checkCategory,
    })
        .then(({ value }) => {
            editCategory(value)
        })
        .catch(() => {})
}
// 删除
const handleDelete = (row: any) => {
    let confirmText: string
    if (row.count > 0) {
        confirmText = `该分类下有${row.count}个美食，删除后对应美食的分类将被清除`
    } else {
        confirmText = `确定要删除分类“${row.name}”吗`
    }
    ElMessageBox.confirm(
        confirmText,
        '删除美食',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        }
    )
        .then(() => {
            merchantAPI.deleteCategory(row.id).then(() => {
                getCategoryList(current.value, size.value, filterValue.value.name)
            })
        })

}

// 合法性检查
const checkCategory = (category: string): string|boolean => {
    if (!category || !category.trim()) {
        return '分类名不能为空'
    }
    if (category.trim().length > 6) {
        return '分类名长度不能超过6个字符'
    }
    return true
}

// 请求
const getCategoryList = (page: number, pageSize: number, name: string = '') => {
    merchantAPI.getCategory(page, pageSize, name).then(res => {
        tableData.value = res.data.categoryList
        total.value = res.data.total
        current.value = res.data.current
        size.value = res.data.size
    })
}
const editCategory = (category: string, id: number|null = null) => {
    merchantAPI.editCategory(category, id).then(() => {
        getCategoryList(current.value, size.value, filterValue.value.name)
    })
}

onMounted(() => {
    getCategoryList(current.value, size.value)
})
</script>

<template>
    <div class="container">
        <div class="top-part">
            <Filter :filters="filterOptions" @apply-filters="handleFilter" @reset-filters="handleFilterClear" />
            <div class="operate-btn">
                <el-button type="primary" @click="handleAdd">新增</el-button>
            </div>
            <Table :columns="columns" :table-data="tableData">
                <template v-slot:action>
                    <el-table-column label="操作" width="200" align="center">
                        <template v-slot="{ row }">
<!--                            <el-link type="primary" @click="" class="link-btn">详情</el-link>-->
                            <el-link type="danger" @click.prevent="handleDelete(row)" class="link-btn">删除</el-link>
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
</style>