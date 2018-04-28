<template>
  <Form ref="addAdzoneForm" :model="addAdzoneForm" :rules="addRule" :label-width="200">
    <FormItem label="Size" prop="sizeId" :required="true" >
      <Select v-model="addAdzoneForm.sizeId" style="width:200px">
        <Option v-for="size in sizes" :value="size.id" :key="size.id">{{ size.width }}x{{ size.height }}</Option>
      </Select>
    </FormItem>
    <FormItem label="Minimum Price (Ether/Day)" prop="minCpt" :required="true" style="width:200px">
      <InputNumber :max="1000" :min="0.0001" :step="0.0001" v-model="addAdzoneForm.minCpt"></InputNumber>
    </FormItem>
    <FormItem label="Maximum Rolling" prop="rolling" :required="true">
      <InputNumber :max="10" :min="1" :step="1" v-model="addAdzoneForm.rolling"></InputNumber>
    </FormItem>
    <FormItem label="Url" prop="url">
      <Input type="text" v-model="addAdzoneForm.url" placeholder="adzone url"></Input>
    </FormItem>
    <FormItem label="Desc" prop="desc">
      <Input v-model="addAdzoneForm.desc" type="textarea" :autosize="{minRows: 2,maxRows: 5}" placeholder="Adzone description"></Input>
    </FormItem>
    <img :src="addAdzoneForm.placeholder.img_url" v-if="addAdzoneForm.placeholder && addAdzoneForm.placeholder.img_url" :style="imgStyle">
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
      <Input type="text" v-model="addAdzoneForm.placeholder.url" placeholder="placeholder landing page"></Input>
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
          placeholder: {
            url: '',
            img: '',
            img_url: ''
          }
        },
        addRule: {
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
              placeholder_url: this.addAdzoneForm.placeholder.url,
              placeholder_img: this.addAdzoneForm.placeholder.img
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