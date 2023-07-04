/**
 * 通过excel数据生成会员服务
 * Created by fly on 2017－06－22.
 */

'use strict';
let _model = Backend.model('1/zlycare', undefined, 'vip_member_product');
let async = require('async');
let xlsx = require('node-xlsx');

module.exports = {
  __beforeAction: function () {
    let ip = getClientIp(this.req);
    if (ip.indexOf("127.0.0.1") == -1) {
      return this.fail("必须 127.0.0.1 启用 Controller");
    }
  },
  getAction: function () {
    var list = xlsx.parse("./data/senior_products_3.xls");
    var from = "ops@20170623";
    var data = list[0].data;
    var len = data.length;
    var counter = 0;
    var creator = 'ops@20170703';
    console.log("data length : " + data.length);
    var products = [];
    var errRows = [];
    //todo:  vipType zlycare | zlycare_vip
    var vipType = 'zlycare';
    if(!vipType){
      return this.fail('vipType is null');
    }
    var nowTS = 1498612439513; //
    for(var i = 1; i < len; i++){
      var meta = data[i] || {};
      var product = {
        vipType: vipType
      };
      product.type = meta[0] || '';
      product.subType = meta[1] || '';
      product.productName =  meta[2] || '';
      product.marketingPrice =  meta[3] ? (Math.round(meta[3] * 100)) / 100 : '';
      product.realPrice =  meta[4] ? (Math.round(meta[4] * 100)) / 100 : '';
      product.productDetail =  meta[5] || '';
      product.productPics =  meta[6] ? meta[6].split(',') : [];
      product.servicePeopleId =  '587595ac9fa133923a59d8e7';
      product.servicePeopleCall =  meta[7] || '4006182273';
      product.servicePeopleName =  meta[8] || '朱李叶健康会员服务助理';
      product.servicePeopleDocChatNum =  meta[9] || '801010866';
      product.servicePeopleImUserName =  '5941cc0cc94d071410661857';
      product.statisticsUpdatedAt = nowTS + 15 * 60 * 1000;

      product.creator = creator;

      if(!product.type || !product.subType || !product.productName || !product.realPrice || !product.marketingPrice) {
        errRows.push(product.type + product.subType + product.productName );
        break;
      }
      products.push(product);
    }
    _model.create(products);
    //console.log(products, products.length);
    return this.success('beginning.......' + errRows);
  }
}