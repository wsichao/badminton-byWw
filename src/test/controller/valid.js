module.exports = {
  __rule: function (valid) {
    return valid.object({
      name: valid.string().trim().empty('').required()
    });
  },
  async getAction() {
    return this.success({
      name: 1
    });
  }
}