import type { Response } from '@/interface'
import { get, post } from '@/request/axios'

export const getPublicKey = (): Promise<Response> => get('/key', {})    // 获取公钥
export const getRoute = (): Promise<Response> => get('/route', {})    // 获取用户路由
export const auth = (username: string, password: string): Promise<Response> => post('/auth', { username, password })  // 登录