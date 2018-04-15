<template>
  <Form ref="editAdzoneForm" :model="adzone" :rules="editRule" :label-width="200" v-if="adzone">
    <FormItem label="Minimum Price (Ether/Day)" prop="min_cpt" :required="true" style="width:200px">
      <InputNumber :max="10" :min="1" :step="1" v-model="adzone.min_cpt"></InputNumber>
    </FormItem>
    <FormItem label="Maximum Rolling" prop="rolling" :required="true">
      <InputNumber :max="10" :min="1" :step="1" v-model="adzone.rolling"></InputNumber>
    </FormItem>
    <FormItem label="Url" prop="url">
      <Input type="text" v-model="adzone.url" placeholder="adzone url"></Input>
    </FormItem>
    <FormItem label="Desc" prop="desc">
      <Input v-model="adzone.desc" type="textarea" :autosize="{minRows: 2,maxRows: 5}" placeholder="Adzone description"></Input>
    </FormItem>
  </Form>
</template>

<script>
  import adzoneAPI from '../api/adzone'
  export default {
    data() {
      return {
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
    props: {
      adzone: null
    },
    computed: {
      token() {
        return this.$store.getters['token']
      }
    },
    methods: {
      submit(resolve, reject) {
        if (!this.adzone) {
          reject(new Error('missing adzone information'))
          return
        }
        this.$refs.editAdzoneForm.validate((valid) => {
          if (valid) {
            const payload = {
              id: this.adzone.id,
              url: this.adzone.url,
              min_cpt: this.adzone.min_cpt,
              settlement: 2,
              rolling: this.adzone.rolling,
              desc: this.adzone.desc
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