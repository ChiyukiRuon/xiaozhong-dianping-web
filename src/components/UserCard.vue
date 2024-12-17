<template>
    <div class="user-card-small" @click="openDetail(userInfo.uid)" v-if="size === 'small'">
        <img class="user-card-avatar" :src="userInfo.avatar" alt="avatar" />
        <div class="user-card-info">
            <div class="user-card-name">
                <el-text size="large" type="primary" tag="b">{{
                    userInfo.nickname || userInfo.username
                }}</el-text>
            </div>
            <div class="user-card-intro">
                {{ userInfo.intro || '暂无简介' }}
            </div>
        </div>
    </div>
    <div class="user-card-large" v-else>
        <img class="user-card-large-avatar" :src="userInfo.avatar" alt="avatar" @click.prevent="openDetail(userInfo.uid)" />
        <div class="user-card-large-name" @click="openDetail(userInfo.uid)">
            <el-text size="large" type="primary" tag="b">{{
                    userInfo.nickname || userInfo.username
                }}</el-text>
        </div>
        <div class="user-card-large-intro">
            {{ userInfo.intro || '暂无简介' }}
        </div>
        <div class="user-card-statistic">
            <div class="statistic-item">
                <div>美食数</div>
                <div>{{ userInfo.foodCount || 0 }}</div>
            </div>
            <div class="statistic-item">
                <div>评价数</div>
                <div>{{ userInfo.reviewCount || 0 }}</div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import router from '@/router'

export default defineComponent({
    name: 'UserCard',
    props: {
        size: {
            type: String as PropType<'small' | 'large'>,
            required: true
        },
        userInfo: {
            type: Object,
            required: true
        }
    },
    methods: {
        openDetail(uid: number) {
            const url = router.resolve(`/merchant/${uid}`).href
            window.open(url)
        }
    }
})
</script>

<style scoped>
.user-card-small {
    display: flex;
    width: 300px;
    padding: 8px;
    border-radius: 10px;
    box-shadow: 0 1px 12px 0 rgba(0, 0, 0, 0.1);
    transition: 0.5s;
}

.user-card-large {
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: #FFFFFF;
    padding: 10px;
    border-radius: 10px;
}

.user-card-small:hover {
    box-shadow: 0 1px 12px 0 rgba(0, 0, 0, 0.2);
    cursor: pointer;
    transition: 0.5s;
}

.user-card-avatar {
    width: 80px;
    border-radius: 100%;
    margin-right: 10px;
}

.user-card-large-avatar {
    width: 80px;
    border-radius: 100%;
    margin-bottom: 10px;
}

.user-card-large-avatar:hover {
    cursor: pointer;
}

.user-card-name {
    margin-top: 5px;
}

.user-card-large-name {
    margin-bottom: 5px;
}

.user-card-large-name:hover {
    cursor: pointer;
}

.user-card-intro {
    width: 200px;
    max-height: 50px;
    overflow: hidden;
    font-size: small;
    display: -webkit-box;
    line-clamp: 2;
    -webkit-line-clamp: 2;
    word-break: break-all;
    word-wrap: break-word;
    -webkit-box-orient: vertical;
    white-space: normal;
}

.user-card-large-intro {
    width: 200px;
    padding: 5px;
    text-align: center;
    margin-bottom: 5px;
    overflow: hidden;
    font-size: small;
    display: -webkit-box;
    line-clamp: 2;
    -webkit-line-clamp: 2;
    word-break: break-all;
    word-wrap: break-word;
    -webkit-box-orient: vertical;
    white-space: normal;
}

.user-card-statistic {
    display: flex;
    align-items: center;
    justify-content: center;
}

.statistic-item {
    width: 100px;
    height: 60px;
    border-radius: 10px;
    background-color: #eaeaea;
    padding: 5px 15px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.statistic-item:last-child {
    margin-left: 10px;
}
</style>