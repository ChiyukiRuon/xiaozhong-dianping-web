export type Response = {
    code: number
    data: any
    message: string
}

export type UserInfo = {
    username?: string
    nickname?: string
    avatar?: string
    intro?: string
    phone?: string
    email?: string
    address?: string
    role?: string
    permission?: string
    status?: number
    remark?: string
    annex?: string
}

export type MenuItem = {
    title: string
    icon: string
    path: string
    component: string
}

export type Region = {
    id: number
    p_code: number
    code: number
    name: string
    level: number
}
