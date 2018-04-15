<template>
  <Form ref="addAdzoneForm" :model="addAdzoneForm" :rules="addRule" :label-width="200">
    <FormItem label="Size" prop="sizeId" :required="true" >
      <Select v-model="addAdzoneForm.sizeId" style="width:200px">
        <Option v-for="size in sizes" :value="size.id" :key="size.id">{{ size.width }}x{{ size.height }}</Option>
      </Select>
    </FormItem>
    <FormItem label="Minimum Price (Ether/Day)" prop="minCpt" :required="true" style="width:200px">
      <InputNumber :max="10" :min="1" :step="1" v-model="addAdzoneForm.minCpt"></InputNumber>
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
  </Form>
</template>

<script>
  import * as types from '../store/mutation-types'
  import adzoneAPI from '../api/adzone'
  export default {
    data() {
      return {
        addAdzoneForm: {
          url: '',
          sizeId: 1,
          minCpt: 1,
          rolling: 1,
          desc: ''
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
      }
    },
    methods: {
      submit(resolve, reject) {
        console.log(this.addAdzoneForm)
        this.$refs.addAdzoneForm.validate((valid) => {
          if (valid) {
            const payload = {
              media_id: this.media.id,
              url: this.addAdzoneForm.url,
              size_id: this.addAdzoneForm.sizeId,
              min_cpt: this.addAdzoneForm.minCpt,
              settlement: 2,
              rolling: this.addAdzoneForm.rolling,
              desc: this.addAdzoneForm.desc
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