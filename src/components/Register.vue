<template>
  <Row type="flex" justify="center">
    <Col span="8">
      <Card style="margin-top:20px">
        <p slot="title">{{$t('m.regis.register')}}</p>
        <p>
          <Form ref="registerForm" :model="registerForm" :rules="registerRule">
          <FormItem prop="email">
            <Input type="text" v-model="registerForm.email" :placeholder="this.$t('m.regis.place_email')">
              <Icon type="ios-email-outline" slot="prepend"></Icon>
            </Input>
          </FormItem>
          <FormItem prop="passwd">
            <Input type="password" v-model="registerForm.passwd" :placeholder="this.$t('m.regis.place_password')">
              <Icon type="ios-locked-outline" slot="prepend"></Icon>
            </Input>
          </FormItem>
          <FormItem prop="repasswd">
            <Input type="password" v-model="registerForm.repasswd" :placeholder="this.$t('m.regis.place_confirm')">
              <Icon type="ios-locked-outline" slot="prepend"></Icon>
            </Input>
          </FormItem>
          <FormItem>
            <Row type="flex" justify="center"  :gutter="24">
              <Col>
                <Button type="ghost" @click="gotoLogin">{{$t('m.regis.log')}}</Button>
              </Col>
              <Col>
                <Button type="primary" :loading="loading" :disabled="loading" @click="onSubmit">
                  <span v-if="!loading">{{$t('m.regis.reg')}}</span>
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
          if (this.registerForm.repasswd !== '') {
            this.$refs.registerForm.validateField('repasswd')
          }
          callback()
        }
      }
      const validatePassCheck = (rule, value, callback) => {
        if (value === '') {
          callback(new Error(this.$t('m.regis.againPassword')))
        } else if (value !== this.registerForm.passwd) {
          callback(new Error(this.$t('m.regis.noMatch')))
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
            { required: true, message: this.$t('m.regis.email'), trigger: 'blur' },
            { type: 'email', message: this.$t('m.regis.invalid'), trigger: 'blur' }
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
                title: this.$t('m.success'),
                content: "<p>{{$t('m.regis.activation')}}</p>",
                onOk: () => {
                  this.$router.push({name: 'login'})
                }
              })
            }, err => {
              this.loading = false
              if (err.code && err.code === 502) {
                this.$Modal.confirm({
                  title: this.$t('m.warning'),
                  content: "<p>{{$t('m.regis.noActivate')}}</p>",
                  loading: true,
                  okText: this.$t('m.send'),
                  onOk: () => {
                    this.resendActivationEmail(payload.email).then(res => {
                      this.$Modal.remove()
                      this.$Message.info(this.$t('m.regis.activation'))
                    }, err => {
                      this.$Modal.remove()
                      this.$Message.error(err.message || this.$t('m.unKnown'))
                    })
                  }
                })
              } else {
                this.$Modal.error({title: this.$t('m.error'), content: err.message ? err.message : this.$t('m.unKnown')})
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