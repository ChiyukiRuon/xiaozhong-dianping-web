<script setup lang="ts">
import { ArrowRightBold, Check, Edit, Upload, UploadFilled, User } from '@element-plus/icons-vue'
import { onMounted, reactive, ref } from 'vue'
import { type CascaderProps, ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { isEmailValid, isNicknameValid, isPasswordValid, isUsernameValid } from '@/utils/valid'
import { commonAPI, userAPI, merchantAPI } from '@/request/api'
import type { Region, Response } from '@/interface'
import { rsa } from '@/utils/rsa'
import store from '@/store'
import router from '@/router'
import { logout } from '@/utils/common'

let step = ref(0)

const CDN_URL = import.meta.env.VITE_CDN_URL
const registerFormRef = ref<FormInstance>()
const detailFormRef = ref<FormInstance>()
const isLoading = ref(false)
const hoverTextVisible = ref(false)

// 级联下拉框配置
const props: CascaderProps = {
    lazy: true,
    lazyLoad(node: any, resolve: any) {
        const { level, data } = node
        commonAPI.getRegions(data.code).then((res: Response) => {
            const nodes = res.data.map((item: Region) => ({
                code: item.code,
                value: item.name,
                label: item.name,
                leaf: level >= 3,
            }))
            resolve(nodes)
        }).catch(() => {
            resolve()
        })
    },
}

// 表单数据
const registerForm = reactive({
    username: '',
    password: '',
    confirm: ''
})
const detailForm = reactive({
    avatar: `${CDN_URL}/avatar/default.jpg`,
    nickname: '',
    intro: '',
    phone: '',
    email: '',
    region: [],
    address: '',
    annex: ''
})

// 表单校验规则
const validateUsername = (rule: any, value: string, callback: any) => {
    if (!value.trim()) {
        return callback(new Error('请输入用户名'))
    }
    if (isUsernameValid(value)) {
        userAPI.isUsernameAvailable(value).then((res: Response) => {
            console.log(res.data)
            if (!res.data.available) {
                callback(new Error('用户名已存在'))
            } else {
                callback()
            }
        }).catch(() => {
            callback(new Error('服务器内部错误'))
        })
    } else {
        if (value.length < 3 || value.length > 30) {
            callback(new Error('用户名长度应在3到30个字符之间'))
        }
        const invalidChars = value.split('').filter(char => !/^[a-zA-Z0-9_]$/.test(char));
        if (invalidChars.length > 0) {
            callback(new Error(`用户名只能包含字母、数字和下划线`))
        }
    }
}
const validatePass = (rule: any, value: string, callback: any) => {
    if (value.trim() === '') {
        callback(new Error('请输入密码'))
    } else {
        if (isPasswordValid(value)) {
            callback()
        } else {
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
    } else if (value !== registerForm.password) {
        callback(new Error("两次输入的密码不一致"))
    } else {
        callback()
    }
}
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

const registerRules = reactive<FormRules<typeof registerForm>>({
    username: [{ validator: validateUsername, trigger: 'blur' }],
    password: [{ validator: validatePass, trigger: 'blur' }],
    confirm: [{ validator: validatePass2, trigger: 'blur' }]
})
const detailRules = reactive<FormRules<typeof detailForm>>({
    nickname: [{ validator: validateNickname, trigger: 'blur' }],
    intro: [{ validator: validateIntro, trigger: 'blur' }],
    phone: [{ validator: validatePhone, trigger: 'blur' }],
    email: [{ validator: validateEmail, trigger: 'blur' }],
    region: [{ validator: validateRegion, trigger: 'change' }],
    address: [{ validator: validateAddress, trigger: 'blur' }]
})

// 注册表单提交
const submitRegister = (formEl: FormInstance | undefined) => {
    if (!formEl) return
    formEl.validate((valid) => {
        if (valid) {
            register(registerForm.username, registerForm.password)
        }
    })
}
const submitDetail = (formEl: FormInstance | undefined) => {
    if (!formEl) return
    formEl.validate((valid) => {
        if (valid) {
            step.value++
        }
    })
}
const submitApply = () => {
    if (detailForm.annex === '') {
        ElMessage.warning('请上传营业执照')
    } else {
        apply(detailForm)
    }
}

// API请求
const register = (username: string, password: string) => {
    let hashedPassword: string
    rsa(password).then((hashed) => {
        if (!hashed) {
            console.error('RSA加密失败')
            return
        }
        hashedPassword = hashed
        isLoading.value = true

        merchantAPI.register(username, hashedPassword).then((res: Response) => {
            ElMessage.success(res.message)

            localStorage.setItem('token', res.data.token)
            localStorage.setItem('userInfo', JSON.stringify(res.data.user))

            store.commit('setUserInfo', res.data.user)
            store.commit('setPath', res.data.path)
            store.commit('setRoute', res.data.route)

            isLoading.value = false
            step.value++
        }).catch(() => {
            isLoading.value = false
        })
    })

}
const apply = (formData: any) => {
    const { address, region } = formData
    const completeAddress = `${region.join(' ')} ${address}`

    isLoading.value = true
    merchantAPI.apply(formData.avatar, formData.nickname, formData.intro, formData.phone, formData.email, completeAddress, formData.annex).then(() => {
        isLoading.value = false
        step.value++
    }).catch(() => {
        isLoading.value = false
    })
}
const uploadAvatar = (file: any) => {
    merchantAPI.uploadFile(file.file, 'avatar').then((res: Response) => {
        detailForm.avatar = `${CDN_URL}${res.data.url}`
    })
}
const uploadAnnex = (file: any) => {
    merchantAPI.uploadFile(file.file, 'annex').then((res: Response) => {
        detailForm.annex = `${CDN_URL}${res.data.url}`
    })
}

/**
 * 返回首页
 *
 * @return void
 * @author ChiyukiRuon
 * */
const backToHome = () => {
    logout()
    router.push('/home')
}

onMounted(() => {
    if (localStorage.getItem('token')) {
        const userInfo = store.state.userInfo
        if (userInfo.role !== 'merchant') {
            backToHome()
        } else if (userInfo.status === 1) {
            step.value = 4
        } else if (userInfo.status === 4 || userInfo.status === 5) {
            step.value = 1
        } else {
            backToHome()
        }
    }
})
</script>

<template>
    <el-container style="width: 100vw; height: 100vh">
        <el-header class="header">
            <div><img class="icon" src="../../public/icon.png" alt="icon" width="50vw"/></div>
            <div class="title">小众点评</div>
            <div class="sub-title">商家申请</div>
        </el-header>
        <el-main style="height: 100%; display: flex; flex-direction: column; align-items: center;">
            <el-steps style="width: 100%; max-width: 800px; margin-bottom: 30px" :active="step">
                <el-step title="Step 1" description="注册账户" :icon="User" />
                <el-step title="Step 2" description="填写基本信息" :icon="Edit" />
                <el-step title="Step 3" description="上传营业执照" :icon="Upload" />
                <el-step title="Step 4" description="等待审核" :icon="Check" />
            </el-steps>
            <div v-if="step === 0">
                <el-form
                    ref="registerFormRef"
                    style="width: 350px"
                    :model="registerForm"
                    status-icon
                    :rules="registerRules"
                    label-width="auto"
                >
                    <el-form-item label="用户名" prop="username" class="form-item">
                        <el-input v-model="registerForm.username" type="text" autocomplete="off" />
                    </el-form-item>
                    <el-form-item label="密码" prop="password" class="form-item">
                        <el-input
                            v-model="registerForm.password"
                            type="password"
                            autocomplete="off"
                            show-password
                        />
                    </el-form-item>
                    <el-form-item label="确认密码" prop="confirm" class="form-item">
                        <el-input v-model="registerForm.confirm" type="password" autocomplete="off" />
                    </el-form-item>
                </el-form>
                <div class="btn-area">
                    <el-button
                        type="primary"
                        :loading="isLoading"
                        @click="submitRegister(registerFormRef)"
                        class="btn">
                        下一步
                        <el-icon><ArrowRightBold /></el-icon>
                    </el-button>
                </div>
            </div>
            <div v-else-if="step === 1">
                <el-form
                    ref="detailFormRef"
                    :rules="detailRules"
                    :model="detailForm"
                    status-icon
                    label-width="auto"
                    style="width: 400px">
                    <el-form-item label="" prop="avatar">
                        <el-upload
                            style="display: flex;
                            flex-direction: column; width: 100%"
                            accept="image/jpeg, image/png"
                            :show-file-list="false"
                            :http-request="uploadAvatar"
                        >
                            <template #trigger>
                                <div class="image-container"
                                     @mouseover="hoverTextVisible = true"
                                     @mouseleave="hoverTextVisible = false">
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
                            @blur="console.log(detailForm.region)"
                            :props="props"
                            v-model="detailForm.region"
                            separator=" "/>
                        <el-input v-model="detailForm.address" placeholder="详细地址" />
                    </el-form-item>
                </el-form>
                <div class="btn-area">
                    <el-button
                        type="primary"
                        :loading="isLoading"
                        @click="submitDetail(detailFormRef)"
                        class="btn">
                        下一步
                        <el-icon><ArrowRightBold /></el-icon>
                    </el-button>
                </div>
            </div>
            <div v-else-if="step === 2">
                <el-upload
                    class="drag-upload"
                    drag
                    style="width: 400px"
                    accept="image/jpeg, image/png"
                    :show-file-list="false"
                    :http-request="uploadAnnex"
                >
                    <div v-if="detailForm.annex === ''">
                        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                        <div class="el-upload__text">
                            将文件拖到这里或 <em>点击上传</em>
                        </div>
                    </div>
                    <div v-else>
                        <img :src="detailForm.annex" alt="annex" style="width: 100%" />
                    </div>
                    <template #tip>
                        <div class="el-upload__tip">
                            仅支持 jpg、png、jpeg 格式，且不超过 2MB
                        </div>
                    </template>
                </el-upload>
                <div class="btn-area">
                    <el-button
                        type="primary"
                        :loading="isLoading"
                        @click="submitApply"
                        class="btn">
                        下一步
                        <el-icon><ArrowRightBold /></el-icon>
                    </el-button>
                </div>
            </div>
            <div v-else>
                <el-result
                    icon="success"
                    title="申请提交成功"
                    sub-title="请等待我们的审核"
                >
                    <template #extra>
                        <el-button type="primary" @click="backToHome">返回首页</el-button>
                    </template>
                </el-result>
            </div>
<!--            <el-button @click="step++">下一页</el-button>-->
<!--            <el-button @click="step&#45;&#45;">上一页</el-button>-->
<!--            <el-button @click="step = 0">重置</el-button>-->
        </el-main>
    </el-container>
</template>

<style scoped>
/deep/.el-step__icon {
    background-color: #f1f1f1 !important;
}

.btn-area {
    width: 100%;
    display: flex;
    justify-content: flex-end;
}

.btn {
    margin: 0;
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