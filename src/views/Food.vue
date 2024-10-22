<script setup lang="ts">
import { useRoute } from 'vue-router'
import { onMounted, ref } from 'vue'
import { commonAPI, userAPI } from '@/request/api'
import UserCard from '@/components/UserCard.vue'
import ReviewCard from '@/components/ReviewCard.vue'
import store from '@/store'
import { Delete, Loading, Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const route = useRoute()
const isLoading = ref(false)
const isUploading = ref(false)
const CDN_PREFIX = import.meta.env.VITE_CDN_URL

const userInfo = store.state.userInfo
const foodId = parseInt(route.params.id!)
let foodInfo = ref<any>({})
let merchantInfo = ref<any>({})

let review = ref([])
let total = ref(0)
let current = ref(0)
let size = ref(10)

const dialogVisible = ref(false)
const handleClose = () => {
    dialogVisible.value = false
    formData.value = {
        content: '',
        score: 0,
        anonymity: 0,
        annex: ''
    }
}
let formData = ref({
    content: '',
    score: 0,
    anonymity: 0,
    annex: ''
})
const hoverTextVisible = ref(false)
const handleRemove = () => {
    formData.value.annex = ''
}

const getFoodInfo = (id: number) => {
    commonAPI.getFoodById(id).then((res) => {
        foodInfo.value = res.data.food
        merchantInfo.value = res.data.food.merchant
    })
}
const getReview = (id: number, page: number = 1, pageSize: number = 10) => {
    commonAPI.getReview(id, page, pageSize).then((res) => {
        review.value = res.data.list
        getFoodInfo(foodId)
        handleClose()
    })
}
const postReview = () => {
    isLoading.value = true
    let isAnonymous = formData.value.anonymity ? 1 : 0

    if (formData.value.content === '') {
        ElMessage.error('评价内容不能为空')
        return
    } else if (formData.value.content.length < 5) {
        ElMessage.error('评价内容过短')
        return
    } else if (formData.value.content.length > 200) {
        ElMessage.error('评价内容过长')
        return
    }
    if (formData.value.score === 0) {
        ElMessage.error('请填写评分')
        return
    }

    userAPI
        .review(
            formData.value.content,
            formData.value.score,
            foodId,
            merchantInfo.value.uid,
            formData.value.annex,
            isAnonymous
        )
        .then(() => {
            isLoading.value = false
            getReview(foodId)
        })
}
const uploadAnnex = (file: any) => {
    isUploading.value = true
    userAPI.uploadFile(file.file, 'annex').then((res) => {
        isUploading.value = false
        formData.value.annex = `${CDN_PREFIX}${res.data.url}`
    })
}

onMounted(() => {
    getFoodInfo(foodId)
    getReview(foodId)
})
</script>

<template>
    <div class="container" style="height: 100%; display: flex; justify-content: center">
        <div class="main-container">
            <div class="food-info">
                <img :src="foodInfo.cover" alt="cover" />
                <div style="margin-left: 20px">
                    <div class="food-name">{{ foodInfo.name }}</div>
                    <div class="food-intro">{{ foodInfo.intro }}</div>
                    <div>
                        <el-rate
                            v-model="foodInfo.score"
                            size="large"
                            disabled
                            allow-half
                            show-score
                            text-color="#ff9900"
                        />
                    </div>
                </div>
            </div>
            <div class="review-container">
                <div class="review-title">
                    <div>用户评价</div>
                    <div style="font-size: medium; color: #cacaca">({{ review.length }})</div>
                    <div style="margin-left: auto; margin-right: 15px">
                        <el-button
                            type="primary"
                            @click="dialogVisible = true"
                            v-if="Object.keys(userInfo).length !== 0"
                            >发表评价</el-button
                        >
                        <el-button type="info" disabled v-else>登录后发表评价</el-button>
                    </div>
                </div>
                <div class="horizontal-divider"></div>
                <div class="review-content">
                    <div v-if="review.length === 0" style="width: 60px; margin: 0 auto">
                        暂无评价
                    </div>
                    <div
                        v-if="Object.keys(userInfo).length !== 0"
                        v-for="(item, i) in review"
                        :key="i"
                    >
                        <ReviewCard
                            :review-info="item"
                            :is-self="true"
                            v-if="item.user.uid === userInfo.uid"
                        />
                        <div
                            class="horizontal-divider"
                            style="opacity: 0.4; width: 98%; margin: 0 auto"
                            v-if="item.user.uid === userInfo.uid"
                        ></div>
                    </div>
                    <div v-for="(item, i) in review" :key="i">
                        <ReviewCard :review-info="item" v-if="item.user.uid !== userInfo.uid" />
                        <div
                            class="horizontal-divider"
                            style="opacity: 0.4; width: 98%; margin: 0 auto"
                            v-if="i !== review.length - 1 && item.user.uid !== userInfo.uid"
                        ></div>
                    </div>
                </div>
            </div>
        </div>
        <div class="side-container">
            <UserCard :user-info="merchantInfo" size="large" />
        </div>
    </div>

    <el-dialog v-model="dialogVisible" title="发表评价" width="500" :before-close="handleClose">
        <el-input
            v-model="formData.content"
            type="textarea"
            placeholder="请输入评价内容"
            :minlength="5"
            :maxlength="200"
            show-word-limit
            :rows="5"
        />
        <el-rate v-model="formData.score" allow-half show-score text-color="#ff9900" />
        <div style="width: 140px; margin-right: auto">
            <el-upload
                style="display: flex; flex-direction: column; width: 100%;"
                accept="image/jpeg, image/png"
                :show-file-list="false"
                :limit="1"
                :http-request="uploadAnnex"
            >
                <template #trigger>
                    <div class="upload-container" v-if="formData.annex === ''">
                        <el-icon size="20" v-if="!isUploading"><Plus /></el-icon>
                        <el-icon size="20" v-else><Loading /></el-icon>
                    </div>
                    <div
                        class="image-container"
                        @mouseover="hoverTextVisible = true"
                        @mouseleave="hoverTextVisible = false"
                        v-else
                    >
                        <img class="upload-annex" :src="formData.annex" alt="annex" />
                        <div class="overlay" v-if="hoverTextVisible" @click.prevent="handleRemove">
                            <el-icon size="20"><Delete /></el-icon>
                        </div>
                    </div>
                </template>
            </el-upload>
        </div>
        <div>
            <el-checkbox v-model="formData.anonymity" label="匿名评价" />
        </div>
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="handleClose" :disabled="isLoading">取消</el-button>
                <el-button type="primary" @click="postReview" :loading="isLoading"> 确定 </el-button>
            </div>
        </template>
    </el-dialog>
</template>

<style scoped>
.main-container {
    width: 70vw;
    max-width: 1000px;
    min-width: 300px;
    padding: 20px;
    background-color: #ffffff;
    overflow: scroll;
}

.side-container {
    width: 15vw;
    min-width: 200px;
    max-width: 300px;
    height: 50%;
    min-height: 300px;
    max-height: 600px;
    margin-top: 20px;
    margin-left: 20px;
    border-radius: 10px;
}

.food-info {
    display: flex;
}

.food-info img {
    width: 20vw;
    min-width: 200px;
    max-width: 500px;
    border-radius: 10px;
}

.food-name {
    width: 100%;
    font-size: xx-large;
    font-weight: bold;
}

.review-container {
    margin-top: 30px;
}

.review-title {
    font-size: x-large;
    display: flex;
    margin-bottom: 5px;
}

.upload-container {
    width: 140px;
    height: 140px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f4f4f4;
    border: 1px dashed rgb(227, 227, 227);
    border-radius: 10px;
}

.upload-annex {
    width: 140px;
    height: 140px;
    border-radius: 10px;
}

.image-container {
    position: relative; /* 使叠加层能够根据容器进行定位 */
    width: 140px;
    height: 140px;
}

.overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 10px;
    background-color: rgba(0, 0, 0, 0.6);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.5s;
}

.overlay :hover {
    cursor: pointer;
}

.image-container:hover .overlay {
    opacity: 1;
    transition: 0.5s;
}
</style>
