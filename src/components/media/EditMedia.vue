<template>
  <Form ref="editMediaForm" :model="media" :rules="editRule" :label-width="80" v-if="media">
    <FormItem :label="this.$t('m.editMed.title')" prop="title">
      <Input type="text" v-model="media.title" :placeholder="this.$t('m.editMed.name')"></Input>
    </FormItem>
    <!-- <FormItem :label="this.$t('m.editMed.desc')" prop="desc">
      <Input v-model="media.desc" type="textarea" :autosize="{minRows: 2,maxRows: 5}" :placeholder="this.$t('m.editMed.mediaDesc')"></Input>
    </FormItem> -->
    <img :src="media.imgurl ? media.imgurl : mediaFrom.placeholder.img_url" v-if="media.imgurl ||mediaFrom.placeholder && mediaFrom.placeholder.img_url" style="width:200px;height:200px;margin-left:160px">
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
      return {
        mediaFrom: {
          placeholder: {
            url: '',
            img: '',
            img_url: ''
          }
        },
        editRule: {
          title: [
            { required: true, message: this.$t('m.editMed.inputMedia'), trigger: 'blur' },
            { type: 'string', max: 64, message: this.$t('m.editMed.less64'), trigger: 'blur' }
          ],
          desc: [
            { required: true, message: this.$t('m.editMed.enterWeb'), trigger: 'blur' },
            { type: 'string', min: 20, message: this.$t('m.editMed.less20'), trigger: 'blur' }
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
        this.mediaFrom.placeholder.img = res.name
        this.mediaFrom.placeholder.img_url = res.url
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
        if (!this.media) {
          reject(new Error(this.$t('m.editMed.miss')))
          return
        }
        this.$refs.editMediaForm.validate((valid) => {
          if (valid) {
            const payload = {
              id: this.media.id,
              title: this.media.title,
              // desc: this.media.desc,
              placeholder_img: this.mediaFrom.placeholder.img,
              online_status: this.media.online_status
            }
            mediaAPI.update(this.token, payload).then(res => {
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