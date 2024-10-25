import type { Response } from '@/interface'
import { get } from '@/request/axios'

export const getRegions = (pcode: number): Promise<Response> => get('/regions', {pcode})
export const getIndex = (page: number = 1, size: number = 10): Promise<Response> => get('/index', { page, size })
export const getRank = () => get('/rank', {})    // 获取排行榜
export const getMerchant = (uid: number): Promise<Response> => get('/merchant', { uid })
export const getCategory = (uid: number): Promise<Response> => get('/category', { uid })
export const getStatistic = (uid: number) => get('/statistic', { uid })  // 获取商家统计信息
export const getAllFood = (uid: number) => get('/allfood', { uid })
export const searchMerchant = (term: string, page: number = 1, size: number = 10): Promise<Response> => get('/search/merchant', { term, page, size })
export const searchFood = (term: string, page: number = 1, size: number = 10): Promise<Response> => get('/search/food', { term, page, size })
export const getFoodById = (id: number): Promise<Response> => get('/food', { id })
export const getReview = (id: number, page: number = 1, size: number = 10): Promise<Response> => get('/review', { id, page, size })