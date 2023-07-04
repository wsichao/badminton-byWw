/**
 *
 * 用户完善信息
 * Created by yichen on 2018/7/2.
 */



'user strict';

const user_model = require("../../../app/models/Customer");
const co = require('co');
module.exports = {
  __rule: function (valid) {
    return valid.object({
    });
  },
  postAction: function () {
    const self = this;
    const post = this.post;
    let user_id = this.req.identity.userId
    let result = co(function* () {
      return yield user_model.findOneAndUpdate({_id:user_id},{$set:post},{new:true});
    });

    return self.success({code:'200',msg:''});
  }
}