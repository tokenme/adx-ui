<template>
  <Form slot="header" ref="filterForm" :model="filter" inline>
    <FormItem label="OnlineStatus" prop="onlineStatus" :label-width="80">
      <Select v-model="filter.onlineStatus" @on-change="onSearch" style="width:100px">
        <Option v-for="item in statusOptions" :value="item.value" :key="item.value">{{ item.label }}</Option>
      </Select>
    </FormItem>
    <FormItem label="DateRange" props="dateRange" :label-width="80">
      <DatePicker v-model="filter.dateRange" type="daterange" split-panels placeholder="Select date" style="width: 200px"></DatePicker>
    </FormItem>
    <Button type="primary" icon="ios-search" @click="onSearch">Search</Button>
    <Button type="success" icon="ios-plus-outline" @click="onAddAirdrop">New Airdrop</Button>
  </Form>
</template>

<script>
  import moment from 'moment'
  export default {
    data() {
      return {
        filter: {
          onlineStatus: 0,
          dateRange: []
        },
        statusOptions: [
          { value: 0, label: 'all' },
          { value: -1, label: 'offline' },
          { value: 1, label: 'online' }
        ]
      }
    },
    computed: {
      token() {
        return this.$store.getters['token']
      }
    },
    methods: {
      onSearch() {
        let dateRange = []
        if (this.filter.dateRange && this.filter.dateRange.length === 2 && this.filter.dateRange[0] && this.filter.dateRange[1]) {
          dateRange = [
            moment(this.filter.dateRange[0]).format('YYYY-MM-DD'),
            moment(this.filter.dateRange[1]).format('YYYY-MM-DD')
          ]
        }
        const filter = {
          onlineStatus: this.filter.onlineStatus,
          dateRange: dateRange
        }
        this.$emit('searchAirdrops', filter)
      },
      onAddAirdrop() {
        this.$emit('addAirdropClick')
      }
    }
  }
</script>