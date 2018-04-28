<template>
  <Form ref="addMediaForm" :model="addMediaForm" :rules="addRule" :label-width="80">
    <FormItem label="Title" prop="title">
      <Input type="text" v-model="addMediaForm.title" placeholder="The name of your website"></Input>
    </FormItem>
    <FormItem label="Url" prop="domain">
      <Input type="text" v-model="addMediaForm.domain" placeholder="website domain">
        <Select v-model="addMediaForm.schema" slot="prepend" style="width: 80px">
            <Option value="http">http://</Option>
            <Option value="https">https://</Option>
        </Select>
      </Input>
    </FormItem>
    <FormItem label="Desc" prop="desc">
      <Input v-model="addMediaForm.desc" type="textarea" :autosize="{minRows: 2,maxRows: 5}" placeholder="Media description"></Input>
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
            callback(new Error('Invalid domain'))
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
          desc: ''
        },
        addRule: {
          title: [
            { required: true, message: 'Please input media name', trigger: 'blur' },
            { type: 'string', max: 64, message: 'Title should be less than 64 characters', trigger: 'blur' }
          ],
          domain: [
            { required: true, message: 'Please input domain', trigger: 'blur' },
            { validator: validateDomain, trigger: 'blur' }
          ],
          desc: [
            { required: true, message: 'Please enter the website introduction', trigger: 'blur' },
            { type: 'string', min: 20, message: 'Introduce no less than 20 words', trigger: 'blur' }
          ]
        }
      }
    },
    computed: {
      token() {
        return this.$store.getters['token']
      }
    },
    methods: {
      submit(resolve, reject) {
        this.$refs.addMediaForm.validate((valid) => {
          if (valid) {
            const payload = {
              title: this.addMediaForm.title,
              domain: this.addMediaForm.schema + '://' + this.addMediaForm.domain,
              desc: this.addMediaForm.desc
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