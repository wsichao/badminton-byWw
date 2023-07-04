const item_model = Backend.model('service_package', undefined, 'make_appointment_orderItems_dict');
const co = require('co');
const _ = require('underscore');

module.exports = {
  getItems: function () {
    return co(function* () {
      let result = yield item_model.find({}, '_id name parentId');
      let arr = _.filter(result, function (item) {
        return item.parentId ? false : true;
      });
      return arr.map((item) => {
        let obj = {}
        let children = _.filter(result, function (z) {
          return z.parentId + '' == item._id + '';
        });
        children = children.map((z) => {
          return {
            name: z.name
          }
        })
        obj.name = item.name
        obj.items = children;
        return obj;
      });
    })
  }
}