/**
 * Created by yichen on 2018/3/13.
 */

'user strict';
let drug_allowance_service = Backend.service('drugAllowance','drug_allowance');
  co = require('co');


module.exports = {
  __rule: function (valid) {
    return valid.object({
      status: valid.number().required(),
    });
  },
  mockAction: function () {
    let resObj = {
      items :[
        {
          _id : '123123123',
          userName:'123123',
          drugName : '123',
          images : ['123','123'],
          createdAt:1520931111000,
          reimburseCount : 100,
          price:20000,
        }
      ],
      bookmark:1520931111000
    };
    return this.success(resObj);
  },
  getAction: function () {
    let self = this;
    let drug_auditor = self.req.session.drug_auditor;
    let query = this.query;
    //test
    // let drug_auditor = {
    //   "_id" : "5aa738a75cab2177caea8612",
    //   "name" : "测试",
    //   "phone" : "12345",
    //   "channelId" : "5a41f6af15f2f0253d85ff11",
    //   "statisticsUpdatedAt" : 1520924170381.0,
    //   "isDeleted" : false,
    //   "updatedAt" : 1520924170381.0,
    //   "createdAt" : 1520908455945.0,
    //   "refuseReason" : "手机号不正确，请正确填写手机号",
    //   "auditState" : 200,
    //   "wechat" : {
    //     "openId" : "oM4JqxMdLpqOUTLdchtxla9C_g7yZqg",
    //     "nickName" : "夜丿未央",
    //     "avatar" : "http://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTKdup3Qx1XJBea1QVUeZ061hDK44p1ot07wo6fdvBuibjVCl8Ix6GTrohLUeWdxS26BcL6noluRWJg/132"
    //   },
    //   "__v" : 0
    // }
    let result = co(function *(){
      let result = drug_allowance_service.get_drug_allowance_list_for_auditor(drug_auditor.drug_auditor_id,query.status,query.limit,query.bookmark)
      return result
      })
    return this.success(result);
  }
};