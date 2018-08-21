<template>
  <Form ref="editAirdropForm" :model="editAirdropForm" :rules="editRule" :label-width="80">
    <FormItem :label="this.$t('m.addAirdrop.title')" prop="title" :required="true">
      <Input type="text" v-model="editAirdropForm.title" :placeholder="this.$t('m.addAirdrop.airdropTask')"></Input>
    </FormItem>
    <div v-if="airdropToken" style="margin-left:80px;margin-bottom:10px">
      <div>{{ airdropToken.address}}</div>
      <Tag>{{ airdropToken.name }}</Tag>
      <Tag>{{ airdropToken.symbol }}</Tag>
    </div>
    <FormItem :label="this.$t('m.addAirdrop.budget')" prop="budget" :required="true">
      <InputNumber :min="1" :step="1" v-model="editAirdropForm.budget"></InputNumber>
      <small>{{$t('m.addAirdrop.totalAmount')}}</small>
    </FormItem>
    <FormItem :label="this.$t('m.addAirdrop.giveOut')" prop="giveOut" :required="true">
      <InputNumber :min="1" :step="1" v-model="editAirdropForm.giveOut"></InputNumber>
      <small>{{$t('m.addAirdrop.giveOutAmount')}}</small>
    </FormItem>
    <FormItem :label="this.$t('m.addAirdrop.promotion')" prop="bonus" :required="true">
      <InputNumber :min="1" :step="1" v-model="editAirdropForm.bonus"></InputNumber>
      <small>{{$t('m.addAirdrop.promotionBonus')}}</small>
    </FormItem>
    <FormItem :label="this.$t('m.addAirdrop.telegram')" prop="telegramGroup" :required="true">
      <Input type="text" v-model="editAirdropForm.telegramGroup" :placeholder="this.$t('m.addAirdrop.TelegramGroup')"></Input>
    </FormItem>
    <FormItem :label="this.$t('m.addAirdrop.dateRange')" props="dateRange">
      <DatePicker :options="dateRangeOptions" v-model="editAirdropForm.dateRange" type="daterange" split-panels placeholder="Select date" style="width: 200px"></DatePicker>
    </FormItem>
  </Form>
</template>

<script>
  import airdropAPI from '../../api/airdrop'
  import moment from 'moment'
  export default {
    data() {
      return {
        editAirdropForm: {
          id: 0,
          title: '',
          budget: 10,
          giveOut: 1,
          bonus: 1,
          telegramGroup: '',
          dateRange: []
        },
        airdropToken: null,
        editRule: {
          title: [
            { required: true, message: this.$t('m.addAirdrop.inputAirdrop'), trigger: 'blur' },
            { type: 'string', max: 20, message: this.$t('m.addAirdrop.noMore20'), trigger: 'blur' }
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
      reset(airdrop) {
        this.airdropToken = airdrop.token
        this.editAirdropForm = {
          id: airdrop.id,
          title: airdrop.title,
          budget: airdrop.budget,
          giveOut: airdrop.give_out,
          bonus: airdrop.bonus,
          telegramGroup: airdrop.telegram_group,
          dateRange: [moment(airdrop.start_date), moment(airdrop.end_date)]
        }
      },
      submit(resolve, reject) {
        this.$refs.editAirdropForm.validate((valid) => {
          if (valid) {
            const payload = {
              id: this.editAirdropForm.id,
              title: this.editAirdropForm.title,
              budget: this.editAirdropForm.budget,
              give_out: this.editAirdropForm.giveOut,
              bonus: this.editAirdropForm.bonus,
              telegram_group: this.editAirdropForm.telegramGroup,
              start_date: moment(this.editAirdropForm.dateRange[0]).format('YYYY-MM-DD'),
              end_date: moment(this.editAirdropForm.dateRange[1]).format('YYYY-MM-DD')
            }
            airdropAPI.update(this.token, payload).then(res => {
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