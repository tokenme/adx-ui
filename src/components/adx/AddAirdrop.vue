<template>
  <Form ref="addAirdropForm" :model="addAirdropForm" :rules="addRule" :label-width="80">
    <FormItem label="Title" prop="title" :required="true">
      <Input type="text" v-model="addAirdropForm.title" placeholder="airdrop task title"></Input>
    </FormItem>
    <FormItem label="Token Address" prop="tokenAddress" :required="true">
      <Input type="text" v-model="addAirdropForm.tokenAddress" placeholder="ERC20 token address"></Input>
      <div v-if="airdropToken">
        <Tag>{{ airdropToken.name }}</Tag>
        <Tag>{{ airdropToken.symbol }}</Tag>
      </div>
    </FormItem>
    <FormItem label="Budget" prop="budget" :required="true">
      <InputNumber :min="1" :step="1" v-model="addAirdropForm.budget"></InputNumber>
      <small>total amount of tokens budget for this airdrop</small>
    </FormItem>
    <FormItem label="Give Out" prop="giveOut" :required="true">
      <InputNumber :min="1" :step="1" v-model="addAirdropForm.giveOut"></InputNumber>
      <small>give out amount of the token per user</small>
    </FormItem>
    <FormItem label="Promotion Bonus" prop="bonus" :required="true">
      <InputNumber :min="1" :step="1" v-model="addAirdropForm.bonus"></InputNumber>
      <small>promotion bonus per transaction</small>
    </FormItem>
    <FormItem label="Telegram Group" prop="telegramGroup" :required="true">
      <Input type="text" v-model="addAirdropForm.telegramGroup" placeholder="telegram group title"></Input>
    </FormItem>
    <FormItem label="DateRange" props="dateRange">
      <DatePicker :options="dateRangeOptions" v-model="addAirdropForm.dateRange" type="daterange" split-panels placeholder="Select date" style="width: 200px"></DatePicker>
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
          return callback(new Error('Token address cannot be empty'));
        }
        this.getToken(res => {
          this.airdropToken = res
          callback()
        }, err => {
          console.log(err)
          callback(new Error('Invalid token address'))
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
            { required: true, message: 'Please input the airdrop title', trigger: 'blur' },
            { type: 'string', max: 20, message: 'Title no more than 20 words', trigger: 'blur' }
          ],
          tokenAddress: [
            { validator: validateToken, trigger: 'blur' }
          ],
          telegramGroup: [
            { required: true, message: 'Please enter telegram group title', trigger: 'blur' }
          ],
          dateRange: [
            { required: true, message: 'Please select dateRange', trigger: 'blur' }
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