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
    { label: '商家名', prop: 'nickname' },
    { label: '审核项目', prop: 'detail' },
    { label: '审核备注', prop: 'verifyRemark' }
])
const filterOptions = ref([
    { label: '用户名', field: 'username', type: 'text' },
    { label: '商家名', field: 'nickname', type: 'text' },
    // {
    //     label: '审核项目',
    //     field: 'detail',
    //     type: 'select',
    //     props: {
    //         options: [
    //             { label: '商家申请', value: 'register' },
    //             { label: '头像违规', value: 'avatar' },
    //             { label: '商家名违规', value: 'nickname' },
    //             { label: '简介违规', value: 'intro' },
    //             { label: '邮箱无效', value: 'email' },
    //             { label: '手机号无效', value: 'phone' },
    //             { label: '地址无效', value: 'address' },
    //             { label: '资质无效', value: 'annex' },
    //         ]
    //     }
    // }
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
            verifyMerchant(dialogValue.value.id, dialogValue.value.user.uid, 0, value)
        })
        .catch(() => {})
}
const isRemarkValid = (remark: string): boolean => {
    console.log(remark)
    if (!remark) return false
    return remark.trim().length > 0
}

// 筛选器回调
const handleFilter = (data: any) => {
    filterValue.value = data
    getUnverifiedMerchantList(current.value, size.value, data.username, data.nickname, data.detail)
}
const handleFilterClear = () => {
    filterValue.value = {
        username: '',
        nickname: '',
        detail: ''
    }
    getUnverifiedMerchantList(current.value, size.value)
}

// 分页器回调
const handleSizeChange = (size: number) => {
    getUnverifiedMerchantList(current.value, size, filterValue.value.username, filterValue.value.nickname, filterValue.value.detail)
}
const handleCurrentChange = (page: number) => {
    getUnverifiedMerchantList(page, size.value, filterValue.value.username, filterValue.value.nickname, filterValue.value.detail)
}

/**
 * 获取未审核商家列表
 *
 * @param page 页码
 * @param pageSize 每页数量
 * @param username 搜索词
 * @param nickname 搜索词
 * @param detail 搜索词
 * @return void
 * @author ChiyukiRuon
 * */
const getUnverifiedMerchantList = (page: number, pageSize: number, username: string = '', nickname: string = '', detail: string = '') => {
    adminAPI.unverifiedMerchantList(page, pageSize, username, nickname, detail).then((res: Response) => {
        tableData.value = res.data.merchantList.map((item: any) => ({
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
 * 审核商家
 *
 * @param id 记录id
 * @param uid 用户id
 * @param approve 审核结果
 * @param remark 审核备注
 * @return void
 * @author ChiyukiRuon
 * */
const verifyMerchant = (id: number, uid: number, approve: number, remark: string = '') => {
    isLoading.value[approve] = true
    adminAPI
        .verifyMerchant(id, uid, approve, remark)
        .then(() => {
            dialogVisible.value = false
            isLoading.value[approve] = false
            getUnverifiedMerchantList(current.value, size.value, filterValue.value.username, filterValue.value.nickname, filterValue.value.detail)
        })
        .catch(() => {
            isLoading.value[approve] = false
        })
}

onMounted(() => {
    getUnverifiedMerchantList(current.value, size.value)
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
                v-model:current-page="current"
                v-model:page-size="size"
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
        top="20px"
        :close-on-click-modal="false"
    >
        <el-descriptions direction="vertical" border style="margin-top: 20px">
            <el-descriptions-item :rowspan="2" :width="140" label="商家头像" align="center">
                <el-image
                    class="avatar"
                    style="width: 100px; height: 100px"
                    :src="dialogValue.user.avatar"
                />
            </el-descriptions-item>
            <el-descriptions-item label="用户名">{{
                dialogValue.user.username
            }}</el-descriptions-item>
            <el-descriptions-item label="商家名">{{
                dialogValue.user.nickname
            }}</el-descriptions-item>
            <el-descriptions-item label="电话">{{ dialogValue.user.phone }}</el-descriptions-item>
            <el-descriptions-item label="邮箱">{{ dialogValue.user.email }}</el-descriptions-item>
            <el-descriptions-item label="商家简介" :span="3">{{
                dialogValue.user.intro || '无'
            }}</el-descriptions-item>
            <el-descriptions-item label="商家地址" :span="3">{{
                dialogValue.user.address
            }}</el-descriptions-item>
            <el-descriptions-item label="商家资质" :span="3">
                <el-image style="width: 100%" :src="dialogValue.user.annex" />
            </el-descriptions-item>
        </el-descriptions>
        <div class="btn-area">
            <el-button
                type="success"
                :loading="isLoading[1]"
                :disabled="isLoading[0]"
                @click.prevent="verifyMerchant(dialogValue.id, dialogValue.user.uid, 1)"
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