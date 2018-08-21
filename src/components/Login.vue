<template>
  <Row type="flex" justify="center">
    <Col :xs="24" :md="8">
      <Card style="margin-top:20px">
        <p slot="title">{{$t('m.login.log')}}</p>
        <p>
          <Form ref="loginForm" :model="loginForm" :rules="loginRule">
          <FormItem prop="email">
            <Input type="text" v-model="loginForm.email" :placeholder="this.$t('m.regis.place_email')">
              <Icon type="ios-email-outline" slot="prepend"></Icon>
            </Input>
          </FormItem>
          <FormItem prop="passwd">
            <Input type="password" v-model="loginForm.passwd" :placeholder="this.$t('m.regis.place_password')">
              <Icon type="ios-locked-outline" slot="prepend"></Icon>
            </Input>
          </FormItem>
          <FormItem>
            <Row type="flex" justify="center" :gutter="24">
              <Col>
                <Button type="ghost" @click="gotoRegister">{{$t('m.login.reg')}}</Button>
              </Col>
              <Col>
                <Button type="text" @click="resetPassword">{{$t('m.login.forgetPassword')}}</Button>
              </Col>
              <Col>
                <Button type="primary" :loading="loading" :disabled="loading" @click="onSubmit">
                  <span v-if="!loading">{{$t('m.login.log')}}</span>
                  <span v-else>Loading...</span>
                </Button>
              </Col>
            </Row>
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
          callback()
        }
      }
      return {
        loading: false,
        loginForm: {
          email: '',
          passwd: ''
        },
        loginRule: {
          email: [
            { required: true, message: this.$t('m.regis.email'), trigger: 'blur' },
            { type: 'email', message: this.$t('m.regis.invalid'), trigger: 'blur' }
          ],
          passwd: [
            { validator: validatePass, trigger: 'blur' }
          ]
        }
      }
    },
    props: {
      redirect: null
    },
    methods: {
      onSubmit() {
        this.$refs.loginForm.validate((valid) => {
          if (valid) {
            this.loading = true
            const payload = {
              email: this.loginForm.email,
              password: this.loginForm.passwd,
              is_publisher: this.$Site === 'media' ? 1 : 0,
              is_advertiser: this.$Site === 'adx' ? 1 : 0
            }
            this.$store.dispatch(types.LOGIN_REQUEST, payload).then(res => {
              this.loading = false
              let redirect = '/'
              if (this.redirect) {
                redirect = this.redirect
              }
              this.$router.push({path: redirect})
            }, err => {
              this.loading = false
              this.$Modal.error({title: this.$t('m.error'), content: err.message ? err.message : this.$t('m.unKnown')})
            })
          }
        })
        return false
      },
      resetPassword() {
        this.$Modal.confirm({
          title: this.$t('m.login.resetPassword'),
          render: (h) => {
            return h('Input', {
              props: {
                value: this.loginForm.email,
                autofocus: true,
                placeholder: this.$t('m.login.email')
              },
              on: {
                input: (val) => {
                  this.loginForm.email = val;
                }
              }
            })
          },
          loading: true,
          okText: this.$t('m.login.resetPassword'),
          onOk: () => {
            this.sendResetPasswordEmail(this.loginForm.email).then(res => {
              this.$Modal.remove()
              this.$Message.info(this.$t('m.login.resetEmail'))
            }, err => {
              this.$Modal.remove()
              this.$Message.error(err.message || this.$t('m.error'))
            })
          }
        })
      },
      sendResetPasswordEmail(email) {
        const payload = {
          email: email,
          is_publisher: this.$Site === 'media' ? 1 : 0,
          is_advertiser: this.$Site === 'adx' ? 1 : 0
        }
        return new Promise((resolve, reject) => {
          if (!this.validateEmail(email)) {
            reject(new Error(this.$t('m.regis.invalid')))
            return
          }
          userAPI.sendResetPasswordEmail(payload).then((response) => {
            if (response && response.code) {
              reject(response)
              return
            }
            resolve(response)
          })
        })
      },
      validateEmail(email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/ // eslint-disable-line no-useless-escape
        return !!email.match(re)
      },
      gotoRegister() {
        this.$router.push({name: 'register'})
      }
    },
    created() {
      this.$store.dispatch(types.UPDATE_CURRENT_ROUTE, 'login')
    }
  }
</script>