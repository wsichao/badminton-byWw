const weapp_service = Backend.service('mc_weapp', 'mc_weapp');

module.exports = {
  __rule: function (valid) {
    return valid.object({
      user_id: valid.string().required()
    });
  },
  async getAction() {
    const user_id = this.query.user_id;
    // TODO : V6.14.0
    const page = 'pages/recommend_goods/recommend_goods_list/recommend_goods_list';
    // const page = 'pages/index/index'
    let qrcode = await weapp_service.get_weapp_qr_code(user_id, page);
    return this.success({
      code: "200",
      msg: "",
      data: {
        qcode: qrcode.qr_code
      }
    });
  }
}