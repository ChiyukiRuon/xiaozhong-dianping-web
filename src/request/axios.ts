import axios from 'axios';
import { ElMessage } from 'element-plus'
import router from '@/router'
import type { Response } from '@/interface'

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL
axios.create({
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 5000,
    withCredentials: true
})

axios.interceptors.request.use(
    config => {
        if (localStorage.getItem('token')) {
            config.headers.set('Authorization', localStorage.getItem('token'))
        }
        return config
    },
    error => Promise.reject(error)
)

axios.interceptors.response.use(
    response => {
        if (response.status === 200) {
            return Promise.resolve(response)
        } else {
            return Promise.reject(response)
        }
    },
    error => {
        if (error.response) {
            ElMessage.error(error.response.data.message)
            switch (error.response.status) {
                case 401:
                    localStorage.removeItem('token')
                    void router.replace({
                        path: '/',
                    })
                    return Promise.reject(error.response)
            }
            return Promise.reject(error.response)
        }
    }
)

/**
 * 封装的GET请求
 *
 * @param url 请求地址
 * @param params 请求参数
 * @return 响应数据
 * @author ChiyukiRuon
 * */
export const get = (url: string, params: object): Promise<Response> => {
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

/**
 * 封装的POST请求
 *
 * @param url 请求地址
 * @param params 请求参数
 * @return 响应数据
 * @author ChiyukiRuon
 * */
export const post = (url: string, params: object): Promise<Response> => {
    return new Promise((resolve, reject) => {
        axios.post(url, params).then(res => {
            resolve(res.data)
        }).catch(err => {
            reject(err)
        })
    })
}

/**
 * 封装的PUT请求
 *
 * @param url 请求地址
 * @param params 请求参数
 * @return 响应数据
 * @author ChiyukiRuon
 * */
export const put = (url: string, params: object): Promise<Response> => {
    return new Promise((resolve, reject) => {
        axios.put(url, params, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }).then(res => {
            resolve(res.data)
        }).catch(err => {
            reject(err)
        })
    })
}

/**
 * 封装的DELETE请求
 *
 * @param url 请求地址
 * @param params 请求参数
 * @return 响应数据
 * @author ChiyukiRuon
 * */
export const del = (url: string, params: object): Promise<Response> => {
    return new Promise((resolve, reject) => {
        axios.delete(url, {
            params: params
        }).then(res => {
            resolve(res.data)
        }).catch(err => {
            reject(err)
        })
    })
}