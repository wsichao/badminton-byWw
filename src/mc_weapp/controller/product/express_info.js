const mcSceneSuborderModel = Backend.model('mc_weapp', undefined, 'mc_scene_suborder');
const express = Backend.service('mc_weapp', 'express_accounts');

module.exports = {
  __rule: function (valid) {
    return valid.object({
      express_no: valid.string().required(),
      order_id: valid.string().required()
    });
  },
  async postAction() {
    let express_no = this.post.express_no;
    let express_name = this.post.express_name || "";
    let express_type = this.post.express_type || "";
    let order_id = this.post.order_id;
    let result = await mcSceneSuborderModel.findOneAndUpdate({
        status: 200,
        isDeleted: false,
        _id: order_id
    },{$set: {
        status: 500,
        expressNo: express_no,
        expressName: express_name,
        expressType: express_type 
    }},{
        new: true
    })
    if (result) {
      return this.success({
        code: "200",
        msg: "发货成功"
      })
    } else {
      return this.success({
        code: "1000",
        msg: "没有符合的订单"
      })
    }

  },
  async getAction() {
    let express_no = this.query.express_no;
    let express_type = this.query.express_type || "";
    let result = await express.getExpressNo(express_type,express_no)
    if (result) {
        return this.success({
            code: "200",
            data: result
        })
      } else {
        return this.success({
          code: "1000",
          msg: "查询失败"
        })
      }
  }
}