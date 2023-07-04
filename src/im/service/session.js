/**
 * session相关 service 方法
 */
const _ = require('underscore');

module.exports = {
  /**
   * 获取session_list 所需的信息
   * @param user_ids 用户list
   * @param group_list 群组list
   */
  async getSessionInfo(user_ids, group_list) {
    //引入
    const imUserService = Backend.service('im', 'user');
    const groupOrderRefModel = Backend.model('im', undefined, 'im_group_ps_ref');
    const orderModel = require('../../../app/models/service_package/servicePackageOrder');
    const packageServiceModel = require('../../../app/models/service_package/servicePackage');
    const Promise = require('promise');
    //获取关联信息
    let groupOrderRefs = await groupOrderRefModel.find({
      groupId: {
        $in: group_list
      },
      isDeleted: false
    });
    groupOrderRefs = JSON.parse(JSON.stringify(groupOrderRefs));
    const ordersIds = _.map(groupOrderRefs, 'servicePackageOrderId');
    const servicePackageIds = _.map(groupOrderRefs, 'servicePackageId');
    //all
    return Promise.all([
        orderModel.find({
          isDeleted: false,
          orderId: {
            $in: ordersIds
          }
        }),
        packageServiceModel.find({
          isDeleted: false,
          _id: {
            $in: servicePackageIds
          }
        }),
        imUserService.getUser(user_ids)
      ])
      .then((promiseRes) => {
        const orderIndex = _.indexBy(promiseRes[0], 'orderId');
        const servicePackageIndex = _.indexBy(promiseRes[1], '_id');
        const userIndex = promiseRes[2];

        groupOrderRefs.forEach((item) => {
          if (orderIndex[item.servicePackageOrderId]) {
            item.name = orderIndex[item.servicePackageOrderId].servicePackageName,
              item.validity_time = orderIndex[item.servicePackageOrderId].deadlinedAt
            item.icon = servicePackageIndex[item.servicePackageId].icon
          }
        })
        const groupOrderRefIndex = _.indexBy(groupOrderRefs, 'groupId');
        return [groupOrderRefIndex, userIndex]
      })
  },
  /**
   * 根据群组删除会话
   * @param {*} group_id : 群组唯一标识
   */
  async delSessionByGroup(group_id) {
    const util = Backend.service('im', 'util');
    const url = '/session/del_group';
    const data = {
      group_id
    };
    return await util.baseRequest(url, 'POST', data);
  },
  /**
   * 
   * @param {*} user_id 
   * @param {*} assistant_id 
   * @param {*} page_size 
   * @param {*} page_num 
   */
  async searchSession(user_id, assistant_id, page_size = 20, page_num = 1) {
    const util = Backend.service('im', 'util');
    const url = '/session/search_list';
    const data = {
      from_id: user_id,
      to_id: assistant_id,
      page_size,
      page_num
    };
    console.log(data)
    return await util.baseRequest(url, 'POST', data);
  }

}