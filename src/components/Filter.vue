<template>
    <el-form :model="filterData" class="filter-form" label-width="auto">
        <div class="left-part">
            <el-form-item
                v-for="filter in filters"
                :key="filter.field"
                :label="filter.label"
                :prop="filter.field"
                class="filter-item"
            >
                <component
                    :is="getComponentType(filter)"
                    v-model="filterData[filter.field]"
                    v-bind="filter.props"
                    @change="handleFilterChange"
                >
                    <el-option
                        v-for="item in filter.props!.options"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    />
                </component>
            </el-form-item>
        </div>
        <div class="filter-actions">
            <el-button type="primary" @click="applyFilters">筛选</el-button>
            <el-button @click="resetFilters">重置</el-button>
        </div>
    </el-form>
</template>

<script lang="ts" setup>
import { ref, defineProps, watch } from 'vue'
import type { PropType } from 'vue'
import { ElInput, ElSelect, ElDatePicker, ElCheckbox } from 'element-plus'

interface FilterConfig {
    label: string
    field: string
    type: string
    props?: object
}

const emits = defineEmits(['resetFilters', 'applyFilters'])

const props = defineProps<{
    filters: FilterConfig[]
    onFilterChange?: (filters: Record<string, any>) => void
}>()

const filterData = ref<Record<string, any>>({})

// 初始化filterData，确保所有筛选项的初始值都正确
props.filters.forEach((filter) => {
    filterData.value[filter.field] = ''
})

// 获取控件类型，根据类型返回相应的组件
const getComponentType = (filter: FilterConfig) => {
    switch (filter.type) {
        case 'text':
            return ElInput
        case 'select':
            return ElSelect
        case 'date':
            return ElDatePicker
        case 'checkbox':
            return ElCheckbox
        default:
            return ElInput
    }
}

// 监听筛选条件的变化
const handleFilterChange = () => {
    if (props.onFilterChange) {
        props.onFilterChange(filterData.value)
    }
}

// 应用筛选
const applyFilters = () => {
    emits('applyFilters', filterData.value)
}

// 重置筛选条件
const resetFilters = () => {
    Object.keys(filterData.value).forEach((key) => {
        filterData.value[key] = ''
    })

    emits('resetFilters')
}
</script>

<style scoped>
el-input {
    width: 100%;
}

/deep/.el-form-item {
    margin: 0;
}

.filter-form {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 20px;
}

.left-part {
    display: flex;
    align-items: center;
}

.filter-item {
    width: 300px;
    margin-left: 20px;
}

.filter-actions {
}
</style>
