/**
 *
 * 购买过医生订单的人 （会员）
 *
 *
 * Created by yichen on 2018/7/3.
 */


"use strict";

module.exports = {
  config: {
    userId : Backend.Schema.Types.ObjectId , //用户id
  },
  options: {
    collection: 'vipMember'
  },
  methods : {
    isVipMember : function (userId) {
      let isVip = false;
      return this.findOne({userId : userId,isDeleted:false})
        .then(function(vip){
          if(vip && vip._id){
            isVip = true
          }
          return isVip
        })
    },
    insertMember : function(userId){
      let self =  this;
      return this.findOne({userId : userId,isDeleted:false})
        .then(function(vip){
          console.log(vip)
          if(!vip){
            return self.create({userId : userId})
          }else{
            return vip
          }
        })
    },
    /**
     * 获取会员用户
     * @param userIds
     * @returns {*}
     */
    getVipUsers: function (userIds) {
      const cond = {
        isDeleted: false,
        userId: {$in: userIds}
      };
      return this.find(cond)
        .then(function (users) {
          return users;
        });
    }
  }
};