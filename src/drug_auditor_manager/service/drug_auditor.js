/**
 * Created by Mr.Carry on 2018/3/12.
 */
"use strict";
const drug_auditor_model = Backend.model('drug_auditor_manager', '', 'drug_auditor');
const co = require('co');
const tag_code_model = require('./../../../app/models/TagCode');

module.exports = {
  /**
   * 药品审核人员登录
   * @param open_id 微信唯一标识
   */
  login(open_id) {
    return co(function* () {
      return yield drug_auditor_model.findOne({ 'wechat.openId': open_id, 'isDeleted': false });
    });
  },
  /**
   * 检查用户是否已注册
   * @param open_id
   */
  check(open_id) {
    return co(function* () {
      const count = yield drug_auditor_model.count({
        'wechat.openId': open_id,
        'isDeleted': false
      });
      return count > 0;
    })
  },
  /***
   * 注册账号
   * @param phone 手机号
   * @param name 姓名
   * @param channel 渠道标识
   * @param open_id 微信唯一标识
   * @param nick_name 昵称
   * @param avatar 头像
   * @return {*}
   */
  register(phone, name, channel, open_id, nick_name, avatar) {
    const wechat = {
      openId: open_id,
      nickName: nick_name,
      avatar: avatar,
    };
    return co(function* () {
      return yield drug_auditor_model.create({
        name: name,
        phone: phone,
        channelId: channel,
        wechat: wechat
      });
    })
  },
  /**
   * 修改账号状态
   * @param id 账号唯一标识
   * @param phone 手机号
   * @param name 姓名
   * @param channel 渠道码
   * @param refuseReason 拒绝理由
   */
  update(id, phone, name, channel, refuseReason) {
    return co(function* () {
      return yield drug_auditor_model.update({ "_id": id }, {
        phone: phone,
        name: name,
        channelId: channel,
        auditState: 0,
        refuseReason: refuseReason
      });
    });
  },

  /**
   * 根据审核人员id 获取审核人员信息
   * @param id
   * @return {*}
   */
  get(id) {
    return co(function* () {
      let info = yield drug_auditor_model.findOne({ _id: id });
      if(info){
        let tag_code = yield tag_code_model.findOne({ _id: info.channelId });
        return {
          "_id": info._id,
          "name": info.name,
          "phone": info.phone,
          "channel_id": tag_code.id,
          "channel_name": tag_code.title,
          "refuseReason": info.refuseReason,
          "auditState": info.auditState,
          "province": tag_code.province,
          "city": tag_code.city,
          "county": tag_code.district,
        }
      }else{
        return {
        }
      }
    })
  }

};