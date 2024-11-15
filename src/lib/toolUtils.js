import api from 'src/api'

export function getOrCall (v, tool, self) {
  if (v) {
    if (typeof v === 'function') {
      return v.call(self, tool)
    } else {
      return v
    }
  }
}

export function onToolClick (toolName, self) {
  const tool = self.$config.tools[toolName]
  if (tool && self.$config.registers) {
    api.geoportal.newToolRegister(
      self.$config.registers,
      self.$t(`tools.${toolName}.headerName`),
      self.$store.getters['auth/config'],
      self.$store.state.auth.username
    )
  }
  if (tool.to) {
    self.$emit('sidebar-visibility-changed', true)
    self.$router.push({ name: tool.to })
  }
  if (tool.action) {
    tool.action.call(self, tool)
  }
  if (tool.emit) {
    self.emit(getOrCall(tool.emmit, self))
  }
}
