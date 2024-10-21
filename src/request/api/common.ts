import type { Response } from '@/interface'
import { get, post } from '@/request/axios'

export const getRegions = (pcode: number): Promise<Response> => get('/regions', {pcode})
export const getIndex = (page: number = 1, size: number = 10): Promise<Response> => get('/index', { page, size })
export const searchMerchant = (term: string, page: number = 1, size: number = 10): Promise<Response> => get('/search/merchant', { term, page, size })
export const searchFood = (term: string, page: number = 1, size: number = 10): Promise<Response> => get('/search/food', { term, page, size })
export const getFoodById = (id: number): Promise<Response> => get('/food', { id })