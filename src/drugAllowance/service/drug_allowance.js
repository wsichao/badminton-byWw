/**
 * Created by yichen on 2018/3/13.
 */

"use strict";
const reimburse_model = require('../../../app/models/Reimburse');
const drug_auditor_model = Backend.model('drug_auditor_manager','','drug_auditor');
const co = require('co');
module.exports = {
  get_drug_allowance_list_for_auditor: function (drug_auditor_id,status,limit,bookmark) {
    var result = co(function* () {
        let drug_auditor = yield drug_auditor_model.findOne({_id:drug_auditor_id});
        var cond = {
          buyChannel : drug_auditor.channelId,
          channelCheckStatus : status
        }
        if(status == 200){
          cond.channelCheckStatus = {$in:[200,300]};
        }
        if(bookmark){
          cond.createdAt = {$lt : bookmark}
        }
        limit = limit || 20;
        let reimburse_list = yield reimburse_model.find(cond,'userName drugName createdAt reimburseCount channelCheckedAt ' +
          'reimbursePrice channelCheckStatus channelCheckRejectReason drugImgs reimburseImgs checkStatus drugAuditorId')
          .sort({createdAt:-1}).limit(limit);
        let result= {
          items : [],
          bookmark : 0
        };
        result.bookmark = reimburse_list.length ? reimburse_list[reimburse_list.length - 1].createdAt : 0;
        reimburse_list.forEach(function(item){
          let res_item = {
            "_id": item._id,
            "userName": item.userName,
            "drugName": item.drugName,
            "images": item.drugImgs.concat(item.reimburseImgs),
            "createdAt": item.createdAt,
            "reimburseCount": item.reimburseCount,
            "price": item.reimburseCount * item.reimbursePrice,
            "channelCheckStatus" : item.channelCheckStatus,
            "channelCheckRejectReason" : item.channelCheckRejectReason || '',
            "channelCheckedAt" : item.channelCheckedAt,
            "checkStatus" : item.checkStatus,
            "isRejectShow" : false
          }
          if((item.channelCheckStatus == 300 || item.channelCheckStatus == 200) && item.checkStatus == 0 &&
            (Date.now() - item.channelCheckedAt < 86400000) && (item.drugAuditorId + "") == drug_auditor_id){
            res_item.isRejectShow = true
          }
          result.items.push(res_item);
        })
        console.log(result);
        return result;
      }
    ).catch(function (err) {
      console.log(err);
    })
    return result
  },
  audit_drug_allowance: function (drug_auditor_id,reimburse_id,status,reject_reason) {
    var result = co(function* () {
        let drug_auditor = yield drug_auditor_model.findOne({_id:drug_auditor_id});
        if(!drug_auditor){
          return {
            code : '800',
            msg : '没有您的审核账户'
          }
        }
        let update = {
          channelCheckStatus : status,
          channelCheckRejectReason : reject_reason,
          drugAuditorId : drug_auditor_id,
          channelCheckedAt : Date.now()
        }
        let cond = {_id:reimburse_id,buyChannel : drug_auditor.channelId};
        if(status == 100){
          cond.drugAuditorId = drug_auditor_id;
        }
        let reimburse = yield reimburse_model.findOneAndUpdate(cond,update,{new:true});
        if(reimburse){
          return {
            code : '200',
            msg : '审核成功'
          }
        }else{
          return {
            code : '800',
            msg : '审核失败'
          }
        }
      }
    ).catch(function (err) {
      console.log(err);
      return err
    })
    return result
  },
}