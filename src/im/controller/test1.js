const group_service = Backend.service('im', 'group');


module.exports = {
  async getAction() {
    const result = await group_service.sendMsgByGroup('56778274439169', '哈哈哈哈哈');
    return this.success({ result });
  }
}