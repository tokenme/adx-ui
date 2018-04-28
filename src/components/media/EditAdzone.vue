<template>
  <Form ref="editAdzoneForm" :model="editForm" :rules="editRule" :label-width="200" v-if="editForm">
    <FormItem label="Minimum Price (Ether/Day)" prop="minCpt" :required="true" style="width:200px">
      <InputNumber :max="10" :min="0.0001" :step="0.0001" v-model="editForm.minCpt"></InputNumber>
    </FormItem>
    <FormItem label="Maximum Rolling" prop="rolling" :required="true">
      <InputNumber :max="10" :min="1" :step="1" v-model="editForm.rolling"></InputNumber>
    </FormItem>
    <FormItem label="Url" prop="url">
      <Input type="text" v-model="editForm.url" placeholder="adzone url"></Input>
    </FormItem>
    <FormItem label="Desc" prop="desc">
      <Input v-model="editForm.desc" type="textarea" :autosize="{minRows: 2,maxRows: 5}" placeholder="Adzone description"></Input>
    </FormItem>
    <img :src="editForm.placeholder.img_url" v-if="editForm.placeholder && editForm.placeholder.img_url" :style="imgStyle">
    <FormItem label="Placeholder Image">
      <Upload 
        ref="uploadModel"
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
      label="Placeholder Landing Page" 
      prop="placeholder.url" 
      :rules="{type: 'url', message: 'invalid url', trigger: 'blur'}">
      <Input type="text" v-model="editForm.placeholder.url" placeholder="placeholder landing page"></Input>
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
            { required: true, message: 'Please input url', trigger: 'blur' },
            { type: 'url', message: 'invalid url', trigger: 'blur' }
          ],
          desc: [
            { required: true, message: 'Please enter the adzone introduction', trigger: 'blur' }
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
          desc: adzone.desc,
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
        this.editForm.placeholder.img = res.name
        this.editForm.placeholder.img_url = res.url
        this.$refs.uploadModel.clearFiles()
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
              online_status: this.editForm.onlineStatus
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