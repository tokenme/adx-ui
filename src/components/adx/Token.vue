<template>
  <v-container fluid class="px-0 pt-0">
    <v-container v-if="tokenInfo">
      <v-layout row wrap align-center justify-center class="mb-4">
        <v-flex class="text-xs-right pr-3">
          <img :src="tokenInfo.logo_address" v-if="tokenInfo.logo_address" width="50" height="50"/>
        </v-flex>
        <v-flex>
          <h1>{{ tokenInfo.name }}</h1>
          <small class="grey--text">{{ tokenInfo.symbol }}</small>
        </v-flex>
      </v-layout>
      <v-layout row wrap align-center justify-center class="text-xs-center">
        <v-flex v-if="tokenInfo.website">
          <v-btn flat icon small :href="tokenInfo.website"><v-icon>mdi-web</v-icon></v-btn>
        </v-flex>
        <v-flex v-if="tokenInfo.blog">
          <v-btn flat icon small :href="tokenInfo.blog"><v-icon>mdi-rss</v-icon></v-btn>
        </v-flex>
        <v-flex v-if="tokenInfo.telegram">
          <v-btn flat icon small :href="'https://t.me/' + tokenInfo.telegram"><v-icon>mdi-telegram</v-icon></v-btn>
        </v-flex>
        <v-flex v-if="tokenInfo.facebook">
          <v-btn flat icon small :href="'https://www.facebook.com/' + tokenInfo.facebook"><v-icon>mdi-facebook</v-icon></v-btn>
        </v-flex>
        <v-flex v-if="tokenInfo.twitter">
          <v-btn flat icon small :href="'https://twitter.com/' + tokenInfo.twitter"><v-icon>mdi-twitter</v-icon></v-btn>
        </v-flex>
        <v-flex v-if="tokenInfo.whitepaper">
          <v-btn flat icon small :href="tokenInfo.whitepaper"><v-icon>mdi-file</v-icon></v-btn>
        </v-flex>
        <v-flex v-if="tokenInfo.email">
          <v-btn flat icon small :href="'mailto:' + tokenInfo.email"><v-icon>mdi-email</v-icon></v-btn>
        </v-flex>
      </v-layout>
    </v-container>
    <v-divider></v-divider>
    <v-container v-if="tokenMarket">
      <v-layout row wrap align-center justify-center class="mb-3">
        <v-flex>
          <div class="headline">
            ${{ tokenMarket.price_usd }}<sub style="font-size:50%">USD</sub>
            <span :class="(tokenMarket.percent_change_24h>=0?'green--text':'red--text') + ' text--darken-4'" v-if="tokenMarket.id">({{ tokenMarket.percent_change_24h }}%)</span>
          </div>
          <small class="grey--text">{{ $t('m.token.price_usd_label') }}</small>
        </div>
        </v-flex>
      </v-layout>
      <v-layout row wrap align-center justify-center>
        <v-flex xs6>
          <div class="caption">
            ${{ numberFormat(tokenMarket.market_cap_usd) }}<sub style="font-size:50%">USD</sub>
          </div>
          <small class="grey--text">{{ $t('m.token.marketcap_label') }}</small>
        </v-flex>
        <v-flex xs6 v-if="tokenMarket.id">
          <div class="caption">
            ${{ numberFormat(tokenMarket['24h_volume_usd']) }}<sub style="font-size:50%">USD</sub>
          </div>
          <small class="grey--text">{{ $t('m.token.volume_usd_label') }}</small>
        </v-flex>
        <v-flex xs6 v-if="tokenMarket.id">
          <div class="caption">
            {{ numberFormat(tokenMarket.available_supply) }}<sub style="font-size:50%">{{ tokenMarket.symbol }}</sub>
          </div>
          <small class="grey--text">{{ $t('m.token.available_supply_label') }}</small>
        </v-flex>
        <v-flex xs6>
          <div class="caption">
            {{ numberFormat(tokenMarket.total_supply) }}<sub style="font-size:50%">{{ tokenMarket.symbol }}</sub>
          </div>
          <small class="grey--text">{{ $t('m.token.total_supply_label') }}</small>
        </v-flex>
      </v-layout>
    </v-container>
    <template v-if="tokenMarket && tokenMarket.id">
      <v-divider></v-divider>
      <v-layout row wrap>
        <v-flex xs6>
          <v-menu
            ref="start_date_menu"
            lazy
            :close-on-content-click="true"
            v-model="start_date_menu"
            transition="scale-transition"
            offset-y
            :nudge-right="40"
            min-width="290px"
            :return-value.sync="options.start_date"
          >
            <v-text-field slot="activator" v-model="options.start_date" :label="this.$t('m.token.start_date_label')" prepend-icon="mdi-calendar-today" readonly></v-text-field>
            <v-date-picker v-model="options.start_date" @change="saveStartDate" :max="today" no-title scrollable></v-date-picker>
          </v-menu>
        </v-flex>
        <v-flex xs6>
          <v-menu
            ref="end_date_menu"
            lazy
            :close-on-content-click="true"
            v-model="end_date_menu"
            transition="scale-transition"
            offset-y
            :nudge-right="40"
            min-width="290px"
            :return-value.sync="options.end_date"
          >
            <v-text-field slot="activator" v-model="options.end_date" :label="this.$t('m.token.end_date_label')" prepend-icon="mdi-calendar-today" readonly></v-text-field>
            <v-date-picker v-model="options.end_date" @change="saveEndDate" :max="today" no-title scrollable></v-date-picker>
          </v-menu>
        </v-flex>
      </v-layout>
      <line-chart
        ref="chart"
        :chart-data="chartData"
        :options="chartOptions"
        :height="200"
        >
      </line-chart>
    </template>
  </v-container>
</template>

<script>
  import * as types from '../../store/mutation-types'
  import LineChart from './LineChart.vue'
  import tokenAPI from '../../api/token'
  //import moment from 'moment'
  import { bus } from '../../bus'

  export default {
    components: {
      'line-chart': LineChart
    },
    data() {
      return {
        tokenAddress: '',
        tokenInfo: null,
        tokenMarket: null,
        options: {
          start_date: '',
          end_date: ''
        },
        graph: null,
        chartOptions: {
          responsive: true,
          maintainAspectRatio: true,
          scales: {
            xAxes: [{
              type: 'time',
              distribution: 'series',
              fontSize: 10
            }],
            yAxes: [{
              type: 'linear',
              display: false,
              position: 'left',
              id: 'marketcap'
            }, {
              type: 'linear',
              display: false,
              position: 'right',
              id: 'price_usd'
            }, {
              type: 'linear',
              display: false,
              position: 'right',
              id: 'volume_usd'
            }]
          }
        }
      }
    },
    computed: {
      chartData() {
        if (!this.graph) {
          return { datasets: [] }
        }
        let labels = []
        let marketcaps = []
        let pricesUsd = []
        let volumesUsd = []
        for (const i of this.graph.market_cap_by_available_supply) {
          labels.push(new Date(i[0]))
          marketcaps.push({ t: new Date(i[0]), y: i[1] })
        }
        for (const i of this.graph.price_usd) {
          pricesUsd.push({ t: new Date(i[0]), y: i[1] })
        }
        for (const i of this.graph.volume_usd) {
          volumesUsd.push({ t: new Date(i[0]), y: i[1] })
        }
        const dataSets = [
          { label: this.$t('m.token.chart.marketcap'), data: marketcaps, borderColor: '#56b4e9', backgroundColor: '#56b4e9', fill: false, yAxisID: 'marketcap', pointRadius: 0, borderWidth: 1 },
          { label: this.$t('m.token.chart.price_usd'), data: pricesUsd, borderColor: '#ff9f00', backgroundColor: '#ff9f00', fill: false, yAxisID: 'price_usd', pointRadius: 0, borderWidth: 1 },
          { label: this.$t('m.token.chart.volume_usd'), data: volumesUsd, borderColor: '#757575', backgroundColor: '#eee', fill: true, yAxisID: 'volume_usd', pointRadius: 0, borderWidth: 1 }
        ]
        return { datasets: dataSets }
      }
    },
    methods: {
      saveStartDate (date) {
        this.$refs.start_date_menu.save(date)
        this.getTokenGraph()
      },
      saveEndDate (date) {
        this.$refs.end_date_menu.save(date)
        this.getTokenGraph()
      },
      numberFormat (d, n, x) {
        var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\.' : '$') + ')'
        return parseFloat(d).toFixed(Math.max(0, ~~n)).replace(new RegExp(re, 'g'), '$&,')
      },
      getToken() {
        this.toggleLoading(false)
        if (!this.tokenAddress) {
          return
        }
        tokenAPI.get(this.tokenAddress).then((response) => {
          this.toggleLoading(false)
          if (response.code) {
            this.showErrorDialog({ title: this.$t('m.token.err.get_token_failed'), message: response.message })
          } else {
            this.tokenInfo = response
          }
        })
      },
      getTokenMarket() {
        if (!this.tokenAddress) {
          return
        }
        tokenAPI.market(this.tokenAddress).then((response) => {
          if (response.code) {
            this.tokenMarket = null
          } else {
            this.tokenMarket = response
            if (this.tokenMarket.id) {
              this.getTokenGraph()
            }
          }
        })
      },
      getTokenGraph() {
        if (!this.tokenAddress) {
          return
        }
        const payload = {
          q: this.tokenAddress,
          start: this.options.start_date,
          end: this.options.end_date
        }
        tokenAPI.graph(payload).then((response) => {
          if (response.code) {
            this.graph = null
          } else {
            this.graph = response
          }
          //this.$refs.chart.renderChart(this.chartData, this.chartOptions)
        })
      },
      toggleLoading(v) {
        let state = types.HIDE_LOADING
        if (v) {
          state = types.SHOW_LOADING
        }
        this.$store.dispatch(state)
      },
      showErrorDialog(err) {
        this.$store.dispatch(types.SHOW_ERROR_DIALOG, err)
      },
      showSnackbar(msg) {
        this.$store.dispatch(types.SHOW_SNACKBAR, {message: msg})
      }
    },
    created() {
      this.tokenAddress = this.$route.params.key
    },
    mounted() {
      this.toggleLoading(true)
      this.getToken()
      this.getTokenMarket()
      bus.$emit('changeTab', '')
      bus.$emit('showGoback', true)
      bus.$emit('update_toolbar_icons', null)
      bus.$emit('update_toolbar_items', null)
    }
  }

</script>