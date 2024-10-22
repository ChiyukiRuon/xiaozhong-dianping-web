<template>
    <div style="display: flex; margin: 7px 0; padding: 0 5px" >
        <img :src="reviewInfo.user.avatar" alt="avatar" class="review-card-avatar" />
        <div class="review-card-main">
            <div>
                <el-text size="large" type="primary" tag="b">{{ reviewInfo.user.nickname || reviewInfo.user.username }}</el-text>
                <el-text size="small" type="info" tag="b" v-if="isSelf" > (我)</el-text>
            </div>
            <div><el-rate v-model="reviewInfo.score" size="small" disabled show-score allow-half text-color="#ff9900" /></div>
            <div class="review-card-content">{{ reviewInfo.content }}</div>
            <img
                :src="reviewInfo.annex"
                alt="annex"
                v-if="reviewInfo.annex"
                class="review-card-annex"
                @click="showImage"
            />
        </div>
    </div>

    <div v-if="showBigImage" class="review-card-overlay" @click="closeImage">
        <img :src="reviewInfo.annex" class="big-image" alt="Big View" />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { PropType } from 'vue';
import router from '@/router'

export default defineComponent({
    name: 'ReviewCard',
    props: {
        // size: {
        //     type: String as PropType<'small' | 'large'>,
        //     default: 'large',
        //     required: true
        // },
        reviewInfo: {
            type: Object,
            required: true
        },
        isSelf: {
            type: Boolean,
            default: false,
            required: false
        }
    },
    data() {
        return {
            showBigImage: false,
        }
    },
    methods: {
        showImage() {
            this.showBigImage = true
        },
        closeImage() {
            this.showBigImage = false
        }
    }
})
</script>

<style scoped>
.review-card-avatar {
    width: 80px;
    height: 80px;
    border-radius: 100%;
}

.review-card-main {
    margin-left: 10px;
}

.review-card-content {
    word-break: break-all;
}

.review-card-annex {
    border-radius: 10px;
    width: 100px;
}

.review-card-annex:hover {
    cursor: pointer;
}

.review-card-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999;
}

.big-image {
    max-width: 90%;
    max-height: 90%;
}
</style>