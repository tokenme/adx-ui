<template>
  <Row type="flex" justify="center">
    <Col span="8">
      <Card style="margin-top:20px">
        <p slot="title">Register</p>
        <p>
          <Form ref="registerForm" :model="registerForm" :rules="registerRule">
          <FormItem prop="email">
            <Input type="text" v-model="registerForm.email" placeholder="Email">
              <Icon type="ios-email-outline" slot="prepend"></Icon>
            </Input>
          </FormItem>
          <FormItem prop="passwd">
            <Input type="password" v-model="registerForm.passwd" placeholder="Password">
              <Icon type="ios-locked-outline" slot="prepend"></Icon>
            </Input>
          </FormItem>
          <FormItem prop="repasswd">
            <Input type="password" v-model="registerForm.repasswd" placeholder="Confirm Password">
              <Icon type="ios-locked-outline" slot="prepend"></Icon>
            </Input>
          </FormItem>
          <FormItem>
            <Row type="flex" justify="center"  :gutter="24">
              <Col>
                <Button type="ghost" @click="gotoLogin">Login</Button>
              </Col>
              <Col>
                <Button type="primary" :loading="loading" :disabled="loading" @click="onSubmit">
                  <span v-if="!loading">Register</span>
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
          if (this.registerForm.repasswd !== '') {
            this.$refs.registerForm.validateField('repasswd')
          }
          callback()
        }
      }
      const validatePassCheck = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('Please enter your password again'))
        } else if (value !== this.registerForm.passwd) {
          callback(new Error('The two input passwords do not match!'))
        } else {
          callback()
        }
      }
      return {
        loading: false,
        registerForm: {
          email: '',
          passwd: '',
          repasswd: ''
        },
        registerRule: {
          email: [
            { required: true, message: 'Please input your email address', trigger: 'blur' },
            { type: 'email', message: 'Invalid email address', trigger: 'blur' }
          ],
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
        this.$refs.registerForm.validate((valid) => {
          if (valid) {
            this.loading = true
            const payload = {
              email: this.registerForm.email,
              passwd: this.registerForm.passwd,
              repasswd: this.registerForm.repasswd,
              is_publisher: this.$Site === 'media' ? 1 : 0,
              is_advertiser: this.$Site === 'adx' ? 1 : 0
            }
            this.$store.dispatch(types.REGISTER_REQUEST, payload).then(res => {
              this.loading = false
              this.$Modal.success({
                title: 'Success',
                content: '<p>Activation email has been sent, please check your mailbox.</p>',
                onOk: () => {
                  this.$router.push({name: 'login'})
                }
              })
            }, err => {
              this.loading = false
              if (err.code && err.code === 502) {
                this.$Modal.confirm({
                  title: 'Warning',
                  content: '<p>Account already existed, but did not activate. Do you want to re-send activation email?</p>',
                  loading: true,
                  okText: 'Send',
                  onOk: () => {
                    this.resendActivationEmail(payload.email).then(res => {
                      this.$Modal.remove()
                      this.$Message.info('Activation email has been sent, please check your mailbox.')
                    }, err => {
                      this.$Modal.remove()
                      this.$Message.error(err.message || 'unknown error')
                    })
                  }
                })
              } else {
                this.$Modal.error({title: 'Error', content: err.message ? err.message : 'unknown error'})
              }
            })
          }
        })
      },
      resendActivationEmail(email) {
        const payload = {
          email: email,
          is_publisher: this.$Site === 'media' ? 1 : 0,
          is_advertiser: this.$Site === 'adx' ? 1 : 0
        }
        return new Promise((resolve, reject) => {
          userAPI.resendActivationEmail(payload).then((response) => {
            if (response && response.code) {
              reject(response)
              return
            }
            resolve(response)
          })
        })
      },
      gotoLogin() {
        this.$router.push({name: 'login'})
      }
    },
    created() {
      this.$store.dispatch(types.UPDATE_CURRENT_ROUTE, 'register')
    }
  }
</script>