<template>
    <el-table
        :data="tableData"
        border
        stripe
        style="width: 100%"
    >
        <el-table-column
            align="center"
            v-for="column in columns"
            :key="column.prop"
            :prop="column.prop"
            :label="column.label"
            :width="column.width"
            :formatter="column.formatter"
            :show-overflow-tooltip="column.config?.showOverflowTooltip ?? false"
        ></el-table-column>
        <slot name="action"></slot>
    </el-table>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { PropType } from 'vue';

interface TableColumn {
    label: string
    prop: string
    config?: {
        showOverflowTooltip?: boolean
    }
    width?: string | number
    slot?: string
    formatter?: (row: any, column: TableColumn, cellValue: any) => string
}

export default defineComponent({
    name: 'Table',
    props: {
        tableData: {
            type: Array as PropType<any[]>,
            required: true
        },
        columns: {
            type: Array as PropType<TableColumn[]>,
            required: true
        }
    }
})
</script>

<style scoped>

</style>
