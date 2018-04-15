<template>
  <Row type="flex" justify="center">
    <Col :xs="24" :md="8">
      <Card style="margin-top:20px">
        <p slot="title">Login</p>
        <p>
          <Form ref="loginForm" :model="loginForm" :rules="loginRule">
          <FormItem prop="email">
            <Input type="text" v-model="loginForm.email" placeholder="Email">
              <Icon type="ios-email-outline" slot="prepend"></Icon>
            </Input>
          </FormItem>
          <FormItem prop="passwd">
            <Input type="password" v-model="loginForm.passwd" placeholder="Password">
              <Icon type="ios-locked-outline" slot="prepend"></Icon>
            </Input>
          </FormItem>
          <FormItem>
            <Row type="flex" justify="center" :gutter="24">
              <Col>
                <Button type="ghost" @click="gotoRegister">Register</Button>
              </Col>
              <Col>
                <Button type="text" @click="resetPassword">Forget password?</Button>
              </Col>
              <Col>
                <Button type="primary" :loading="loading" :disabled="loading" @click="onSubmit">
                  <span v-if="!loading">Login</span>
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
          callback(new Error('Please enter your password'))
        } else if (value.length < 6) {
          callback(new Error('The password length can\'t be less then 6 characters'))
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
            { required: true, message: 'Please input your email address', trigger: 'blur' },
            { type: 'email', message: 'Invalid email address', trigger: 'blur' }
          ],
          passwd: [
            { validator: validatePass, trigger: 'blur' }
          ]
        }
      }
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
              this.$router.push({name: 'dashboard'})
            }, err => {
              this.loading = false
              this.$Modal.error({title: 'Error', content: err.msg ? err.msg : 'unknown error'})
            })
          }
        })
        return false
      },
      resetPassword() {
        this.$Modal.confirm({
          title: 'Reset Password',
          render: (h) => {
            return h('Input', {
              props: {
                value: this.loginForm.email,
                autofocus: true,
                placeholder: 'Please enter your email...'
              },
              on: {
                input: (val) => {
                  this.loginForm.email = val;
                }
              }
            })
          },
          loading: true,
          okText: 'Reset password',
          onOk: () => {
            this.sendResetPasswordEmail(this.loginForm.email).then(res => {
              this.$Modal.remove()
              this.$Message.info('Reset password email has been sent, please check your mailbox.')
            }, err => {
              this.$Modal.remove()
              this.$Message.error(err.message || 'unknown error')
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
            reject(new Error('invalid email address'))
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