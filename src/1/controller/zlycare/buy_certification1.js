/**
 * Created by fly on 2017－05－22.
 */
"use strict";
let _service = Backend.service('1/zlycare', 'vip_service');
let _membership_service = Backend.service('1/membership', 'membership_card');
let product_catalog_service = Backend.service('1/zlycare', 'product_catalog_service');
let _vip_trade_service = Backend.service('1/zlycare', 'member_trade_service');
let dynamic_sample_service = Backend.service('1/recommend', 'dynamic_sample_service');
module.exports = {
  __beforeAction: function () {
      console.log("__beforeAction");

      if(!isUserInfoAuthorized(this.req)){
      return this.fail(8005);
    }
  },
  mockAction: function () {
    let resObj = {
      certification_title: '300元报销凭证',
      certification_code: '23412412414',
      certification_for: '本凭证可用于全基因组测序报销',
      certification_use: '出示报销码即获取300元优惠',
    }
    return this.success(resObj);
  },
  postAction: function () {
    console.log("bug_certification");
    let _self = this;
    let resObj = {
      certification_title: '',
      certification_code: '',
      certification_for: '',
      certification_use: ''
    }
    let req = this.req;
    let product_id = req.body.product_id;
    if(!product_id){
      return this.fail(8005);
    }
    let product = null;
    let membership_type = '';
    let code = '';//todo: 生成报销码

    let third_type_name = ''; //生成标签用
    //初始化报销样本
    let sample_info = {
      type: 2,
      action: 5, //默认购买失败
      tags: []
    }

    return limitApiCall(req.userId, 'buy_certification')//限制访问频率
    .then(function(isLimited){
      if(isLimited){
        throw getBusinessErrorByCode(8003);
      }
     return  _service.getVipProduct(product_id);
    })
    .then(function(_product) {
      //console.log(_product);
      if (!_product) {
        throw getBusinessErrorByCode(2410);
      }
      product = _product;
      //消耗会员额度.先判断消耗哪种类型的会员额度
      membership_type = product.vipType;

      sample_info.targetId = product._id + '';
      //查询报销产品二级目录
      if (!product.thirdType) return;
      return product_catalog_service.getSubTypeByThirdType(product.thirdType)
        .then(function (_third_type_name) {
          if (!_third_type_name)
            return;
          third_type_name = _third_type_name;
        })
    })
    .then(function(){
      if(!membership_type){
        throw getBusinessErrorByCode(2410);
      }
      console.log(req.userId, membership_type);
      //判断会员额度是否足够
      return _membership_service.getVipMembershipBalance(req.userId, membership_type);
    })
    .then(function(_res) {
      if (!_res || !_res[0] || !_res[0].balance || (_res.balance < product.realPrice)) {
        throw getBusinessErrorByCode(2411);
      }

      // if(){//常用药品报销不足
      //     2301
      // }
      return _vip_trade_service.genVipTradeCode();
    })
    .then(function(_code){
      code = _code;
      let options = {
        productId: product._id + '',
        productName: product.productName + '',
        code: code,
        marketingPrice: product.marketingPrice || 0
      }
      return _membership_service.consumedVipMembership(membership_type, req.userId, product.realPrice || 0, options);
    })
    .then(function(_res) {
      if (!_res || !_res.isConsumedSuccess) {
        throw getBusinessErrorByCode(2411);
      }

      if (!third_type_name) return;
      sample_info.action = 4;
      sample_info.tags = [third_type_name];
      return dynamic_sample_service.genSample(req.userId, sample_info);

    })
    .then(function(){
      resObj.certification_title = product.realPrice + '元报销凭证';
      resObj.certification_code = code;
      resObj.certification_for = '本凭证可用于' + (product.productName || '') + '报销' ;
      resObj.certification_use = '出示报销码即获取' + product.realPrice + '元优惠';
      resObj.certification_phone = product.servicePeopleCall || '';
      resObj.qrUrl = webHOST + qrToPath + '?zlycareCode=' + code;
      return _self.success(resObj);
    }, function(e){
      console.log(e);

      if (third_type_name){
        //生成失败的报销样本
        dynamic_sample_service.genSample(req.userId, sample_info);
      };

      return _self.fail(e.code);
    })
  }
}