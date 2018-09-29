<template>
  <Form ref="addMediaForm" :model="addMediaForm" :rules="addRule" :label-width="80">
    <FormItem :label="this.$t('m.addMedia.title')" prop="title">
      <Input type="text" v-model="addMediaForm.title" :placeholder="this.$t('m.addMedia.name')"></Input>
    </FormItem>
    <FormItem :label="this.$t('m.addMedia.url')" prop="domain">
      <Input type="text" v-model="addMediaForm.domain" :placeholder="this.$t('m.addMedia.website')">
        <Select v-model="addMediaForm.schema" slot="prepend" style="width: 80px">
            <Option value="http">http://</Option>
            <Option value="https">https://</Option>
        </Select>
      </Input>
    </FormItem>
    <!-- <FormItem :label="this.$t('m.addMedia.desc')" prop="desc">
      <Input v-model="addMediaForm.desc" type="textarea" :autosize="{minRows: 2,maxRows: 5}" :placeholder="this.$t('m.addMedia.mediaDesc')"></Input>
    </FormItem> -->
    <img :src="addMediaForm.placeholder.img_url" v-if="addMediaForm.placeholder && addMediaForm.placeholder.img_url" :style="imgStyle">
    <FormItem :label="this.$t('m.addMedia.meint')">
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
  </Form>
</template>

<script>
  import mediaAPI from '../../api/media'
  export default {
    data() {
      const validateDomain = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('Please input domain'))
        } else {
          const urlPattern = new RegExp('^(?!mailto:)(?:(?:http|https|ftp)://|//)(?:\\S+(?::\\S*)?@)?(?:(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[0-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))|localhost)(?::\\d{2,5})?(?:(/|\\?|#)[^\\s]*)?$', 'i')
          const validDomain = !!((this.addMediaForm.schema + '://' + value).match(urlPattern))
          if (!validDomain) {
            callback(new Error(this.$t('m.addMedia.invaildDomain')))
          } else {
            callback()
          }
        }
      }
      return {
        addMediaForm: {
          title: '',
          schema: 'http',
          domain: '',
          desc: '',
          placeholder: {
            url: '',
            img: '',
            img_url: ''
          }
        },
        addRule: {
          title: [
            { required: true, message: this.$t('m.addMedia.inputMedia'), trigger: 'blur' },
            { type: 'string', max: 64, message: this.$t('m.addMedia.less64'), trigger: 'blur' }
          ],
          domain: [
            { required: true, message: this.$t('m.addMedia.inputDomain'), trigger: 'blur' },
            { validator: validateDomain, trigger: 'blur' }
          ],
          desc: [
            { required: true, message: this.$t('m.addMedia.enterWeb'), trigger: 'blur' },
            { type: 'string', min: 20, message: this.$t('m.addMedia.less20'), trigger: 'blur' }
          ]
        }
      }
    },
    computed: {
      token() {
        return this.$store.getters['token']
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
        if (res.code && res.code === 400) {
          this.$Notice.warning({
            title: this.$t('m.fail'),
            desc: this.$t('m.tim')
          });
          return
        }
        this.addMediaForm.placeholder.img = res.name
        this.addMediaForm.placeholder.img_url = res.url
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
        this.$refs.addMediaForm.validate((valid) => {
          if (valid) {
            const payload = {
              title: this.addMediaForm.title,
              domain: this.addMediaForm.schema + '://' + this.addMediaForm.domain,
              // desc: this.addMediaForm.desc,
              placeholder_img: this.addMediaForm.placeholder.img
            }
            mediaAPI.add(this.token, payload).then(res => {
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