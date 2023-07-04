

module.exports = {
  /**
   * 查询当天过期服务包 groupIds
   */
  async getExpireGroups () {
    const now = Date.now();
    const servicePackageOrderModel = require('../../../app/models/service_package/servicePackageOrder');
    const groupOrderRefModel = Backend.model("im",undefined,'im_group_ps_ref')
    const _ = require('underscore');
    const orders = await servicePackageOrderModel.find({
        isDeleted:false,
        deadlinedAt : {
            $gte : getDateBeginTS(now),
            $lte : getDateEndTS(now)
        }
    })
    const orderIds = _.map(orders,'orderId');
    const groups = await groupOrderRefModel.find({isDeleted:false,servicePackageOrderId : {$in:orderIds}});
    let result = [];
    groups.forEach( element => {
      let item = {
        groupId : element.groupId,
        orderId:element.servicePackageOrderId
      }
      result.push(item);
    });
    return result
  },
  /**
   * 查询当天过期7天的服务包 groupIds
   */
  async getExpireSevenDaysGroups () {
    const nowObj = new Date();
    const sevenDaysAgo = nowObj.setDate(nowObj.getDate() - 7)
    console.log("123");
    console.log(sevenDaysAgo);
    const servicePackageOrderModel = require('../../../app/models/service_package/servicePackageOrder');
    const groupOrderRefModel = Backend.model("im",undefined,'im_group_ps_ref')
    const _ = require('underscore');
    const orders = await servicePackageOrderModel.find({
        isDeleted:false,
        deadlinedAt : {
            $gte : getDateBeginTS(sevenDaysAgo),
            $lte : getDateEndTS(sevenDaysAgo)
        }
    })
    const orderIds = _.map(orders,'orderId');
    const groups = await groupOrderRefModel.find({isDeleted:false,servicePackageOrderId : {$in:orderIds}});
    let result = [];
    groups.forEach( element => {
      let item = {
        groupId : element.groupId,
        orderId:element.servicePackageOrderId
      }
      result.push(item);
    });
    return result
  }
};