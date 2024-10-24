import type { Response } from '@/interface'
import { del, get, post } from '@/request/axios'

const BASE_URL = '/admin'

export const unverifiedMerchantList = (page: number, size: number, username: string, nickname: string, detail: string): Promise<Response> => get(`${BASE_URL}/verify/merchant`, { page, size, username, nickname, detail })
export const unverifiedUserList = (page: number, size: number, username: string, nickname: string, detail: string): Promise<Response> => get(`${BASE_URL}/verify/user`, { page, size, username, nickname, detail })
export const verifyMerchant = (id: number, uid: number, approve: number, remark: string): Promise<Response> => post(`${BASE_URL}/verify/merchant`, { id, uid, approve, remark })
export const verifyUser = (id: number, uid: number, approve: number, remark: string): Promise<Response> => post(`${BASE_URL}/verify/user`, { id, uid, approve, remark })
export const getReviewList = (page: number = 1, size: number = 10, nickname: string = '', food: string = '', merchant: string = ''): Promise<Response> => get(`${BASE_URL}/review`, { page, size, nickname, food, merchant })
export const getFoodList = (page: number = 1, size: number = 10, food: string = '', merchant: string = ''): Promise<Response> => get(`${BASE_URL}/food`, { page, size, food, merchant })
export const deleteReview = (id: number, food: number, remark: string): Promise<Response> => del(`${BASE_URL}/review`, { id, food, remark })
export const foodShelf = (id: number, remark: string): Promise<Response> => del(`${BASE_URL}/food`, { id, remark })