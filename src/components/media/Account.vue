<template>
  <div>
    <Card v-if="user" :bordered="false" :dis-hover="true" :shadow="false">
      <h2 slot="title">
        {{ user.email }}
      </h2>
      <p>
        <dl>
          <dt>{{$t('m.account.balance')}}</dt>
          <dd v-if="balance===null"><Spin></Spin></dd>
          <dd v-else>{{ balance / Math.pow(10, 18) }} Ether</dd>
        </dl>
      </p>
    </Card>
  </div>
</template>

<script>
  import * as types from '../../store/mutation-types'
  import userAPI from '../../api/user'
  export default {
    data() {
      return {
        spinShow: false,
        balance: null
      }
    },
    computed: {
      token() {
        return this.$store.getters['token']
      },
      user() {
        return this.$store.getters['userInfo']
      }
    },
    methods: {
      getBalance() {
        this.spinShow = true
        userAPI.balance(this.token).then(res => {
          this.spinShow = false
          if (res && res.code) {
            if (res.code === 401) {
              this.$router.push({
                path: '/login',
                query: {
                  redirect: this.$route.fullPath
                }
              })
            }
            this.$Message.error(res.message || 'unknown error')
            return
          }
          this.balance = res
        })
      }
    },
    mounted() {
      this.getBalance()
      this.$store.dispatch(types.UPDATE_CURRENT_ROUTE, 'account')
    }
  }
</script>