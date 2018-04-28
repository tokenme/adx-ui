<template>
  <Modal
    v-model="showVerifyIntro"
    :title="'Verification for ' + media.domain"
    ok-text="Verify"
    cancel-text="Close"
    loading
    @on-ok="onVerifiy"
    v-if="media">
    <p>There are tow methods to verify your website</p>
    <Steps  direction="vertical">
      <Step title="Verify by URL" status="process" :content="'Make the following url avaliable. `' + media.verify_url + '`'"></Step>
      <Step title="Verify by DNS" status="process" :content="'Add the following CNAME record in your DNS setting. `' + media.verify_dns + '` with Value: `' + media.dns_value + '`'"></Step>
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