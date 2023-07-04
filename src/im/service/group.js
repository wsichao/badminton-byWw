const util = Backend.service('im', 'util');
const userService = Backend.service('im', 'user');
const messageService = Backend.service('im', 'message');

const im_group_ps_ref_model = Backend.model('im', undefined, 'im_group_ps_ref');
const sys_user_model = Backend.model('assistant', undefined, 'sys_user');
const service_package_order_model = require('./../../../app/models/service_package/servicePackageOrder');

module.exports = {
  /**
   * 创建群组
   * @param {*} args group_name
   * @param {*} args desc
   * @param {*} args owner_user_id
   * @param {*} args group_user_ids
   */
  async createGroup(args) {
    //创建IM用户
    await this.createImUser([args.owner_user_id].concat(args.group_user_ids));
    const url = '/group/create';
    const data = {
      group_name: args.group_name || '自定义群组',
      desc: args.desc || '无',
      owner: args.owner_user_id,
      members: args.group_user_ids
    };
    const result = await util.baseRequest(url, 'POST', data);
    return result;
  },
  /**
   * 修改群组信息
   * @param {*} args <group_id> 
   * @param {*} args <group_name> 
   * @param {*} args <group_desc> 
   */
  async editGroupInfo(args) {
    const url = '/group/update';
    const data = {
      group_id: args.group_id,
      group_name: args.group_name,
      description: args.description
    };
    return await util.baseRequest(url, 'POST', data);
  },
  /**
   * 获取群组信息
   * @param {*} group_id 群组唯一标识
   */
  async getGroupInfo(group_id) {
    const url = '/group/get';
    const data = { group_id };
    return await util.baseRequest(url, 'GET', data);
  },
  /**
   * 获取群组信息（多个）
   * @param {*} group_ids 群组唯一标识
   */
  async getGroupsInfo(group_ids) {
    const url = '/group/get_list_info';
    const data = { group_ids };
    return await util.baseRequest(url, 'GET', data);
  },
  /**
   * 创建IM用户
   * @param {}} user_ids 
   */
  async createImUser(user_ids) {
    const url = '/user/create';
    const data = {
      user_ids
    };
    const result = await util.baseRequest(url, 'POST', data);
    return result;
  },
  /**
   * 获取服务包--IM群组关系
   * @param {*} service_package_orderId 服务包订单唯一标识
   * @param {*} group_id 群组唯一标识
   * @param {*} servicePackageId 服务包唯一标识
   */
  async groupPackageServiceRef(service_package_orderId, group_id, servicePackageId) {
    const cond = {
      servicePackageOrderId: service_package_orderId,
      groupId: group_id,
      servicePackageId,
      isDeleted: false
    };
    const count = await im_group_ps_ref_model.count(cond);
    if (count == 0) {
      return await im_group_ps_ref_model.create(cond)
    }
  },
  /**
   * 获取群组关联的服务包及购买的用户信息
   * @param {*} group_id 
   */
  async getGroupPSRef(group_id) {
    const cond = {
      groupId: group_id,
      isDeleted: false
    }
    const result = await im_group_ps_ref_model.findOne(cond);
    if (!result.servicePackageOrderId) {
      return ;
    }
    const order = await service_package_order_model.findOne({
      orderId: result.servicePackageOrderId,
      isDeleted: false
    }, "userId");
    return order.userId;
  },
  /**
   * 移除群成员
   * @param {*}} group_id 
   * @param {*} members 
   */
  async removeGroupMember(group_id, member_ids) {
    const url = '/group/del_member';
    const data = {
      group_id,
      member_ids
    };
    const result = await util.baseRequest(url, 'POST', data);
    return result;
  },
  /**
   * 添加群组成员
   * @param {*} group_id 
   * @param {*} member_ids 
   */
  async addGroupMember(group_id, member_ids) {
    //创建IM用户
    await this.createImUser(member_ids);
    const url = '/group/add_member';
    const data = {
      group_id,
      member_ids
    };
    const result = await util.baseRequest(url, 'POST', data);
    return result;
  },
  /**
   * 转让群主
   * @param {*} group_id 
   * @param {*} member_id 
   */
  async groupTransferOwner(group_id, member_id) {
    const url = '/group/set_admin';
    const data = {
      group_id,
      owner_id: member_id
    };
    const result = await util.baseRequest(url, 'POST', data);
    return result;
  },
  /**
   * 解散群组
   * @param {*} group_id 群组唯一标识
   */
  async destroyGroup(group_id) {
    const url = '/group/destroy';
    const data = {
      group_id
    };
    const result = await util.baseRequest(url, 'POST', data);
    return result;
  },
  /**
   * 获取全部助理
   * @param args <page_size>
   * @param args <page_num>
   */
  async getUserList(args) {
    const cond = {
      role: 'assistant',
      isDeleted: false
    };
    let user_ids = await sys_user_model
      .find(cond, '_id')
      .limit(args.page_num)
      .skip((args.page_size) * args.page_num);

    user_ids = user_ids.map(item => { return item._id + '' });
    let result = await userService.getAssistant(user_ids);
    result = result.map(item => {
      return {
        user_id: item._id,
        user_name: item.user_name,
        user_avatar: item.avatar
      }
    });
    return result;
  },
  /**
   * 根据groupId，发送群消息；默认群主发送
   */
  async sendMsgByGroup(group_id, message) {
    // 获取群主信息
    const group_info = await this.getGroupInfo(group_id);
    if (group_info.errno == 1000) {
      return;
    }
    let owner_id = '';
    group_info.data.members.forEach(item => {
      if (item.rule === 'owner') {
        owner_id = item.user_id;
      }
    })
    if (owner_id == '') return;
    // 发送消息
    return await this.sendMsg({
      user_id: owner_id,
      group_id,
      message
    });
  },
  /**
   * 发送消息
   * @param {*} args <user_id> 用户唯一标识
   * @param {*} args <group_id> 群组唯一标识
   * @param {*} args <message> 消息体
   */
  async sendMsg(args) {
    const data = {
      user_id: args.user_id,
      to_user_id: args.group_id,
      message_type: 'text',
      message_txt: args.message,
      target_type: 'chatgroups'
    };
    return await messageService.sendMsg(data, 'chatgroups');
  },
  /**
   * 根据 gourpId 获取订单相关信息
   * @param {*} groupId 
   */
  async getOrderInfoByGroupId(groupId) {
    let ref = await im_group_ps_ref_model.findOne({ isDeleted: false, groupId: groupId });
    const orderModel = require('../../../app/models/service_package/servicePackageOrder');
    const packageServiceModel = require('../../../app/models/service_package/servicePackage');
    const Promise = require('promise');
    if (!ref) {
      return false;
    }
    ref.servicePackageId = ref.servicePackageId || '';
    return Promise.all([
      orderModel.findOne({ isDeleted: false, orderId: ref.servicePackageOrderId }),
      packageServiceModel.findOne({ isDeleted: false, _id: ref.servicePackageId }),
    ])
      .then((promiseRes) => {
        const order = promiseRes[0] || {};
        const servicePackage = promiseRes[1] || {}
        ref.orderId = order.orderId;
        ref.name = order.servicePackageName;
        ref.validity_time = order.deadlinedAt;
        ref.icon = servicePackage.icon;
        return ref;
      })
  }

}