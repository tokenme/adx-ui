<template>
  <Row type="flex" justify="center">
    <Col span="8">
      <Card style="margin-top:20px">
        <p slot="title">{{$t('m.regis.register')}}</p>
        <Tabs value="name1">
          <TabPane :label="this.$t('m.regis.mo')" name="name1">
            <p>
              <Form ref="registerPhoneForm" :model="registerPhoneForm" :rules="registerPhoneRule">
                <Select v-model="countryCode" >
                  <Option v-for="item of countries " :key="item.name" :value="item.code">{{item.name}}, +{{item.code}}</Option>
                </Select>
              <FormItem prop="mobile">
                <Input v-model="registerPhoneForm.mobile" @change="onMobileChange"  required :placeholder="this.$t('m.regis.phone')" >
                  <Button slot="append" type="primary" :loading="authSending" :disabled="smsCountdown>0 || !registerPhoneForm.mobile || !countryCode || verifing" @click="authSend">{{ authSendBtn }}</Button>
                </Input>
              </FormItem>
              <FormItem prop="verify_code">
                <Input type="text" v-model="registerPhoneForm.verify_code" :placeholder="this.$t('m.regis.va')" >
                  <Icon type="ios-email-outline" slot="prepend"></Icon>
                </Input>
              </FormItem>
              <FormItem prop="passwd">
                <Input type="password" v-model="registerPhoneForm.passwd" :placeholder="this.$t('m.regis.place_password')">
                  <Icon type="ios-locked-outline" slot="prepend"></Icon>
                </Input>
              </FormItem>
              <FormItem prop="repasswd">
                <Input type="password" v-model="registerPhoneForm.repasswd" :placeholder="this.$t('m.regis.place_confirm')">
                  <Icon type="ios-locked-outline" slot="prepend"></Icon>
                </Input>
              </FormItem>
              <FormItem>
                <Row type="flex" justify="center"  :gutter="24">
                  <Col>
                    <Button type="ghost" @click="gotoLogin">{{$t('m.regis.log')}}</Button>
                  </Col>
                  <Col>
                    <Button type="primary" :loading="submitting" :disabled="!registerPhoneForm.valid || submitting" @click="submitForm">
                      <span v-if="!submitting">{{$t('m.regis.reg')}}</span>
                      <span v-else>Loading...</span>
                    </Button>
                  </Col>
                </Row>
              </FormItem>
            </Form>
           </p>
          </TabPane>
          <TabPane :label="this.$t('m.regis.em')" name="name2">
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
          </TabPane>
        </Tabs>
        
      </Card>
    </Col>
  </Row>
</template>

<script>
  import * as types from '../store/mutation-types'
  import userAPI from '../api/user'
  import {countries} from '../twilio-countries'
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
      const validatePassPhone = (rule, value, callback) => {
        if (value === '') {
          callback(new Error(this.$t('m.regis.password')))
        } else if (value.length < 6) {
          callback(new Error(this.$t('m.regis.sixLess')))
        } else {
          if (this.registerPhoneForm.repasswd !== '') {
            this.$refs.registerPhoneForm.validateField('repasswd')
          }
          callback()
        }
      }
      const validatePassCheckPhone = (rule, value, callback) => {
        if (value === '') {
          callback(new Error(this.$t('m.regis.againPassword')))
        } else if (value !== this.registerPhoneForm.passwd) {
          callback(new Error(this.$t('m.regis.noMatch')))
        } else {
          callback()
        }
      }
      const validatePhone = (rule, value, callback) => {
        if (value === '') {
          callback(new Error(this.$t('m.login.inPhone')))
        } else if (/^\d{1,10}$/.test(value)) {
          callback(new Error(this.$t('m.login.fa')))
        } else {
          callback()
        }
      }
      const validatEverify = (rule, value, callback) => {
        if (value === '') {
          callback(new Error(this.$t('m.regis.check')))
        }
      }
      return {
        loading: false,
        registerForm: {
          email: '',
          passwd: '',
          repasswd: ''
        },
        submiting: false,
        registerPhoneForm: {
          valid: true,
          mobile: '',
          passwd: '',
          repasswd: '',
          verify_code: ''
        },
        countries: countries,
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
        },
        registerPhoneRule: {
          mobile: [
            { validator: validatePhone, trigger: 'blur' }
          ],
          verify_code: [
            { validator: validatEverify, trigger: 'blur' }
          ],
          passwd: [
            { validator: validatePassPhone, trigger: 'blur' }
          ],
          repasswd: [
            { validator: validatePassCheckPhone, trigger: 'blur' }
          ]
        },
        authSending: false,
        verifing: false,
        smsCountdown: 0
      }
    },
    computed: {
      countryCode: {
        get() {
          return this.$store.getters['countryCode']
        },
        set(value) {
          this.$store.dispatch(types.CHANGE_COUNTRY_CODE_REQUEST, value)
        }
      },
      authSendBtn() {
        if (this.smsCountdown <= 0) {
          return this.$t('m.regis.send')
        }
        return '(' + this.smsCountdown + ') ' + this.$t('m.regis.send')
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
                content: this.$t('m.regis.activation'),
                onOk: () => {
                  this.$router.push({name: 'login'})
                }
              })
            }, err => {
              this.loading = false
              if (err.code && err.code === 502) {
                this.$Modal.confirm({
                  title: this.$t('m.warning'),
                  content: this.$t('m.regis.noActivate'),
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
      submitForm(e) {
        if (!this.$refs.registerPhoneForm.validate()) {
          return false
        }
        this.submitting = true
        let payload = {
          country_code: this.countryCode,
          mobile: this.registerPhoneForm.mobile,
          verify_code: this.registerPhoneForm.verify_code,
          passwd: this.registerPhoneForm.passwd,
          repasswd: this.registerPhoneForm.repasswd,
          is_publisher: this.$Site === 'media' ? 1 : 0,
          is_advertiser: this.$Site === 'adx' ? 1 : 0
        }
        this.$store.dispatch(types.REGISTER_REQUESTPHONE, payload).then(res => {
          this.submitting = false
          this.$Modal.success({
            title: this.$t('m.success'),
            content: this.$t('m.regis.succ'),
            onOk: () => {
              this.$router.push({name: 'login'})
            }
          })
        }, err => {
          this.submitting = false
          this.loading = false
          if (err.code && err.code === 502) {
            this.$Modal.confirm({
              title: this.$t('m.warning'),
              content: this.$t('m.regis.fail'),
              loading: true,
              okText: this.$t('m.send')
            })
          } else {
            this.$Modal.error({title: this.$t('m.error'), content: err.message ? err.message : this.$t('m.unKnown')})
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
      },
      onMobileChange() {
        this.registerForm.verify_code = ''
      },
      authSendCountdown() {
        let self = this
        self.smsCountdown -= 1
        if (self.smsCountdown <= 0) {
          return
        }
        setTimeout(self.authSendCountdown, 1000)
      },
      authSend() {
        this.authSending = true
        this.smsCountdown = 60
        userAPI.authSend({ mobile: this.registerPhoneForm.mobile, country: this.countryCode }).then((response) => {
          this.authSending = false
          if (response.code) {
            this.smsCountdown = 0
            this.$Modal.confirm({
              title: this.$t('m.regis.sendfail'),
              content: response.message,
              loading: true,
              okText: this.$t('m.regis.ok'),
              onOk: () => {
                this.$Modal.remove()
              }
            })
          } else {
            let self = this
            setTimeout(self.authSendCountdown, 1000)
          }
        })
      },
      showErrorDialog(err) {
        this.$store.dispatch(types.SHOW_ERROR_DIALOG, err)
      }
    },
    created() {
      this.$store.dispatch(types.UPDATE_CURRENT_ROUTE, 'register')
    }
    
  }
</script>