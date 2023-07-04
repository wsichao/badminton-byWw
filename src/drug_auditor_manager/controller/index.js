/**
 * Created by Mr.Carry on 2018/3/12.
 */
"use strict";
const drug_auditor_service = Backend.service('drug_auditor_manager', 'drug_auditor');
const wx_service = Backend.service('wechat', 'snsapi_userInfo');
const co = require('co');

module.exports = {
  getAction() {
    let self = this;
    co(function* () {

      let openid = null;
      if (!self.req.session.drug_auditor) {
        const wechat = yield wx_service.getWXUserInfo(self.query.code);
        // 测试用
        // const wechat = {
        //   openid: 'oM4JqxMdLpqOUTLdchtxla9C_g7yZqg',
        //   nickname: '夜丿未央',
        //   sex: 1,
        //   language: 'zh_CN',
        //   city: '海淀',
        //   province: '北京',
        //   country: '中国',
        //   headimgurl: 'http://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTKdup3Qx1XJBea1QVUeZ061hDK44p1ot07wo6fdvBuibjVCl8Ix6GTrohLUeWdxS26BcL6noluRWJg/132',
        //   privilege: [],
        //   unionid: 'oexy806sx9yPB1G6rdIJeX2tHNgw'
        // };
        self.req.session.drug_auditor = {
          open_id: wechat.openid,
          name: wechat.nickname,
          avatar: wechat.headimgurl,
        };
        openid = wechat.openid;
      } else {
        openid = self.req.session.drug_auditor.open_id;
      }

      // 1、check openId 是否已经注册
      const is_reg = yield drug_auditor_service.check(openid);
      // 已注册
      if (is_reg) {
        // 记录session
        let drug_auditor = yield drug_auditor_service.login(openid);
        self.req.session.drug_auditor.drug_auditor_id = drug_auditor._id;
        // 认证成功
        if (drug_auditor.auditState === 200) {

          // 跳转 List 页面
          self.res.redirect('/drug_auditor_manager/list');
        }
        // 认证中
        else if (drug_auditor.auditState === 0) {
          self.res.redirect('/drug_auditor_manager/audit');
        }
        // 认证失败
        else if (drug_auditor.auditState === 100) {
          self.res.redirect('/drug_auditor_manager/audit_fail');
        }
      }
      // 未注册
      else {
        // 跳转注册页面
        self.res.redirect('/drug_auditor_manager/login');
      }
    }).catch(function (err) {
      console.log(err)
    });
  }
};