<template>
  <Form ref="editMediaForm" :model="media" :rules="editRule" :label-width="80" v-if="media">
    <FormItem label="Title" prop="title">
      <Input type="text" v-model="media.title" placeholder="The name of your website"></Input>
    </FormItem>
    <FormItem label="Desc" prop="desc">
      <Input v-model="media.desc" type="textarea" :autosize="{minRows: 2,maxRows: 5}" placeholder="Media description"></Input>
    </FormItem>
  </Form>
</template>

<script>
  import mediaAPI from '../api/media'
  export default {
    data() {
      return {
        editRule: {
          title: [
            { required: true, message: 'Please input media name', trigger: 'blur' },
            { type: 'string', max: 64, message: 'Title should be less than 64 characters', trigger: 'blur' }
          ],
          desc: [
            { required: true, message: 'Please enter the website introduction', trigger: 'blur' },
            { type: 'string', min: 20, message: 'Introduce no less than 20 words', trigger: 'blur' }
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
      }
    },
    methods: {
      submit(resolve, reject) {
        if (!this.media) {
          reject(new Error('missing media information'))
          return
        }
        this.$refs.editMediaForm.validate((valid) => {
          if (valid) {
            const payload = {
              id: this.media.id,
              title: this.media.title,
              desc: this.media.desc,
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