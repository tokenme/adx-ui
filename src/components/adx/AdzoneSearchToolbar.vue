<template>
  <Form slot="header" ref="filterForm" :model="filter" inline style="display:flex;justify-content:space-between">
    <FormItem :label="this.$t('m.adZoneSearch.domain')" prop="domain" :label-width="37" v-if='showDomain'>
      <Input type="text" v-model="filter.domain" :placeholder="this.$t('m.adZoneSearch.webDomain')"></Input>
    </FormItem>
    <FormItem :label="this.$t('m.adZoneSearch.dateRange')" props="dateRange" :label-width="84">
      <DatePicker :options="dateRangeOptions" v-model="filter.dateRange" type="daterange" split-panels :placeholder="this.$t('m.adZoneSearch.selectDate')" style="width: 200px"></DatePicker>
    </FormItem>
    <FormItem :label="this.$t('m.adZoneSearch.size')" prop="sizes" :label-width="80">
      <Select v-model="filter.sizes" multiple>
        <Option v-for="item in sizes" :value="item.id" :key="item.id">{{ item.width }}x{{ item.height }}</Option>
      </Select>
    </FormItem>
    <Button style="margin-left:25px;height:40px" type="primary" icon="ios-search" @click="onSearch">{{$t('m.adZoneSearch.search')}}</Button>
  </Form>
</template>

<script>
  import * as types from '../../store/mutation-types'
  import moment from 'moment'
  export default {
    data() {
      return {
        filter: {
          domain: '',
          sizes: [],
          dateRange: []
        },
        dateRangeOptions: {
          disabledDate (date) {
            return date && (moment(date).isBefore(moment()) || moment(date).isAfter(moment().add(2, 'months')))
          }
        }
      }
    },
    props: {
      showDomain: false
    },
    computed: {
      token() {
        return this.$store.getters['token']
      },
      sizes() {
        return this.$store.getters['sizes']
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
          domain: this.filter.domain,
          sizes: this.filter.sizes,
          dateRange: dateRange
        }
        this.$emit('searchAdzones', filter, true)
      }
    },
    mounted() {
      if (!this.sizes || this.sizes.length === 0) {
        this.$store.dispatch(types.ADZONE_SIZES_REQUEST)
      }
    }
  }
</script>