/**
 * Created by yichen on 2017/5/7.
 */


var
  Promise = require('promise'),
  async = require('async'),
  _ = require('underscore'),
  Q = require("q"),
  commonUtil = require('../../lib/common-util'),
  constants = require('../configs/constants'),

  Shop = require('../models/Shop'),
  Promise = require('promise');



var ShopService = function () {
};
ShopService.prototype.constructor = ShopService;

ShopService.prototype.createOpShop = function (data){

  return Shop.create(data);
};
ShopService.prototype.getShopByUserId = function (userId){
  var condition = {
    isDeleted : false,
    userId : userId
  }
  return Shop.findOne(condition).exec();
};
ShopService.prototype.getShopById = function (id){
  var condition = {
    isDeleted : false,
    _id : id
  }
  return Shop.findOne(condition).exec();
};
ShopService.prototype.updateShopById = function (id , update){
  var condition = {
    isDeleted : false,
    _id : id
  }
  return Shop.findOneAndUpdate(condition,update,{new:true}).exec();
};
ShopService.prototype.updateShopByUserId = function (userId , update){
  var condition = {
    isDeleted : false,
    userId : userId
  }
  return Shop.findOneAndUpdate(condition,update,{new:true}).exec();
};

ShopService.prototype.query = function(conditions, pageSlice){
  return Shop.find(conditions,{},pageSlice)
}
module.exports = exports = new ShopService();




