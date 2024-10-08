<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { isPasswordValid, isUsernameValid } from '@/utils/valid'
import { auth } from '@/request/api'
import type { response } from '@/interface/api'
import { rsa } from '@/utils/rsa'
import store from '@/store'
import router from '@/router'

const ruleFormRef = ref<FormInstance>()
const isLoading = ref(false)

const validateUsername = (rule: any, value: string, callback: any) => {
    if (!value.trim()) {
        return callback(new Error('请输入用户名'))
    }
    if (isUsernameValid(value)) {
        callback()
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
    } else if (value !== ruleForm.password) {
        callback(new Error("两次输入的密码不一致"))
    } else {
        callback()
    }
}

const ruleForm = reactive({
    username: '',
    password: '',
    confirm: ''
})

const rules = reactive<FormRules<typeof ruleForm>>({
    username: [{ validator: validateUsername, trigger: 'blur' }],
    password: [{ validator: validatePass, trigger: 'blur' }],
    confirm: [{ validator: validatePass2, trigger: 'blur' }]
})

const submitForm = (formEl: FormInstance | undefined) => {
    if (!formEl) return
    formEl.validate((valid) => {
        if (valid) {
            console.log('submit!')
        } else {
            console.log('error submit!')
        }
    })
}

const resetForm = (formEl: FormInstance | undefined) => {
    if (!formEl) return
    formEl.resetFields()
}

const login = (username: string, password: string) => {
    let hashedPassword: string
    rsa(password).then((hashed) => {
        if (!hashed) {
            console.error('RSA加密失败')
            return
        }
        hashedPassword = hashed
        isLoading.value = true

        auth(username, hashedPassword).then((res: response) => {
            ElMessage.success(res.message)
            localStorage.setItem('token', res.data.token)
            localStorage.setItem('userInfo', JSON.stringify(res.data.user))
            store.commit('setUserInfo', res.data.user)
            isLoading.value = false
            router.push('/dashboard')
            console.log(localStorage.getItem('token'), store.state.userInfo)
        }).catch((err: response) => {
            isLoading.value = false
        })
    })
}
</script>

<template>
    <div class="login">
        <div>
            <div class="login-title">小众点评</div>
            <img src="../../public/icon.png" width="200">
        </div>
        <div class="vertical-divider"></div>
        <div>
            <div class="form-title">用户登录</div>
            <el-form
                ref="ruleFormRef"
                style="width: 300px"
                :model="ruleForm"
                status-icon
                :rules="rules"
                label-width="auto"
                class="demo-ruleForm"
            >
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="ruleForm.username" type="text" autocomplete="off" />
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input
                        v-model="ruleForm.password"
                        type="password"
                        autocomplete="off"
                        show-password
                    />
                </el-form-item>
                <el-form-item>
                    <el-button @click="resetForm(ruleFormRef)">注册</el-button>
                    <el-button type="primary" :loading="isLoading" @click="login(ruleForm.username, ruleForm.password)">
                        登录
                    </el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
    <div class="footer">
        想要成为商家？<a href="/register">点此注册</a>
    </div>
</template>

<style scoped>
.login {
    height: 100% !important;
    display: flex;
    align-items: center;
    justify-content: center;
}

.vertical-divider {
    width: 1px;
    height: 300px;
    background-color: rgba(52, 152, 219, 0.28);
    margin: 20px;
}


.login-title {
    font-size: 1.5vw;
    font-weight: bold;
    color: var(--theme-color);
    text-align: center;
}

.form-title {
    font-size: 1.5vw;
    margin-bottom: 40px;
    text-align: center;
}

.footer {
    text-align: center;
}
</style>