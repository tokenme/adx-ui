<template>
  <Button :type="buttonType" :icon="buttonIcon" :size="buttonSize" @click="onClick">
    {{ buttonText }}
    <Badge :count="count" :overflow-count="overflowCount"></Badge>
  </Button>
</template>

<script>

export default {
  props: {
    count: Number,
    overflowCount: {
      type: Number,
      default: 99
    },
    buttonType: {
      type: String,
      default: null
    },
    buttonIcon: {
      type: String,
      default: null
    },
    buttonSize: {
      type: String,
      default: null
    },
    buttonText: String
  },
  methods: {
    onClick(ev) {
      this.$emit('click', ev)
    }
  }
}

</script>