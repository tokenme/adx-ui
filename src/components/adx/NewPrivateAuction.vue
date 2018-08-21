<template>
  <div>
    <Card v-if="adzone && adzone.media" :bordered="false" :dis-hover="true" :shadow="false">
      <h4 slot="title">
        {{ adzone.media.title }}
      </h4>
      <a slot="extra" :href="adzone.media.domain" target="_blank">
        <Icon type="link"></Icon>
        {{ adzone.media.domain }}
      </a>
      <p>{{ adzone.desc }}</p>
      <Row type="flex" justify="space-between">
        <Col>{{$t('m.newPrivate.adZoneId')}} {{ adzone.id }}</Col>
        <Col>{{$t('m.newPrivate.size')}} {{ adzone.size.width }}x{{ adzone.size.height }}</Col>
        <Col>{{$t('m.newPrivate.rolling')}} {{ adzone.rolling }}</Col>
        <Col>{{$t('m.newPrivate.suggest')}} {{ adzone.suggest_cpt }} {{$t('m.newPrivate.ether')}}</Col>
      </Row>
    </Card>
    <Card :bordered="false" :dis-hover="true" :shadow="false">
      <h3 slot="title">{{$t('m.newPrivate.adgroup')}}</h3>
      <Form ref="addForm" :model="addForm" :rules="addRule" :label-width="160">
        <FormItem :label="this.$t('m.newPrivate.title')" prop="title">
          <Input type="text" v-model="addForm.title" :placeholder="this.$t('m.newPrivate.adgroupTitle')"></Input>
        </FormItem>
        <FormItem :label="this.$t('m.newPrivate.auctionPrice')" prop="price" :required="true" style="width:200px">
          <InputNumber :max="1000" :min="minPrice" :step="0.0001" v-model="addForm.price"></InputNumber>
        </FormItem>
        <FormItem :label="this.$t('m.newPrivate.dateRange')" props="dateRange">
          <DatePicker :options="dateRangeOptions" v-model="addForm.dateRange" type="daterange" split-panels :placeholder="this.$t('m.newPrivate.selectDate')" style="width: 200px"></DatePicker>
        </FormItem>
        <template v-for="(creative, index) in addForm.creatives">
          <img :src="creative.img.url" v-if="creative.img" :style="imgStyle">
          <FormItem :label="img" :key="index + 'img'" v-else>
            <Upload 
              action="/creative/upload" 
              :format="['jpg','jpeg','png']" 
              :max-size="2048"
              :headers = "{'Authorization': 'Bearer ' + token}"
              :on-format-error="handleFormatError"
              :on-exceeded-size="handleMaxSize"
              :on-success="handleSuccess">
              <Button type="ghost" icon="ios-cloud-upload-outline">{{uploadImg}}</Button>
            </Upload>
          </FormItem>
          <FormItem 
            :label="landing" 
            prop="creative.url" 
            :prop="'creatives.' + index + '.url'" 
            :rules="{type: 'url', message: invaildUrl, trigger: 'blur'}"
            :key="index + 'url'">
            <Input type="text" v-model="creative.url" :placeholder="creativeLanding"></Input>
          </FormItem>
        </template>
        <FormItem>
          <Row>
            <Col span="12">
              <Button type="dashed" :disabled="!allowAddCreative" long @click="onAddCreative" icon="plus-round">{{$t('m.newPrivate.addCreative')}}</Button>
            </Col>
          </Row>
        </FormItem>
      </Form>
    </Card>
  </div>
</template>

<script>
  import privateAuctionAPI from '../../api/private-auction'
  import moment from 'moment'
  export default {
    data() {
      return {
        img: this.$t('m.newPrivate.img'),
        uploadImg: this.$t('m.newPrivate.uploadImg'),
        landing: this.$t('m.newPrivate.landing'),
        invaildUrl: this.$t('m.newPrivate.invaildUrl'),
        creativeLanding: this.$t('m.newPrivate.creativeLanding'),
        addForm: {
          title: '',
          creatives: [],
          price: 1,
          dateRange: []
        },
        addRule: {
          title: [
            { required: true, message: this.$t('m.newPrivate.inputAdgroupName'), trigger: 'blur' },
            { type: 'string', max: 64, message: this.$t('m.newPrivate.less64'), trigger: 'blur' }
          ],
          creatives: [
            { required: true, message: this.$t('m.newPrivate.uploadCreative'), trigger: 'blur' }
          ],
          dateRange: [
            { required: true, message: this.$t('m.newPrivate.selectDateRange'), trigger: 'blur' }
          ]
        }
      }
    },
    props: {
      adzone: null
    },
    computed: {
      token() {
        return this.$store.getters['token']
      },
      allowAddCreative() {
        const creatives = this.addForm.creatives
        if (!creatives) {
          return true
        }
        const len = creatives.length
        if (len === 0) {
          return true
        }
        return creatives[len - 1].img
      },
      minPrice() {
        return this.adzone ? this.adzone.min_cpt : 1
      },
      imgStyle() {
        if (this.adzone.size.width >= this.adzone.size.height) {
          return { marginLeft: '160px', width: '200px', height: Math.floor(200 * this.adzone.size.height / this.adzone.size.width) + 'px' }
        }
        return { marginLeft: '160px', width: Math.floor(100 * this.adzone.size.width / this.adzone.size.height) + 'px', height: '100px' }
      },
      dateRangeOptions() {
        const self = this
        return {
          disabledDate (date) {
            if (!date) {
              return false
            }
            if (moment(date).isBefore(moment()) || moment(date).isAfter(moment().add(2, 'months'))) {
              return true
            }
            if (self.adzone && self.adzone.unavailable_days) {
              for (const day of self.adzone.unavailable_days) {
                if (moment(date).format('YYYY-MM-DD') === moment(day).format('YYYY-MM-DD')) {
                  return true
                }
              }
            }
            return false
          }
        }
      }
    },
    watch: {
      adzone(curVal, oldVal) {
        this.addForm.price = curVal ? curVal.suggest_cpt : 1
      }
    },
    methods: {
      reset() {
        this.addForm = {
          title: '',
          creatives: [],
          price: this.adzone ? this.adzone.suggest_cpt : 1,
          dateRange: []
        }
      },
      handleSuccess (res, file) {
        this.addForm.creatives[this.addForm.creatives.length - 1].img = file
        file.url = res.url
        file.name = res.name
      },
      handleFormatError (file) {
        this.$Notice.warning({
          title: this.$t('m.newPrivate.fromatIncorrect'),
          desc: this.$t('m.newPrivate.fileFormat') + file.name + this.$t('m.newPrivate.isINcorrect')
        });
      },
      handleMaxSize (file) {
        this.$Notice.warning({
          title: this.$t('m.newPrivate.exceeding'),
          desc: this.$t('m.newPrivate.file') + file.name + this.$t('m.newPrivate.tooLarge')
        });
      },
      onAddCreative() {
        this.addForm.creatives.push({
          img: null,
          url: ''
        })
      },
      submit(resolve, reject) {
        this.$refs.addForm.validate((valid) => {
          if (valid) {
            let creatives = []
            for (const c of this.addForm.creatives) {
              creatives.push({
                img: c.img.name,
                url: c.url
              })
            }
            if (creatives.length === 0) {
              reject(new Error(this.$t('m.newPrivate.uploadCreative')))
              return
            }
            const payload = {
              media_id: this.adzone.media.id,
              adzone_id: this.adzone.id,
              title: this.addForm.title,
              price: this.addForm.price,
              start_time: moment(this.addForm.dateRange[0]).format('YYYY-MM-DD'),
              end_time: moment(this.addForm.dateRange[1]).format('YYYY-MM-DD'),
              creatives: creatives
            }
            privateAuctionAPI.add(this.token, payload).then(res => {
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