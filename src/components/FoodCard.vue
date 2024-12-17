<template>
    <div class="food-card" v-if="size === 'large'" @click="openDetail(foodInfo.id)">
        <img class="cover" :src="foodInfo.cover" alt="food-cover" />
        <div class="info">
            <div class="food-title">
                <el-text size="large" type="primary" tag="b" line-clamp="1">{{ foodInfo.name }}</el-text>
            </div>
            <div class="food-intro">{{ foodInfo.intro || '暂无介绍' }}</div>
            <el-rate
                v-model="foodInfo.score"
                disabled
                show-score
                allow-half
                size="small"
                text-color="#ff9900"
            />
        </div>
    </div>
    <div
        class="food-card-small"
        v-else-if="size === 'small'"
        @click.prevent="openDetail(foodInfo.id)"
        :style="shadow ? 'box-shadow: 0 1px 12px 0 rgba(0, 0, 0, 0.1); padding: 5px;' : ''"
    >
        <img :src="foodInfo.cover" alt="cover" />
        <el-text size="large" tag="b" truncated>{{ foodInfo.name }}</el-text>
        <div
            style="
                margin-left: auto;
                display: flex;
                justify-content: center;
                align-items: center;
                color: #ff9900;
            "
        >
            <el-icon style="margin-right: 2px"><Star /></el-icon>
            {{ foodInfo.score }}
        </div>
    </div>
    <div class="food-card-skeleton" v-else>
        <div class="food-card">
            <el-skeleton animated style="width: 200px; height: 304px">
                <template #template>
                    <el-skeleton-item variant="image" style="width: 200px; height: 200px" />
                    <div style="padding: 14px">
                        <el-skeleton-item variant="p" style="width: 50%" />
                        <div style="display: flex; align-items: center;">
                            <el-skeleton-item variant="text" style="margin-right: 16px" />
                        </div>
                    </div>
                </template>
            </el-skeleton>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { PropType } from 'vue'
import router from '@/router'
import { Star } from '@element-plus/icons-vue'

export default defineComponent({
    name: 'FoodCard',
    components: { Star },
    props: {
        size: {
            type: String as PropType<'small' | 'large' | 'skeleton'>,
            default: 'large',
            required: true
        },
        foodInfo: {
            type: Object,
            default: {},
            required: false
        },
        shadow: {
            type: Boolean,
            default: false,
            required: false
        }
    },
    methods: {
        openDetail(id: number) {
            const url = router.resolve(`/food/${id}`).href
            window.open(url)
        }
    }
})
</script>

<style scoped>
.food-card {
    width: 200px;
    margin: 5px;
    padding-bottom: 10px;
    border-radius: 10px;
    background-color: #ffffff;
    color: #181818;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    box-shadow: 0 1px 12px 0 rgba(0, 0, 0, 0.1);
    transition: 0.5s;
}

.food-card:hover {
    box-shadow: 0 1px 12px 0 rgba(0, 0, 0, 0.2);
    cursor: pointer;
    transition: 0.5s;
}

.cover {
    width: 100%;
    border-radius: 10px 10px 0 0;
}

.info {
    width: 100%;
    padding: 0 5px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
}

.food-title {
    font-size: large;
    font-weight: bold;
    width: 100%;
    color: #181818;
}

.food-intro {
    height: 41px;
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

.food-card-small {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 5px 0;
    border-radius: 10px;
}

.food-card-small:hover {
    cursor: pointer;
}

.food-card-small img {
    width: 40px;
    border-radius: 10px;
    margin-right: 5px;
}
</style>