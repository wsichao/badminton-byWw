/**
 * Created by guoyichen on 2017/1/4.
 */

var
    _ = require('underscore'),
    Q = require("q"),
    commonUtil = require('../../lib/common-util'),
    constants = require('../configs/constants'),

    Moment = require('../models/Moment'),
    Promise = require('promise');


var MomentService = function () {
};
MomentService.prototype.constructor = MomentService;

MomentService.prototype.createMoment = function (data){

    return Moment.create(data);
};

MomentService.prototype.getInfoByID = function (ID) {
    var condition = {};
    condition._id = ID;
    condition.isDeleted = false;

    return Moment.findOne(condition).populate("hongbao").populate('recommendedUser', 'name docChatNum shopVenderApplyStatus shopName').exec();
};

MomentService.prototype.getMomentByID = function (ID) {
    var condition = {};
    condition._id = ID;
    condition.isDeleted = false;

    return Moment.findOne(condition).exec();
};

MomentService.prototype.updateZanStatus = function (data) {
    var condition = {};
    condition._id = data.momentId;
    condition.isDeleted = false;
    console.log("zanUser:" + data.zanUser);
    console.log(typeof data.zanStatus);
    if(data.zanStatus == true){
        console.log(1);
        return Moment.findOneAndUpdate(condition, {$inc: {zanCount: 1},$push: {"zanUsers": data.zanUser}}, {new: true});
    }else{
        console.log(2);
        condition.zanCount = { $gt:0 } ;//防止点赞数为负;
        return Moment.findOneAndUpdate(condition, {$inc: {zanCount: -1},$pull: {"zanUsers": data.zanUser}}, {new: true});
    }
};

MomentService.prototype.updateShare = function (data,isInc,originId) {
    console.log(data);
    var condition = {};
    if(originId){
        condition._id = originId;
    }else{
        condition._id = data.momentId;
    }

    condition.isDeleted = false;
    var shareData = {};
    shareData.userId = data.userId;
    shareData.sharedType = data.sharedType;
    console.log(shareData);
    if(isInc){
        return Moment.findOneAndUpdate(condition, {$inc: {sharedCount: 1},$push: {"sharedUsers": shareData}}, {new: true}).exec();
    }else{
        return Moment.findOne(condition);
    }

};

/**
 * 返回动态列表信息
 * 仅需要返回必要信息即可
 * @param ID
 * @returns {Promise|Array|{index: number, input: string}}
 */
MomentService.prototype.getMomentListByUserId = function (ID,pageSlice) {
    var condition = {};
    condition.userId = ID;
    condition.isDeleted = false;

    return Moment.find(condition,Moment.publicFields,pageSlice).populate("hongbao","totalCount").exec();
    //return Moment.find(condition,Moment.publicFields,pageSlice).exec();
};

MomentService.prototype.getMomentListByUserIdandBookmark = function (ID,bookmark) {
  var condition = {};
  condition.userId = ID;
  condition.isDeleted = false;
  if(bookmark && bookmark > 0){
      condition.createdAt  = { $lt:bookmark }
  }
  return Moment.find(condition,Moment.publicFields).sort({createdAt:-1}).limit(20)
    .populate("hongbao","totalCount").populate('recommendedUser', 'name docChatNum shopVenderApplyStatus shopName').exec();
  //return Moment.find(condition,Moment.publicFields,pageSlice).exec();
};

MomentService.prototype.getMomentByIds = function (ids, option) {
    var condition = {};
    condition._id =  {$in: ids};
    condition.isDeleted = false;
    var fields = option && option.fields || Moment.publicFields;
    return Moment.find(condition,fields )
        .populate('recommendedUser', 'name docChatNum shopVenderApplyStatus shopName').exec();
};

MomentService.prototype.updateMomentInfo = function (momentId, update) {
    var condition = {};
    condition.isDeleted = false;
    condition._id = momentId;


    return Moment.update(condition, update).exec();
};


module.exports = exports = new MomentService();




