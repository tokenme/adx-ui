<template>
  <v-container class="fluid white">
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
          <v-text-field slot="activator" v-model="options.start_date" :label="this.$t('m.stats.start_date_label')" prepend-icon="mdi-calendar-today" readonly></v-text-field>
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
          <v-text-field slot="activator" v-model="options.end_date" :label="this.$t('m.stats.end_date_label')" prepend-icon="mdi-calendar-today" readonly></v-text-field>
          <v-date-picker v-model="options.end_date" @change="saveEndDate" :max="today" no-title scrollable></v-date-picker>
        </v-menu>
      </v-flex>
    </v-layout>
    <v-btn block color="success" style="background:#4caf50;color:#fff" :disabled="!stats" :href="exportLink">{{ $t('m.stats.airdrop_export') }}</v-btn>
    <v-select
      :items="chartSeriesSelections"
      v-model="chartSeries"
      item-text="text"
      item-value="value"
      single-line
      top
      class="mx-2 d-block"
      ></v-select>
    <line-chart
      :chart-data="chartData"
      :options="{responsive: true, maintainAspectRatio: true}"
      :height="200"
      >
    </line-chart>
    <v-data-table
      :headers="headers"
      :items="stats"
      :pagination.sync="pagination"
      hide-actions
      class="elevation-1"
    >
      <v-progress-linear slot="progress" color="blue" indeterminate v-if="loading"></v-progress-linear>
      <template slot="items" slot-scope="props">
        <td>{{ dateFormat(props.item.record_on) }}</td>
        <td class="text-xs-right">{{ props.item.pv }}</td>
        <td class="text-xs-right">{{ props.item.submissions }}</td>
        <td class="text-xs-right">{{ props.item.transactions }}</td>
        <td class="text-xs-right">{{ props.item.give_out }}</td>
        <td class="text-xs-right">{{ props.item.bonus }}</td>
        <td class="text-xs-right">{{ props.item.commission_fee }}</td>
      </template>
    </v-data-table>
  </v-container>
</template>

<script>
  import airdropAPI from '../../api/airdrop'
  import LineChart from './LineChart.vue'
  import moment from 'moment'

  export default {
    components: {
      'line-chart': LineChart
    },
    data() {
      return {
        loading: false,
        start_date_menu: false,
        end_date_menu: false,
        options: {
          start_date: '',
          end_date: ''
        },
        pagination: {
          sortBy: 'record_on',
          descending: true
        },
        chartSeries: 'pv',
        stats: [],
        summary: null,
        exporting: false
      }
    },
    props: {
      airdropId: 0
    },
    computed: {
      token() {
        return this.$store.getters['token']
      },
      headers() {
        return [
          { text: this.$t('m.stats.stats.header.record_on'), value: 'record_on', align: 'left' },
          { text: this.$t('m.stats.stats.header.pv'), value: 'pv', align: 'right' },
          { text: this.$t('m.stats.stats.header.submissions'), value: 'submissions', align: 'right' },
          { text: this.$t('m.stats.stats.header.transactions'), value: 'transactions', align: 'right' },
          { text: this.$t('m.stats.stats.header.give_out'), value: 'give_out', align: 'right' },
          { text: this.$t('m.stats.stats.header.bonus'), value: 'bonus', align: 'right' },
          { text: this.$t('m.stats.stats.header.commission_fee'), value: 'commission_fee', align: 'right' }
        ]
      },
      chartSeriesSelections() {
        return [
          { text: this.$t('m.stats.stats.header.pv'), value: 'pv' },
          { text: this.$t('m.stats.stats.header.submissions'), value: 'submissions' },
          { text: this.$t('m.stats.stats.header.transactions'), value: 'transactions' },
          { text: this.$t('m.stats.stats.header.give_out'), value: 'give_out' },
          { text: this.$t('m.stats.stats.header.bonus'), value: 'bonus' },
          { text: this.$t('m.stats.stats.header.commission_fee'), value: 'commission_fee' }
        ]
      },
      chartData() {
        let labels = []
        let data = []
        for (const i of this.stats) {
          labels.push(moment(i.record_on).format('DD/MM'))
          data.push(i[this.chartSeries])
        }
        let dataSets = []
        if (data.length > 0) {
          dataSets = [
            { label: this.$t('m.stats.stats.header.' + this.chartSeries), backgroundColor: '#2196F3', data: data }
          ]
        }
        return { labels: labels, datasets: dataSets }
      },
      exportLink() {
        const payload = {
          airdrop_id: this.airdropId,
          start_date: this.options.start_date,
          end_date: this.options.end_date,
          jwt: this.token
        }
        const redirectLink = window.location.protocol + '//' + window.location.hostname + '/airdrop/submission-export?' + this.serialize(payload)
        return redirectLink
      }
    },
    methods: {
      dateFormat(d) {
        return moment(d).format('YYYY-MM-DD')
      },
      saveStartDate (date) {
        this.$refs.start_date_menu.save(date)
        this.getStats()
      },
      saveEndDate (date) {
        this.$refs.end_date_menu.save(date)
        this.getStats()
      },
      getStats() {
        const payload = {
          airdrop_id: this.airdropId,
          start_date: this.options.start_date,
          end_date: this.options.end_date
        }
        this.loading = true
        airdropAPI.stats(this.token, payload).then((response) => {
          this.loading = false
          if (!response.code) {
            let stats = []
            if (response.stats) {
              for (let s of response.stats) {
                s['bonus'] /= Math.pow(10, s['decimals'])
                stats.push(s)
              }
            }
            this.stats = stats
            this.summary = response.summary
          }
        })
      },
      serialize(obj) {
        var str = [];
        for (var p in obj) {
          if (obj.hasOwnProperty(p)) {
            str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]))
          }
        }
        return str.join('&')
      }
    },
    mounted() {
      this.getStats()
    }
  }
</script>