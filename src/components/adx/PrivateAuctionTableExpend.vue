<template>
  <div>
    <Row type="flex" justify="start" :gutter="16">
      <Col span="6" v-for="(creative, index) in row.creatives" :key="creative.id">
        <a :href="creative.url" target="_blank">
          <img :src="creative.img_url" width="100%">
        </a>
      </Col>
    </Row>
    <template v-if="row.reject_reason">
      <h4>Reject Reason</h4>
      <p>{{ row.reject_reason }}</p>
    </template>
  </div>
</template>
<script>
  export default {
    props: {
      row: Object
    }
  }
</script>