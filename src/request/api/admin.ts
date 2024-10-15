import type { Response } from '@/interface'
import { get, post } from '@/request/axios'

const BASE_URL = '/admin'

export const unverifiedMerchantList = (page: number, size: number, username: string, nickname: string, detail: string): Promise<Response> => get(`${BASE_URL}/verify/merchant`, { page, size, username, nickname, detail })
export const verifyMerchant = (id: number, uid: number, approve: number, remark: string): Promise<Response> => post(`${BASE_URL}/verify/merchant`, { id, uid, approve, remark })