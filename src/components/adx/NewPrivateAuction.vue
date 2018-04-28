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
        <Col>AdzoneID: {{ adzone.id }}</Col>
        <Col>Size: {{ adzone.size.width }}x{{ adzone.size.height }}</Col>
        <Col>Rolling: {{ adzone.rolling }}</Col>
        <Col>Suggest Price: {{ adzone.suggest_cpt }} Ether/Day</Col>
      </Row>
    </Card>
    <Card :bordered="false" :dis-hover="true" :shadow="false">
      <h3 slot="title">Adgroup</h3>
      <Form ref="addForm" :model="addForm" :rules="addRule" :label-width="160">
        <FormItem label="Title" prop="title">
          <Input type="text" v-model="addForm.title" placeholder="adgroup title"></Input>
        </FormItem>
        <FormItem label="Auction Price (Ether/Day)" prop="price" :required="true" style="width:200px">
          <InputNumber :max="1000" :min="minPrice" :step="0.0001" v-model="addForm.price"></InputNumber>
        </FormItem>
        <FormItem label="DateRange" props="dateRange">
          <DatePicker :options="dateRangeOptions" v-model="addForm.dateRange" type="daterange" split-panels placeholder="Select date" style="width: 200px"></DatePicker>
        </FormItem>
        <template v-for="(creative, index) in addForm.creatives">
          <img :src="creative.img.url" v-if="creative.img" :style="imgStyle">
          <FormItem label="Image" :key="index + 'img'" v-else>
            <Upload 
              action="/creative/upload" 
              :format="['jpg','jpeg','png']" 
              :max-size="2048"
              :headers = "{'Authorization': 'Bearer ' + token}"
              :on-format-error="handleFormatError"
              :on-exceeded-size="handleMaxSize"
              :on-success="handleSuccess">
              <Button type="ghost" icon="ios-cloud-upload-outline">Upload Image</Button>
            </Upload>
          </FormItem>
          <FormItem 
            label="Landing Page" 
            prop="creative.url" 
            :prop="'creatives.' + index + '.url'" 
            :rules="{type: 'url', message: 'invalid url', trigger: 'blur'}"
            :key="index + 'url'">
            <Input type="text" v-model="creative.url" placeholder="creative landing_page"></Input>
          </FormItem>
        </template>
        <FormItem>
          <Row>
            <Col span="12">
              <Button type="dashed" :disabled="!allowAddCreative" long @click="onAddCreative" icon="plus-round">Add creative</Button>
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
        addForm: {
          title: '',
          creatives: [],
          price: 1,
          dateRange: []
        },
        addRule: {
          title: [
            { required: true, message: 'Please input adgroup name', trigger: 'blur' },
            { type: 'string', max: 64, message: 'Title should be less than 64 characters', trigger: 'blur' }
          ],
          creatives: [
            { required: true, message: 'Please upload creatives', trigger: 'blur' }
          ],
          dateRange: [
            { required: true, message: 'Please select dateRange', trigger: 'blur' }
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
          title: 'The file format is incorrect',
          desc: 'File format of ' + file.name + ' is incorrect, please select jpg or png.'
        });
      },
      handleMaxSize (file) {
        this.$Notice.warning({
          title: 'Exceeding file size limit',
          desc: 'File  ' + file.name + ' is too large, no more than 2M.'
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
              reject(new Error('please upload creatives'))
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