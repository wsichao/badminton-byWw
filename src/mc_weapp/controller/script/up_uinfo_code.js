/**
 * mc_user_info 修改 微信小程序二维码
 */
const weapp_service = Backend.service('mc_weapp', 'mc_weapp');
const mc_user_info = Backend.model("mc_weapp", undefined, "mc_user_info");

module.exports = {
  async getList() {
    return await mc_user_info.find({
      isDeleted: false
    }, "userId");
  },
  async update(id, qcode) {
    await mc_user_info.update({
      _id: id
    }, {
      qcode
    });
  },
  async run(item) {
    let qrcode = (await weapp_service.get_weapp_qr_code(item.userId)).qr_code;
    await this.update(item._id, qrcode);
  },
  async getAction() {
    const list = await this.getList();
    let items = [];
    for (let i = 0; i < list.length; i++) {
      const item = list[i];
      await this.run(item)
    }
    // Promise
    return this.success({
      items
    });
  }
}