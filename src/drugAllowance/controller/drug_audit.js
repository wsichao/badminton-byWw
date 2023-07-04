/**
 * Created by yichen on 2018/3/14.
 */

'user strict';
let drug_allowance_service = Backend.service('drugAllowance','drug_allowance');
co = require('co');


module.exports = {
  __rule: function (valid) {
    return valid.object({
      reimburse_id : valid.string().required(),
      status: valid.number().required(),
    });
  },
  postAction: function () {
    let self = this;
    let post = this.post;
    if(post.status == 300 && !post.reject_reason){
      return self.fail(8005);
    }
    let drug_auditor = self.req.session.drug_auditor;
    // let drug_auditor = {
    //   "open_id" : "oM4JqxMdLpqOUTLdchtxla9C_g7yZqg",
    //   "name" : "夜丿未央",
    //   "avatar" : "http://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTKdup3Qx1XJBea1QVUeZ061hDK44p1ot07wo6fdvBuibjVCl8Ix6GTrohLUeWdxS26BcL6noluRWJg/132",
    //   "drug_auditor_id" : "5aa738a75cab2177caea8612"
    // };
    let result = co(function *(){
      let result = drug_allowance_service.audit_drug_allowance(drug_auditor.drug_auditor_id,post.reimburse_id,
        post.status,post.reject_reason)
      return result
    })
    return this.success(result);
  }
};