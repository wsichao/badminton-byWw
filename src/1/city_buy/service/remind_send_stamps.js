/**
 * 提醒发券领券 service
 * Created by Mr.Carry on 2017/5/24.
 */

"use strict";
let model = Backend.model("1/city_buy", undefined, "remind_send_stamps");
let customer = Backend.model("common", undefined, "customer");
let messages_service = Backend.service("1/message", 'messages');
let moment = require('moment');
/**
 * 获取当前时间到指定自然日之间的毫秒数
 * @param day
 */
let getNaturalDay = function (day) {
  let start_time = new Date().getTime();
  let end_time = new Date(moment().date(moment().date() + 3).format('YYYY-MM-DD')).getTime();

  return Math.round((end_time - start_time) / 1000);
}
module.exports = {
  /**
   * 提醒用户发券
   * @param user_id 用户唯一标识
   * @param shop_id 商家唯一标识
   * @return {}
   */
  remindingSendStamps: function (user_id, shop_id) {
    return model.count({shopId: shop_id}).then(function (count) {
      if (count > 0) {
        return model.update({shopId: shop_id, userIds: {$ne: user_id}}, {
          $push: {userIds: user_id},
        }).then(function () {
          return model.update({shopId: shop_id}, {$set: {isRemind: true}});
        });
      } else {
        return model.create({shopId: shop_id, userIds: user_id});
      }
    }).then(function (data) {
      return Backend.cache.set(user_id + "_" + shop_id, shop_id, getNaturalDay(3));
      //return Backend.cache.set(user_id + "_" + shop_id, shop_id, 60 * 2);
    });
  },
  /**
   * 检查用户是否已发送过提醒
   * @param user_id
   * @param shop_id
   * @returns {*}
   */
  checkUserAndShop: function (user_id, shop_id) {
    // cache 检查用户是否已发送过提醒
    return Backend.cache.get(user_id + "_" + shop_id).then(function (result) {
      if (result) {
        return true;
      }
      return false;
    })
  },
  /**
   * 检查商户是否被登录用户发送过提醒
   * @param user_id
   * @param shop_ids
   * @returns {Promise.<T>}
   */
  checkShops: function (user_id, shop_ids) {
    let arr = shop_ids.map(function (shop_id) {
      return Backend.cache.get(user_id + "_" + shop_id);
    });
    return Backend.Deferred.all(arr)
      .then(function (data) {
        data = data || [];
        let shops = arrayFilter(data, function (item) {
          if (item != null) return true;
        });
        if (!shops || shops.length == 0) return {};
        let obj = {};
        shops.forEach(function (item) {
          obj[item] = true;
        });
        return obj;
      });
  },
  /**
   * 发送发券提醒,并推送给商家
   * @param shop_id
   */
  sendMsgToShop: function (shop_id) {
    console.log("=====" + shop_id)
    let that = this;
    let msg = {
      userId: shop_id,
      type: 'sys',
      title: '{0}位用户提醒您该发优惠券了',
      content: '在之前的一段时间内共有{0}位用户,想要领取您的推广代金券,为了避免客户流失,快去充值发券吧',
      linkType: 'shop'
    };
    let extras = {
      type: 3,//有新消息 
      contentType: 'sys' //moment-动态, personal-个人留言, sys-系统通知 
    };
    let push_id;
    let count = 0;
    let oldVersion = '5.0.1';
    // 添加消息   messages.service.insert()
    return customer
      .findOne({_id: shop_id, latestLoginVersion: {$gt: oldVersion}}, "pushId latestLoginVersion")
      .then(function (data) {
        if (!data || !data.latestLoginVersion) {
          throw new Error('version too low');
        }
        push_id = data.pushId;
        return model.findOne({shopId: shop_id}).exec();
      })
      .then(function (result) {
        count = result.userIds.length;
        result.userIds.forEach(function (item) {
          // 删除缓存 user_id + "_" + shop_id
          Backend.cache.delete(item + "_" + shop_id);
        })
        //// 修改 remindSendStamps.isPushShop = true;
        //return model.update({shopId: shop_id}, {$set: {isPushShop: true}}).exec();
        msg.title = msg.title.replace("{0}", count);
        msg.content = msg.content.replace("{0}", count);
        if (push_id) {
          // 推送弹框提示  messages.service.pushNotification
          messages_service.pushNotification(push_id, msg.title, extras);
          // 推送未读提示  messages.service.pushMessage
          messages_service.pushMessage(push_id, msg.title, extras);
        }

        return messages_service.insertMessage(msg)
          .then(function () {
            return model.update({shopId: shop_id}, {
              $set: {isRemind: false}
            });
          });
      })
      .then(function () {
        return {success: true, msg: 'shop_id:' + shop_id};
      }).catch(function (err) {
        console.log(err)
        return err;
      });
  },
  /**
   * 发送商铺已发券提醒 ( 大量数据处理 JPush 与 userIDs )
   * @param user_id
   * @param shop_id
   */
  sendMsgToUser: function (shop_id) {
    let shopName = '';
    let push_id;
    let extras = {
      type: 3,//有新消息 
      contentType: 'sys' //moment-动态, personal-个人留言, sys-系统通知 
    };
    return customer.findOne({_id: shop_id}, "shopName")
      .then(function (data) {
        shopName = data.shopName;
        return model.findOne({shopId: shop_id});
      })
      .then(function (data) {
        if (!data) return [];
        return customer.find({_id: {$in: data.userIds}}, "_id pushId").exec();
      })
      .then(function (data) {
        if (!data) return {};
        data.forEach(function (item) {
          // 发送消息通知
          let msg = {
            userId: item._id,
            type: 'sys',
            title: shopName + '发券通知',
            content: shopName + '在您提醒后补发了优惠券,快去领取消费券吧',
            linkType: 'user',
            linkData: shop_id
          }
          // 推送弹框提示  messages.service.pushNotification
          messages_service.pushNotification(item.pushId, msg.title, extras);
          // 推送未读提示  messages.service.pushMessage
          messages_service.pushMessage(item.pushId, msg.title, extras);
          messages_service.insertMessage(msg);

          // 删除缓存
          Backend.cache.delete(item._id + "_" + shop_id);
        })
        // 删除remindSendStamps集合商铺提醒
        return model.remove({shopId: shop_id});
      })
  },
  getShops: function () {
    return model.find({isRemind: true}, "shopId");
  }

};