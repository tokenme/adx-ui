<template>
  <Form ref="addAdzoneForm" :model="addAdzoneForm" :rules="addRule" :label-width="200">
    <FormItem :label="this.$t('m.addAdzone.size')" prop="sizeId" :required="true" >
      <Select v-model="addAdzoneForm.sizeId" style="width:200px">
        <Option v-for="size in sizes" :value="size.id" :key="size.id">{{ size.width }}x{{ size.height }}</Option>
      </Select>
    </FormItem>
    <FormItem :label="this.$t('m.addAdzone.mini')" prop="minCpt" :required="true" style="width:200px">
      <InputNumber :max="1000" :min="0.0001" :step="0.0001" v-model="addAdzoneForm.minCpt"></InputNumber>
    </FormItem>
    <FormItem :label="this.$t('m.addAdzone.max')" prop="rolling" :required="true">
      <InputNumber :max="10" :min="1" :step="1" v-model="addAdzoneForm.rolling"></InputNumber>
    </FormItem>
    <FormItem :label="this.$t('m.addAdzone.url')" prop="url">
      <Input type="text" v-model="addAdzoneForm.url" :placeholder="this.$t('m.addAdzone.adzoneUrl')"></Input>
    </FormItem>
    <FormItem :label="this.$t('m.addAdzone.desc')" prop="desc">
      <Input v-model="addAdzoneForm.desc" type="textarea" :autosize="{minRows: 2,maxRows: 5}" :placeholder="this.$t('m.addAdzone.adzoneDesc')"></Input>
    </FormItem>
    <img :src="addAdzoneForm.placeholder.img_url" v-if="addAdzoneForm.placeholder && addAdzoneForm.placeholder.img_url" :style="imgStyle">
    <FormItem :label="this.$t('m.addAdzone.placeImg')">
      <Upload 
        ref="uploadModel"
        action="/creative/upload" 
        :format="['jpg','jpeg','png']" 
        :max-size="2048"
        :headers = "{'Authorization': 'Bearer ' + token}"
        :on-format-error="handleFormatError"
        :on-exceeded-size="handleMaxSize"
        :on-success="handleSuccess">
        <Button type="ghost" icon="ios-cloud-upload-outline">{{$t('m.addAdzone.uploadImg')}}</Button>
      </Upload>
    </FormItem>
    <FormItem 
      :label="this.$t('m.addAdzone.landing')" 
      prop="placeholder.url" 
      :rules="{type: 'url', message: this.$t('m.addAdzone.invalidUrl'), trigger: 'blur'}">
      <Input type="text" v-model="addAdzoneForm.placeholder.url" :placeholder="this.$t('m.addAdzone.landing')"></Input>
    </FormItem>
    <FormItem :label="this.$t('m.addAdzone.po')" prop="location">
      <Input v-model="addAdzoneForm.location" type="text"  :placeholder="this.$t('m.addAdzone.pc')"></Input>
    </FormItem>
    <FormItem :label="this.$t('m.addAdzone.fl')" prop="traffic">
      <Input v-model="addAdzoneForm.traffic" type="text" :placeholder="this.$t('m.addAdzone.adv')"></Input>
    </FormItem>
    <FormItem :label="this.$t('m.addAdzone.ae')" prop="advantage">
      <Input v-model="addAdzoneForm.advantage" type="textarea" :placeholder="this.$t('m.addAdzone.int')"></Input>
    </FormItem>
  </Form>
</template>

<script>
  import * as types from '../../store/mutation-types'
  import adzoneAPI from '../../api/adzone'
  export default {
    data() {
      return {
        addAdzoneForm: {
          url: '',
          sizeId: 1,
          minCpt: 1,
          rolling: 1,
          desc: '',
          advantage: '',
          location: '',
          traffic: '',
          placeholder: {
            url: '',
            img: '',
            img_url: ''
          }
        },
        addRule: {
          url: [
            { required: true, message: this.$t('m.addAdzone.inputUrl'), trigger: 'blur' },
            { type: 'url', message: this.$t('m.addAdzone.invalidUrl'), trigger: 'blur' }
          ],
          desc: [
            { required: true, message: this.$t('m.addAdzone.enterAdzone'), trigger: 'blur' }
          ]
        }
      }
    },
    props: {
      media: null
    },
    computed: {
      token() {
        return this.$store.getters['token']
      },
      sizes() {
        return this.$store.getters['sizes']
      },
      size() {
        for (const size of this.sizes) {
          if (size.id === this.addAdzoneForm.sizeId) {
            return size
          }
        }
        return null
      },
      imgStyle() {
        if (!this.size) {
          return {marginLeft: '160px', width: '200px', height: '200px'}
        }
        if (this.size.width >= this.size.height) {
          return { marginLeft: '160px', width: '200px', height: Math.floor(200 * this.size.height / this.size.width) + 'px' }
        }
        return { marginLeft: '160px', width: Math.floor(100 * this.size.width / this.size.height) + 'px', height: '100px' }
      }
    },
    methods: {
      handleSuccess (res, file) {
        this.addAdzoneForm.placeholder.img = res.name
        this.addAdzoneForm.placeholder.img_url = res.url
        this.$refs.uploadModel.clearFiles()
        file.url = res.url
        file.name = res.name
      },
      handleFormatError (file) {
        this.$Notice.warning({
          title: this.$t('m.addAdzone.fromatIncorrect'),
          desc: this.$t('m.addAdzone.fileFormat') + file.name + this.$t('m.addAdzone.isINcorrect')
        });
      },
      handleMaxSize (file) {
        this.$Notice.warning({
          title: this.$t('m.addAdzone.exceeding'),
          desc: this.$t('m.addAdzone.file') + file.name + this.$t('m.addAdzone.tooLarge')
        });
      },
      submit(resolve, reject) {
        this.$refs.addAdzoneForm.validate((valid) => {
          if (valid) {
            const payload = {
              media_id: this.media.id,
              url: this.addAdzoneForm.url,
              size_id: this.addAdzoneForm.sizeId,
              min_cpt: this.addAdzoneForm.minCpt,
              settlement: 2,
              rolling: this.addAdzoneForm.rolling,
              desc: this.addAdzoneForm.desc,
              placeholder_url: this.addAdzoneForm.placeholder.url, //登录页面
              placeholder_img: this.addAdzoneForm.placeholder.img, //图片
              location: this.addAdzoneForm.location,
              traffic: this.addAdzoneForm.traffic,
              advantage: this.addAdzoneForm.advantage
            }
            adzoneAPI.add(this.token, payload).then(res => {
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
    },
    mounted() {
      if (this.media) {
        this.addAdzoneForm.url = this.media.domain
      }
      if (!this.sizes || this.sizes.length === 0) {
        this.$store.dispatch(types.ADZONE_SIZES_REQUEST)
      }
    }
  }
</script>