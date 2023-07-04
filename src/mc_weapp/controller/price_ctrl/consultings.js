const mcConsultingModel = Backend.model('mc_weapp', undefined, 'mc_consulting');

module.exports = {
  async getList(user_id) {
    return await mcConsultingModel.find({
      userId: user_id,
      isDeleted: false
    }).sort({
      createdAt: -1
    })
  },
  async getAction() {
    const user_id = this.req.identity.userId;
    let items = await this.getList(user_id);

    items = items.map(item => {
      return {
        id: item._id,
        name: item.name,
        detail: item.detail,
        time: item.createdAt
      }
    });

    return this.success({
      code: "200",
      msg: "",
      items
    })
  }
}