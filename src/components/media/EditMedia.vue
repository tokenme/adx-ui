<template>
  <Form ref="editMediaForm" :model="media" :rules="editRule" :label-width="80" v-if="media">
    <FormItem :label="this.$t('m.editMed.title')" prop="title">
      <Input type="text" v-model="media.title" :placeholder="this.$t('m.editMed.name')"></Input>
    </FormItem>
    <FormItem :label="this.$t('m.editMed.desc')" prop="desc">
      <Input v-model="media.desc" type="textarea" :autosize="{minRows: 2,maxRows: 5}" :placeholder="this.$t('m.editMed.mediaDesc')"></Input>
    </FormItem>
  </Form>
</template>

<script>
  import mediaAPI from '../../api/media'
  export default {
    data() {
      return {
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
      }
    },
    methods: {
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