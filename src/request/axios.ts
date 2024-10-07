import axios from 'axios';
import { ElMessage } from 'element-plus'

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL
axios.create({
    // baseURL: import.meta.env.BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 5000,
    withCredentials: true
})

axios.interceptors.request.use(
    config => {
        console.log(config, import.meta.env.VITE_BASE_URL)
        if (localStorage.getItem('token')) {
            config.headers.set('Authorization', localStorage.getItem('token'))
        }
        return config
    },
    error => Promise.reject(error)
)

axios.interceptors.response.use(
    response => {
        console.log(response)
        if (response.status === 200) {
            return Promise.resolve(response)
        } else {
            return Promise.reject(response)
        }
    },
    error => {
        if (error.response) {
            switch (error.response.status) {
                case 400:
                    ElMessage.error('请求错误')
                    break;
                case 401:
                    ElMessage.error('登录过期，请重新登录')
                    localStorage.removeItem('token')
                    break;
                case 403:
                    ElMessage.error('拒绝访问')
                    break;
                case 404:
                    ElMessage.error('请求错误，未找到该资源')
                    break;
                case 500:
                    ElMessage.error('服务器内部错误')
                    break;
                default:
                    ElMessage.error('未知错误')
            }
        }
    }
)

export const get = (url: string, params: Object): Promise<Object> => {
    return new Promise((resolve, reject) => {
        axios.get(url, {
            params: params,
        }).then(res => {
            resolve(res.data)
        }).catch(err => {
            reject(err)
        })
    })
}

export const post = (url: string, params: Object): Promise<Object> => {
    return new Promise((resolve, reject) => {
        axios.post(url, params).then(res => {
            resolve(res.data)
        }).catch(err => {
            reject(err)
        })
    })
}