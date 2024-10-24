import type { Response } from '@/interface'
import { get, post, put, del } from '@/request/axios'

const BASE_URL = '/merchant'

export const register = (username: string, password: string): Promise<Response> => post(`${BASE_URL}/register`, { username, password })    // 商户注册
export const apply = (avatar: string, nickname: string, intro: string, phone: string, email: string, address: string, annex: string): Promise<Response> => post(`${BASE_URL}/apply`, { avatar, nickname, intro, phone, email, address, annex })    // 商户申请
export const getStatistic = (): Promise<Response> => get(`${BASE_URL}/statistic`, {})    // 获取商户统计信息
export const getFood = (page: number, size: number, name: string, category: number | null, status: number | null): Promise<Response> => get(`${BASE_URL}/food`, { page, size, name, category, status })   // 获取商品列表
export const getAllFood = (): Promise<Response> => get(`${BASE_URL}/allfood`, {})    // 获取所有商品
export const getCategory = (page: number, size: number, name: string): Promise<Response> => get(`${BASE_URL}/category`, { page, size, name })    // 获取商品分类
export const getAllCategory = (): Promise<Response> => get(`${BASE_URL}/allcategory`, {})    // 获取商品分类
export const getReviewList = (page: number, size: number, food: number|null = null) => get(`${BASE_URL}/review`, { page, size, food })    // 获取评论列表
export const editInfo = (nickname: string, intro: string, phone: string, email: string, address: string, avatar: string): Promise<Response> => post(`${BASE_URL}/info`, { nickname, intro, phone, email, address, avatar })    // 修改商户信息
export const editFood = (name: string, intro: string, price: number | null, category: number | null, status: number | null, id: number | null): Promise<Response> => post(`${BASE_URL}/food`, { id, name, intro, price, category, status })    // 修改商品信息
export const editCategory = (category: string, id: number|null): Promise<Response> => post(`${BASE_URL}/category`, { id, category })    // 修改商品分类
export const deleteFood = (id: number): Promise<Response> => del(`${BASE_URL}/food`, { id })    // 删除美食
export const deleteCategory = (id: number): Promise<Response> => del(`${BASE_URL}/category`, { id })    // 删除分类
export const uploadFile = (file: File, type: string): Promise<Response> => put(`${BASE_URL}/file`, { file, type })    // 上传文件