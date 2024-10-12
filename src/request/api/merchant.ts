import type { Response } from '@/interface'
import { get, post } from '@/request/axios'

const BASE_URL = '/merchant'

export const register = (username: string, password: string): Promise<Response> => post(`${BASE_URL}/register`, { username, password })