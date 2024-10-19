<script setup lang="ts">
import { onMounted, ref } from 'vue'
import Table from '@/components/Table.vue'
import { ElButton, ElMessageBox } from 'element-plus'
import type { Response } from '@/interface'
import { formatVerificationType } from '@/utils/common'
import { adminAPI } from '@/request/api'
import Filter from '@/components/Filter.vue'

let isLoading = ref([false, false])   // 0: 拒绝 1: 通过
let dialogVisible = ref(false)

let total = ref(0)
let current = ref(1)
let size = ref(10)

let tableData = ref([])
let dialogValue = ref()
let filterValue = ref({
    username: '',
    nickname: '',
    detail: ''
})

// 配置项
const columns = ref([
    { label: '用户名', prop: 'username' },
    { label: '昵称', prop: 'nickname' },
    { label: '审核项目', prop: 'detail' },
    { label: '审核备注', prop: 'verifyRemark' }
])
const filterOptions = ref([
    { label: '用户名', field: 'username', type: 'text' },
    { label: '昵称', field: 'nickname', type: 'text' },
    {
        label: '审核项目',
        field: 'detail',
        type: 'select',
        props: {
            options: [
                { label: '头像违规', value: 'avatar' },
                { label: '昵称违规', value: 'nickname' },
                { label: '简介违规', value: 'intro' },
            ]
        }
    }
])

// 审核弹窗
const showDialog = (row: any) => {
    dialogValue.value = row
    dialogVisible.value = true
}
const rejectRemark = () => {
    ElMessageBox.prompt('请输入拒绝理由', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValidator: isRemarkValid,
        inputErrorMessage: '请输入拒绝理由'
    })
        .then(({ value }) => {
            verifyUser(dialogValue.value.id, dialogValue.value.user.uid, 0, value)
        })
        .catch(() => {})
}
const isRemarkValid = (remark: string): boolean => {
    if (!remark) return false
    return remark.trim().length > 0
}

// 筛选器回调
const handleFilter = (data: any) => {
    filterValue.value = data
    getUnverifiedUserList(current.value, size.value, data.username, data.nickname, data.detail)
}
const handleFilterClear = () => {
    filterValue.value = {
        username: '',
        nickname: '',
        detail: ''
    }
    getUnverifiedUserList(current.value, size.value)
}

// 分页器回调
const handleSizeChange = (size: number) => {
    getUnverifiedUserList(current.value, size, filterValue.value.username, filterValue.value.nickname, filterValue.value.detail)
}
const handleCurrentChange = (page: number) => {
    getUnverifiedUserList(page, size.value, filterValue.value.username, filterValue.value.nickname, filterValue.value.detail)
}

/**
 * 获取未审核用户列表
 *
 * @param page 页码
 * @param pageSize 每页数量
 * @param username 搜索词
 * @param nickname 搜索词
 * @param detail 搜索词
 * @return void
 * @author ChiyukiRuon
 * */
const getUnverifiedUserList = (page: number, pageSize: number, username: string = '', nickname: string = '', detail: string = '') => {
    adminAPI.unverifiedUserList(page, pageSize, username, nickname, detail).then((res: Response) => {
        tableData.value = res.data.userList.map((item: any) => ({
            ...item,
            username: item.user.username,
            nickname: item.user.nickname,
            detail: formatVerificationType(item.detail)
        }))
        total.value = res.data.total
        current.value = res.data.current
        size.value = res.data.size
    })
}

/**
 * 审核用户
 *
 * @param id 记录id
 * @param uid 用户id
 * @param approve 审核结果
 * @param remark 审核备注
 * @return void
 * @author ChiyukiRuon
 * */
const verifyUser = (id: number, uid: number, approve: number, remark: string = '') => {
    isLoading.value[approve] = true
    adminAPI
        .verifyUser(id, uid, approve, remark)
        .then(() => {
            dialogVisible.value = false
            isLoading.value[approve] = false
            getUnverifiedUserList(current.value, size.value, filterValue.value.username, filterValue.value.nickname, filterValue.value.detail)
        })
        .catch(() => {
            isLoading.value[approve] = false
        })
}

onMounted(() => {
    getUnverifiedUserList(current.value, size.value)
})
</script>

<template>
    <div class="container">
        <div class="top-part">
            <Filter :filters="filterOptions" @apply-filters="handleFilter" @reset-filters="handleFilterClear" />
            <Table :columns="columns" :table-data="tableData">
                <template v-slot:action>
                    <el-table-column label="操作" width="150" align="center">
                        <template v-slot="{ row }">
                            <el-link type="primary" @click="showDialog(row)">详情</el-link>
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
        title="审核详情"
        v-model="dialogVisible"
        width="50%"
        :close-on-click-modal="false"
    >
        <el-descriptions direction="vertical" border style="margin-top: 20px">
            <el-descriptions-item :rowspan="2" :width="140" label="头像" align="center">
                <el-image
                    class="avatar"
                    style="width: 100px; height: 100px"
                    :src="dialogValue.user.avatar"
                />
            </el-descriptions-item>
            <el-descriptions-item label="用户名">{{
                    dialogValue.user.username
                }}</el-descriptions-item>
            <el-descriptions-item label="昵称">{{
                    dialogValue.user.nickname || '无'
                }}</el-descriptions-item>
            <el-descriptions-item label="电话">{{ dialogValue.user.phone || '无' }}</el-descriptions-item>
            <el-descriptions-item label="邮箱">{{ dialogValue.user.email || '无' }}</el-descriptions-item>
            <el-descriptions-item label="简介" :span="3">{{
                    dialogValue.user.intro || '无'
                }}</el-descriptions-item>
        </el-descriptions>
        <div class="btn-area">
            <el-button
                type="success"
                :loading="isLoading[1]"
                :disabled="isLoading[0]"
                @click.prevent="verifyUser(dialogValue.id, dialogValue.user.uid, 1)"
            >通过</el-button
            >
            <el-button
                type="danger"
                :loading="isLoading[0]"
                :disabled="isLoading[1]"
                @click.prevent="rejectRemark"
            >拒绝</el-button
            >
        </div>
    </el-dialog>
</template>

<style scoped>
.container {
    display: flex;
    flex-direction: column; /* 垂直排列子元素 */
    height: 100%;
}

.bottom-part {
    margin-top: auto;
    margin-left: auto;
}

.btn-area {
    width: 100%;
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
}

.avatar {
    width: 5vw;
    height: 5vw;
    border-radius: 100%;
}
</style>