import type { Response } from '@/interface'
import { get, post, put } from '@/request/axios'

const BASE_URL = '/merchant'

export const register = (username: string, password: string): Promise<Response> => post(`${BASE_URL}/register`, { username, password })    // 商户注册
export const apply = (avatar: string, nickname: string, intro: string, phone: string, email: string, address: string, annex: string): Promise<Response> => post(`${BASE_URL}/apply`, { avatar, nickname, intro, phone, email, address, annex })    // 商户申请
export const uploadFile = (file: File, type: string): Promise<Response> => put(`${BASE_URL}/file`, { file, type })    // 上传文件