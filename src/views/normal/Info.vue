<script setup lang="ts">
import { UploadFilled } from '@element-plus/icons-vue'
import { onMounted, reactive, ref } from 'vue'
import { isNicknameValid, isPasswordValid } from '@/utils/valid'
import { type FormInstance, type FormRules } from 'element-plus'
import type { Response } from '@/interface'
import { userAPI } from '@/request/api'
import store from '@/store'
import { updateUserInfo } from '@/utils/common'
import { rsa } from '@/utils/rsa'

const CDN_URL = import.meta.env.VITE_CDN_URL

let detailForm = ref({
    avatar: `${CDN_URL}/avatar/default.jpg`,
    nickname: '',
    password: '',
    confirm: '',
})
let defaultDetailForm = ref({
    avatar: `${CDN_URL}/avatar/default.jpg`,
    nickname: '',
    password: '',
    confirm: '',
})

let isLoading = ref(false)
let isFormDataChanged = ref(false)
let isChangePassword = ref(false)
let hoverTextVisible = ref(false)
let detailFormRef = ref<FormInstance>()

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
const validatePass = (rule: any, value: string, callback: any) => {
    if (value.trim() === '') {
        isChangePassword.value = false
        callback()
    } else {
        if (isPasswordValid(value)) {
            isChangePassword.value = true
            isFormDataChanged.value = true
            callback()
        } else {
            isChangePassword.value = false
            isFormDataChanged.value = false
            const hasUpperCase = /[A-Z]/.test(value);
            const hasLowerCase = /[a-z]/.test(value);
            const hasNumber = /[0-9]/.test(value);
            const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);

            if (value.length < 4 || value.length > 20) {
                callback(new Error('密码长度应在4到20个字符之间'))
            }
            if (!hasUpperCase) {
                callback(new Error('密码必须包含至少一个大写字母'))
            }
            if (!hasLowerCase) {
                callback(new Error('密码必须包含至少一个小写字母'))
            }
            if (!hasNumber) {
                callback(new Error('密码必须包含至少一个数字'))
            }
            if (!hasSpecialChar) {
                callback(new Error('密码必须包含至少一个特殊字符'))
            }
        }
    }
}
const validatePass2 = (rule: any, value: string, callback: any) => {
    if (value.trim() === '') {
        callback(new Error('请输入确认密码'))
    } else if (value !== detailForm.value.password) {
        callback(new Error("两次输入的密码不一致"))
    } else {
        callback()
    }
}

const detailRules = reactive<FormRules<typeof detailForm>>({
    nickname: [{ validator: validateNickname, trigger: 'blur' }],
    password: [{ validator: validatePass, trigger: 'blur' }],
    confirm: [{ validator: validatePass2, trigger: 'blur' }],
})

const submitForm = (formEl: FormInstance | undefined) => {
    if (!formEl) return
    formEl.validate((valid) => {
        if (valid) {
            if (detailForm.value.password) {
                let hashedPassword: string
                rsa(detailForm.value.password).then((hashed) => {
                    if (!hashed) {
                        console.error('RSA加密失败')
                        return
                    }
                    hashedPassword = hashed
                    isLoading.value = true

                    editInfo(
                        detailForm.value.nickname,
                        detailForm.value.avatar,
                        hashedPassword
                    )
                })
            } else {
                editInfo(
                    detailForm.value.nickname,
                    detailForm.value.avatar
                )
            }
        }
    })
}
const resetForm = (formEl: FormInstance | undefined) => {
    if (!formEl) return
    isFormDataChanged.value = false
    isChangePassword.value = false
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
    userAPI.uploadFile(file.file, 'avatar').then((res: Response) => {
        detailForm.value.avatar = `${CDN_URL}${res.data.url}`
        editInfo('', detailForm.value.avatar)
    })
}
const editInfo = (
    nickname: string = '',
    avatar: string = '',
    password: string = '',
) => {
    isLoading.value = true
    userAPI
        .editInfo(nickname, avatar, password)
        .then((res: Response) => {
            isLoading.value = false
            isFormDataChanged.value = false
            isChangePassword.value = false

            defaultDetailForm.value = { ...detailForm.value }
            detailForm.value.password = ''
            detailForm.value.confirm = ''
            defaultDetailForm.value.password = ''
            defaultDetailForm.value.confirm = ''

            updateUserInfo(res.data)
        })
        .catch(() => {
            isLoading.value = false
        })
}

onMounted(() => {
    const { avatar, nickname } = store.state.userInfo
    detailForm.value.avatar = avatar
    detailForm.value.nickname = nickname
    defaultDetailForm.value = { ...detailForm.value }
})
</script>

<template>
    <div class="">
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
                <el-form-item label="昵称" prop="nickname" class="form-item">
                    <el-input v-model="detailForm.nickname" placeholder="昵称" />
                </el-form-item>
                <el-form-item label="修改密码" prop="password" class="form-item">
                    <el-input
                        v-model="detailForm.password"
                        type="password"
                        autocomplete="off"
                        show-password
                        clearable
                    />
                </el-form-item>
                <el-form-item v-if="isChangePassword" label="确认密码" prop="confirm" class="form-item">
                    <el-input
                        v-model="detailForm.confirm"
                        type="password"
                        autocomplete="off"
                        show-password
                        clearable
                    />
                </el-form-item>
            </el-form>
        </div>
    </div>
    <div class="button-container" v-if="isFormDataChanged">
        <el-button @click="resetForm(detailFormRef)">重置</el-button>
        <el-button type="primary" @click="submitForm(detailFormRef)" :loading="isLoading"
            >提交</el-button
        >
    </div>
</template>

<style scoped>
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