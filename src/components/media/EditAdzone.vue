<template>
  <Form ref="editAdzoneForm" :model="editForm" :rules="editRule" :label-width="200" v-if="editForm">
    <FormItem :label="this.$t('m.editAd.mini')" prop="minCpt" :required="true" style="width:200px">
      <InputNumber :max="10" :min="0.0001" :step="0.0001" v-model="editForm.minCpt"></InputNumber>
    </FormItem>
    <FormItem :label="this.$t('m.editAd.max')" prop="rolling" :required="true">
      <InputNumber :max="10" :min="1" :step="1" v-model="editForm.rolling"></InputNumber>
    </FormItem>
    <FormItem :label="this.$t('m.editAd.url')" prop="url">
      <Input type="text" v-model="editForm.url" placeholder="adzone url"></Input>
    </FormItem>
    <FormItem :label="this.$t('m.editAd.desc')" prop="desc">
      <Input v-model="editForm.desc" type="textarea" :autosize="{minRows: 2,maxRows: 5}" :placeholder="this.$t('m.editAd.adDesc')"></Input>
    </FormItem>
    <img :src="editForm.placeholder.img_url" v-if="editForm.placeholder && editForm.placeholder.img_url" :style="imgStyle">
    <FormItem :label="this.$t('m.editAd.placeImg')">
      <Upload 
        ref="uploadModel"
        action="/creative/upload" 
        :format="['jpg','jpeg','png']" 
        :max-size="2048"
        :headers = "{'Authorization': 'Bearer ' + token}"
        :on-format-error="handleFormatError"
        :on-exceeded-size="handleMaxSize"
        :on-success="handleSuccess">
        <Button type="ghost" icon="ios-cloud-upload-outline">{{$t('m.editAd.uploadImg')}}</Button>
      </Upload>
    </FormItem>
    <FormItem 
      :label="this.$t('m.editAd.landing')" 
      prop="placeholder.url" 
      :rules="{type: 'url', message: this.$t('m.editAd.invalidUrl'), trigger: 'blur'}">
      <Input type="text" v-model="editForm.placeholder.url" :placeholder="this.$t('m.editAd.landing')"></Input>
    </FormItem>
    <FormItem :label="this.$t('m.addAdzone.po')" prop="location">
      <Input v-model="editForm.location" type="text"  :placeholder="this.$t('m.addAdzone.pc')"></Input>
    </FormItem>
    <FormItem :label="this.$t('m.addAdzone.fl')" prop="traffic">
      <Input v-model="editForm.traffic" type="text" :placeholder="this.$t('m.addAdzone.adv')"></Input>
    </FormItem>
    <FormItem :label="this.$t('m.addAdzone.ae')" prop="advantage">
      <Input v-model="editForm.advantage" type="textarea" :placeholder="this.$t('m.addAdzone.int')"></Input>
    </FormItem>
  </Form>
</template>

<script>
  import adzoneAPI from '../../api/adzone'
  export default {
    data() {
      return {
        editForm: {
          minCpt: 1,
          rolling: 1,
          url: '',
          desc: '',
          advantage: '',
          location: '',
          traffic: '',
          size: {
            width: 0,
            height: 0
          },
          placeholder: {
            url: '',
            img: '',
            img_url: ''
          },
          onlineStatus: 0
        },
        editRule: {
          url: [
            { required: true, message: this.$t('m.editAd.inputUrl'), trigger: 'blur' },
            { type: 'url', message: this.$t('m.editAd.invalidUrl'), trigger: 'blur' }
          ],
          desc: [
            { required: true, message: this.$t('m.editAd.enterAdzone'), trigger: 'blur' }
          ]
        }
      }
    },
    computed: {
      token() {
        return this.$store.getters['token']
      },
      imgStyle() {
        if (this.editForm.size.width >= this.editForm.size.height) {
          return { marginLeft: '160px', width: '200px', height: Math.floor(200 * this.editForm.size.height / this.editForm.size.width) + 'px' }
        }
        return { marginLeft: '160px', width: Math.floor(100 * this.editForm.size.width / this.editForm.size.height) + 'px', height: '100px' }
      }
    },
    methods: {
      reset(adzone) {
        this.editForm = {
          id: adzone.id,
          minCpt: adzone.min_cpt,
          rolling: adzone.rolling,
          url: adzone.url,
          desc: adzone.intro,
          advantage: adzone.advantage,
          location: adzone.location,
          traffic: adzone.traffic,
          size: adzone.size,
          placeholder: {
            url: adzone.placeholder ? adzone.placeholder.url : '',
            img: adzone.placeholder ? adzone.placeholder.img : '',
            img_url: adzone.placeholder ? adzone.placeholder.img_url : ''
          },
          onlineStatus: adzone.online_status
        }
      },
      handleSuccess (res, file) {
        if (res.code && res.code === 400) {
          this.$Notice.warning({
            title: this.$t('m.fail'),
            desc: this.$t('m.tim')
          });
          return
        }
        this.editForm.placeholder.img = res.name
        this.editForm.placeholder.img_url = res.url
        this.$refs.uploadModel.clearFiles()
        file.url = res.url
        file.name = res.name
        this.$Notice.warning({
          title: '成功',
          desc: '上传图片成功'
        });
      },
      handleFormatError (file) {
        this.$Notice.warning({
          title: this.$t('m.editAd.fromatIncorrect'),
          desc: this.$t('m.editAd.fileFormat') + file.name + this.$t('m.editAd.isINcorrect')
        });
      },
      handleMaxSize (file) {
        this.$Notice.warning({
          title: this.$t('m.editAd.exceeding'),
          desc: this.$t('m.editAd.file') + file.name + this.$t('m.editAd.tooLarge')
        });
      },
      submit(resolve, reject) {
        this.$refs.editAdzoneForm.validate((valid) => {
          if (valid) {
            const payload = {
              id: this.editForm.id,
              url: this.editForm.url,
              min_cpt: this.editForm.minCpt,
              settlement: 2,
              rolling: this.editForm.rolling,
              desc: this.editForm.desc,
              placeholder_url: this.editForm.placeholder.url,
              placeholder_img: this.editForm.placeholder.img,
              online_status: this.editForm.onlineStatus,
              location: this.editForm.location,
              traffic: this.editForm.traffic,
              advantage: this.editForm.advantage
            }
            adzoneAPI.update(this.token, payload).then(res => {
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