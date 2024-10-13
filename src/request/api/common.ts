import type { Response } from '@/interface'
import { get, post } from '@/request/axios'

export const getRegions = (pcode: number): Promise<Response> => get('/regions', {pcode})