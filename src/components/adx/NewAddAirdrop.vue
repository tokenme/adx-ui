<template>
  <v-container class="fluid px-0 pt-0" >
    <v-card>
      <v-card-text>
        <v-form v-model="newAirdropForm.valid" ref="newAirdropForm" lazy-validation>
          <v-text-field v-model="newAirdropForm.title" :label="this.$t('m.newAddAirdrop.airdrop_name_label')" :rules="airdropNameRules" required></v-text-field>
          <v-text-field v-model="newAirdropForm.token.address" :label="$t('m.newAddAirdrop.token_address_label')" @change="getToken" :rules="tokenRules" required></v-text-field>
          <div class="text-xs-center" v-if="newAirdropForm.token.name">
            <v-chip label outline color="primary" style="background:#1976d2">
              {{ $t('m.newAddAirdrop.token_name') }}: <strong>{{ newAirdropForm.token.name }}</strong>
            </v-chip>
            <v-chip label outline color="primary" style="background:#1976d2;color:#fff">
              {{ $t('m.newAddAirdrop.token_symbol') }}: <strong>{{ newAirdropForm.token.symbol }}</strong>
            </v-chip>
            <v-chip label outline color="primary" style="background:#1976d2;color:#fff">
              {{ $t('m.newAddAirdrop.token_decimals') }}: <strong>{{ newAirdropForm.token.decimals || 0 }}</strong></strong>
            </v-chip>
            <v-divider></v-divider>
          </div>
          <v-text-field v-model="newAirdropForm.gas_price" :label="this.$t('m.newAddAirdrop.gas_price_label')" prepend-icon="mdi-currency-eth" :rules="gasPriceRules" :hint="this.$t('m.newAddAirdrop.suggest_gas_price_hint', {price: suggest_gas_price})" suffix="Gwei" required></v-text-field>
          <v-text-field v-model="newAirdropForm.give_out" :label="this.$t('m.newAddAirdrop.give_out_label')" prepend-icon="mdi-airballoon" :rules="integerRules" :suffix="this.$t('m.newAddAirdrop.symbol_per_user', {symbol: newAirdropForm.token.symbol})" required></v-text-field>
          <v-text-field v-model="newAirdropForm.bonus" :label="this.$t('m.newAddAirdrop.bonus_label')" prepend-icon="mdi-trophy-award" :rules="bonusRules" :hint="this.$t('m.newAddAirdrop.bonus_hint')" :suffix="this.$t('m.newAddAirdrop.symbol_per_tx', {symbol: newAirdropForm.token.symbol})" required></v-text-field>
          <v-text-field v-model="newAirdropForm.max_submissions" :label="this.$t('m.newAddAirdrop.max_submissions_label')" prepend-icon="mdi-account-group" required></v-text-field>
          <v-text-field v-model="newAirdropForm.telegram_group" :label="this.$t('m.newAddAirdrop.telegram_group_label')" prepend-icon="mdi-telegram" :rules="telegramRules" required></v-text-field>
          <v-switch :label="this.$t('m.newAddAirdrop.require_email_label')" v-model="newAirdropForm.require_email"></v-switch>
          <v-text-field v-model="newAirdropForm.reply_msg" :label="this.$t('m.newAddAirdrop.reply_msg_label')" prepend-icon="mdi-message-reply" required></v-text-field>
          <v-menu
            ref="start_date_menu"
            lazy
            :close-on-content-click="false"
            v-model="start_date_menu"
            transition="scale-transition"
            offset-y
            full-width
            :nudge-right="40"
            min-width="290px"
            :return-value.sync="newAirdropForm.start_date"
          >
            <v-text-field slot="activator" v-model="newAirdropForm.start_date" :label="this.$t('m.newAddAirdrop.start_date_label')" prepend-icon="mdi-calendar-today" :rules="startDateRules" suffix="UTC" readonly required></v-text-field>
            <v-date-picker v-model="newAirdropForm.start_date" @change="saveStartDate" :min="today" no-title scrollable></v-date-picker>
          </v-menu>
          <v-menu
            ref="end_date_menu"
            lazy
            :close-on-content-click="false"
            v-model="end_date_menu"
            transition="scale-transition"
            offset-y
            full-width
            :nudge-right="40"
            min-width="290px"
            :return-value.sync="newAirdropForm.end_date"
          >
            <v-text-field slot="activator" v-model="newAirdropForm.end_date" :label="this.$t('m.newAddAirdrop.end_date_label')" prepend-icon="mdi-calendar" :rules="endDateRules" suffix="UTC" readonly required></v-text-field>
            <v-date-picker v-model="newAirdropForm.end_date" @change="saveEndDate" :min="newAirdropForm.start_date" no-title scrollable></v-date-picker>
          </v-menu>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-btn color="secondary" style="background:#424242;color:#fff" :to="{name:'newairdrops'}">{{ $t('m.newAirdrops.close') }}</v-btn>
        <v-spacer></v-spacer>
        <v-btn color="primary" :loading="submitting" :disabled="submitting" style="background:#1976d2;color:#fff" @click="submitNewAirdropForm">{{ $t('m.newAddAirdrop.sub') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script>
  import * as types from '../../store/mutation-types'
  import tokenAPI from '../../api/token'
  import gasAPI from '../../api/gas'
  import airdropAPI from '../../api/airdrop'
  // import i18n from '../locale/add-airdrop'
  import { bus } from '../../bus'
  import moment from 'moment'

  export default {
    // i18n: i18n,
    data() {
      return {
        submitting: false,
        newAirdropForm: {
          valid: true,
          title: '',
          token: {
            address: '',
            symbol: '',
            name: '',
            decimals: 0
          },
          gas_price: 0,
          give_out: 0,
          bonus: 0,
          max_submissions: 0,
          telegram_group: '',
          start_date: '',
          end_date: '',
          require_email: false,
          msg_reply: ''
        },
        suggest_gas_price: 50,
        start_date_menu: false,
        end_date_menu: false
      }
    },
    computed: {
      token() {
        return this.$store.getters['token']
      },
      airdropNameRules() {
        return [
          v => !!v || this.$t('m.newAddAirdrop.error.airdrop_name_required'),
          v => v.length <= 20 || this.$t('m.newAddAirdrop.error.airdrop_name_less_than_20'),
          v => v.length >= 5 || this.$t('m.newAddAirdrop.error.airdrop_name_more_than_5')
        ]
      },
      tokenRules() {
        return [
          v => !!this.newAirdropForm.token.name || this.$t('m.newAddAirdrop.error.token_required')
        ]
      },
      gasPriceRules() {
        return [
          v => parseInt(v) >= 1 || this.$t('m.newAddAirdrop.error.min_gas_price'),
          v => parseInt(v) <= 500 || this.$t('m.newAddAirdrop.error.max_gas_price')
        ]
      },
      integerRules() {
        return [
          v => parseInt(v) > 0 || this.$t('m.newAddAirdrop.error.number_required')
        ]
      },
      bonusRules() {
        return [
          v => (parseInt(v) >= 0 && parseInt(v) <= 100) || this.$t('m.newAddAirdrop.error.bonus_required')
        ]
      },
      telegramRules() {
        return [
          v => !!v || this.$t('m.newAddAirdrop.error.telegram_group_required')
        ]
      },
      startDateRules() {
        return [
          v => !!v || this.$t('m.newAddAirdrop.error.start_date_required')
        ]
      },
      endDateRules() {
        return [
          v => !!v || this.$t('m.newAddAirdrop.error.end_date_required')
        ]
      },
      today() {
        return moment().format('YYYY-MM-DD')
      }
    },
    methods: {
      submitNewAirdropForm() {
        if (!this.$refs.newAirdropForm.validate()) {
          return false
        }
        const payload = {
          title: this.newAirdropForm.title,
          token_address: this.newAirdropForm.token.address,
          gas_price: parseInt(this.newAirdropForm.gas_price),
          give_out: parseInt(this.newAirdropForm.give_out),
          bonus: parseInt(this.newAirdropForm.bonus),
          max_submissions: parseInt(this.newAirdropForm.max_submissions),
          telegram_group: this.newAirdropForm.telegram_group,
          msg_reply: this.newAirdropForm.msg_reply,
          start_date: moment(this.newAirdropForm.start_date).valueOf(),
          end_date: moment(this.newAirdropForm.end_date).valueOf(),
          require_email: this.newAirdropForm.require_email ? 1 : 0
        }
        this.submitting = true
        airdropAPI.add(this.token, payload).then((response) => {
          this.submitting = false
          if (response.code) {
            this.showErrorDialog({ title: this.$t('m.newAddAirdrop.failed_title'), message: response.message })
          } else {
            this.gotoAirdrop(response)
          }
        })
      },
      getToken(q) {
        this.loading = true
        tokenAPI.get(q).then((response) => {
          this.loading = false
          if (response.code) {
            this.showErrorDialog({ title: this.$t('m.newAddAirdrop.error.get_token_failed'), message: response.message })
          } else {
            this.newAirdropForm.token = response
            this.$refs.newAirdropForm.validate()
          }
        })
      },
      getSuggestGasPrice() {
        gasAPI.suggestPrice().then((response) => {
          if (response.price) {
            this.suggest_gas_price = Math.ceil(response.price / Math.pow(10, 9))
            if (this.newAirdropForm.gas_price === 0) {
              this.newAirdropForm.gas_price = this.suggest_gas_price
            } 
          }
        })
      },
      saveStartDate (date) {
        this.$refs.start_date_menu.save(date)
      },
      saveEndDate (date) {
        this.$refs.end_date_menu.save(date)
      },
      gotoAirdrop(airdrop) {
        this.$router.push({
          name: 'newairdrop',
          params: {
            id: airdrop.id
          }
        })
      },
      showErrorDialog(err) {
        this.$store.dispatch(types.SHOW_ERROR_DIALOG, err)
      }
    },
    created() {
      const user = this.$store.getters['userInfo']
      if (user.is_airdrop_publisher !== 1) {
        this.$router.push({path: '/'})
      }
      this.getSuggestGasPrice()
    },
    mounted() {
      bus.$emit('update_toolbar_icons', null)
      bus.$emit('update_toolbar_items', null)
    }
  }

</script>
