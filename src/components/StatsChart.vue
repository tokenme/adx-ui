<template>
  <div>
    <Card :bordered="false" :dis-hover="true" :shadow="false" :padding="0">
      <p slot="title">
        {{ title }}
      </p>
      <Form slot="extra" inline>
        <FormItem label="DateRange" props="dateRange" :label-width="80">
          <DatePicker :options="dateRangeOptions" v-model="dateRange" type="daterange" split-panels placeholder="Select date" style="width: 200px" @on-change="onDateChange"></DatePicker>
        </FormItem>
        <FormItem label="Series" prop="chartSeries" :label-width="40">
          <Select v-model="chartSeries" style="width: 100px">
            <Option v-for="item in seriesOptions" :value="item.value" :key="item.value">{{ item.label }}</Option>
          </Select>
        </FormItem>
        <Button type="primary" icon="ios-grid" @click="showTable = !showTable">{{ showTable ? 'Hide Table' : 'Show Table' }}</Button>
        <Button type="primary" icon="ios-download-outline" @click="exportCSV">Export</Button>
      </Form>
      <p :style="{height:height}">
        <BarChart
          :chart-data="chartData"
          :options="{responsive: true, maintainAspectRatio: false}"
          :height="height"
          >
        </BarChart>
      </p>
      <p v-show="showTable">
        <Table border ref="table" :loading="spinShow" :columns="columns" :data="tableData" :row-class-name="rowClassName" size="small"></Table>
      </p>
      <Spin size="large" fix v-if="spinShow"></Spin>
    </Card>
    <Row type="flex" justify="space-between" v-if="showStatsDetail">
      <Col span="5">
        <Card :bordered="false" :dis-hover="true" :shadow="false" :padding="0">
          <p slot="title">
            Countries Stats
          </p>
          <HorizontalBar
            :chart-data="countryData"
            :options="{responsive: true, maintainAspectRatio: true}"
            >
          </HorizontalBar>
          <Spin size="large" fix v-if="countrySpinShow"></Spin>
        </Card>
      </Col>
      <Col span="5">
        <Card :bordered="false" :dis-hover="true" :shadow="false" :padding="0">
          <p slot="title">
            Platforms Stats
          </p>
          <PieChart
            :chart-data="browserTypeData"
            :options="{responsive: true, maintainAspectRatio: true}"
            >
          </PieChart>
          <Spin size="large" fix v-if="browserTypeSpinShow"></Spin>
        </Card>
      </Col>
      <Col span="5">
        <Card :bordered="false" :dis-hover="true" :shadow="false" :padding="0">
          <p slot="title">
            OS Stats
          </p>
          <PieChart
            :chart-data="osData"
            :options="{responsive: true, maintainAspectRatio: true}"
            >
          </PieChart>
          <Spin size="large" fix v-if="osSpinShow"></Spin>
        </Card>
      </Col>
      <Col span="5">
        <Card :bordered="false" :dis-hover="true" :shadow="false" :padding="0">
          <p slot="title">
            Browsers Stats
          </p>
          <HorizontalBar
            :chart-data="browserData"
            :options="{responsive: true, maintainAspectRatio: true}"
            >
          </HorizontalBar>
          <Spin size="large" fix v-if="browserSpinShow"></Spin>
        </Card>
      </Col>
    </Row>
  </div>
</template>

<script>
  import BarChart from './BarChart.vue'
  import PieChart from './PieChart.vue'
  import HorizontalBar from './HorizontalBarChart.vue'
  import statsAPI from '../api/stats'
  import moment from 'moment'

  function getRandomColor() {
    const letters = '0123456789ABCDEF'.split('')
    let color = '#'
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)]
    }
    return color
  }

  export default {
    components: {
      'BarChart': BarChart,
      'HorizontalBar': HorizontalBar,
      'PieChart': PieChart
    },
    data() {
      return {
        spinShow: false,
        countrySpinShow: false,
        browserTypeSpinShow: false,
        osSpinShow: false,
        browserSpinShow: false,
        chartSeries: 'pv',
        seriesOptions: [
          { label: 'pv', value: 'pv' },
          { label: 'uv', value: 'uv' },
          { label: 'clicks', value: 'clicks' },
          { label: 'ctr', value: 'ctr' }
        ],
        dateRangeOptions: {
          disabledDate (date) {
            return date && (moment(date).isAfter(moment()) || moment(date).isBefore(moment().subtract(3, 'months')))
          }
        },
        stats: [],
        countries: [],
        browserTypes: [],
        os: [],
        browsers: [],
        dateRange: []
      }
    },
    props: {
      title: '',
      height: 300,
      mediaId: 0,
      adzoneId: 0,
      auctionId: 0,
      showTable: false,
      showStatsDetail: false
    },
    computed: {
      token() {
        return this.$store.getters['token']
      },
      tableData() {
        return [...this.stats].reverse()
      },
      columns() {
        return [
          {
            title: this.stats.length > 0 && this.stats[0].hour !== undefined ? 'Hour' : 'Date', 
            key: this.stats.length > 0 && this.stats[0].hour !== undefined ? 'hour' : 'date',
            align: 'left'
          }, {
            title: 'PV',
            key: 'pv',
            align: 'right'
          }, {
            title: 'UV',
            key: 'uv',
            align: 'right'
          }, {
            title: 'Clicks',
            key: 'clicks',
            align: 'right'
          }, {
            title: 'CTR',
            key: 'ctr',
            align: 'center',
            size: 80,
            render: (h, params) => {
              return h('span', params.row.ctr.toFixed(4))
            }
          }
        ]
      },
      chartData() {
        let labels = []
        let data = []
        for (const i of this.stats) {
          if (i.date) {
            labels.push(moment(i.date).format('DD/MM'))
          } else if (i.hour) {
            labels.push(i.hour)
          }
          data.push(i[this.chartSeries])
        }
        let dataSets = []
        if (data.length > 0) {
          dataSets = [
            { label: this.chartSeries, backgroundColor: '#2196F3', data: data }
          ]
        }
        return { labels: labels, datasets: dataSets }
      },
      countryData() {
        let labels = []
        let data = []
        for (const i of this.countries) {
          labels.push(i.name)
          data.push(i[this.chartSeries])
        }
        let dataSets = []
        if (data.length > 0) {
          dataSets = [
            { label: this.chartSeries, backgroundColor: '#2196F3', data: data }
          ]
        }
        return { labels: labels, datasets: dataSets }
      },
      browserTypeData() {
        let labels = []
        let data = []
        let backgroundColors = []
        for (const i of this.browserTypes) {
          labels.push(i.name)
          data.push(i[this.chartSeries])
          backgroundColors.push(getRandomColor())
        }
        let dataSets = []
        if (data.length > 0) {
          dataSets = [
            { backgroundColor: backgroundColors, data: data }
          ]
        }
        return { labels: labels, datasets: dataSets }
      },
      osData() {
        let labels = []
        let data = []
        let backgroundColors = []
        for (const i of this.os) {
          labels.push(i.name)
          data.push(i[this.chartSeries])
          backgroundColors.push(getRandomColor())
        }
        let dataSets = []
        if (data.length > 0) {
          dataSets = [
            { backgroundColor: backgroundColors, data: data }
          ]
        }
        return { labels: labels, datasets: dataSets }
      },
      browserData() {
        let labels = []
        let data = []
        for (const i of this.browsers) {
          labels.push(i.name)
          data.push(i[this.chartSeries])
        }
        let dataSets = []
        if (data.length > 0) {
          dataSets = [
            { label: this.chartSeries, backgroundColor: '#2196F3', data: data }
          ]
        }
        return { labels: labels, datasets: dataSets }
      }
    },
    methods: {
      rowClassName (row, index) {
        return row.pv ? '' : 'muted'
      },
      getStats() {
        return new Promise((resolve, reject) => {
          let dateRange = []
          if (this.dateRange && this.dateRange.length === 2 && this.dateRange[0] && this.dateRange[1]) {
            dateRange = [
              moment(this.dateRange[0]).format('YYYY-MM-DD'),
              moment(this.dateRange[1]).format('YYYY-MM-DD')
            ]
          }
          const payload = {
            media_id: this.mediaId,
            adzone_id: this.adzoneId,
            auction_id: this.auctionId,
            dateRange: dateRange
          }
          statsAPI.dates(this.token, { options: JSON.stringify(payload) }).then(res => {
            if (res && res.code) {
              reject(res)
              return
            }
            resolve(res || [])
          })
        })
      },
      getCountry() {
        return new Promise((resolve, reject) => {
          let dateRange = []
          if (this.dateRange && this.dateRange.length === 2 && this.dateRange[0] && this.dateRange[1]) {
            dateRange = [
              moment(this.dateRange[0]).format('YYYY-MM-DD'),
              moment(this.dateRange[1]).format('YYYY-MM-DD')
            ]
          }
          const payload = {
            media_id: this.mediaId,
            adzone_id: this.adzoneId,
            auction_id: this.auctionId,
            dateRange: dateRange
          }
          statsAPI.country(this.token, { options: JSON.stringify(payload) }).then(res => {
            if (res && res.code) {
              reject(res)
              return
            }
            resolve(res || [])
          })
        })
      },
      getBrowserType() {
        return new Promise((resolve, reject) => {
          let dateRange = []
          if (this.dateRange && this.dateRange.length === 2 && this.dateRange[0] && this.dateRange[1]) {
            dateRange = [
              moment(this.dateRange[0]).format('YYYY-MM-DD'),
              moment(this.dateRange[1]).format('YYYY-MM-DD')
            ]
          }
          const payload = {
            media_id: this.mediaId,
            adzone_id: this.adzoneId,
            auction_id: this.auctionId,
            dateRange: dateRange
          }
          statsAPI.browserType(this.token, { options: JSON.stringify(payload) }).then(res => {
            if (res && res.code) {
              reject(res)
              return
            }
            resolve(res || [])
          })
        })
      },
      getOs() {
        return new Promise((resolve, reject) => {
          let dateRange = []
          if (this.dateRange && this.dateRange.length === 2 && this.dateRange[0] && this.dateRange[1]) {
            dateRange = [
              moment(this.dateRange[0]).format('YYYY-MM-DD'),
              moment(this.dateRange[1]).format('YYYY-MM-DD')
            ]
          }
          const payload = {
            media_id: this.mediaId,
            adzone_id: this.adzoneId,
            auction_id: this.auctionId,
            dateRange: dateRange
          }
          statsAPI.os(this.token, { options: JSON.stringify(payload) }).then(res => {
            if (res && res.code) {
              reject(res)
              return
            }
            resolve(res || [])
          })
        })
      },
      getBrowser() {
        return new Promise((resolve, reject) => {
          let dateRange = []
          if (this.dateRange && this.dateRange.length === 2 && this.dateRange[0] && this.dateRange[1]) {
            dateRange = [
              moment(this.dateRange[0]).format('YYYY-MM-DD'),
              moment(this.dateRange[1]).format('YYYY-MM-DD')
            ]
          }
          const payload = {
            media_id: this.mediaId,
            adzone_id: this.adzoneId,
            auction_id: this.auctionId,
            dateRange: dateRange
          }
          statsAPI.browser(this.token, { options: JSON.stringify(payload) }).then(res => {
            if (res && res.code) {
              reject(res)
              return
            }
            resolve(res || [])
          })
        })
      },
      exportCSV() {
        let dateRange = '';
        if (this.dateRange && this.dateRange.length === 2 && this.dateRange[0] && this.dateRange[1]) {
          dateRange = moment(this.dateRange[0]).format('YYYY-MM-DD') + '-' + moment(this.dateRange[1]).format('YYYY-MM-DD')
        }
        this.$refs.table.exportCsv({
          filename: this.title + '-' + this.mediaId + '-' + this.adzoneId + '-' + this.auctionId + '-' + dateRange
        })
      },
      onDateChange(val) {
        this.refresh()
      },
      refresh() {
        this.spinShow = true
        this.getStats().then(res => {
          this.spinShow = false
          this.stats = res || []
        }, err => {
          this.spinShow = false
          if (err.code === 401) {
            this.$router.push({
              path: '/login',
              query: {
                redirect: this.$route.fullPath
              }
            })
          }
        })
        if (this.showStatsDetail) {
          this.countrySpinShow = true
          this.getCountry().then(res => {
            this.countrySpinShow = false
            this.countries = res || []
          }, err => {
            this.countrySpinShow = false
            if (err.code === 401) {
              this.$router.push({
                path: '/login',
                query: {
                  redirect: this.$route.fullPath
                }
              })
            }
          })
          this.browserTypeSpinShow = true
          this.getBrowserType().then(res => {
            this.browserTypeSpinShow = false
            this.browserTypes = res || []
          }, err => {
            this.browserTypeSpinShow = false
            if (err.code === 401) {
              this.$router.push({
                path: '/login',
                query: {
                  redirect: this.$route.fullPath
                }
              })
            }
          })
          this.osSpinShow = true
          this.getOs().then(res => {
            this.osSpinShow = false
            this.os = res || []
          }, err => {
            this.osSpinShow = false
            if (err.code === 401) {
              this.$router.push({
                path: '/login',
                query: {
                  redirect: this.$route.fullPath
                }
              })
            }
          })
          this.browserSpinShow = true
          this.getBrowser().then(res => {
            this.browserSpinShow = false
            this.browsers = res || []
          }, err => {
            this.browserSpinShow = false
            if (err.code === 401) {
              this.$router.push({
                path: '/login',
                query: {
                  redirect: this.$route.fullPath
                }
              })
            }
          })
        }
      }
    },
    mounted() {
      this.refresh()
    }
  }
</script>