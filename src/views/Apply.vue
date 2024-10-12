<script setup lang="ts">
import { ArrowRightBold, Check, Edit, Upload, User } from '@element-plus/icons-vue'
import { reactive, ref } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { isPasswordValid, isUsernameValid } from '@/utils/valid'
import { authAPI, userAPI, merchantAPI } from '@/request/api'
import type { Response } from '@/interface'
import { rsa } from '@/utils/rsa'
import store from '@/store'
import router from '@/router'

let step = ref(0)

const registerFormRef = ref<FormInstance>()
const isLoading = ref(false)

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

const registerForm = reactive({
    username: '',
    password: '',
    confirm: ''
})
const registerRules = reactive<FormRules<typeof registerForm>>({
    username: [{ validator: validateUsername, trigger: 'blur' }],
    password: [{ validator: validatePass, trigger: 'blur' }],
    confirm: [{ validator: validatePass2, trigger: 'blur' }]
})

const submitRegister = (formEl: FormInstance | undefined) => {
    if (!formEl) return
    formEl.validate((valid) => {
        if (valid) {
            register(registerForm.username, registerForm.password)
        }
    })
}

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
</script>

<template>
    <el-container style="width: 100vw; height: 100vh">
        <el-header class="header">
            <div><img class="icon" src="../../public/icon.png" alt="icon" width="50vw"/></div>
            <div class="title">小众点评</div>
            <div class="sub-title">商家申请</div>
        </el-header>
        <el-main style="height: 100%; display: flex; flex-direction: column; align-items: center;">
            <el-steps style="width: 100%; max-width: 800px" :active="step">
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
                <el-button @click="step++">下一页</el-button>
            </div>
            <div v-else-if="step === 1">
                基本信息
                <el-button @click="step++">下一页</el-button>
            </div>
            <div v-else-if="step === 2">
                营业执照
                <el-button @click="step++">下一页</el-button>
            </div>
            <div v-else>
                <div>注册成功</div>
                <el-button @click="step = 0">重置</el-button>
            </div>
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
</style>