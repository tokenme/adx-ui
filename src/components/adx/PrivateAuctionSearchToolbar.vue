<template>
  <Form slot="header" ref="filterForm" :model="filter" inline>
    <FormItem label="AuditStatus" prop="auditStatus" :label-width="80">
      <Select v-model="filter.auditStatus" @on-change="onSearch" style="width:100px">
        <Option v-for="item in statusOptions" :value="item.value" :key="item.value">{{ item.label }}</Option>
      </Select>
    </FormItem>
  </Form>
</template>

<script>
  export default {
    data() {
      return {
        filter: {
          auditStatus: -1
        },
        statusOptions: [
          { value: -1, label: 'any' },
          { value: 0, label: 'waiting' },
          { value: 1, label: 'deal' },
          { value: 2, label: 'rejected' }
        ]
      }
    },
    methods: {
      onSearch(value) {
        this.$emit('searchPrivateAuctions', this.filter)
      }
    }
  }
</script>