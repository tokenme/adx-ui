<template>
    <Row type="flex" justify="space-between">
      <Col span="10">
        <a :href="row.url" target="_blank">
          <Icon type="link"></Icon>
          {{ row.url }}
        </a>
        <p>{{ row.desc }}</p>
      </Col>
      <Col span="12">
        <vue-calendar :events="events" :disabled="disabled" :height="300"></vue-calendar>
      </Col>
  </Row>
</template>
<script>
  import moment from 'moment'
  export default {
    props: {
      row: Object
    },
    computed: {
      disabled() {
        return {
          to: moment().toDate(),
          from: moment().add(2, 'months').toDate()
        }
      },
      events() {
        if (!this.row.unavailable_days) {
          return []
        }
        let events = []
        let start = null
        let end = null
        for (const day of this.row.unavailable_days) {
          const date = moment(day)
          if (!start) {
            start = date
          } else if (end && date.diff(end, 'days') > 1) {
            events.push({
              start: start.toDate(),
              end: end.toDate(),
              title: 'unavailable'
            })
            start = date
            end = date
          } else {
            end = date
          }
        }
        if (end.diff(start, 'days') >= 1) {
          events.push({
            start: start.toDate(),
            end: end.toDate(),
            title: 'unavailable'
          })
        }
        return events
      }
    }
  }
</script>