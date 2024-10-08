import { get, post } from './axios'
import type { response } from '@/interface/api'

export const getPublicKey = (): Promise<response> => get('/key', {})    // 获取公钥
export const auth = (username: string, password: string): Promise<response> => post('/auth', { username, password })  // 登录