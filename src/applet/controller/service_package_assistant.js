
/**
 *
 * 服务包助理列表
 *
 * Created by yichen on 2018/7/2.
 */


'user strict';

const assistant_model = require('../../../app/models/service_package/servicePackageAssistant');
const assistantRef_model = require('../../../app/models/service_package/servicePackageDoctorAssistantRef');
const _ = require('underscore');

const co = require('co');
module.exports = {
  __rule: function (valid) {
    return valid.object({
      doctor_id: valid.string().required(),
    });
  },
  getAction: function () {
    const self = this;
    const query = this.query;
    let user_id = this.req.identity.userId;
    let result = co(function* () {
      let assistantRefs = yield assistantRef_model.find({doctorId:query.doctor_id,isDeleted:false});
      let assistant_ids = _.map(assistantRefs,'assistantId');
      let assistants = yield assistant_model.find({_id:{$in:assistant_ids}});
      let other_assistants = yield assistant_model.find({_id:{$nin:assistant_ids}});
      assistants = assistants.concat(other_assistants);
      let result = {
        code:'200',
        msg:'',
        items:[]
      }
      assistants.forEach(function(item){
        result.items.push({
          name : item.name,
          avatar : item.avatar || '',
          _id : item._id,
        })
      })
      return result;
    });
    return self.success(result);
  }
}