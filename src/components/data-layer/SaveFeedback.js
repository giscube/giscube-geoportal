const config = {
  position: 'top',
  group: false,
  actions: [
    {
      icon: 'close',
      color: 'white'
    }
  ],
  progress: true
}

export default class SaveFeedback {
  constructor (parent) {
    this.dismiss = () => {}
    this.parent = parent
  }

  handler (v, o) {
    const value = !!v
    const oldValue = !!o
    if (value !== oldValue) {
      this.dismiss()
      if (value) {
        this.dismiss = this.parent.$q.notify({
          ...config,
          type: 'info',
          message: this.parent.t('savingChanges'),
          timeout: 0
        })
      } else {
        this.dismiss = this.parent.$q.notify({
          ...config,
          type: 'positive',
          message: this.parent.t('changesSaved'),
          timeout: 2500
        })
      }
    }
  }
}
