import type { Response } from '@/interface'
import { del, get, post, put } from '@/request/axios'

const BASE_URL = '/user'

export const register = (username: string, password: string): Promise<Response> => post(`${BASE_URL}/register`, { username, password })    // 普通用户注册
export const getReviewHistory = (page: number = 1, size: number = 10): Promise<Response> => get(`${BASE_URL}/review`, { page, size })
export const searchUser = (term: string, page: number = 1, size: number = 10): Promise<Response> => get(`${BASE_URL}/search`, { term, page, size })    // 搜索用户
export const isUsernameAvailable = (username: string): Promise<Response> => get(`${BASE_URL}/available`, { username })    // 判断用户名是否可用
export const review = (content: string, score: number, target: number|null = null, merchant: number|null = null, annex: string = '', anonymity: number = 0, parent: number|null = null, id: number|null = null, ) => post(`${BASE_URL}/review`, { content, score, target, merchant, annex, anonymity, parent , id })
export const uploadFile = (file: File, type: string): Promise<Response> => put(`${BASE_URL}/file`, { file, type })    // 上传文件
export const editInfo = (nickname: string = '', avatar: string = '', password: string = ''): Promise<Response> => post(`${BASE_URL}/info`, { nickname, avatar, password })
export const deleteReview = (id: number): Promise<Response> => del(`${BASE_URL}/review`, { id })