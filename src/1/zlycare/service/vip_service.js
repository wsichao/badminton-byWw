/**
 * 会员专区service
 * Created by fly on 2017－06－25.
 */

'use strict';

// let _model = Backend.model('1/zlycare', undefined, 'vip_member_product');

let _model = require('../../../../app/models/VipMemberProducts');
module.exports = {
  getNormalServices: function () {
    let cond = {
      type: {$nin: [null, '']},
      subType: {$nin: [null, '']},
      vipType: 'zlycare',
      isDeleted: false,
      status: 1,
      online: 1
    }
    return _model.find(cond).sort({createdAt: 1}).exec();
  },
  getVipServices: function () {
    let cond = {
      type: {$nin: [null, '']},
      subType: {$nin: [null, '']},
      vipType: 'zlycare_vip',
      isDeleted: false,
      status: 1,
      online: 1
    }
    return _model.find(cond).sort({createdAt: 1}).exec();
  },
  getVipProduct: function (product_id, fields) {
    let cond = {
      _id: product_id,
      isDeleted: false,
      status: 1,
      online: 1
    }
    return _model.findOne(cond).exec();
  },
  getVipProductInfo: function (product_id, fields) {
    let cond = {
      _id: product_id,
      isDeleted: false,
      status: 1,
    }
    return _model.findOne(cond).exec();
  },
  /**
   * 报销纪录查询产品用,不限定上线状态
   * @param product_ids
   * @param fields
   * @returns {Array|{index: number, input: string}|Promise|*}
   */
  getVipProducts: function (product_ids, fields) {
    let cond = {
      _id: {$in: product_ids},
      isDeleted: false,
      status: 1,
      //online: 1 //
    }
    return _model.find(cond, fields || 'servicePeopleCall productName').exec();
  },
  getVipServicesByCond: function (cond, pageSlice) {
    cond.isDeleted = false;
    cond.status = 1;
    cond.online = 1;
    if(!cond.thirdType){
      cond.thirdType = {$nin: [null, '']};
    }
    return _model.find(cond, '', pageSlice).exec();
  }
}
