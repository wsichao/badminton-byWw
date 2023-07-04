/**
 *
 *  处理boss端发送的消息通知
 *
 * Created by yichen on 2018/4/10.
 */
const JPushService = require('../../../app/services/JPushService');
const commonUtil = require('../../../lib/common-util');
const message_center_model = require('../../../app/models/MessageCenter');
const collection_center_service = Backend.service('collectionCenter','collectionCenter');
const co = require('co');
const reimburse_model = require('../../../app/models/Reimburse');
const user_model = require('../../../app/models/Customer');
const application_model = require('../../../app/models/Application');
const service_package_order_model = require('../../../app/models/service_package/servicePackageOrder');
const factory_drug_rel_model = require('../../../app/models/FactoryDrugRel');
const recharge_application_model = Backend.model('boss',undefined,'recharge_application');
let pushToUser = function (pushIds, data, notificationExtras) {

  if (data.type == '1' || data.type == "5" || data.type == "6"|| data.type == "7"|| data.type == "8" || data.type == '9') {//消息中心的信息，添加一个透传(ios和android都收到透传)
    JPushService.pushMessage(pushIds, data.title, '', notificationExtras);
  } else {//其它情况android发透传，ios不发
    JPushService.pushMessage(pushIds, data.title, '', notificationExtras, 'android');
  }
  JPushService.pushNotification(pushIds, data.title, '', notificationExtras, 'ios');
};


'use strict';
module.exports = {
  /**
   * 存储消息 发送推送
   */
  push_and_save_message(push_id,notificationExtras,phone_num,phone_msg_opt,message){
    if(push_id){
      pushToUser(push_id,{title:message.title,type:message.type},notificationExtras)
    }
    if(phone_num){
      commonUtil.sendSms(phone_msg_opt.code, phone_num,phone_msg_opt.opt);
    }
    return co(function* () {
      return  yield message_center_model.create(message);
    });
  },
  /**
   * 通过type判断操作
   *
   *
   * 返回结果 {
   * push_id : 推送用户id 无pushId则不推送
   * phone_num ： 发送短信手机号 无手机号则不发送短信
   * message ： 消息中心中生成的消息
   * notificationExtras ： 推送透传的额外信息
   * phone_msg_model ： 发送短信的配置信息
   * }
   */
  judge_type(post){
    let result =  co(function* () {
      if(post.type == 4){
        //药品变动
        let collections = yield collection_center_service.getCollectionsByPlanId(post.message_ref);
        let drug_rel = {};
        if(collections && collections.length){
          drug_rel = yield factory_drug_rel_model.findOne({_id:post.message_ref});
        }
        let messages = [];
        collections.forEach(function(item){
          let message_item = {
            type : 8,
            subType : post.sub_type,
            user : item.user,
            content:'只有收藏的药品才会收到变动通' +
            '知哟',
            messageRef:item.planId
          }
          if(post.sub_type == 1){
            message_item.title = drug_rel.drugName+' 补贴额度提升至'+ drug_rel.reimbursePrice +'元 ，立即查看';
          }else if(post.sub_type == 2){
            message_item.title = drug_rel.drugName+' 补贴额度下降至'+drug_rel.reimbursePrice+'元 ，立即查看';
          }else if(post.sub_type == 3){
            message_item.title = drug_rel.drugName+' 已被下架，立即查看';
          }
          messages.push(message_item);
        })
        return messages;
      }
      else if(post.type == 1){
        //药品补贴进度通知
        let reimburse = yield reimburse_model.findOne({_id:post.message_ref});
        let user = yield user_model.findOne({_id:reimburse.user})
        let result = {
          push_id : user.pushId,
          message : {
            user: user._id,
            type: 5,
            subType: post.sub_type,
            content: reimburse.drugName, //消息的内容
            messageRef:reimburse._id
          }
        }
        if(post.sub_type == 1){
          result.message.title = '您申请的药品补贴已通过审核，' + commonUtil.returnFloat(reimburse.reimburseCount * reimburse.reimbursePrice)
            + '元已到帐，前往"我的钱包"查看详情'
        }else if(post.sub_type == 2){
          result.message.title = '您申请的药品补贴未通过审核，前往"我的补贴"查看详情'
        }
        result.notificationExtras = {
          type: '4',//推送按照type
          contentType: 'notificationCenter',//透传按照contentType
          notificationBody: {
            type: result.message.type + '' ,
            title: result.message.title,//标题
            content: result.message.content,//药品名称
          }
        }
        return result
      }
      else if(post.type == 2){
        //提现通知
        let application = yield application_model.findOne({_id:post.message_ref});
        let user = yield user_model.findOne({_id:application.applicantId});
        let result = {
          push_id : user.pushId,
          phone_num : user.phoneNum,
          message : {
            user: user._id,
            type: 6,
            subType: post.sub_type,
            messageRef:application._id
          }
        }
        if(post.sub_type == 1){
          result.message.title = '您的提现已通过审核，'+ application.cash +'元已到账，前往“我的钱包”查看详情';
          result.message.content = '提现通过审核';
          result.phone_msg_model = {
            code : '2115806',
            opt : "#money#=" + application.cash
          };
        }else if(post.sub_type == 2){
          result.message.title = '您的提现未通过审核，'+ application.cash +'元已返还至您的钱包，前往查看详情';
          result.message.content = '未通过原因：' + application.reason;
          result.phone_msg_model = {
            code : '2115816',
            opt : "#content#=" + application.reason
          };
        }
        result.notificationExtras = {
          type: '4',//推送按照type
          contentType: 'notificationCenter',//透传按照contentType
          notificationBody: {
            type: result.message.type + "",
            title: result.message.title,//标题
            content: result.message.content,//药品名称
          }
        }
        return result
      }
      else if(post.type == 3){
        //专属医生-进度通知
        let service_package_order = yield service_package_order_model.findOne({_id:post.message_ref});
        let user = yield user_model.findOne({_id:service_package_order.userId});
        let result = {
          push_id : user.pushId,
          message : {
            user: user._id,
            type: 7,
            subType: post.sub_type,
            content: service_package_order.servicePackageName + service_package_order.doctorName, //消息的内容
            messageRef:service_package_order._id
          }
        }
        if(post.sub_type == 1){
          result.message.title = '您提交的病情说明已通过审核，前往“我的医生”开始预约医生吧';
        }else if(post.sub_type == 2){
          result.message.title = '您提交的病情说明未通过审核，前往“我的医生”查看详情';
        }else if(post.sub_type == 3){
          result.message.title = '您购买的专属医生订单已成功退款'+ service_package_order.mountOfRealPay/100 +
            '元，前往“我的钱包”查看详情';
          result.phone_num = user.phoneNum;
          result.phone_msg_model = {
            code : '2251756',
            opt : "#doctor#=" + service_package_order.doctorName + "&#orderid#=" + service_package_order.orderId
          };
        }
        result.notificationExtras = {
          type: '4',//推送按照type
          contentType: 'notificationCenter',//透传按照contentType
          notificationBody: {
            type: result.message.type + '',
            title: result.message.title,//标题
            content: result.message.content,//药品名称
          }
        }
        return result
      }
      else if(post.type == 5){
        //boss充值通知
        let recharge_application = yield recharge_application_model.findOne({_id:post.message_ref});
        let user = yield user_model.findOne({_id:recharge_application.userId});
        let result = {
          push_id : user.pushId,
          phone_num : user.phoneNum,
          message : {
            user: user._id,
            type: 9,
            messageRef:recharge_application._id,
            title : '您的'+ recharge_application.remark + recharge_application.rechargeAmount +'元已到账，前往查看详情',
            content : recharge_application.remark
          },

        }
        result.phone_msg_model = {
          code : '2288754',
          opt : "#content#=" + recharge_application.remark + "&#money#=" + recharge_application.rechargeAmount
        }
        result.notificationExtras = {
          type: '4',//推送按照type
          contentType: 'notificationCenter',//透传按照contentType
          notificationBody: {
            type: result.message.type + '',
            title: result.message.title,//标题
            content: result.message.content,//药品名称
          }
        }
        return result
      }
    });
    console.log(result);
    return result;
  },
}