import type { Response } from '@/interface'
import { get, post } from '@/request/axios'

const BASE_URL = '/user'

export const register = (username: string, password: string): Promise<Response> => post(`${BASE_URL}/register`, { username, password })    // 普通用户注册
export const searchUser = (term: string, page: number = 1, size: number = 10): Promise<Response> => get(`${BASE_URL}/search`, { term, page, size })    // 搜索用户
export const isUsernameAvailable = (username: string): Promise<Response> => get(`${BASE_URL}/available`, { username })    // 判断用户名是否可用