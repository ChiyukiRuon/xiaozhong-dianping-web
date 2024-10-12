<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { isPasswordValid, isUsernameValid } from '@/utils/valid'
import { authAPI, userAPI } from '@/request/api'
import type { MenuItem, Response } from '@/interface'
import { rsa } from '@/utils/rsa'
import store from '@/store'
import router from '@/router'

const ruleFormRef = ref<FormInstance>()
const isLoading = ref(false)
const isRegister = ref(false)
const emits = defineEmits(['close'])

const validateUsername = (rule: any, value: string, callback: any) => {
    if (!value.trim()) {
        return callback(new Error('请输入用户名'))
    }
    if (isUsernameValid(value)) {
        if (isRegister.value) {
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
            callback()
        }
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
            if (isRegister.value) {
                register(ruleForm.username, ruleForm.password)
            } else {
                login(ruleForm.username, ruleForm.password)
            }
        }
    })
}
const resetForm = (formEl: FormInstance | undefined) => {
    if (!formEl) return
    formEl.clearValidate()
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

        authAPI.auth(username, hashedPassword).then((res: Response) => {
            ElMessage.success(res.message)

            localStorage.setItem('token', res.data.token)
            localStorage.setItem('userInfo', JSON.stringify(res.data.user))

            store.commit('setUserInfo', res.data.user)
            store.commit('setPath', res.data.path)
            store.commit('setRoute', res.data.route)

            isLoading.value = false
            emits('close')
            router.push(res.data.path)
        }).catch(() => {
            isLoading.value = false
        })
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

        userAPI.register(username, hashedPassword).then((res: Response) => {
            ElMessage.success(res.message)

            localStorage.setItem('token', res.data.token)
            localStorage.setItem('userInfo', JSON.stringify(res.data.user))

            store.commit('setUserInfo', res.data.user)
            store.commit('setPath', res.data.path)
            store.commit('setRoute', res.data.route)

            isLoading.value = false
            emits('close')
            router.push('/')
        }).catch(() => {
            isLoading.value = false
        })
    })

}
</script>

<template>
    <div class="login">
        <div class="logo-area">
            <div class="logo-title">小众点评</div>
            <img src="../../public/icon.png" width="200">
        </div>
        <div class="vertical-divider"></div>
        <div class="form-area">
            <div class="form-title" :style="isRegister ? 'margin-bottom: 6px' : ''">
                <div :style="isRegister ? 'color: #000000' : 'color: #7CB8F2'">用户登录</div>
                <div class="vertical-divider" style="height: 30px; margin: 10px"></div>
                <div :style="isRegister ? 'color: #7CB8F2' : 'color: #000000'">用户注册</div>
            </div>
            <el-form
                ref="ruleFormRef"
                style="width: 350px"
                :model="ruleForm"
                status-icon
                :rules="rules"
                label-width="auto"
            >
                <el-form-item label="用户名" prop="username" class="form-item">
                    <el-input v-model="ruleForm.username" type="text" autocomplete="off" />
                </el-form-item>
                <el-form-item label="密码" prop="password" class="form-item">
                    <el-input
                        v-model="ruleForm.password"
                        type="password"
                        autocomplete="off"
                        show-password
                    />
                </el-form-item>
                <el-form-item v-if="isRegister" label="确认密码" prop="confirm" class="form-item">
                    <el-input v-model="ruleForm.confirm" type="password" autocomplete="off" />
                </el-form-item>
                <el-form-item class="btn-area" :style="isRegister ? 'margin-top: 19px' : ''">
                    <el-button @click="isRegister = !isRegister;resetForm(ruleFormRef)" class="btn">
                        {{ isRegister ? '返回' : '注册' }}
                    </el-button>
                    <el-button
                        type="primary"
                        :loading="isLoading"
                        @click="submitForm(ruleFormRef)"
                        v-if="!isRegister"
                        class="btn">
                        登录
                    </el-button>
                    <el-button
                        type="primary"
                        :loading="isLoading"
                        @click="submitForm(ruleFormRef)"
                        v-if="isRegister"
                        class="btn">
                        注册并登录
                    </el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
    <div class="footer">
        想要成为商家？<a href="/apply">点此注册</a>
    </div>
</template>

<style scoped>
.login {
    height: 100% !important;
    display: flex;
    align-items: center;
}

.vertical-divider {
    width: 1px;
    height: 300px;
    background-color: rgba(52, 152, 219, 0.28);
    margin: 20px;
}

.logo-area {
    margin: 0 20px;
}

.logo-title {
    font-size: 1.5vw;
    font-weight: bold;
    color: var(--theme-color);
    text-align: center;
}

.form-area {
    margin: 0 45px;
    width: 380px;
}

.form-title {
    display: flex;
    font-size: 1.5vw;
    justify-content: center;
    margin-bottom: 25px;
    text-align: center;
}

.form-item {
    margin-left: 40px;
}

.btn-area {
    margin-top: 50px;
    margin-left: 38px;
}

.btn {
    width: 150px;
}

.footer {
    text-align: center;
}
</style>