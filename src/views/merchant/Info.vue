<script setup lang="ts">
import { UploadFilled } from '@element-plus/icons-vue'
import { onMounted, reactive, ref } from 'vue'
import { isEmailValid, isNicknameValid } from '@/utils/valid'
import type { CascaderProps, FormRules } from 'element-plus'
import type { Region, Response } from '@/interface'
import { commonAPI, merchantAPI } from '@/request/api'
import store from '@/store'
import router from '@/router'

const CDN_URL = import.meta.env.VITE_CDN_URL

let detailForm = ref({
    avatar: `${CDN_URL}/avatar/default.jpg`,
    nickname: '',
    intro: '',
    phone: '',
    email: '',
    region: [],
    address: '',
    annex: ''
})
let isLoading = ref(false)
let hoverTextVisible = ref(false)

// 配置参数
const props: CascaderProps = {
    lazy: true,
    lazyLoad(node: any, resolve: any) {
        const { level, data } = node
        commonAPI
            .getRegions(data.code)
            .then((res: Response) => {
                const nodes = res.data.map((item: Region) => ({
                    code: item.code,
                    value: item.name,
                    label: item.name,
                    leaf: level >= 3
                }))
                resolve(nodes)
            })
            .catch(() => {
                resolve()
            })
    }
}
const font = reactive({
    color: 'rgba(0, 0, 0, .15)',
    fontSize: 10,
})

const validateNickname = (rule: any, value: string, callback: any) => {
    if (!value.trim()) {
        return callback(new Error('请输入商家名称'))
    }
    if (isNicknameValid(value)) {
        callback()
    } else {
        if (value.length < 3 || value.length > 30) {
            callback(new Error('商家名称长度应在3到30个字符之间'))
        } else {
            callback(new Error('商家名称含有非法字符'))
        }
    }
}
const validateIntro = (rule: any, value: string, callback: any) => {
    if (!value.trim()) {
        return callback(new Error('请输入商家简介'))
    } else if (value.length > 100) {
        callback(new Error('商家简介长度不能超过100个字符'))
    } else {
        callback()
    }
}
const validatePhone = (rule: any, value: string, callback: any) => {
    if (!value.trim()) {
        return callback(new Error('请输入手机号'))
    } else if (!/^1[3456789]\d{9}$/.test(value)) {
        callback(new Error('手机号格式不正确'))
    } else {
        callback()
    }
}
const validateEmail = (rule: any, value: string, callback: any) => {
    if (!value.trim()) {
        return callback(new Error('请输入邮箱'))
    } else if (!isEmailValid(value)) {
        callback(new Error('邮箱格式不正确'))
    } else {
        callback()
    }
}
const validateRegion = (rule: any, value: string[], callback: any) => {
    if (value.length !== 4) {
        callback(new Error('请选择所在地'))
    } else {
        callback()
    }
}
const validateAddress = (rule: any, value: string, callback: any) => {
    if (!value.trim()) {
        return callback(new Error('请输入详细地址'))
    } else {
        callback()
    }
}

const detailRules = reactive<FormRules<typeof detailForm>>({
    nickname: [{ validator: validateNickname, trigger: 'blur' }],
    intro: [{ validator: validateIntro, trigger: 'blur' }],
    phone: [{ validator: validatePhone, trigger: 'blur' }],
    email: [{ validator: validateEmail, trigger: 'blur' }],
    region: [{ validator: validateRegion, trigger: 'change' }],
    address: [{ validator: validateAddress, trigger: 'blur' }]
})

const uploadAvatar = (file: any) => {
    merchantAPI.uploadFile(file.file, 'avatar').then((res: Response) => {
        detailForm.value.avatar = `${CDN_URL}${res.data.url}`
    })
}

onMounted(() => {
    if (store.state.userInfo.role !== 'merchant') {
        router.push('/')
    }

    const { address, ...userInfo } = store.state.userInfo
    detailForm.value = userInfo
    detailForm.value.region = address.split(' ').slice(0, 4)
    detailForm.value.address = address.split(' ')[4]
})
</script>

<template>
    <el-form
        ref="detailFormRef"
        :rules="detailRules"
        :model="detailForm"
        status-icon
        label-width="auto"
        style="width: 400px"
    >
        <el-form-item label="" prop="avatar">
            <el-upload
                style="display: flex; flex-direction: column; width: 100%"
                accept="image/jpeg, image/png"
                :show-file-list="false"
                :http-request="uploadAvatar"
            >
                <template #trigger>
                    <div
                        class="image-container"
                        @mouseover="hoverTextVisible = true"
                        @mouseleave="hoverTextVisible = false"
                    >
                        <img class="avatar" :src="detailForm.avatar" alt="avatar" />
                        <div class="overlay" v-if="hoverTextVisible">
                            <el-icon size="20"><UploadFilled /></el-icon>
                        </div>
                    </div>
                </template>
            </el-upload>
        </el-form-item>
        <el-form-item label="商家名称" prop="nickname" class="form-item">
            <el-input v-model="detailForm.nickname" placeholder="商家名称" />
        </el-form-item>
        <el-form-item label="商家简介" prop="intro" class="form-item">
            <el-input
                v-model="detailForm.intro"
                placeholder="商家简介"
                type="textarea"
                maxlength="100"
                :rows="4"
                show-word-limit
            />
        </el-form-item>
        <el-form-item label="手机号" prop="phone" class="form-item">
            <el-input :maxlength="11" placeholder="手机号" v-model="detailForm.phone" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email" class="form-item">
            <el-input v-model="detailForm.email" placeholder="邮箱" />
        </el-form-item>
        <el-form-item label="地址" prop="address" class="form-item">
            <el-cascader
                style="width: 100%; margin-bottom: 5px"
                placeholder="选择省市区"
                :props="props"
                v-model="detailForm.region"
                separator=" "
            />
            <el-input v-model="detailForm.address" placeholder="详细地址" />
        </el-form-item>
    </el-form>
    <el-watermark style="width: 400px" :font="font" :gap="[50, 50]" :content="['仅用于小众点评平台展示', store.state.userInfo.username]">
        <img style="width: 400px" :src="store.state.userInfo.annex" alt="license" />
    </el-watermark>
</template>

<style scoped>
.avatar {
    width: 5vw;
    height: 5vw;
    border-radius: 50%;
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
    border-radius: 100%;
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