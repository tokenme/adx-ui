<template>
  <Row type="flex" justify="space-between">
    <Col span="10">
      <a :href="row.url" target="_blank">
        <Icon type="link"></Icon>
        {{ row.url }}
      </a>
      <p>{{ row.desc }}</p>
      <a :href="row.placeholder.url" target="_blank" v-if="row.placeholder">
        <img :src="row.placeholder.img_url" :style="imgStyle" />
      </a>
    </Col>
    <Col span="12">
      <h4>{{$t('m.adzoneExp.em')}}</h4>
      <Input 
        v-model="row.embed" 
        disabled 
        type="textarea"
        rows="4"
        v-clipboard:copy="row.embed"
        v-clipboard:success="onCopySuccess"></Input>
    </Col>
  </Row>
</template>
<script>
  export default {
    props: {
      row: Object
    },
    computed: {
      imgStyle() {
        if (this.row.size.width >= this.row.size.height) {
          return { width: '200px', height: Math.floor(200 * this.row.size.height / this.row.size.width) + 'px' }
        }
        return { width: Math.floor(100 * this.row.size.width / this.row.size.height) + 'px', height: '100px' }
      }
    },
    methods: {
      onCopySuccess(e) {
        this.$Message.success(this.$t('m.adzoneExp.suc'))
      }
    }
  }
</script>