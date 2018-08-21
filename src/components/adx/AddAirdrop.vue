<template>
  <Form ref="addAirdropForm" :model="addAirdropForm" :rules="addRule" :label-width="80">
    <FormItem :label="this.$t('m.addAirdrop.title')" prop="title" :required="true">
      <Input type="text" v-model="addAirdropForm.title" :placeholder="this.$t('m.addAirdrop.airdropTask')"></Input>
    </FormItem>
    <FormItem :label="this.$t('m.addAirdrop.tokenAddress')" prop="tokenAddress" :required="true">
      <Input type="text" v-model="addAirdropForm.tokenAddress" :placeholder="this.$t('m.addAirdrop.erc20')"></Input>
      <div v-if="airdropToken">
        <Tag>{{ airdropToken.name }}</Tag>
        <Tag>{{ airdropToken.symbol }}</Tag>
      </div>
    </FormItem>
    <FormItem :label="this.$t('m.addAirdrop.budget')" prop="budget" :required="true">
      <InputNumber :min="1" :step="1" v-model="addAirdropForm.budget"></InputNumber>
      <small>{{$t('m.addAirdrop.totalAmount')}}</small>
    </FormItem>
    <FormItem :label="this.$t('m.addAirdrop.giveOut')" prop="giveOut" :required="true">
      <InputNumber :min="1" :step="1" v-model="addAirdropForm.giveOut"></InputNumber>
      <small>{{$t('m.addAirdrop.giveOutAmount')}}</small>
    </FormItem>
    <FormItem :label="this.$t('m.addAirdrop.promotion')" prop="bonus" :required="true">
      <InputNumber :min="1" :step="1" v-model="addAirdropForm.bonus"></InputNumber>
      <small>{{$t('m.addAirdrop.promotionBonus')}}</small>
    </FormItem>
    <FormItem :label="this.$t('m.addAirdrop.telegram')" prop="telegramGroup" :required="true">
      <Input type="text" v-model="addAirdropForm.telegramGroup" :placeholder="this.$t('m.addAirdrop.TelegramGroup')"></Input>
    </FormItem>
    <FormItem :label="this.$t('m.addAirdrop.dateRange')" props="dateRange">
      <DatePicker :options="dateRangeOptions" v-model="addAirdropForm.dateRange" type="daterange" split-panels :placeholder="this.$t('m.addAirdrop.selectDate')" style="width: 200px"></DatePicker>
    </FormItem>
  </Form>
</template>

<script>
  import airdropAPI from '../../api/airdrop'
  import tokenAPI from '../../api/token'
  import moment from 'moment'
  export default {
    data() {
      const validateToken = (rule, value, callback) => {
        if (!value) {
          return callback(new Error(this.$t('m.addAirdrop.tokenNoEmpty')));
        }
        this.getToken(res => {
          this.airdropToken = res
          callback()
        }, err => {
          console.log(err)
          callback(new Error(this.$t('m.addAirdrop.invaildToken')))
        }, value)
      }
      return {
        addAirdropForm: {
          title: '',
          tokenAddress: '',
          budget: 10,
          giveOut: 1,
          bonus: 1,
          telegramGroup: '',
          dateRange: []
        },
        airdropToken: null,
        addRule: {
          title: [
            { required: true, message: this.$t('m.addAirdrop.inputAirdrop'), trigger: 'blur' },
            { type: 'string', max: 20, message: this.$t('m.addAirdrop.noMore20'), trigger: 'blur' }
          ],
          tokenAddress: [
            { validator: validateToken, trigger: 'blur' }
          ],
          telegramGroup: [
            { required: true, message: this.$t('m.addAirdrop.enterTelegram'), trigger: 'blur' }
          ],
          dateRange: [
            { required: true, message: this.$t('m.addAirdrop.selectDateRange'), trigger: 'blur' }
          ]
        },
        dateRangeOptions: {
          disabledDate (date) {
            return date && (moment(date).isBefore(moment()) || moment(date).isAfter(moment().add(2, 'months')))
          }
        }
      }
    },
    computed: {
      token() {
        return this.$store.getters['token']
      }
    },
    methods: {
      reset() {
        this.airdropToken = null
        this.addAirdropForm = {
          title: '',
          tokenAddress: '',
          budget: 10,
          giveOut: 1,
          bonus: 1,
          telegramGroup: ''
        }
      },
      getToken(resolve, reject, q) {
        tokenAPI.get(this.token, q).then(res => {
          if (res && res.code) {
            reject(res)
            return
          }
          resolve(res)
        })
      },
      submit(resolve, reject) {
        this.$refs.addAirdropForm.validate((valid) => {
          if (valid) {
            const payload = {
              title: this.addAirdropForm.title,
              token_address: this.addAirdropForm.tokenAddress,
              budget: this.addAirdropForm.budget,
              give_out: this.addAirdropForm.giveOut,
              bonus: this.addAirdropForm.bonus,
              telegram_group: this.addAirdropForm.telegramGroup,
              start_date: moment(this.addAirdropForm.dateRange[0]).format('YYYY-MM-DD'),
              end_date: moment(this.addAirdropForm.dateRange[1]).format('YYYY-MM-DD')
            }
            airdropAPI.add(this.token, payload).then(res => {
              if (res && res.code) {
                reject(res)
                return
              }
              resolve(res)
            })
          }
        })
        return false
      }
    }
  }
</script>