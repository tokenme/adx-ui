<template>
  <Modal
    v-model="showVerifyIntro"
    :title="this.$t('m.mv.vf') + media.domain"
    :ok-text="this.$t('m.mv.ok')"
    :cancel-text="this.$t('m.mv.can')"
    loading
    @on-ok="onVerifiy"
    v-if="media">
    <p>{{$t('m.mv.tow')}}</p>
    <Steps  direction="vertical">
      <Step :title="this.$t('m.mv.vb')" status="process" :content="'Make the following url avaliable. `' + media.verify_url + '`'"></Step>
      <Step :title="this.$t('m.mv.vd')" status="process" :content="'Add the following CNAME record in your DNS setting. `' + media.verify_dns + '` with Value: `' + media.dns_value + '`'"></Step>
    </Steps>
  </Modal>
</template>

<script>
  import mediaAPI from '../../api/media'
  export default {
    data() {
      return {
        showVerifyIntro: false
      }
    },
    props: {
      media: null
    },
    computed: {
      token() {
        return this.$store.getters['token']
      }
    },
    methods: {
      show() {
        this.showVerifyIntro = true
      },
      hide() {
        this.showVerifyIntro = false
      },
      onVerifiy() {
        mediaAPI.verify(this.token, this.media.id).then(res => {
          if (res && res.code) {
            this.$emit('mediaVerifyFailed', res)
            return
          }
          this.$emit('mediaVerified', this.media)
        })
      }
    }
  }
</script>