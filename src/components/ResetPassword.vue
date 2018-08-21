<template>
  <Row type="flex" justify="center">
    <Col span="8">
      <Card style="margin-top:20px">
        <p slot="title">{{$t('m.login.resetPassword')}}</p>
        <p> 
          <Form ref="resetPasswordForm" :model="resetPasswordForm" :rules="passwordRule">
          <FormItem prop="passwd">
            <Input type="password" v-model="resetPasswordForm.passwd" :placeholder="this.$t('m.regis.place_password')">
              <Icon type="ios-locked-outline" slot="prepend"></Icon>
            </Input>
          </FormItem>
          <FormItem prop="repasswd">
            <Input type="password" v-model="resetPasswordForm.repasswd" :placeholder="this.$t('m.regis.place_confirm')">
              <Icon type="ios-locked-outline" slot="prepend"></Icon>
            </Input>
          </FormItem>
          <FormItem>
            <Button type="primary" :loading="loading" :disabled="loading" @click="onSubmit">
              <span v-if="!loading">{{$t('m.resetPassword.submit')}}</span>
              <span v-else>Loading...</span>
            </Button>
          </FormItem>
        </Form>
        </p>
      </Card>
    </Col>
  </Row>
</template>

<script>
  import * as types from '../store/mutation-types'
  import userAPI from '../api/user'

  export default {
    data() {
      const validatePass = (rule, value, callback) => {
        if (value === '') {
          callback(new Error(this.$t('m.regis.password')))
        } else if (value.length < 6) {
          callback(new Error(this.$t('m.regis.sixLess')))
        } else {
          if (this.resetPasswordForm.repasswd !== '') {
            this.$refs.resetPasswordForm.validateField('repasswd')
          }
          callback()
        }
      }
      const validatePassCheck = (rule, value, callback) => {
        if (value === '') {
          callback(new Error(this.$t('m.regis.againPassword')))
        } else if (value !== this.resetPasswordForm.passwd) {
          callback(new Error(this.$t('m.regis.noMatch')))
        } else {
          callback()
        }
      }
      return {
        loading: false,
        code: '',
        resetPasswordForm: {
          passwd: '',
          repasswd: ''
        },
        passwordRule: {
          passwd: [
            { validator: validatePass, trigger: 'blur' }
          ],
          repasswd: [
            { validator: validatePassCheck, trigger: 'blur' }
          ]
        }
      }
    },
    methods: {
      onSubmit() {
        if (!this.code) {
          this.$Modal.error({title: this.$t('m.error'), content: this.$t('m.resetPassword.invalidCode')})
          return
        }
        this.$refs.resetPasswordForm.validate((valid) => {
          if (valid) {
            this.loading = true
            const payload = {
              code: this.code,
              passwd: this.resetPasswordForm.passwd,
              repasswd: this.resetPasswordForm.repasswd,
              is_publisher: this.$Site === 'media' ? 1 : 0,
              is_advertiser: this.$Site === 'adx' ? 1 : 0
            }
            userAPI.resetPassword(payload).then((response) => {
              if (response && response.code) {
                this.$Modal.error({title: this.$t('m.error'), content: response.message ? response.message : this.$t('m.unKnown')})
                return
              }
              this.$router.push({
                name: 'login'
              })
            })
          }
        })
      },
      gotoLogin() {
        this.$router.push({name: 'login'})
      }
    },
    created() {
      this.code = this.$route.params.code
      this.$store.dispatch(types.UPDATE_CURRENT_ROUTE, 'reset-passwd')
    }
  }
</script>