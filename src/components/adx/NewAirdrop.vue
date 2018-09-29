<template>
  <v-container class="fluid px-0 pt-0">
    <v-dialog v-model="withdrawTXDialog">
      <v-card>
        <v-card-title class="headline">{{ $t('m.Airdrop.withdraw_tx_title') }}</v-card-title>
        <v-card-text>
          <v-btn block
            v-clipboard:copy="withdrawTX"
            v-clipboard:success="onCopySuccess">{{ $t('m.Airdrop.withdraw_tx_msg') }}</v-btn>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="withdrawTXDialog=false">{{ $t('close') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="newPromotionDialog">
      <v-card>
        <v-card-title class="headline">{{ $t('m.Airdrop.promotion_title') }}</v-card-title>
        <v-card-text>
          <v-select
            :items="channels"
            v-model="newPromotionForm.channel_id"
            item-text="name"
            item-value="id"
            :label="this.$t('m.Airdrop.select_channel')"
            @change="getAdzones"
            single-line
            bottom
          ></v-select>
          <v-select
            :items="adzones"
            v-model="newPromotionForm.adzone_id"
            :label="this.$t('m.Airdrop.select_adzone')"
            item-text="name"
            item-value="id"
            append-icon="mdi-plus"
            :append-icon-cb="() => ( editingAdzone=true )"
            v-if="!editingAdzone"
            single-line
            bottom
          ></v-select>
          <v-text-field v-else 
              v-model="newAdzoneName" 
              :label="this.$t('m.Airdrop.new_adzone_label')"
              :loading="addingNewAdzone" 
              :disabled="addingNewAdzone" 
              :append-icon="addingNewAdzone ? 'mdi-loading' : (newAdzoneName=='' ? 'mdi-close' : 'mdi-check')" 
              :append-icon-cb="() => (onAddNewAdzone())" 
              @change="onAddNewAdzone()"
              @blur="onAddNewAdzone()"></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-btn color="secondary" @click="newPromotionDialog=false">{{ $t('close') }}</v-btn>
          <v-spacer></v-spacer>
          <v-btn color="primary" :disabled="creatingPromotion" :loading="creatingPromotion" @click="onCreatePromotion">{{ $t('create') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="newWithdrawDialog">
      <v-card>
        <v-card-title class="headline">{{ $t('m.Airdrop.withdraw') }}</v-card-title>
        <v-card-text>
          <v-form v-model="withdrawForm.valid" ref="withdrawForm" lazy-validation>
            <v-text-field v-model="withdrawForm.wallet" prepend-icon="mdi-wallet" :label="this.$t('m.Airdrop.withdraw_form.wallet_label')"  :rules="walletRules" required></v-text-field>
            <v-text-field v-model="withdrawForm.token_amount" :label="this.$t('m.Airdrop.withdraw_form.token_amount_label')" prepend-icon="mdi-coins" :suffix="airdrop.token.symbol"></v-text-field>
            <v-text-field v-model="withdrawForm.eth" :label="this.$t('m.Airdrop.withdraw_form.eth_amount_label')" prepend-icon="mdi-currency-eth"></v-text-field>
            <v-text-field v-model="withdrawForm.gas_price" :label="this.$t('m.Airdrop.withdraw_form.gas_price_label')" prepend-icon="mdi-currency-eth" :rules="gasPriceRules" :hint="this.$t('m.Airdrop.suggest_gas_price_hint', {price: suggest_gas_price})" suffix="Gwei" required></v-text-field>
            <v-text-field prepend-icon="mdi-key" v-model="withdrawForm.passwd" :label="this.$t('m.Airdrop.withdraw_form.password')" :rules="passwordRules" type="password"></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn color="secondary" @click="newWithdrawDialog=false">{{ $t('close') }}</v-btn>
          <v-spacer></v-spacer>
          <v-btn color="primary" :disabled="withdrawing" :loading="withdrawing" @click="onWithdraw">{{ $t('m.Airdrop.withdraw') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="promotionResponseDialog">
      <v-card v-if="promotionResponse && promotionResponse.link">
        <v-card-title class="headline">{{ $t('m.Airdrop.promotion_response_title') }}</v-card-title>
        <v-card-text>
          <v-btn block
            v-clipboard:copy="promotionResponse.link"
            v-clipboard:success="onCopySuccess">{{ $t('m.Airdrop.promotion_response_msg') }}</v-btn>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="promotionResponseDialog=false">{{ $t('close') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <loadmore 
      :top-method="topRefresh" 
      :topPullText="this.$t('m.loadmore.topPullText')"
      :topDropText="this.$t('m.loadmore.releaseText')"
      :topLoadingText="this.$t('m.loadmore.loadingText')"
      ref="loadmore">
      <v-container fluid v-if="airdrop && airdrop.id == airdropId">
        <v-layout row align-content-start justify-space-between class="mb-4">
          <v-flex xs9>
            <header class="title">{{ airdrop.title }}</header>
            <small class="grey--text text--lighten-1">
              {{ $t('m.Airdrop.dateRange', { from: dateFormat(airdrop.start_date), to: dateFormat(airdrop.end_date) })}}
            </small>
          </v-flex>
          <v-flex xs3 v-if="isAdmin || isOwner">
              <v-switch :label="statusString" v-model="editAirdropForm.status" color="success" @click="onUpdateStatus" hide-details></v-switch>
          </v-flex>
        </v-layout>
        <template v-if="airdrop.token">
          <v-btn block small :to="{path:'/token/' + airdrop.token.address}" style="text-transform:none">{{ airdrop.token.address }}</v-btn>
          <div class="text-xs-center">
            <v-chip small label outline color="primary">
              {{ $t('m.Airdrop.token_name') }}: <strong>{{ airdrop.token.name }}</strong>
            </v-chip>
            <v-chip small label outline color="primary">
              {{ $t('m.Airdrop.token_symbol') }}: <strong>{{ airdrop.token.symbol }}</strong>
            </v-chip>
            <v-chip small label outline color="primary">
              {{ $t('m.Airdrop.token_decimals') }}: <strong>{{ airdrop.token.decimals || 0 }}</strong></strong>
            </v-chip>
          </div>
        </template>
        <v-layout row justify-space-between>
          <v-flex xs7>
            <v-btn v-if="!editing.give_out" depressed @click.native="onEditGiveOut">
              <v-icon>mdi-airballoon</v-icon>{{ $t('m.Airdrop.give_out_label') }} : {{ airdrop.give_out }} {{ $t('m.Airdrop.symbol_per_user', {symbol: airdrop.token.symbol}) }}
            </v-btn>
            <v-text-field v-else 
              v-model="editAirdropForm.give_out" 
              :label="this.$t('m.Airdrop.give_out_label')" 
              prepend-icon="mdi-airballoon" 
              :suffix="this.$t('m.Airdrop.symbol_per_user', {symbol: airdrop.token.symbol})" 
              :loading="updating.give_out" 
              :disabled="updating.give_out" 
              :append-icon="updating.give_out ? 'mdi-loading' : (parseInt(editAirdropForm.give_out) != airdrop.give_out ? 'mdi-check' : 'mdi-close')" 
              :append-icon-cb="() => (onUpdateAirdrop('give_out'))" 
              @change="onUpdateAirdrop('give_out')"
              @blur="onUpdateAirdrop('give_out')"></v-text-field>
          </v-flex>
          <v-flex xs5>
            <v-btn depressed>
              <v-icon>mdi-trophy-award</v-icon>{{ $t('bonus', {bonus: airdrop.bonus}) }}
            </v-btn>
          </v-flex>
        </v-layout>
        <v-btn 
          block 
          color="primary" 
          style="background:#4caf50;color:#fff"
          :disabled="!airdrop.status" 
          @click.native="newPromotionDialog=true">
          {{ $t('m.Airdrop.promote_btn') }}
        </v-btn>
      </v-container>
      <v-divider></v-divider>
      <v-list two-line v-if="airdrop && airdrop.id == airdropId">
        <v-list-tile avatar :href="'https://t.me/' + airdrop.telegram_group">
          <v-list-tile-avatar>
            <v-icon>mdi-telegram</v-icon>
          </v-list-tile-avatar>
          <v-list-tile-content>
            <v-list-tile-title>@{{ airdrop.telegram_group }}</v-list-tile-title>
            <v-list-tile-subtitle v-if="isAdmin || isOwner">
              <small class="yellow accent-4 px-2 pt-2 pb-2">{{ $t('m.Airdrop.add_telegram_bot_alert', { bot: airdrop.telegram_bot, group: airdrop.telegram_group }) }}</small>
            </v-list-tile-subtitle>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile avatar 
          v-if="(isAdmin || isOwner) && airdrop.require_email && airdrop.token.protocol == 'ERC20'">
          <v-list-tile-avatar>
            <v-icon>mdi-email</v-icon>
          </v-list-tile-avatar>
          <v-list-tile-content>
            <v-list-tile-title>{{ $t('m.Airdrop.require_email_label') }}</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile avatar 
          v-if="(isAdmin || isOwner) && airdrop.token.protocol == 'ERC20'"
          v-clipboard:copy="airdrop.wallet"
          v-clipboard:success="onCopySuccess">
          <v-list-tile-avatar>
            <v-icon>mdi-wallet</v-icon>
          </v-list-tile-avatar>
          <v-list-tile-content>
            <v-list-tile-title><small>{{ airdrop.wallet }}</small></v-list-tile-title>
            <v-list-tile-sub-title>{{ $t('m.Airdrop.wallet_address') }}</v-list-tile-sub-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile avatar 
          v-if="(isAdmin || isOwner) && airdrop.token.protocol == 'ERC20'">
          <v-list-tile-avatar>
            <v-icon>mdi-currency-eth</v-icon>
          </v-list-tile-avatar>
          <v-list-tile-content>
            <v-list-tile-title>{{ airdrop.gas_balance_gwei }}</v-list-tile-title>
            <v-list-tile-sub-title>{{ $t('m.Airdrop.gas_balance') }}</v-list-tile-sub-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-chip label small>Gwei</v-chip>
          </v-list-tile-action>
        </v-list-tile>
        <v-list-tile avatar v-if="airdrop.token.protocol == 'ERC20'">
          <v-list-tile-avatar>
            <v-icon>mdi-coins</v-icon>
          </v-list-tile-avatar>
          <v-list-tile-content>
            <v-list-tile-title>{{ airdrop.token.decimals ? (airdrop.token_balance / Math.pow(10, airdrop.token.decimals)) : airdrop.token_balance }}</v-list-tile-title>
            <v-list-tile-sub-title>{{ $t('m.Airdrop.token_balance') }}</v-list-tile-sub-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile avatar v-if="!editing.max_submissions && (isAdmin || isOwner)" @click="editing.max_submissions = !editing.max_submissions ">
          <v-list-tile-avatar>
            <v-icon>mdi-account-group</v-icon>
          </v-list-tile-avatar>
          <v-list-tile-content>
            <v-list-tile-title>{{ airdrop.max_submissions || 0 }}</v-list-tile-title>
            <v-list-tile-sub-title>{{ $t('m.Airdrop.max_submissions_label') }}</v-list-tile-sub-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-text-field v-else 
          v-model="editAirdropForm.max_submissions" 
          :label="this.$t('m.Airdrop.max_submissions_label')" 
          prepend-icon="mdi-account-group" 
          :loading="updating.max_submissions" 
          :disabled="updating.max_submissions" 
          :append-icon="updating.max_submissions ? 'mdi-loading' : (parseInt(editAirdropForm.max_submissions) != (airdrop.max_submissions || 0) ? 'mdi-check':'mdi-close')" 
          :append-icon-cb="() => (onUpdateAirdrop('max_submissions'))" 
          @change="onUpdateAirdrop('max_submissions')" 
          @blur="onUpdateAirdrop('max_submissions')"></v-text-field>
        <v-list-tile avatar v-if="!editing.reply_msg && (isAdmin || isOwner)" @click="editing.reply_msg = !editing.reply_msg ">
          <v-list-tile-avatar>
            <v-icon>mdi-message-reply</v-icon>
          </v-list-tile-avatar>
          <v-list-tile-content>
            <v-list-tile-title>{{ airdrop.reply_msg || '' }}</v-list-tile-title>
            <v-list-tile-sub-title>{{ $t('m.Airdrop.reply_msg_label') }}</v-list-tile-sub-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-text-field v-else 
          v-model="editAirdropForm.reply_msg" 
          :label="this.$t('m.Airdrop.reply_msg_label')" 
          prepend-icon="mdi-message-reply" 
          :loading="updating.reply_msg" 
          :disabled="updating.reply_msg" 
          :append-icon="updating.reply_msg ? 'mdi-loading' : (editAirdropForm.reply_msg != (airdrop.reply_msg || '') ? 'mdi-check':'mdi-close')" 
          :append-icon-cb="() => (onUpdateAirdrop('reply_msg'))" 
          @change="onUpdateAirdrop('reply_msg')" 
          @blur="onUpdateAirdrop('reply_msg')"></v-text-field>
        <v-list-tile v-if="(isAdmin || isOwner) && airdrop.token.protocol == 'ERC20'">
          <v-list-tile-content>
            <v-list-tile-title style="height:40px">
              <v-btn block color="warning" style="background:#ffc107;color:#fff" @click="showWithdrawDialog">{{ $t('m.Airdrop.withdraw') }}</v-btn>
            </v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <template v-if="(isAdmin || isOwner) && airdrop.token.protocol == 'ERC20'">
          <v-divider></v-divider>
          <v-subheader inset>{{ $t('m.Airdrop.transfer_setting') }}</v-subheader>
          <v-list-tile avatar v-if="!editing.gas_price" @click="editing.gas_price = !editing.gas_price ">
            <v-list-tile-avatar>
              <v-icon>mdi-currency-eth</v-icon>
            </v-list-tile-avatar>
            <v-list-tile-content>
              <v-list-tile-title>{{ airdrop.gas_price }}</v-list-tile-title>
              <v-list-tile-sub-title>{{ $t('m.Airdrop.gas_price') }}</v-list-tile-sub-title>
            </v-list-tile-content>
            <v-list-tile-action>
              <v-chip label small>Gwei</v-chip>
            </v-list-tile-action>
          </v-list-tile>
          <v-text-field v-else 
            v-model="editAirdropForm.gas_price" 
            :label="this.$t('m.Airdrop.gas_price_label')" 
            prepend-icon="mdi-currency-eth" 
            :hint="this.$t('m.Airdrop.suggest_gas_price_hint', {price: suggest_gas_price})" 
            :loading="updating.gas_price" 
            :disabled="updating.gas_price" 
            suffix="Gwei" 
            :append-icon="updating.gas_price ? 'mdi-loading' : (parseInt(editAirdropForm.gas_price) != airdrop.gas_price ? 'mdi-check':'mdi-close')" 
            :append-icon-cb="() => (onUpdateAirdrop('gas_price'))" 
            @change="onUpdateAirdrop('gas_price')" 
            @blur="onUpdateAirdrop('gas_price')"></v-text-field>
          <v-list-tile avatar v-if="!editing.drop_date" @click="editing.drop_date = !editing.drop_date">
            <v-list-tile-avatar>
              <v-icon>mdi-calendar-today</v-icon>
            </v-list-tile-avatar>
            <v-list-tile-content>
              <v-list-tile-title>{{ dateFormat(airdrop.drop_date) }}</v-list-tile-title>
              <v-list-tile-sub-title>{{ $t('m.Airdrop.drop_date_sub_label') }}</v-list-tile-sub-title>
            </v-list-tile-content>
          </v-list-tile>
          <v-menu v-else
            ref="drop_date_menu"
            :close-on-content-click="false"
            v-model="drop_date_menu"
            lazy
            transition="scale-transition"
            offset-y
            full-width
            :nudge-right="40"
            min-width="290px"
            :return-value.sync="editAirdropForm.drop_date"
          >
            <v-text-field slot="activator" v-model="dropDateFormatted" :label="this.$t('m.Airdrop.drop_date_label')" prepend-icon="mdi-calendar-today" :rules="dropDateRules" suffix="UTC" readonly></v-text-field>
            <v-date-picker v-model="editAirdropForm.drop_date" @input="saveDropDate" :min="today" no-title scrollable></v-date-picker>
          </v-menu>
        </template>
      </v-list>
      <v-divider></v-divider>
      <airdrop-stats ref="statsView" :airdrop-id="airdrop.id" v-if="airdrop && airdrop.id == airdropId && (isOwner || isAdmin)"></airdrop-stats>
    </loadmore>
  </v-container>
</template>

<script>
  import Loadmore from './Loadmore.vue'
  import AirdropStats from './AirdropStats'
  import airdropAPI from '../../api/airdrop'
  import gasAPI from '../../api/gas'
  import promotionAPI from '../../api/promotion'
  import * as types from '../../store/mutation-types'
  import moment from 'moment'
  import { bus } from '../../bus'

  export default {
    components: {
      'loadmore': Loadmore,
      'airdrop-stats': AirdropStats
    },
    data() {
      return {
        creatingPromotion: false,
        withdrawing: false,
        airdropId: 0,
        newPromotionDialog: false,
        promotionResponseDialog: false,
        newWithdrawDialog: false,
        drop_date_menu: false,
        promotionResponse: null,
        editing: {
          gas_price: false,
          drop_date: false,
          give_out: false,
          max_submissions: false,
          reply_msg: false
        },
        updating: {
          gas_price: false,
          drop_date: false,
          give_out: false,
          max_submissions: false,
          reply_msg: false
        },
        editAirdropForm: {
          gas_price: 0,
          drop_date: '',
          give_out: 0,
          status: 0,
          max_submissions: 0,
          reply_msg: ''
        },
        newPromotionForm: {
          channel_id: 0,
          adzone_id: 0
        },
        withdrawForm: {
          wallet: '',
          token_amount: 0,
          eth: 0,
          gas_price: 0,
          passwd: '',
          valid: true
        },
        suggest_gas_price: 50,
        editingAdzone: false,
        newAdzoneName: '',
        addingNewAdzone: false,
        withdrawTX: ''
      }
    },
    computed: {
      airdrop() {
        return this.$store.getters.getAirdropById(this.airdropId)
      },
      user() {
        return this.$store.getters['userInfo']
      },
      token() {
        return this.$store.getters['token']
      },
      statusString() {
        return this.airdrop.status ? this.$t('m.Airdrop.airdrop.status.start') : this.$t('m.Airdrop.airdrop.status.stop')
      },
      isOwner() {
        return this.airdrop && this.airdrop.user.id === this.user.id
      },
      isAdmin() {
        return this.$store.getters['isAdmin']
      },
      channels() {
        return this.$store.getters['channels']
      },
      adzones() {
        return this.$store.getters.getAdzonesByChannelId(this.newPromotionForm.channel_id)
      },
      passwordRules() {
        return [
          v => !!v || this.$t('m.Airdrop.error.password_required')
        ]
      },
      gasPriceRules() {
        return [
          v => parseInt(v) >= 1 || this.$t('m.Airdrop.error.min_gas_price'),
          v => parseInt(v) <= 500 || this.$t('m.Airdrop.error.max_gas_price')
        ]
      },
      walletRules() {
        return [
          v => !!v || this.$t('m.Airdrop.error.wallet_required'),
          v => /^0x[a-fA-F0-9]{40}$/.test(v) || this.$t('m.Airdrop.error.wallet_invalid')
        ]
      },
      dropDateRules() {
        return [
          v => !!v || this.$t('m.Airdrop.error.drop_date_required')
        ]
      },
      dropDateFormatted () {
        return this.dateFormat(this.editAirdropForm.drop_date)
      },
      today() {
        return moment().format('YYYY-MM-DD')
      }
    },
    methods: {
      dateFormat(d) {
        return moment(d).format('YYYY-MM-DD')
      },
      onCopySuccess(e) {
        this.showSnackbar(this.$t('copied', { txt: e.text }))
      },
      topRefresh(id) {
        this.getAirdrop(() => { 
          this.$refs.loadmore.onTopLoaded(id) 
          this.$refs.statsView.getStats()
        })
      },
      getChannels() {
        this.$store.dispatch(types.CHANNEL_LIST_REQUEST, this.token).then(res => {}, err => {
          if (err.code === 401) {
            this.$router.push({
              name: 'login'
            })
            return
          }
          this.showErrorDialog({ title: this.$t('m.Airdrop.failed_title'), message: err.message })
        })
      },
      getAdzones(ev) {
        this.newPromotionForm.adzone_id = 0
        let channelId = this.newPromotionForm.channel_id
        let callback = null
        if (typeof (ev) === 'function') {
          callback = ev
        } else if (ev !== undefined) {
          channelId = ev
        }
        const payload = { token: this.token, channel_id: channelId }
        this.$store.dispatch(types.AIRDROP_ADZONE_LIST_REQUEST, payload).then(res => {
          if (this.adzones.length > 0) {
            this.newPromotionForm.adzone_id = this.adzones[0].id
          }
          if (callback) {
            callback()
          }
        }, err => {
          if (err.code === 401) {
            this.$router.push({
              name: 'login'
            })
            return
          }
          this.showErrorDialog({ title: this.$t('m.Airdrop.error.get_adzones_failed'), message: err.message })
        })
      },
      getSuggestGasPrice() {
        gasAPI.suggestPrice().then((response) => {
          if (response.price) {
            this.suggest_gas_price = Math.ceil(response.price / Math.pow(10, 9))
          }
        })
      },
      syncEditingAirdropData() {
        this.editAirdropForm.gas_price = this.airdrop.gas_price
        this.editAirdropForm.drop_date = this.airdrop.drop_date
        this.editAirdropForm.give_out = this.airdrop.give_out
        this.editAirdropForm.status = this.airdrop.status
        this.editAirdropForm.max_submissions = this.airdrop.max_submissions || 0
        this.editAirdropForm.reply_msg = this.airdrop.reply_msg || ''
      },
      getAirdrop(cb) {
        this.$store.dispatch(types.AIRDROP_GET_REQUEST, { token: this.token, id: this.airdropId }).then(res => {
          this.toggleLoading(false)
          this.syncEditingAirdropData()
          if (cb) {
            cb()
          }
        }, err => {
          this.toggleLoading(false)
          if (err.code === 401) {
            this.$router.push({
              name: 'login'
            })
            return
          }
          this.showErrorDialog({ title: this.$t('m.Airdrop.failed_title'), message: err.message })
          if (cb) {
            cb()
          }
        })
      },
      onAddNewAdzone() {
        if (this.addingNewAdzone) {
          return
        }
        if (this.newAdzoneName === '') {
          this.editingAdzone = false
          this.addingNewAdzone = false
          return
        }
        this.addingNewAdzone = true
        const payload = { token: this.token, name: this.newAdzoneName, channel_id: this.newPromotionForm.channel_id }
        this.$store.dispatch(types.ADZONE_ADD_REQUEST, payload).then(res => {
          this.editingAdzone = false
          this.addingNewAdzone = false
          const name = this.newAdzoneName
          this.newAdzoneName = ''
          const self = this
          this.getAdzones(() => {
            for (const ad of self.adzones) {
              if (ad.name === name) {
                self.newPromotionForm.adzone_id = ad.id
              }
            }
          })
        }, err => {
          console.log(err)
          this.editingAdzone = false
          this.addingNewAdzone = false
          this.newAdzoneName = ''
        })
      },
      onUpdateStatus() {
        this.editAirdropForm.status = this.editAirdropForm.status ? 0 : 1
        this.onUpdateAirdrop('status')
      },
      onEditGiveOut() {
        if (!this.isAdmin && !this.isOwner) {
          return
        }
        this.editing.give_out = !this.editing.give_out
      },
      saveDropDate (date) {
        this.$refs.drop_date_menu.save(date)
        if (!this.isAdmin && !this.isOwner) {
          return
        }
        this.onUpdateAirdrop('drop_date')
      },
      onUpdateAirdrop(field) {
        if (this.updating[field]) {
          return
        }
        let fieldValue = parseInt(this.editAirdropForm[field])
        if (field === 'drop_date') {
          fieldValue = moment(this.editAirdropForm[field]).valueOf()
        } else if (field === 'reply_msg') {
          fieldValue = this.editAirdropForm[field]
        }
        let airdropValue = this.airdrop[field]
        if (fieldValue === airdropValue) {
          this.updating[field] = false
          this.editing[field] = false
          return
        }
        let payload = {
          id: this.airdrop.id,
          gas_price: 0,
          drop_date: 0,
          give_out: 0,
          max_submissions: this.editAirdropForm.max_submissions,
          reply_msg: this.editAirdropForm.reply_msg,
          status: parseInt(this.editAirdropForm.status)
        }
        if (field !== 'max_submissions' && field !== 'reply_msg' && field !== 'status') {
          payload[field] = fieldValue
        }

        if (field === 'gas_price') {
          if (payload.gas_price < 3) {
            this.showErrorDialog({ title: this.$t('m.Airdrop.error.update_airdrop_failed'), message: this.$t('m.Airdrop.error.min_gas_price') })
            return
          } else if (payload.gas_price > 500) {
            this.showErrorDialog({ title: this.$t('m.Airdrop.error.update_airdrop_failed'), message: this.$t('m.Airdrop.error.max_gas_price') })
            return
          }
        } else if (field === 'give_out' && payload.give_out <= 0) {
          this.showErrorDialog({ title: this.$t('m.Airdrop.error.update_airdrop_failed'), message: this.$t('m.Airdrop.error.number_required') })
          return
        }

        this.updating[field] = true
        airdropAPI.update(this.token, payload).then((response) => {
          this.updating[field] = false
          this.editing[field] = false
          if (response.code) {
            this.showErrorDialog({ title: this.$t('m.Airdrop.error.update_airdrop_failed'), message: response.message })
          } else {
            this.getAirdrop()
          }
        })
      },
      showWithdrawDialog() {
        this.withdrawForm = {
          wallet: '',
          token_amount: this.airdrop.token.decimals ? this.airdrop.token_balance / Math.pow(10, this.airdrop.token.decimals) : this.airdrop.token_balance,
          eth: (this.airdrop.gas_balance_gwei / Math.pow(10, 9)).toFixed(2),
          gas_price: this.suggest_gas_price || 0
        }
        this.newWithdrawDialog = true
      },
      onWithdraw() {
        if (!this.$refs.withdrawForm.validate()) {
          return false
        }
        this.withdrawing = true
        const payload = {
          airdrop_id: this.airdrop.id,
          wallet: this.withdrawForm.wallet,
          token_amount: parseFloat(this.withdrawForm.token_amount),
          eth: parseFloat(this.withdrawForm.eth),
          gas_price: parseInt(this.withdrawForm.gas_price),
          passwd: this.withdrawForm.passwd
        }
        if (payload.token_amount > 0 && payload.eth > 0) {
          this.showErrorDialog({ title: this.$t('m.Airdrop.error.withdraw_failed'), message: this.$t('m.Airdrop.error.withdraw_seperatly') })
          return
        }
        airdropAPI.withdraw(this.token, payload).then((response) => {
          this.withdrawing = false
          this.newWithdrawDialog = false
          if (response.code) {
            this.showErrorDialog({ title: this.$t('m.Airdrop.error.withdraw_failed'), message: response.message })
          } else {
            this.withdrawTX = response.message
            this.withdrawTXDialog = true
          }
        })
      },
      onCreatePromotion() {
        const channelId = this.newPromotionForm.channel_id
        if (!channelId) {
          this.showSnackbar(this.$t('m.Airdrop.error.need_channel'))
          return
        }
        const adzoneId = this.newPromotionForm.adzone_id
        if (!adzoneId) {
          this.showSnackbar(this.$t('m.Airdrop.error.need_adzone'))
          return
        }
        const payload = {
          channel_id: channelId,
          adzone_id: adzoneId,
          airdrop_id: this.airdrop.id
        }
        this.newPromotionDialog = false
        this.creatingPromotion = true
        promotionAPI.add(this.token, payload).then((response) => {
          this.creatingPromotion = false
          if (response.code) {
            this.showErrorDialog({ title: this.$t('m.Airdrop.error.create_promotion_failed'), message: response.message })
          } else {
            this.promotionResponse = response
            this.promotionResponseDialog = true
          }
        })
      },
      toggleLoading(v) {
        let state = types.HIDE_LOADING
        if (v) {
          state = types.SHOW_LOADING
        }
        this.$store.dispatch(state)
      },
      showErrorDialog(err) {
        this.$store.dispatch(types.SHOW_ERROR_DIALOG, err)
      },
      showSnackbar(msg) {
        this.$store.dispatch(types.SHOW_SNACKBAR, {message: msg})
      }
    },
    created() {
      this.airdropId = parseInt(this.$route.params.id)
      this.getSuggestGasPrice()
    },
    mounted() {
      if (!this.airdrop || this.airdrop.id !== this.airdropId) {
        this.toggleLoading(true)
        this.getAirdrop()
      } else {
        this.syncEditingAirdropData()
      }
      if (!this.channels || this.channels.length === 0) {
        this.getChannels()
      }
      bus.$emit('update_toolbar_items', null)
      bus.$emit('update_toolbar_icons', null)
    }
  }

</script>