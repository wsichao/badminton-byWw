const reimburse_model = require('../../../app/models/Reimburse');
const factory_model = require('../../../app/models/Factory');

module.exports = {
  getReimburseById: function(id, fields){
    fields = fields || undefined;
    return reimburse_model.findOne({_id: id}, fields).exec();
  },
  getFactoryInfoByCode: function(code, fields) {
    fields = fields || undefined;
    return factory_model.findOne({code: code}, fields || undefined).exec();
  }
}
