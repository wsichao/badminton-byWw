const mcSceneGoodsInfoModel = Backend.model('mc_weapp', undefined, 'mc_scene_goods_info');

module.exports = {
  async getList() {
    return await mcSceneGoodsInfoModel.find({
      sortedByTime: null
    })
  },
  async update(id, value) {
    await mcSceneGoodsInfoModel.update({
      _id: id
    }, {
      sortedByTime: value
    });
  },
  async getAction() {
    const list = await this.getList();
    let ids = [];
    for (let i = 0; i < list.length; i++) {
      const element = list[i];
      const id = element._id;
      const value = element.updatedAt;
      await this.update(id, value);
      ids.push(id);
    }
    return this.success({
      ids
    })
  }
}