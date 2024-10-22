<script setup lang="ts">
import { UploadFilled } from '@element-plus/icons-vue'
import { onMounted, reactive, ref } from 'vue'
import { isEmailValid, isNicknameValid } from '@/utils/valid'
import type { CascaderProps, FormInstance, FormRules } from 'element-plus'
import type { Region, Response } from '@/interface'
import { commonAPI, merchantAPI } from '@/request/api'
import store from '@/store'
import router from '@/router'
import { updateUserInfo } from '@/utils/common'

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
let defaultDetailForm = ref({
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
let isFormDataChanged = ref(false)
let hoverTextVisible = ref(false)
let detailFormRef = ref<FormInstance>()

let totalFood = ref(0)
let totalCategory = ref(0)
let totalReview = ref(0)

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

// 表单校验
const validateNickname = (rule: any, value: string, callback: any) => {
    if (!value.trim()) {
        return callback(new Error('请输入商家名称'))
    }
    if (isNicknameValid(value)) {
        isFormDataChanged.value = deepCompare(detailForm.value, defaultDetailForm.value)
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
    if (!value) {
        isFormDataChanged.value = deepCompare(detailForm.value, defaultDetailForm.value)
        callback()
    } else if (value.length > 100) {
        callback(new Error('商家简介长度不能超过100个字符'))
    } else {
        isFormDataChanged.value = deepCompare(detailForm.value, defaultDetailForm.value)
        callback()
    }
}
const validatePhone = (rule: any, value: string, callback: any) => {
    if (!value.trim()) {
        return callback(new Error('请输入手机号'))
    } else if (!/^1[3456789]\d{9}$/.test(value)) {
        callback(new Error('手机号格式不正确'))
    } else {
        isFormDataChanged.value = deepCompare(detailForm.value, defaultDetailForm.value)
        callback()
    }
}
const validateEmail = (rule: any, value: string, callback: any) => {
    if (!value.trim()) {
        return callback(new Error('请输入邮箱'))
    } else if (!isEmailValid(value)) {
        callback(new Error('邮箱格式不正确'))
    } else {
        isFormDataChanged.value = deepCompare(detailForm.value, defaultDetailForm.value)
        callback()
    }
}
const validateRegion = (rule: any, value: string[], callback: any) => {
    if (value.length !== 4) {
        callback(new Error('请选择所在地'))
    } else {
        isFormDataChanged.value = deepCompare(detailForm.value, defaultDetailForm.value)
        callback()
    }
}
const validateAddress = (rule: any, value: string, callback: any) => {
    if (!value.trim()) {
        return callback(new Error('请输入详细地址'))
    } else {
        isFormDataChanged.value = deepCompare(detailForm.value, defaultDetailForm.value)
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

const submitForm = (formEl: FormInstance | undefined) => {
    if (!formEl) return
    formEl.validate((valid) => {
        if (valid) {
            const { address, region } = detailForm.value
            const completeAddress = `${region.join(' ')} ${address}`

            editInfo(detailForm.value.nickname, detailForm.value.intro, detailForm.value.phone, detailForm.value.email, completeAddress)
        }
    })
}
const resetForm = (formEl: FormInstance | undefined) => {
    if (!formEl) return
    isFormDataChanged.value = false
    detailForm.value = defaultDetailForm.value
    formEl.clearValidate()
}

/**
 * 比较是否存在更改
 *
 * @param obj1 第一个对象
 * @param obj2 第二个对象
 * @return 存在更改则返回 true，否则返回 false
 * @author ChiyukiRuon
 */
const deepCompare = (obj1: Record<string, any>, obj2: Record<string, any>): boolean => {
    if (typeof obj1 !== typeof obj2 || obj1 === null || obj2 === null) {
        return obj1 !== obj2
    }

    if (typeof obj1 !== 'object') {
        return obj1 !== obj2
    }

    const keys1 = Object.keys(obj1)
    const keys2 = Object.keys(obj2)

    if (keys1.length !== keys2.length) {
        return true
    }

    for (const key of keys1) {
        if (deepCompare(obj1[key], obj2[key])) {
            return true
        }
    }

    return false
}

// 请求
const uploadAvatar = (file: any) => {
    merchantAPI.uploadFile(file.file, 'avatar').then((res: Response) => {
        detailForm.value.avatar = `${CDN_URL}${res.data.url}`
        editInfo('', '', '', '', '', detailForm.value.avatar)
    })
}
const getStatistic = () => {
    merchantAPI.getStatistic().then((res: Response) => {
        totalFood.value = res.data.statistic.food
        totalCategory.value = res.data.statistic.category
        totalReview.value = res.data.statistic.review
    })
}
const editInfo = (nickname: string = '', intro: string = '', phone: string = '', email: string = '', address: string = '', avatar: string = '') => {
    isLoading.value = true
    merchantAPI.editInfo(nickname, intro, phone, email, address, avatar).then((res: Response) => {
        isLoading.value = false
        isFormDataChanged.value = false
        defaultDetailForm.value = { ...detailForm.value }
        updateUserInfo(res.data)
    }).catch(() => {
        isLoading.value = false
    })
}

onMounted(() => {
    if (store.state.userInfo.role !== 'merchant') {
        router.push('/home')
    }

    const { address, ...userInfo } = store.state.userInfo
    detailForm.value = userInfo
    detailForm.value.region = address.split(' ').slice(0, 4)
    detailForm.value.address = address.split(' ')[4]
    defaultDetailForm.value = { ...detailForm.value }

    getStatistic()
})
</script>

<template>
    <div class="statistic-container">
        <div class="statistic-card">
            <el-statistic title="美食" :value="totalFood" />
        </div>
        <div class="statistic-card">
            <el-statistic title="分类" :value="totalCategory" />
        </div>
        <div class="statistic-card">
            <el-statistic title="评价" :value="totalReview" />
        </div>
    </div>
    <div class="info-container">
        <div class="info-form">
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
                        @blur="isFormDataChanged = deepCompare(detailForm, defaultDetailForm)"
                    />
                    <el-input v-model="detailForm.address" placeholder="详细地址" />
                </el-form-item>
            </el-form>
        </div>
        <div class="license">
            <el-watermark
                style="width: 400px"
                :font="font"
                :gap="[50, 50]"
                :content="['仅用于小众点评平台展示', store.state.userInfo.username]"
            >
                <img style="width: 400px" :src="store.state.userInfo.annex" alt="license" />
            </el-watermark>
        </div>
    </div>
    <div class="button-container" v-if="isFormDataChanged">
        <el-button @click="resetForm(detailFormRef)">重置</el-button>
        <el-button type="primary" @click="submitForm(detailFormRef)" :loading="isLoading">提交</el-button>
    </div>
</template>

<style scoped>
.statistic-container {
    display: flex;
    justify-content: center;
}

.statistic-card {
    width: 200px;
    height: 100px;
    background-color: #ffffff;
    display: flex;
    align-items: center;
    padding: 10px;
    margin-right: 20px;
}

.statistic-card:last-child {
    margin-right: 0;
}

.info-container {
    display: flex;
    align-items: center;
    justify-content: center;
}

.info-form {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 20px;
    margin-right: 40px;
}

.button-container {
    display: flex;
    justify-content: center;
}

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