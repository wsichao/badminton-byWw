const sessionTokenService = Backend.service('common', 'session_token');
module.exports = {
  async postAction() {
    return this.success({
      name: 1
    })
  },
  async getAction() {
    const user_id = this.query.user_id;
    const session_token = await sessionTokenService.createToken(user_id,'2030Assistant');
    return this.success({
      session_token
    })
  }
}