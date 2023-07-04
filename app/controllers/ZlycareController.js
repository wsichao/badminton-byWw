/**
 * Created by lijinxia on 2017/9/5.
 */

var ProductCatalogService = require('../services/ProductCatalogService'),
  VipMemberProductsService = require('../services/VipMemberProductsService'),
  MembershipService = require('../services/MembershipService'),
  VipMemberTradesService = require('../services/VipMemberTradesService'),
  DynamicSampleService = require('../services/DynamicSamleService'),
  MessageCenterService = require('../services/MessageCenterService'),
  NotificationService = require('../services/NotificationService'),
  CustomerService = require('../services/CustomerService'),
  CommonInfoService = require('../services/CommonInfoService'),
  ApplicationService = require('../services/ApplicationService'),
  DoctorService = require('../services/DoctorService'),
  LoggerService = require('../services/LoggerService'),
  ValidateService = require('../services/ValidateService'),
  ReimburseService = require('../services/ReimburseService'),
  RegionService = require('../services/RegionService'),
  DrugService = require('../services/DrugService'),
  FactoryDrugRelService = require('../services/FactoryDrugRelService'),
  TagCodeService = require('../services/TagCodeService'),
  commonUtil = require('../../lib/common-util'),
  request = require('request'),
  encrypt = commonUtil.commonMD5,
  serverConfigs = require('../configs/server'),
  DoctorModel = require('../models/Doctor'),
  CustomerModel = require('../models/Customer'),
  AdvertiseRelService = require('../services/AdvertiseRelService'),
  ServicePackageDoctorService = require('../services/service_package/servicePackageDoctorService'),
  ServicePackageOrderService = require('../services/service_package/servicePackageOrderService'),
  ServicePackageService = require('../services/service_package/servicePackageService'),
  MakeAppointmentOrderService = require('../services/service_package/makeAppointmentOrderService'),
  servicePackageDoctorRefSreivce = require('../services/service_package/servicePackageDoctorRefSreivce'),
  TransactionController = require('./TransactionController'),
  TransactionMysqlService = require('../services/TransactionMysqlService'),
  PayService = require('../services/PayService'),
  OrderService = require('../services/OrderService'),
  FactoryService = require('../services/FactoryService'),
  SocialRelService = require('../services/SocialRelService'),

  // groupService = require(''),
  // product_catalog_service = require('../../src/1/zlycare/service/product_catalog_service'),
  // membership_card_service = require('../../src/1/membership/service/membership_card'),
  // dynamic_sample_service = require('../../src/1/recommend/service/dynamic_sample_service'),
  // member_trade_service = require('../../src/1/zlycare/service/member_trade_service'),
  _ = require('underscore'),
  util = require('util'),
  apiHandler = require('../configs/ApiHandler'),
  ErrorHandler = require('../../lib/ErrorHandler'),
  constants = require('../configs/constants'),
  Server = require('../configs/server'),
  httpHandler = require('../../lib/CommonRequest'),
  configs = require('../configs/api'),
  async = require('async'),
  Promise = require('promise'),
  bson = require('bson'),
  co = require('co'),
  appId = constants.wxConfig.appId,
  secret = constants.wxConfig.secret,
  noncestr = 'Wm3WZYTPz34dsfkjkd', //TODO 随即生成
  jsApiList = ['onMenuShareTimeline', 'onMenuShareAppMessage'],
  // proxy = require('../configs/rpc').proxy,
  adUrlTest = constants.AdvertiseInfoTest.url + '/' + constants.AdvertiseInfoTest.router + '?source=' + constants.AdvertiseInfoTest.source + '&slotid=',
  adUrl = constants.AdvertiseInfo.url + '/' + constants.AdvertiseInfo.router + '?source=' + constants.AdvertiseInfo.source + '&slotid=';
ZlycareController = function () {

};

ZlycareController.prototype.constructor = ZlycareController;

ZlycareController.prototype.types = function (req, res) {
  var vipType = req.query.vipType || 'zlycare';
  var region = req.query.region || '';

  var cond = {
    online: 1,
    status: 1,
    thirdType: { $ne: '' },
    isDeleted: false,
    vipType: vipType
  };
  var typeMap = {};
  var subTypeMap = {};

  var firstTypesArr = [], secondTypesArr = [], thirdTypesArr = [];

  if (region) {
    cond.productSalesArea = region;
  }
  VipMemberProductsService.getVipMemberProductsByCon(cond)
    .then(function (_v) {
      var thirdTypeIds = [];
      _v.forEach(function (item) {
        if (item.thirdType) {
          thirdTypeIds.push(item.thirdType);
        }
      });

      console.log('_v', thirdTypeIds);
      return ProductCatalogService.getProductCatalogByCon({
        _id: { $in: thirdTypeIds },
        isDeleted: false,
        // show: 1,
        "vipType": vipType
      }, '_id name parentId');//查找三级目录
    })
    .then(function (_third) {
      console.log('_third', _third);
      thirdTypesArr = _third;
      var secondTypeIds = _.map(_third, function (item) {
        console.log('item', item);
        return item.parentId;
      });
      console.log('secondTypeIds', secondTypeIds);

      return ProductCatalogService.getProductCatalogByCon({
        $or: [{ _id: { $in: secondTypeIds } }, { parentId: '1' }],
        "vipType": vipType
      });
    })
    .then(function (_firstAndSecond) {
      console.log('_firstAndSecond', _firstAndSecond);
      _firstAndSecond.forEach(function (item) {
        if (item.parentId == '1') {
          firstTypesArr.push(item);
        } else {
          secondTypesArr.push(item);
        }
      });


      for (var i = 0; i < secondTypesArr.length; i++) {
        secondTypesArr[i].third_types = [];
        for (var j = 0; j < thirdTypesArr.length; j++) {
          if (secondTypesArr[i]._id + '' == thirdTypesArr[j].parentId) {

            secondTypesArr[i].third_types.push({
              third_type_id: thirdTypesArr[j]._id + '',
              third_type_name: thirdTypesArr[j].name
            });
          }
        }
      }

      console.log('secondTypesArrsecondTypesArr', secondTypesArr);

      var items = [];
      firstTypesArr.forEach(function (item) {
        items.push({ type_id: item._id, type_name: item.name, type_image: item.image });
      });


      for (var i = 0; i < items.length; i++) {
        items[i].sub_types = [];
        for (var j = 0; j < secondTypesArr.length; j++) {
          if (items[i].type_id + '' == secondTypesArr[j].parentId) {

            items[i].sub_types.push({
              sub_type_id: secondTypesArr[j]._id,
              sub_type_name: secondTypesArr[j].name,
              third_types: secondTypesArr[j].third_types
            });
          }
        }
      }

      //没有药品时，一级目录也不展示
      var retData = [];
      for (var k = 0; k < items.length; k++) {
        if (items[k].sub_types.length != 0) {
          retData.push(items[k]);
        }
      }
      apiHandler.OK(res, { items: retData });
    }, function (err) {
      apiHandler.handleErr(res, err);
    });
  // ProductCatalogService.getProductCatalog(cond)
  //     .then(function (_items) {
  //         console.log('_items:', _items);
  //         _items = _items || [];
  //
  //
  //         var item_group_map = _.groupBy(_items, function (_item) {
  //             return _item.parentId;
  //         });
  //         var items = item_group_map['1'];
  //         if (!items) {
  //             return [];
  //         }
  //         var res_items = [];
  //         items.forEach(function (item) {
  //             var sub_types = item_group_map['' + item._id];
  //             if (!sub_types) {
  //                 return;
  //             }
  //             var sub_items = [];
  //             for (var i = 0; i < sub_types.length; i++) {
  //                 var sub_type = sub_types[i];
  //                 if (!item_group_map[sub_type._id + '']) {
  //                     continue;
  //                 }
  //                 var third_types = item_group_map[sub_type._id + ''].map(function (third_type) {
  //                     return {
  //                         third_type_id: third_type._id + '',
  //                         third_type_name: third_type.name || '',
  //                     }
  //                 })
  //                 var sub_item = {
  //                     sub_type_id: sub_type._id + '',
  //                     sub_type_name: sub_type.name || '',
  //                     third_types: third_types
  //                 }
  //                 sub_items.push(sub_item);
  //             }
  //             item = {
  //                 type_id: item._id + '',
  //                 type_name: item.name + '',
  //                 sub_types: sub_items
  //             }
  //             res_items.push(item);
  //         })
  //         console.log('erferferfr', res_items);
  //         // return res_items;
  //
  //         apiHandler.OK(res, res_items);
  //     }, function (err) {
  //         apiHandler.handleErr(res, err);
  //     });
};


ZlycareController.prototype.getMemberInfo = function (req, res) {

  var type = req.query.type;
  if (!type) {
    return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
  }
  var typeMap = {
    'senior': 'zlycare',
    'vip': 'zlycare_vip'
  }
  var resObj = {
    value: 600
  }
  MembershipService.getVipMembershipBalance(req.userId, typeMap[type] || type)
    .then(function (_res) {
      apiHandler.OK(res, {
        value: _res && _res[0] ? (_res[0].balance || 0) : -1,
        normalValue: _res && _res[0] ? (_res[0].normalValue || 0) : -1
      });
    }, function (err) {
      apiHandler.handleErr(res, err);
    });

};


/**
 *是否是常用药品
 * @param id
 * @returns {Promise|Array|{index: number, input: string}|*}
 */
var isNormal = function (id) {
  // var id='595c9b5e0dd25d4927f2184b'; //测试
  return VipMemberProductsService.getVipMemberProductsById(id)
    .then(function (_p) {
      console.log('_p', _p);
      if (_p) {
        return ProductCatalogService.getParentIdByThirdType(_p.thirdType);
      } else {
        return null;
      }
    })
    .then(function (_catalog) {
      if (_catalog) {
        console.log('_catalog', _catalog);
        if (_catalog.parentId == 1) {
          return _catalog;
        } else {
          return ProductCatalogService.getParentIdByThirdType(_catalog.parentId);
        }
      } else {
        return _catalog;
      }

    })
    .then(function (_catalog) {
      if (_catalog) {
        if (_catalog.parentId == 1) {
          return _catalog;
        } else {
          return ProductCatalogService.getParentIdByThirdType(_catalog.parentId);
        }
      } else {
        return _catalog;
      }

    })
    .then(function (_catalog) {
      if (_catalog) {
        if ((_catalog.parentId == 1) && (_catalog.name == '常用药品')) {
          console.log('truetrue');
          return true;
        } else {
          console.log('false');
          return false;
        }
      } else {
        console.log('在目录中找不到该药品');
        return false;//在目录中找不到该药品
      }

    });
};
ZlycareController.prototype.isNormal = isNormal;


ZlycareController.prototype.getServices = function (req, res) {

  var query = req.query;
  var vipType = query.vipType || 'zlycare';
  var thirdTypeId = query.thirdTypeId || '';
  var region = query.region || '';
  var keyword = query.keyword || '';
  var reg = new RegExp(keyword, 'i');
  var pageSlice = commonUtil.getCurrentPageSlice(req, 0, 20, { expiredAt: -1 });
  var cond = {
    vipType: vipType
  }
  if (thirdTypeId) {
    cond.thirdType = thirdTypeId;
  }
  if (region) {
    cond.productSalesArea = region;
  }

  if (keyword) {
    cond.productName = reg;
  }
  var items = [];
  console.log('cond', cond);
  VipMemberProductsService.getVipServicesByCond(cond, pageSlice)
    .then(function (_items) {
      items = _items;
      // if (items && (items.length > 0)) {
      //     console.log('items.length1', _items.length);
      //     console.log('items[0]._id', items[0]._id);
      //     return isNormal(items[0]._id);
      // } else {
      return false;//是否是常用药品，全部返回false
      // }

    })
    .then(function (_isNormal) {

      console.log('items.length', items.length);
      console.log('_isNormal', _isNormal);
      var retData = _.map(items, function (item) {
        return {
          product_id: item._id + '',
          product_name: item.productName || '',
          product_detail: item.productDetail || '',
          product_pics: item.productPics || [],
          marketing_price: item.marketingPrice,
          real_price: item.realPrice,
          service_people_id: item.servicePeopleId || '',
          service_people_call: item.servicePeopleCall || '',
          service_people_name: item.servicePeopleName || '',
          service_people_chat_num: item.servicePeopleDocChatNum || '',
          im_user_name: item.servicePeopleImUserName || '',
          isNormal: _isNormal,
          instruction: '1.点击"电话咨询"，联系平台服务助理\n2.服务助理会与您确认具体服务项目及服务流程'
        }
      });

      console.log('返回值', retData);
      apiHandler.OK(res, {
        items: retData
      });

    }, function (err) {
      apiHandler.handleErr(res, err);
    });

  // MemberShipService.getVipMembershipBalance(req.userId, typeMap[type] || type)
  //     .then(function (_res) {
  //         apiHandler.OK(res, {
  //             value: _res && _res[0] ? (_res[0].balance || 0) : -1,
  //             normalValue: _res && _res[0] ? (_res[0].normalValue || 0) : -1
  //         });
  //     }, function (err) {
  //         apiHandler.handleErr(res, err);
  //     });

};


ZlycareController.prototype.buyCertification = function (req, res) {
  var userId = req.identity ? req.identity.userId : '';
  var payload = req.body;
  var fields = {
    required: [],
    optional: []
  };
  console.log("bug_certification");
  var resObj = {
    certification_title: '',
    certification_code: '',
    certification_for: '',
    certification_use: ''
  }
  var product_id = payload.product_id;
  if (!product_id) {
    return this.fail(8005);
  }
  var product = null;
  var membership_type = '';
  var code = '';//todo: 生成报销码

  var third_type_name = ''; //生成标签用
  //初始化报销样本
  var sample_info = {
    type: 2,
    action: 5, //默认购买失败
    tags: []
  }

  var onFailure = function (handler, type) {
    handler(res, type);
  };
  var onSuccess = function (handler, data) {

    var balance, isNormalFlag = false, tradeId = '';
    limitApiCall(userId, 'buy_certification')//限制访问频率
      .then(function (isLimited) {
        if (isLimited) {
          // throw getBusinessErrorByCode(8003);
          throw ErrorHandler.getBusinessErrorByCode(8003);
        }
        return VipMemberProductsService.getVipProduct(product_id);
      })
      .then(function (_product) {
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
        return ProductCatalogService.getSubTypeByThirdType(product.thirdType)
          .then(function (_third_type_name) {
            if (!_third_type_name)
              return;
            third_type_name = _third_type_name;
          })
      })
      .then(function () {
        if (!membership_type) {
          // throw getBusinessErrorByCode(2410);
          throw ErrorHandler.getBusinessErrorByCode(2410);
        }
        console.log(userId, membership_type);
        //判断会员额度是否足够
        return MembershipService.getVipMembershipBalance(userId, membership_type);
      })
      .then(function (_res) {
        console.log('_res', _res);
        if (!_res || !_res[0] || !_res[0].balance || (_res.balance < product.realPrice)) {
          // throw getBusinessErrorByCode(2411);
          throw ErrorHandler.getBusinessErrorByCode(2411);
        }
        balance = _res[0];

        return isNormal(product_id);//常用药品报销不足
      })
      .then(function (_isNormal) {
        console.log('product.realPrice', product.realPrice);
        console.log('balance.normalValue', balance.normalValue);
        if (_isNormal && balance.normalValue < product.realPrice) {
          throw ErrorHandler.getBusinessErrorByCode(2301);
        }
        isNormalFlag = _isNormal;
        return VipMemberTradesService.genVipTradeCode();
      })
      .then(function (_code) {
        code = _code;
        var options = {
          productId: product._id + '',
          productName: product.productName + '',
          code: code,
          marketingPrice: product.marketingPrice || 0
        }
        return MembershipService.consumedVipMembership(membership_type, userId, product.realPrice || 0, isNormalFlag, options);
      })
      .then(function (_res) {
        console.log('报销返回值', _res);
        if (!_res || !_res.isConsumedSuccess) {
          // throw getBusinessErrorByCode(2411);
          throw ErrorHandler.getBusinessErrorByCode(2411);
        }

        if (!third_type_name) return;
        tradeId = _res.tradeId;
        sample_info.action = 4;
        sample_info.tags = [third_type_name];
        return DynamicSampleService.genSample(userId, sample_info);

      })
      .then(function () {
        resObj._id = tradeId;
        // resObj.certification_title = product.realPrice + '元报销凭证';
        resObj.certification_title = product.realPrice + '元报销券';
        resObj.certification_code = code;
        // resObj.certification_for = '本凭证可用于' + (product.productName || '') + '报销';
        // resObj.certification_use = '出示报销码即获取' + product.realPrice + '元优惠';
        resObj.certification_for = '此券可用于报销“ ' + (product.productName || '') + '”';
        resObj.certification_use = '商家扫码后，可为你报销' + product.realPrice + '元';
        resObj.certification_phone = product.servicePeopleCall || '';
        resObj.qrUrl = webHOST + qrToPath + '?zlycareCode=' + code;

        console.log('返回值', resObj);
        apiHandler.OK(res, resObj);
        // return _self.success(resObj);
      }, function (e) {
        console.log(e);

        if (third_type_name) {
          //生成失败的报销样本
          DynamicSampleService.genSample(userId, sample_info);
        }
        apiHandler.handleErr(res, e);
        // return _self.fail(e.code);
      })
  };
  commonUtil.validate(payload, fields, onSuccess, onFailure);
};
/**
 * 获得微信内二次分享的JS配置信息
 * TODO 最好把分享的内容也发送给web端
 * @param req
 * @param res
 */
ZlycareController.prototype.getWXConfig = function (req, res) {

  var reqWebUrl = req.query.url;

  if (!Server.WX_TICKET || ((Date.now() - Server.WX_TICKET_TIME) > constants.TIME2H)) {
    var tokenPath = '/cgi-bin/token?grant_type=client_credential&appid=' + appId + '&secret=' + secret;
    httpHandler.sendRequest(httpHandler.genOptions('api.weixin.qq.com', null, tokenPath, 'GET', null, null), null, function (error) {

    }, function (data) {
      data = JSON.parse(data);

      console.log('data', data);
      var ticketPath = '/cgi-bin/ticket/getticket?access_token=' + data.access_token + '&type=jsapi';
      httpHandler.sendRequest(httpHandler.genOptions('api.weixin.qq.com', null, ticketPath, 'GET', null, null), null, function (error) {

      }, function (data) {
        Server.WX_TICKET = JSON.parse(data).ticket;
        Server.WX_TICKET_TIME = Date.now();

        resWXJSConfig(res, reqWebUrl);
      });
    });
  } else {
    resWXJSConfig(res, reqWebUrl);
  }
};

var resWXJSConfig = function (res, reqWebUrl) {
  var timestamp = Math.ceil(Date.now() / 1000);
  var sha1String = "jsapi_ticket=" + Server.WX_TICKET + "&noncestr=" + noncestr + "&timestamp=" + timestamp + "&url=" + reqWebUrl;
  var signature = commonUtil.sha1(sha1String, "", false);

  var resData = {
    debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
    appId: appId,
    timestamp: timestamp,
    nonceStr: noncestr,
    jsApiList: jsApiList,
    signature: signature
  };
  apiHandler.OK(res, resData);
};


/**
 * 热搜词
 * 参数count是返回热词个数，默认是10
 * @param req
 * @param res
 */
ZlycareController.prototype.hotSearch = function (req, res) {
  var userId = req.identity ? req.identity.userId : '';
  var deviceId = req.headers[constants.HEADER_DEVICE_ID] || '';
  if (!userId && !deviceId) {
    return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(3001));
  }
  var uuid = userId || deviceId;
  proxy.get_hotkeywords().then(function (err, result) {
    if (err) apiHandler.handleErr(res, err);

    if (result) {
      apiHandler.OK(res, { hot: result });
    }

  });

};
/**
 * get_categories
 * 导航栏信息
 * @param req
 * @param res
 */
ZlycareController.prototype.banner = function (req, res) {
  var userId = req.identity ? req.identity.userId : '';
  var deviceId = req.headers[constants.HEADER_DEVICE_ID] || '';
  if (!userId && !deviceId) {
    return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(3001));
  }
  var uuid = userId || deviceId || '';

  // proxy.on_result(proxy.get_categories(uuid), function (err, result) {
  proxy.get_categories().then(function (err, result) {
    if (err) apiHandler.handleErr(res, err);

    console.log('errdvevever', result);

    if (result) {
      /* EVAN CHANGE BEGIN */
      /*
       var categoryArr = _.uniq(result, 'category1');
       var category1 = [], loc1 = 0, index1 = 0;

       for (var j = 0; j < categoryArr.length; j++) {
       category1[index1] = {};
       category1[index1].name = '';
       category1[index1].ids = [];
       for (var k = 0; k < result.length; k++) {
       if (categoryArr[j].category1 == result[k].category1) {
       category1[index1].name = categoryArr[j].category1;
       category1[index1].ids.push(result[k].id);
       }
       }
       index1++;
       }
       */
      var sortedCategories = _.sortBy(result, 'id');
      var category1NamesWithOrder = _.uniq(_.map(sortedCategories, (dict) => {
        return dict.category1
      }));
      var groupedCategories = _.groupBy(result, 'category1');
      var groupedCategoriesWithIds = _.mapObject(groupedCategories, (val, key) => {
        return _.map(val, (dict) => {
          return dict.id
        });
      });
      var category1 = _.map(category1NamesWithOrder, (name) => {
        return { 'name': name, 'ids': groupedCategoriesWithIds[name] };
      });

      category1.unshift({ 'name': '推荐', 'ids': [-1] });

      /* EVAN CHANGE END */

      //二级目录显示
      // var index2=0;
      // for(var i=0;i<category1.length;i++){
      //         index2=0;
      //     for(var j=0;j<result.length;j++){
      //         if(category1[i].name==result[j].category1){
      //             if(category1[i].sub){
      //                 if(_.indexOf(category1[i].sub,result[j].category2)>-1){
      //                     category1[i].sub[index2].ids.push(result[j].id);
      //                 }else{
      //                     category1[i].sub[index2]={};
      //                     category1[i].sub[index2].name=result[j].category2;
      //                     category1[i].sub[index2].ids=[];
      //                     category1[i].sub[index2].ids.push(result[j].id);
      //                 }
      //             }else{
      //                 category1[i].sub=[];
      //                 index2=0;
      //                 category1[i].sub[index2]={};
      //                 category1[i].sub[index2].ids=[];
      //                 category1[i].sub[index2].name=result[j].category2;
      //                 category1[i].sub[index2].ids.push(result[j].id);
      //
      //             }
      //             index2++;
      //         }
      //     }
      // }
      apiHandler.OK(res, { banner: category1 });
    }

  });
};
/**
 * 关键词搜索
 * lookup_article
 * @param req
 * @param res
 */
ZlycareController.prototype.search = function (req, res) {
  var userId = req.identity ? req.identity.userId : '';
  var deviceId = req.headers[constants.HEADER_DEVICE_ID] || '';
  var key = req.query.key || '';
  var pageNum = Number(req.query.pageNum) || 0;
  var pageSize = Number(req.query.pageSize) || configs.pageSize20;


  if (!userId && !deviceId) {
    return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(3001));
  }

  var uuid = userId || deviceId;
  var reg = /[,:@#。 ]/;
  var keyArr = key.split(reg);
  console.log(keyArr); //输出[ 'aaa', 'bbb', 'ccc', 'ddd', 'eee' ] 这才是用正则的强大之处

  keyArr = _.filter(keyArr, function (d) {
    if (d) return d
  });


  var items = [];
  console.log('去除空格', keyArr);
  proxy.lookup_article(pageSize, pageNum, keyArr, uuid).then(function (err, result) {
    if (err) apiHandler.handleErr(res, err);

    console.log('fewfef', result);
    var retData = [];
    if (result) {
      for (var i = 0; i < result.length; i++) {
        retData[i] = {};
        retData[i].desc = result[i].abstract || '朱李叶健康头条';
        retData[i].createdAt = (new Date((new Date(result[i].publish_date)).format('yyyy-MM-dd hh:mm:ss'))).getTime();
        retData[i].title = result[i].title || '';
        retData[i].pics = result[i].image_links || [];
        retData[i].user_name = result[i].source_name || '';
        retData[i].moment_id = result[i].id;
        retData[i].displayURL = [{ url: '', text: '【 ' + result[i].title + '】' }];

        retData[i].authorId = result[i].author_id || '';
        retData[i].authorName = result[i].author_name || '';
        retData[i].authorType = result[i].author_type || '';
        retData[i].formatType = result[i].format_type || '';


      }
      apiHandler.OK(res, { items: retData });
    }

  });

  // var retData = [
  //     {
  //         "createdAt": 1504752196704,
  //         "pics": [
  //             "FrWmu8vktgqzLYTS-ESLi8LhyKpG"
  //         ],
  //         title: '玉米比白米饭好，减肥降三高？很多人都吃错了',
  //         desc: '喜欢吃玉米的人肯定不少。黄白紫各种颜色，脆糯硬各种口感，味道也分甜和不甜',
  //         "user_name": "食疗食补",
  //         "moment_id": "59b0b244e0f9bd5d63a68716",
  //         "displayURL": [
  //             {
  //                 "url": "",
  //                 "text": "【玉米比白米饭好，减肥降三高？很多人都吃错了】\n作者：史军，转载自《丁香医生》\n\n喜欢吃玉米的人肯定不少。黄白紫各种颜色，脆糯硬各种口感，味道也分甜和不甜，玉米家族也真是让人眼花缭乱。很多人把玉米当成粗粮吃，而且还喜欢「物尽其用」，把玉米须也用来煮水喝，期待这样可以降血压。玉米真的这么好吗？我们今天就来说说。\n\n玉米是粗粮吗？\n没那么「粗」不少人把玉米当作一种粗粮，但是我们需要注意的是，玉米并没有大多数人想象得那么「粗」。尤其是有糖尿病的朋友需要注意：新鲜玉米的升糖指数约 70，属于比较高的升血糖食物。所以，千万不要被它们略显粗糙的口感所蒙蔽，一定要注意控制摄入量，避免血糖控制不佳。不同的玉米品种对血糖的影响也不同，一般来说，黏玉米更容易升血糖。\n\n另外，深度粉碎且长时间熬煮的玉米粥，消化吸收起来很快，升血糖的作用也更快。因此，如果你想减肥或者控制血糖，吃玉米的时候要注意两点：\n\n要注意吃玉米的量，不要一次吃太多，吃了玉米也要相应减少主食的量；选择非糯性的粗磨玉米碴，熬粥的时间短一点。这样做，才更有利于控制血糖。\n\n玉米可以当主食吗？\n玉米当然可以做主食。作为植物的籽粒，就像小麦和水稻一样，玉米中也蕴含了大量的营养物质，以备种子萌发所需。和小麦、水稻一样，玉米里最多的成分是淀粉。新鲜玉米中，碳水化合物占到干物质的 74%，伴随有 9.4% 的蛋白质。正因为营养丰富，早在 3000 年前玉米就已经被美洲的玛雅人当做自己的主食了。所以，如果一餐中有了玉米，就要相应减少米、面等其它主食的量。\n\n玉米须煮水\n能降血压、降血脂？并不能！所谓的玉米须其实是玉米的花粉管，作为植物繁殖器官的一部分，玉米须确实含有复杂的化学成分，比如黄酮类物质、氨基酸、矿物质以及部分氨基酸。\n\n但是这些物质就目前来看，很难直接作用于人体的代谢系统。在人类身上是否有效，还是个未知数。就更别说，仅有的几个动物实验本身，都存在样本量过少、没有后续重复实验等诸多问题了。简单来说就是，玉米须煮水的降三高的功效，目前为止仍缺乏确切的证据。喝一点是可以，但别因为这个，耽误正常用药。\n\n煮玉米时加点它味道好到不得了\n\n1. 加点盐！但不要太多\n煮玉米时，在水开后，往里面加少许盐。少许的咸味，能够更加突显玉米本身的清甜的味道，入口之后，味道会更好！\n\n2. 加点碱！更有营养\n加一点小苏打，可以让玉米粒中所含的烟酸释放出来，让玉米更有营养。如果不经碱性溶液处理，玉米籽粒中所含的烟酸就无法释放出来。\n\n不过，如果之前煮玉米的时候都忘记加了，也没有关系，毕竟咱们中国人饮食很丰富，也可以从别的食物中获取足够的烟酸。\n\n3. 煮之前先泡一会儿\n煮玉米前，可以先泡上 20 分钟左右，再开大火煮熟。带着薄衣煮，则可以保存下来一种独特的谷物清香。甜玉米（明黄色）和老玉米在水开后需要再煮上 8 分钟左右，黏玉米（白色的）通常要煮得更久一些，水开后再煮上至少 10 分钟。 煮熟后，记得把玉米捞出，沥干水分。长时间泡在水里，玉米的味道和口感会变得不好。\n\n总结一下：玉米挺有营养也很好吃，但别指望用玉米须煮水来控三高，糖尿病患者更是要注意别吃太多。如果做了松仁玉米、玉米烙等菜，记得要减少一些主食。\n\n现在，就可以开心吃玉米啦！"
  //             }
  //         ]
  //     }];
  // apiHandler.OK(res, {items: retData});

};
/**
 * 文章详情
 * get_article
 * @param req
 * @param res
 */
ZlycareController.prototype.pageDetail = function (req, res) {
  var userId = req.identity ? req.identity.userId : '';
  var deviceId = req.headers[constants.HEADER_DEVICE_ID] || '';
  var pageId = req.query.pageId || '';

  console.log('参数校验', !userId, !deviceId);
  if (!userId && !deviceId) {
    return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(3001));
  }
  if (!pageId) {
    return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(3001));
  }
  var uuid = userId || deviceId || '';
  var retData = {};
  proxy.get_article(pageId, uuid).then(function (err, result) {
    if (err) apiHandler.handleErr(res, err);
    console.log('文章详情错误', err);
    console.log('resultresult', result);

    if (result) {

      retData.title = result.title || '';
      // var temp = result.content.replace(/<[^>]+>/g,"");
      // temp=temp.replace(/\s/g,"");
      // retData.desc=temp.substr(0,50);
      retData.desc = result.abstract || '朱李叶健康头条';
      retData.viewNum = result.view_count || 0;
      retData.createdAt = (new Date((new Date(result.publish_date)).format('yyyy-MM-dd hh:mm:ss'))).getTime();
      retData.pics = result.image_links || [];
      retData.user_name = result.source_name || '';
      retData.moment_id = result.id;
      retData.mainBody = result.content;


      retData.authorId = result.author_id || '';
      retData.authorName = result.author_name || '';
      retData.formatType = result.format_type;


      if (result.format_type == 'imagetext') {
        console.log('有大图');
        retData.bigMainBody = [];
        retData.pics = [];
        for (var i = 0; i < result.format_data.length; i++) {
          retData.bigMainBody.push(result.format_data[i].text);
          retData.pics.push(result.format_data[i].image);
        }
      }

      retData.authorType = result.author_type || '';
      // retData.authorType = 'doctor';
      var drug_activity_service = Backend.service('activity', 'drug_activity');
      drug_activity_service.get_random_avtivity_by_article(pageId)
        .then(function (activity_id) {
          retData.activity_id = activity_id || '';
          //console.log('文章的返回值',retData);
          apiHandler.OK(res, retData);
        })

    }
  })
};
/**
 * 文章点赞
 * @param req
 * @param res
 */
ZlycareController.prototype.approve = function (req, res) {
  var userId = req.identity ? req.identity.userId : '';
  // var deviceId = req.headers[constants.HEADER_DEVICE_ID] || '';

  console.log('进入点赞');
  var payload = req.body;
  var fields = {
    required: ['pageId']
  };

  var onFailure = function (handler, type) {
    handler(res, type);
  };
  var onSuccess = function (handler, data) {
    var pageId = Number(data.pageId || 0);
    if (!userId && !pageId) {
      return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(3001));
    }

    proxy.useraction_like_article(userId, pageId).then(function (err, result) {
      if (err) apiHandler.handleErr(res, err);

      console.log('fewfef', result);

      apiHandler.OK(res);
    });
  };

  commonUtil.validate(payload, fields, onSuccess, onFailure);
};
/**
 * 取消点赞
 * @param req
 * @param res
 */
ZlycareController.prototype.disApprove = function (req, res) {
  var userId = req.identity ? req.identity.userId : '';
  // var deviceId = req.headers[constants.HEADER_DEVICE_ID] || '';

  var payload = req.body;
  var fields = {
    required: ['pageId']
  };
  console.log('进入取消点赞');
  var onFailure = function (handler, type) {
    handler(res, type);
  };
  var onSuccess = function (handler, data) {
    var pageId = Number(data.pageId || 0);
    if (!userId && !pageId) {
      return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(3001));
    }


    proxy.useraction_remove_like_article(userId, pageId)
      .then(function (err, result) {
        if (err) apiHandler.handleErr(res, err);

        console.log('fewfef', result);

        apiHandler.OK(res);
      });
  };

  commonUtil.validate(payload, fields, onSuccess, onFailure);

};
/**
 * 通过药品ID，获取药品详情
 * 不在健康商城中展示的药品，也是可以显示的
 * @param req
 * @param res
 */
ZlycareController.prototype.getProductInfo = function (req, res) {
  var userId = req.identity ? req.identity.userId : '';
  var productId = req.query.productId;
  var product, retData = {};

  if (!productId) {
    return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(3001));
  }
  VipMemberProductsService.getVipProduct(productId)
    .then(function (_p) {
      if (!_p) {
        throw ErrorHandler.getBusinessErrorByCode(2302);
      }
      product = JSON.parse(JSON.stringify(_p));
      return isNormal(_p._id);
    })
    .then(function (_n) {
      console.log('_n', _n);
      console.log('product', product);
      retData.product_id = product._id;
      retData.product_name = product.productName;
      retData.product_detail = product.productDetail;
      retData.product_pics = product.productPics;
      retData.marketing_price = product.marketingPrice;
      retData.real_price = product.realPrice;
      retData.service_people_id = product.servicePeopleId;
      retData.service_people_call = product.servicePeopleCall;
      retData.service_people_name = product.servicePeopleName;
      retData.service_people_chat_num = product.servicePeopleDocChatNum;
      retData.im_user_name = product.servicePeopleImUserName;
      retData.isNormal = _n;
      retData.instruction = '1.点击"电话咨询"，联系平台服务助理\n2.服务助理会与您确认具体服务项目及服务流程';

      apiHandler.OK(res, retData);
    }, function (err) {
      apiHandler.handleErr(res, err);
    });
};

/**
 * 头条文章列表
 * userId   用户ID
 bannerIds   分类数组
 pageNum  第几页
 * @param req
 * @param res
 */
ZlycareController.prototype.pageList = function (req, res) {

  var userId = req.identity ? req.identity.userId : '';
  var deviceId = req.headers[constants.HEADER_DEVICE_ID] || '';
  var bannerIds = req.query.bannerIds;
  var pageNum = Number(req.query.pageNum) || 0;
  var pageSize = Number(req.query.pageSize) || configs.pageSize20;
  var isNeedTop = req.query.isNeedTop;


  if (!userId && !deviceId) {
    return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(3001));
  }
  var uuid = userId || deviceId || '';

  /* EVAN CHANGE BEGIN */
  var categoryIds = [];
  if (bannerIds) {
    bannerIds.split(',').forEach((n) => {
      num = Number(n);
      if (num != -1)
        categoryIds.push(num);
    });
  }
  bannerIds = categoryIds;

  /*if (bannerIds) {
   bannerIds = bannerIds.split(',');
   for (var i = 0; i < bannerIds.length; i++) {
   bannerIds[i] = Number(bannerIds[i]);
   }
   } else {
   bannerIds = [];
   }*/
  /* EVAN CHANGE END */

  var retData = [];
  console.log('参数：', pageSize, pageNum, bannerIds, uuid);
  var stickyNum = 0;
  if (isNeedTop == '1') {
    stickyNum = 1;
  }
  var areas = [], authorNames = [];

  Promise.resolve()
    .then(function () {
      if (userId) {
        return CustomerService.getInfoByID(userId);
      } else {
        return null;
      }
    })
    .then(function (_user) {
      if (_user && _user.location && _user.location.city) {
        areas.push(_user.location.city)
      }
      if (_user && _user._id) {
        if (_user.bossType == 'tagCodeUserGroup') {
          return Backend.service('tag_code_user_group', 'channelGroup').getChannelGroupArticles(_user._id);
        } else {
          let groupService = require('../../src/user_group/service/group');
          return groupService.getGroupArticles(_user._id);
        }
      }
    })
    .then(function (_groupArticles) {
      console.log('_groupArticles')
      console.log(_groupArticles)
      let groupArticles = [];

      for (let key in _groupArticles) {
        groupArticles.push(Number(_groupArticles[key]));
      }
      // let groupArticles=_groupArticles||[];
      console.log('用户信息流，地区', groupArticles);

      proxy.get_article_list(pageSize, pageNum, bannerIds, uuid, stickyNum, 1, areas, authorNames, groupArticles)
        .then(function (err, result) {
          if (err) apiHandler.handleErr(res, err);


          if (result) {
            // console.log('头条列表的返回结果', result);
            for (var i = 0; i < result.length; i++) {
              retData[i] = {};
              retData[i].desc = result[i].abstract || '朱李叶健康头条';
              retData[i].createdAt = (new Date((new Date(result[i].publish_date)).format('yyyy-MM-dd hh:mm:ss'))).getTime();
              retData[i].title = result[i].title || '';
              retData[i].pics = result[i].image_links || [];
              retData[i].user_name = result[i].source_name || '';
              retData[i].moment_id = result[i].id;
              retData[i].displayURL = [{ url: '', text: '【 ' + result[i].title + '】' }];
              retData[i].topStatus = result[i].sticky_status || 0;

              retData[i].authorId = result[i].author_id || '';
              retData[i].authorName = result[i].author_name || '';
              retData[i].authorType = result[i].author_type || '';
              retData[i].formatType = result[i].format_type || '';

            }
            apiHandler.OK(res, { items: retData });
          }
        });
    });
};


//消息中心
//存在问题：切换城市之间的信息会收不到
ZlycareController.prototype.myMessageCenter = function (req, res) {
  var userId = req.identity ? req.identity.userId : '';
  if (!userId) {
    return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(3001));
  }

  var allNot = [], userMessage = [], user;

  var option = {
    doctorFields: DoctorModel.frontEndFields,
    customerFields: CustomerModel.frontEndFields
  };
  CustomerService.getAllInfoByID(userId, option)
    .then(function (_u) {
      user = JSON.parse(JSON.stringify(_u));
      // console.log('用户信息', user);
      return MessageCenterService.getMessageByUserId(userId);
    })
    .then(function (_userMessage) {
      var notificationIds = [];
      if (_userMessage) {
        userMessage = JSON.parse(JSON.stringify(_userMessage));

        for (var i = 0; i < userMessage.length; i++) {
          if (userMessage[i].notification && userMessage[i].notification._id) { //过滤通知中心信息
            notificationIds.push(userMessage[i].notification._id);
          }

          if (userMessage[i].isDeleted) {
            userMessage.splice(i, 1);
            i--;
          } else {
            if (userMessage[i].notification && userMessage[i].notification._id && !userMessage[i].type) { //TODO  老版本数据兼容   可删除
              userMessage[i].type = userMessage[i].notification.type;
              userMessage[i].subType = userMessage[i].notification.subType || '';
              userMessage[i].title = userMessage[i].notification.title;
              userMessage[i].content = userMessage[i].notification.content;
              userMessage[i].images = userMessage[i].notification.pics;
              userMessage[i].link = userMessage[i].notification.link;
            }
          }
        }
      }

      // console.log('过滤掉的ID',notificationIds);
      var condArea = [{
        area: '全部城市',
        updatedAt: { $gt: user.createdAt }
      }];
      if (user.location && user.location.city) {
        condArea.push({
          area: user.location.city,
          updatedAt: { $gt: user.jkLastestLoginTime }
        });
      }

      console.log('查询城市参数', condArea);
      return NotificationService.getNotificationList({
        type: '1',
        isSend: true,
        _id: { $nin: notificationIds },
        $and: [
          { $or: condArea },
          { $or: [{ tagCode: { $exists: false } }, { tagCode: user.tagCode }] }
        ]
      }, '-isSend  -updatedAt -statisticsUpdatedAt');
    })
    .then(function (_n) {

      if (_n) {
        allNot = JSON.parse(JSON.stringify(_n));
        var now = Date.now();
        allNot.forEach(function (data) {
          userMessage.push({
            _id: data._id,
            user: user._id,
            notification: {
              _id: data._id
            },
            type: data.type,
            subType: data.subType || '',
            title: data.title,
            content: data.content,
            images: data.images,
            link: data.link,
            messageRef: '',
            updatedAt: now,
            createdAt: now,
            isDeleted: false,
            userDeleted: false,
            isViewed: false
          });
        });

        userMessage = _.sortBy(userMessage, function (item) {
          return -item.createdAt;
        });

        apiHandler.OK(res, userMessage);

        async.each(allNot, function (data, next) {
          MessageCenterService.addMessageCenterToUser([userId], data, data._id);
          next();
        }, function complete(err) {

        });
      }
    }, function (err) {
      apiHandler.handleErr(res, err);
    });
};

function compare(v1, v2) {
  if (v1 < v2) {
    return 1;
  } else if (v1 > v2) {
    return -1;
  } else {
    return 0;
  }
};


// user: {type: Schema.Types.ObjectId, ref: 'User'}, //收到通知用户主账号ID
// notification : {type: Schema.Types.ObjectId, ref: 'NotificationModel'}, //通知表中的消息ID
// isViewed: {type: Boolean, default: false}, //是否被查看
// userDeleted: {type: Boolean, default: false},//用户删除
ZlycareController.prototype.setMyMessageViewed = function (req, res) {
  var userId = req.identity ? req.identity.userId : '';

  var payload = req.body;
  var fields = {
    required: ['messageId']
  };

  var onFailure = function (handler, type) {
    handler(res, type);
  };
  var onSuccess = function (handler, data) {


    MessageCenterService.getMessageByUserAndNotificationId(userId, data.messageId)
      .then(function (_m) {
        console.log('找到的结果', _m);
        if (_m.length > 0) {
          var cond = {
            user: userId,
            // notification: data.messageId,
            $or: [{ notification: data.messageId }, { _id: data.messageId }],
            isViewed: false
          };
          var updates = { isViewed: true };
          return MessageCenterService.updateMessage(cond, updates);
        } else { //还没有创建消息中心数据用户就点击了通知信息的特殊情况
          return NotificationService.getNotificationById(data.messageId)
            .then(function (notification) {
              if (!notification)
                return;

              notification.isViewed = true;
              MessageCenterService.addMessageCenterToUser([userId], notification, notification._id);
            });
        }
      })
      .then(function () {
        apiHandler.OK(res);
      }, function (err) {
        apiHandler.handleErr(res, err);
      });
  };

  commonUtil.validate(payload, fields, onSuccess, onFailure);
};

ZlycareController.prototype.delMyMessage = function (req, res) {
  var userId = req.identity ? req.identity.userId : '';
  var messageId = req.body.messageId;
  if (!userId) {
    return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(3001));
  }
  if (!messageId) {
    return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(3001));
  }


  MessageCenterService.getMessageByUserAndNotificationId(userId, messageId)
    .then(function (_m) {
      console.log('找到的结果', _m);
      if (_m.length > 0) {
        var cond = {
          user: userId,
          // notification: messageId,
          $or: [{ notification: messageId }, { _id: messageId }],
          isDeleted: false
        };
        var updates = { isDeleted: true };
        return MessageCenterService.updateMessage(cond, updates);
      } else { //还没有创建消息中心数据用户就删除了通知信息的特殊情况
        return NotificationService.getNotificationById(data.messageId)
          .then(function (notification) {
            if (!notification)
              return;

            notification.isDeleted = true;
            MessageCenterService.addMessageCenterToUser([userId], notification, notification._id);
          });
      }
    })
    .then(function () {
      apiHandler.OK(res);
    }, function (err) {
      apiHandler.handleErr(res, err);
    });
};

ZlycareController.prototype.getMessage = function (req, res) {
  // var userId = req.identity ? req.identity.userId : '';
  var messageId = req.query.messageId;
  // if (!userId) {
  //     return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(3001));
  // }
  if (!messageId) {
    return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(3001));
  }


  // NotificationService.getNotificationForMessageById(messageId)
  var from = 'message';
  MessageCenterService.getMessageById(messageId)
    .then(function (_n) {
      console.log('返回值', _n);
      if (!_n) {
        from = 'notification';
        return NotificationService.getNotificationForMessageById(messageId);
      } else {
        return _n;
      }
    })
    .then(function (_n) {
      console.log('ferfre', from)
      if (from == 'message') {
        _n = JSON.parse(JSON.stringify(_n));

        console.log('ojoj');
        _n.title = _n.notification.title;
        _n.content = _n.notification.content;
        _n.createdAt = _n.notification.createdAt;

      }
      apiHandler.OK(res, _n);
    }, function (err) {
      apiHandler.handleErr(res, err);
    });
};


ZlycareController.prototype.cancel_certification = function (req, res) {
  var userId = req.identity ? req.identity.userId : '';

  var payload = req.body;
  var fields = {
    required: ['tradeId']
  };

  var onFailure = function (handler, type) {
    handler(res, type);
  };
  var onSuccess = function (handler, data) {
    if (!userId && !data.tradeId) {
      return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(3001));
    }

    console.log('测试取消报销', data.tradeId, userId);
    VipMemberTradesService.getVipMembershipTradeById(data.tradeId)
      .then(function (_t) {
        console.log('步骤', _t);
        if (_t) {
          if (_t.step == 2) {
            throw ErrorHandler.getBusinessErrorByCode(2416);
          } else if (_t.step == 1) {
            throw ErrorHandler.getBusinessErrorByCode(2418);
          } else if (_t.step == 0) {
            var memberships = _t.memberships;

            async.each(memberships, function (data, next) {
              MembershipService.udpMembershipById(data.membershipId, {
                $inc: {
                  balance: data.cost,
                  cost: -data.cost,
                  normalValue: data.isNormalFlag ? data.cost : 0
                }
              });
              next();
            }, function complete(err) {
              console.log('all done!');
              VipMemberTradesService.udpVipMembershipTradeById(_t._id, { step: 1, stepAt: Date.now() });
            });
          }
        }
        apiHandler.OK(res);

      }, function (err) {
        apiHandler.handleErr(res, err);
      });
  };

  commonUtil.validate(payload, fields, onSuccess, onFailure);
};


ZlycareController.prototype.comments = function (req, res) {
  var pageId = req.query.pageId || 0;
  if (!pageId) {
    return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(3001));
  }
  var retData = [];
  proxy.get_article_comments(Number(pageId))
    .then(function (err, result) {
      if (err) apiHandler.handleErr(res, err);

      console.log('评论内容', result);
      if (result) {
        retData = JSON.parse(JSON.stringify(result));
        var userIds = _.map(result, function (data) {
          if (data.user_id) {
            return data.user_id;
          }
        });


        CustomerService.getInfoByIDs(userIds, '_id name avatar').then(function (_users) {

          if (_users) {
            var usersMap = _.indexBy(_users, '_id');
            for (var i = 0; i < result.length; i++) {
              retData[i] = {};
              retData[i].createdAt = (new Date((new Date(result[i].date)).format('yyyy-MM-dd hh:mm:ss'))).getTime();
              delete retData[i].date;
              retData[i].content = result[i].comment || '';
              retData[i].commentId = result[i].comment_id || 0;
              delete retData[i].comment;
              retData[i].userId = usersMap[result[i].user_id]._id || '';
              retData[i].name = usersMap[result[i].user_id].name || '';
              retData[i].avatar = usersMap[result[i].user_id].avatar || '';

            }
            console.log('返回结果', retData);
            apiHandler.OK(res, retData);
          }
        });
      } else {
        apiHandler.OK(res, retData);
      }
    });
};

ZlycareController.prototype.statisticals = function (req, res) {
  var userId = req.query.userId || '';
  var pageId = Number(req.query.pageId || 0);
  if (!userId && !pageId) {
    return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(3001));
  }
  var retData = {};

  proxy.get_article_extra_info(userId, pageId)
    .then(function (err, result) {
      if (err) apiHandler.handleErr(res, err);

      console.log('统计分析结果', result);
      // 统计分析结果 { user_liked: false,
      //0|zlycare  |   comment_count: 0,
      // 0|zlycare  |   user_collected: false,
      // 0|zlycare  |   like_count: 0 }
      if (result) {
        retData.approveNum = result.like_count || 0;
        retData.isApproved = result.user_liked || false;
        retData.commentNum = result.comment_count || 0;
        retData.isCollected = result.user_collected || false;
      }

      apiHandler.OK(res, retData);

    });
};


ZlycareController.prototype.publishComment = function (req, res) {
  var userId = req.identity ? req.identity.userId : '';
  var payload = req.body;
  var fields = {
    required: ['pageId', 'content'],
    optional: ['name']
  };

  var onFailure = function (handler, type) {
    handler(res, type);
  };
  var onSuccess = function (handler, data) {
    var pageId = Number(data.pageId || 0);
    if (!userId && !pageId) {
      return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(3001));
    }


    var name = data.name || '', ip = req.get("X-Real-IP") || req.get("X-Forwarded-For") || req.ip;
    proxy.add_comment_toarticle(userId, pageId, data.content, name, ip)//name,ip
      .then(function (err, result) {
        if (err) apiHandler.handleErr(res, err);

        console.log('发布评论', result);//发布评论 success  要返回一个时间
        if (result) {
          console.log('发布评论时间', result.date, formatUTCTime(result.date));
          //要返回一个发布时间

          console.log('发布评论的返回值', {
            createdAt: formatUTCTimePublishComment(result.date),
            commentId: result.comment_id
          });
          apiHandler.OK(res, {
            createdAt: formatUTCTimePublishComment(result.date),
            commentId: result.comment_id
          });

        }
      });
  };
  commonUtil.validate(payload, fields, onSuccess, onFailure);
};
ZlycareController.prototype.formatUTCTime = formatUTCTime;

function formatUTCTime(data) {
  return (new Date(new Date(data) + '+0800').getTime());
}

function formatUTCTimePublishComment(data) {
  var dateCon = new Date(data);
  var year = dateCon.getUTCFullYear();

  var month = dateCon.getUTCMonth() + 1;
  var day = dateCon.getUTCDate();
  var hour = dateCon.getUTCHours();
  var minute = dateCon.getUTCMinutes();
  var second = dateCon.getUTCSeconds();
  return (new Date((new Date(year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second)).format('yyyy-MM-dd hh:mm:ss'))).getTime();
}

ZlycareController.prototype.collect = function (req, res) {
  var userId = req.identity ? req.identity.userId : '';
  var payload = req.body;
  var fields = {
    required: ['pageId'],
    optional: []
  };

  var onFailure = function (handler, type) {
    handler(res, type);
  };
  var onSuccess = function (handler, data) {
    var pageId = Number(data.pageId || 0);
    if (!userId && !pageId) {
      return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(3001));
    }


    proxy.useraction_collect_article(userId, pageId)
      .then(function (err, result) {
        if (err) apiHandler.handleErr(res, err);

        if (result) {
          apiHandler.OK(res);
        }
      });
  };
  commonUtil.validate(payload, fields, onSuccess, onFailure);
};

ZlycareController.prototype.cancelCollect = function (req, res) {
  var userId = req.identity ? req.identity.userId : '';
  var payload = req.body;
  var fields = {
    required: ['pageId'],
    optional: []
  };

  var onFailure = function (handler, type) {
    handler(res, type);
  };
  var onSuccess = function (handler, data) {
    var pageId = Number(data.pageId || 0);
    if (!userId && !pageId) {
      return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(3001));
    }


    proxy.useraction_remove_collect_article(userId, pageId)
      .then(function (err, result) {
        if (err) apiHandler.handleErr(res, err);

        if (result) {
          apiHandler.OK(res);
        }
      });
  };
  commonUtil.validate(payload, fields, onSuccess, onFailure);
};


ZlycareController.prototype.myCollection = function (req, res) {
  var userId = req.identity ? req.identity.userId : '';

  if (!userId) {
    return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(3001));
  }
  var retData = [];
  proxy.get_user_collected_articles(userId)
    .then(function (err, result) {
      if (err) apiHandler.handleErr(res, err);

      console.log(result);
      if (result) {
        for (var i = 0; i < result.length; i++) {
          retData[i] = {};
          retData[i].collectedAt = (new Date((new Date(result[i].collected_date)).format('yyyy-MM-dd hh:mm:ss'))).getTime();
          retData[i].createdAt = (new Date((new Date(result[i].publish_date)).format('yyyy-MM-dd hh:mm:ss'))).getTime();
          retData[i].moment_id = result[i].id;
          retData[i].title = result[i].title;
          retData[i].user_name = result[i].source_name;
          retData[i].pics = result[i].image_links || [];
          retData[i].desc = result[i].abstract;
          retData[i].authorId = result[i].author_id;
          retData[i].authorName = result[i].author_name;
          retData[i].authorType = result[i].author_type;
          retData[i].formatType = result[i].format_type;
        }
      }

      console.log('我的收藏', retData);
      apiHandler.OK(res, retData);

    });
};


ZlycareController.prototype.unInterested = function (req, res) {
  var userId = req.headers[constants.HEADER_USER_ID] || '';
  var pageId = Number(req.body.pageId || 0);
  var deviceId = req.headers[constants.HEADER_DEVICE_ID] || '';
  var uuid = userId || deviceId;
  console.log('uuid', uuid);
  if (!uuid && !pageId) {
    return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(3001));
  }


    proxy.useraction_dislike_article(uuid, pageId)
        .then(function (err, result) {
            if (err) apiHandler.handleErr(res, err);

            if (result) {
                apiHandler.OK(res);
            }
        });
};


// from:String,//第三方类别，wx-微信,qq-QQ , wb-微博
//     id:String,//第三方ID
//     nickName:String,//昵称
ZlycareController.prototype.thirdPartyLogin = function (req, res) {
    var payload = req.body;
    var fields = {
        required: ['from', "id", "nickName"],
        optional: ['storeChannel']
    };

    var deviceId = req.headers[constants.HEADER_DEVICE_ID] || '';

    var onFailure = function (handler, type) {
        handler(res, type);
    };
    var onSuccess = function (handler, data) {
        var user,
            accidExists = false,
            accid = '', retData = {};

        if (!data.from) {
            throw ErrorHandler.getBusinessErrorByCode(3001);
        }
        CustomerService.getUserByThirdParty(data.from, data.id, data.nickName, deviceId, data.storeChannel)
          .then(function (u) {
              if (!u) {
                  return {};
              } else {
                  user = u;
                  let user_center = Backend.service('user_center', 'handle_user_center');
                  return user_center.user_info(user.openId);
              }
          })
          .then(function(user_center_res){
            if(user_center_res.data){
              return handleUserInfo(user,user_center_res.data);
            }else{
              return {};
            }
          })
          .then(function (_ret) {
            console.log('函数返回', _ret);
            if (_ret) {
              retData = _ret;
            }
            apiHandler.OK(res, _ret);

            loginUpdateUserInfo(user);
            LoggerService.trace(LoggerService.getTraceDataByReq(req)); //和发送验证码的log一起用，不能删
          },
          function (err) {
            console.log('err:', err);
            apiHandler.handleErr(res, err);
          });
  };

  commonUtil.validate(payload, fields, onSuccess, onFailure);
};

var handleUserInfo = function (user,user_center_data) {
  var json = {};


  // 创建 IM 账户
  json = JSON.parse(JSON.stringify(user));
  var user_service = Backend.service("1/im", "user");
  return user_service.create(user._id)
    .then(function (im_user_info) {
      json.im = im_user_info || {};

      //todo: u不存在
      if (json.frozen)
        throw ErrorHandler.getBusinessErrorByCode(1211);//号码被冻结

      json.sessionToken = CustomerService.token(user);
      console.log('用户token', json.sessionToken);

      json.isOccupationSet = user.hospital ? true : false;
      if (user.doctorRef) {
        //json.docChatNum = u.doctorRef.docChatNum;
        json.doctorRef.isOnline = json.doctorRef.isOnlineOnLogout;
      }
      json.hasPwd = user_center_data && user_center_data.id && user_center_data.hasPwd ? true : false;
      json.hasPayPwd = user.payPwd ? true : false;
      json.hasPayPassword = user.payPassword ? true : false;
      if (json['loginPassword'])
        delete json['loginPassword'];
      // 系统信息
      json[CommonInfoService.CONS.PARAMS.CDN] = CommonInfoService.getCDN();
      json[CommonInfoService.CONS.PARAMS.ZLY400] = CommonInfoService.get400();
      json[CommonInfoService.CONS.PARAMS.DOC_CHAT_NUM_REG] = CommonInfoService.getDocChatNumRegex();

      if (json.momentRef) {
        delete json.momentRef;
      }

      //自动离线
      json.isAutoOffline = user.isAutoOffline || false;
      json.offlineBeginTime = user.offlineBeginTime || '22:00';
      json.offlineEndTime = user.offlineEndTime || '08:00';
      //联系我们
      json.contactUs = constants.contactUs;
      if (json.shopVenderApplyStatus == 2 || json.shopVenderApplyStatus == 5) {
        return ApplicationService.findLastShopApplication(user._id)
      } else {
        return false;
      }

    })
    .then(function (_appl) {
      if (_appl && _appl[0] && _appl[0].status == -1) {
        json.shopRefuseReason = _appl[0].reason || "";
      }
      json.shopTypeVersion = constants.shopTypeVersion;


      var zlycare_service = require('./../services/zlycareService');
      return zlycare_service.insertUser(json._id, json.name, json.phoneNum);
    })
    .then(function () {

      return ApplicationService.findLatestOne({applicantId: user._id, alipayNum: {$exists: true}});
    })
    .then(function (_aliPay) {
      json.alipayName = '';
      json.bankCardName = '';
      if (_aliPay && _aliPay.length > 0) {
        json.alipayName = _aliPay[0].alipayName;
      }
      return ApplicationService.findLatestOne({applicantId: user._id, bankCardNum: {$exists: true}});
    })
    .then(function (_bankCard) {
      json.bankCardName = '';
      if (_bankCard && _bankCard.length > 0) {
        json.bankCardName = _bankCard[0].bankCardName;
      }
      var drug_coupon_service = Backend.service('activity', 'drug_coupon');
      return drug_coupon_service.checkAuditor(json.phoneNum)
    })
    .then(function (isActivityClerk) {
      json.isActivityClerk = isActivityClerk;
      const tp_user_identity_service = Backend.service('tp_memberships','user_identity');
      return tp_user_identity_service.identity(json._id);
    })
    .then(function(identity){
      json.identity = identity;
      return json;
    })
}

ZlycareController.prototype.handleUserInfo = handleUserInfo;

var loginUpdateUserInfo = function (user) {
  var updateData = {
    updatedAt: Date.now()
  };
  if (!user.appInstalled) {
    updateData['appInstalled'] = true;
    if (user.from == "webCall")
      CustomerService.favoriteDocs(user._id, constants.webCall);
  }
  CustomerService.updateBaseInfo(user._id, updateData);
  if (user.doctorRef && user.doctorRef._id) {
    var doctorData = {
      isOnline: user.doctorRef.isOnlineOnLogout,
    };
    DoctorService.updateBaseInfo(user.doctorRef._id, doctorData);
  }
};
ZlycareController.prototype.loginUpdateUserInfo = loginUpdateUserInfo;
// from:String,//第三方类别，wx-微信,qq-QQ , wb-微博
//     id:String,//第三方ID
//     nickName:String,//昵称
//     phoneNum:String,//手机号码
//     authCode:String,//验证码
ZlycareController.prototype.thirdPartyRegister = function (req, res) {
  var payload = req.body;
  var fields = {
    required: ['from', "id", "nickName", "phoneNum"],
    optional: ["authCode", "storeChannel"]
  };

  var deviceId = req.headers[constants.HEADER_DEVICE_ID] || '';

  var onFailure = function (handler, type) {
    handler(res, type);
  };
  var onSuccess = function (handler, data) {
    var user, retData = {};
    if (!data.authCode) {
      throw ErrorHandler.getBusinessErrorByCode(1810);
    }
    if (!data.from) {
      throw ErrorHandler.getBusinessErrorByCode(3001);
    }
    let user_center_data;
    ValidateService.validateByPhone(data.phoneNum, data.authCode, '')
      .then(function (_resObj) {
        console.log('_resObj:', _resObj);
        user_center_data = _resObj;
        // if (data.password && !_resObj.isPhone) {
        //     return CustomerService.validUserByDocChatNum(data.phoneNum, '', deviceId);
        // }
        return CustomerService.getInfoByPhone(data.phoneNum);//通过手机号码，查找用户信息
      })
      .then(function (_u) {
        var updates = {from: data.from, id: data.id, nickName: data.nickName};
        if (!_u) {//用户不存在，直接注册
          return CustomerService.validUser(data.phoneNum,'', deviceId, '', '', '','',user_center_data);
        } else {
          console.log('用户第三方信息', _u.thirdParty)
          if (_u.thirdParty && Object.keys(_u.thirdParty).length > 0) {//该手机号码已经绑定过某个第三方
            throw ErrorHandler.getBusinessErrorByCode(1215);
          }
          else {
            //     // userId, from, id, nickName
            //     console.log('参数',data,data.from);
            //     return CustomerService.updateThirdPartyById(_u._id, data.from, data.id, data.nickName);
            return _u;
          }
        }
      })
      .then(function (_u) {
        if (_u) {
          CustomerService.updateThirdPartyById(_u._id, data.from, data.id, data.nickName);
          user = _u;
          return handleUserInfo(_u,user_center_data);
        }
      })
      .then(function (_ret) {
          if (_ret) {
            retData = _ret;
          }

        //用户中心同步数据
        let user_center = Backend.service('user_center', 'handle_user_center');
        if (retData.openId) {
          let update = {
            wechat: data.from == 'wx' ? data.id : '' ,

            qq: data.from == 'qq' ? data.id : '',

            weibo: data.from == 'wb' ? data.id : ''
          }
          return user_center.user_info_update(retData.openId, update)
        }
      })
      .then(function () {
          apiHandler.OK(res, retData);

          loginUpdateUserInfo(user);
          LoggerService.trace(LoggerService.getTraceDataByReq(req)); //和发送验证码的log一起用，不能删
        },
        function (err) {
          console.log('err:', err);
          apiHandler.handleErr(res, err);
        });
  };
  commonUtil.validate(payload, fields, onSuccess, onFailure);
};


// userId: String(header)
// from:String,//第三方类别，wx-微信,qq-QQ , wb-微博
//     id:String,//第三方ID
//     nickName:String,//昵称
ZlycareController.prototype.bindThirdParty = function (req, res) {
  var payload = req.body;
  var fields = {
    required: ['from', "id", "nickName"],
    optional: []
  };
  var user = req.identity && req.identity.user || {};
  var userId = req.headers[constants.HEADER_USER_ID] || '';

  var onFailure = function (handler, type) {
    handler(res, type);
  };
  var onSuccess = function (handler, data) {
    if (!userId) {
      return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(3001));
    }
    // console.log('user.openId:', user.openId);

    if (user && user.openId) {
      const typeMap = {
        'wx': 'wechat',
        'qq': 'qq',
        'wb': 'weibo',
      }
      const update = {
        'extra_from': 'zlycare'
      };
      update[typeMap[data.from]] = data.id;
      const user_info_update = Backend.service('user_center', 'handle_user_center').user_info_update;
      return user_info_update(user.openId, update)
        .then(function (_res) {
          if (_res && _res.errno === 0) {
            CustomerService.getUserByThirdPartyPure(userId, data.from, data.id)
              .then(function (_thirdLogin) {
                console.log('_thirdLogin', _thirdLogin);
                if (!_thirdLogin) {
                  CustomerService.updateThirdPartyById(userId, data.from, data.id, data.nickName);
                  apiHandler.OK(res);
                } else {
                  return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(1216));
                }
              }, function (err) {
                console.log('err:', err);
                apiHandler.handleErr(res, err);
              });
          } else if (_res && _res.errno === 2004) {
            return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(1216));
          } else {
            return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(9000));
          }
        })
    } else {
      console.log('not find user OpenId');
      return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(9000));
    }
  };
  commonUtil.validate(payload, fields, onSuccess, onFailure);
};

ZlycareController.prototype.cancelThirdParty = function (req, res) {
  var payload = req.body;
  var fields = {
    required: ['from'],
    optional: []
  };
  var user = req.identity && req.identity.user || {};
  var userId = req.headers[constants.HEADER_USER_ID] || '';

  var onFailure = function (handler, type) {
    handler(res, type);
  };
  var onSuccess = function (handler, data) {
    if (!userId) {
      return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(3001));
    }
    const user_info_update = Backend.service('user_center', 'handle_user_center').user_info_update;
    const typeMap = {
      'wx': 'wechat',
      'qq': 'qq',
      'wb': 'weibo',
    }
    const update = {
      'extra_from': 'zlycare'
    };
    update[typeMap[data.from]] = '';
    return user_info_update(user.openId, update)
      .then(function (_res) {
        if (_res && _res.errno === 0) {
          if (user && user.thirdParty && user.thirdParty[data.from]) {
            CustomerService.cancelThirdPartyById(userId, data.from);
          }
          apiHandler.OK(res);
        } else {
          return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(2500));
        }
      })
      .catch(function () {
        return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(9000));
      })
  };
  commonUtil.validate(payload, fields, onSuccess, onFailure);
};


ZlycareController.prototype.thirdPartyList = function (req, res) {

  var userId = req.headers[constants.HEADER_USER_ID] || '';
  if (!userId) {
    return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(3001));
  }

  CustomerService.getAllInfoByID(userId)
    .then(function (_u) {
      console.log('第三方信息', _u.thirdParty);
      if (_u) {
        var retData = [];
        if (_u.thirdParty) {
          for (var key in _u.thirdParty) {
            // console.log(key,thirdParty[key]);
            retData.push({from: key, nickName: _u.thirdParty[key].nickName});
          }
        }
        apiHandler.OK(res, retData);
      }

    }, function (err) {
      apiHandler.handleErr(res, err);
    });
};


ZlycareController.prototype.tagUser = function (req, res) {
  var payload = req.body;
  var fields = {
    required: ['phoneNum', 'tagId', 'tagTitle'],
    optional: ['code']
  };

  console.log('进入feedFlow1');
  var deviceId = req.headers[constants.HEADER_DEVICE_ID] || '';

  var onFailure = function (handler, type) {
    handler(res, type);
  };
  var onSuccess = function (handler, data) {
    var user;

    console.log('得到的参数', payload);
    var tagId = Number(data.tagId);
    CustomerService.validUser(data.phoneNum, '', '', 'web')
      .then(function (_user) {
        user = JSON.parse(JSON.stringify(_user));
        console.log('得到的参数：', tagId, data.tagTitle);
        var updates = {
          $set: {
            "tagGroup": {
              id: tagId,
              title: data.tagTitle,
              updatedAt: Date.now()
            }
          }
        };
        if (!_user.tagCode && data.code) {
          updates.tagCode = data.code;
        }
        CustomerService.updateBaseInfo(user._id, updates);

        var zlycare_service = require('./../services/zlycareService');
        return zlycare_service.insertUser(user._id, user.name, user.phoneNum);
      })
      .then(function () {
        var type = '';
        if (!user.name) {
          console.log('注册用户');
          type = 'goDownload';
        } else {
          console.log('老用户');
        }
        apiHandler.OK(res, { type: type });


        proxy.update_user_keywords_with_keywordgroup(user._id, tagId)
          .then(function (err, result) {
            // if (err) apiHandler.handleErr(res, err);
          });
      }, function (err) {
        console.log('err:', err);
        apiHandler.handleErr(res, err);
      });
  };

  commonUtil.validate(payload, fields, onSuccess, onFailure);
};


ZlycareController.prototype.setLocation = function (req, res) {
  var payload = req.body;
  var fields = {
    required: ['province', 'city'],
    optional: []
  };
  var user = req.identity && req.identity.user || {};
  var userId = req.headers[constants.HEADER_USER_ID] || '';

  var onFailure = function (handler, type) {
    handler(res, type);
  };
  var onSuccess = function (handler, data) {

    CustomerService.updateBaseInfo(userId, {
      "location.province": data.province,
      "location.city": data.city,
      updatedAt: Date.now()
    })
      .then(function (_u) {
        apiHandler.OK(res);
      }, function (err) {
        console.log('err:', err);
        apiHandler.handleErr(res, err);
      });

  };
  commonUtil.validate(payload, fields, onSuccess, onFailure);
};

/**
 * uid  用户ID，未登录的时候，给空值
 * @param req
 * @param res
 */
ZlycareController.prototype.getAd = function (req, res) {

  var userId = req.headers[constants.HEADER_USER_ID] || '';
  var deviceId = req.headers[constants.HEADER_DEVICE_ID] || '';

  // var slotid = '10,11';
  var slotid = '31,32';

  var url = adUrlTest + slotid + '&uid=' + userId;

  if (serverConfigs.env) {
    url = adUrl + slotid + '&uid=' + userId
  }
  // url = url + '/' + router + '?source=' + source + '&slotid=' + slotid + '&uid=' + userId;
  var ip = req.get("X-Real-IP") || req.get("X-Forwarded-For") || req.ip;
  url += '&ip=' + ip;
  console.log('请求地址', url);
  var retData = [];
  AdvertiseRelService.getAdById(deviceId, userId)
    .then(function (_adRel) {
      request(url, function (error, response, body) {

        console.log('广告信息参数', error, response.statusCode, body);
        if ((response.statusCode == '200') && (!error)) {
          body = JSON.parse(body);
          console.log('广告信息', body, body.status);
          if (body.status == 1) {
            var ads = body.ads || [];

            var adsMap = _.indexBy(ads, 'adid');

            //过滤不感兴趣的广告
            if (_adRel && _adRel.adIds && _adRel.adIds.length > 0) {
              console.log('进入广告不感兴趣');

              for (var j = 0; j < _adRel.adIds.length; j++) {
                if (adsMap[_adRel.adIds[j]]) {
                  adsMap[_adRel.adIds[j]].isDeleted = true;
                  console.log('不感兴趣的广告', adsMap[_adRel.adIds[j]].isDeleted);
                }
              }
            }

            var index = 0;
            for (var key in adsMap) {
              if (!adsMap[key].isDeleted) {
                retData[index] = {};
                retData[index].adId = adsMap[key].adid || 0;
                retData[index].title = adsMap[key].title || '';
                retData[index].createdAt = adsMap[key].time || '';
                retData[index].user_name = adsMap[key].tag || '';
                retData[index].pics = [];
                retData[index].descTag = [];
                retData[index].links = [];
                retData[index].topStatus = 2;
                for (var j = 0; j < adsMap[key].images.length; j++) {
                  retData[index].pics.push(adsMap[key].images[j].src || '');
                  retData[index].descTag.push(adsMap[key].images[j].subtitle || '');
                  retData[index].links.push(adsMap[key].images[j].ldp || '');
                }
                index++;
              }
            }


            console.log('不感兴趣后的结果', retData);
            // for (var i = 0; i < ads.length; i++) {
            //     retData[i] = {};
            //     retData[i]._id = ads[i].adid || '';
            //     retData[i].title = ads[i].title || '';
            //     retData[i].createdAt = ads[i].time || '';
            //     retData[i].user_name = ads[i].tag || '';
            //     retData[i].pics = [];
            //     retData[i].descTag = [];
            //     retData[i].links = [];
            //     retData[i].topStatus = 2;
            //     for (var j = 0; j < ads[i].images.length; j++) {
            //         retData[i].pics.push(ads[i].images[j].src || '');
            //         retData[i].descTag.push(ads[i].images[j].subtitle || '');
            //         retData[i].links.push(ads[i].images[j].ldp || '');
            //     }
            // }
          }
          apiHandler.OK(res, retData);
        } else {

          apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(2304));

        }

      });
    });

};


/**
 * 1、userId和deviceId至少有一个的时候，才进行操作
 * 2、deviceId和第一次操作的userId绑定（用于保存用户登录前的操作）
 *    以deviceId为准，若userId为空，则绑定该userId，若已存在，则新增一条记录
 * @param req
 * @param res
 */
ZlycareController.prototype.unInterestedAd = function (req, res) {
  var userId = req.headers[constants.HEADER_USER_ID];
  var deviceId = req.headers[constants.HEADER_DEVICE_ID];
  var adId = req.body.adId;

  console.log('广告id', adId);
  if (!userId && !deviceId) {
    return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(3001));
  }

  if (!adId) {
    return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(3001));
  }

  AdvertiseRelService.getAdById(deviceId, userId)
    .then(function (_ad) {
      var flag = 'create';
      var data = {};
      var cond = {};
      console.log('找到的记录', _ad);
      if (_ad) {
        if (_ad.userId) {//该deviceId已绑定用户
          if (_ad.userId == userId) {//绑定的用户和当前请求的用户是同一个，修改数据
            flag = 'update';
            cond.userId = userId;
            data = {$addToSet: {adIds: adId}};
            console.log('ever', _ad.deviceId, _ad);
          } else {
            data = {userId: userId, adIds: adId};
          }
        } else {//deviceId未绑定用户
          console.log('未绑定用户');
          flag = 'update';
          cond.deviceId = deviceId;
          data = {
            $addToSet: {adIds: adId}
          };
          if (userId) {
            data.userId = userId;
          }
        }
      } else {//deviceId和userId均不存在
        data = {deviceId: deviceId, adIds: adId};
        if (userId) {
          data.userId = userId;
        }
      }


      if (flag == 'create') {
        AdvertiseRelService.createAdvertiseRel(data);
      } else {
        AdvertiseRelService.updateAdvertiseRel(cond, data);
      }
      apiHandler.OK(res);
    }, function (err) {
      apiHandler.handleErr(res, err);
    });
};

/**
 * uid  用户ID，未登录的时候，给空值
 * @param req
 * @param res
 */
ZlycareController.prototype.getBannerAd = function (req, res) {

  var userId = req.headers[constants.HEADER_USER_ID] || '';
  var deviceId = req.headers[constants.HEADER_DEVICE_ID] || '';

  // var slotid = '12';
  var slotid = '30';

  var url = adUrlTest + slotid + '&uid=' + userId;

  if (serverConfigs.env) {
    url = adUrl + slotid + '&uid=' + userId
  }
  var ip = req.get("X-Real-IP") || req.get("X-Forwarded-For") || req.ip;
  url += '&ip=' + ip;
  console.log('请求地址', url);
  var retData = [];
  AdvertiseRelService.getAdById(deviceId, userId)
    .then(function (_adRel) {
      request(url, function (error, response, body) {

        if ((response.statusCode == '200') && (!error)) {
          body = JSON.parse(body);
          console.log('广告信息', body);
          if (body.status == 1) {
            var ads = body.ads || [];

            for (var i = 0; i < ads.length; i++) {
              retData[i] = {};
              retData[i].adId = ads[i].adid || 0;
              retData[i].title = ads[i].title || '';
              retData[i].createdAt = ads[i].time || '';
              retData[i].user_name = ads[i].tag || '';
              retData[i].pics = [];
              retData[i].descTag = [];
              retData[i].links = [];
              retData[i].topStatus = 0;
              for (var j = 0; j < ads[i].images.length; j++) {
                retData[i].pics.push(ads[i].images[j].src || '');
                retData[i].descTag.push(ads[i].images[j].subtitle || '');
                retData[i].links.push(ads[i].images[j].ldp || '');
              }
            }
          }
          apiHandler.OK(res, retData);
        } else {
          apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(2304));
        }

      });
    });

};

/**
 * 按照会员维护计划返回，返回计划中的药品
 * @param req
 * @param res
 */
ZlycareController.prototype.searchDrug = function (req, res) {

  var userId = req.headers[constants.HEADER_USER_ID] || '';
  var deviceId = req.headers[constants.HEADER_DEVICE_ID] || '';

  var pageNum = Number(req.query.pageNum || 0);
  var pageSize = Number(req.query.pageSize || 20);

  var pageSlice = commonUtil.getCurrentPageSlice(req, pageNum, pageSize, {createdAt: -1});
  var city = req.query.city;
  var keys = req.query.keys;
  if (!city) {
    return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(3001));
  }
  // var cond = {stopPlan: false, balanceVal: {$gt: 0}};
  var cond = {stopPlan: false};//去掉balanceVal字段
  cond.$or = [{area: '全部城市'}, {area: city}];
  if (keys) {
    cond.drugName = new RegExp(keys, 'i');
  }

  console.log('请求参数', cond);
  var fdr, fdrMap;
  FactoryDrugRelService.getFactoryDrugRel(cond, {}, pageSlice)
    .then(function (_fdr) {
      console.log('ssdfsdf', _fdr);
      fdr = JSON.parse(JSON.stringify(_fdr));
      // fdrMap = _.indexBy(fdr, 'drugId');
      console.log('frdMap', fdrMap);
      var drugIds = _.map(fdr, function (item) {
        console.log('item.drugId', item, item.drugId);
        if (item.drugId) {
          return item.drugId;
        }
      });

      console.log('drugIds', drugIds);
      return DrugService.getDrug({_id: {$in: drugIds}});
    })
    .then(function (_d) {
      console.log('药品信息', _d);//TODO 这里不能按照药品列表展示了，要按照会员计划循环，把所有的药品补上
      _d = JSON.parse(JSON.stringify(_d));
      var drugMap = _.indexBy(_d, '_id');
      console.log('drugMap', drugMap);
      for (var i = 0; i < fdr.length; i++) {
        fdr[i].planId = fdr[i]._id;
        fdr[i]._id = drugMap[fdr[i].drugId]._id;
        fdr[i].name = drugMap[fdr[i].drugId].name;
        fdr[i].images = drugMap[fdr[i].drugId].images;
        fdr[i].desc = drugMap[fdr[i].drugId].desc;
        fdr[i].packageInfo = drugMap[fdr[i].drugId].packageInfo;
        // fdr[i].reimbursePrice = fdr[i].reimbursePrice;
        // fdr[i].leastCount = fdr[i].leastCount;
        // fdr[i].maxCount = fdr[i].maxCount;
        fdr[i].introduction = constants.Introduction;
      }

      // for (var i = 0; i < _d.length; i++) {
      //     _d[i].reimbursePrice = fdrMap[_d[i]._id].reimbursePrice;
      //     _d[i].leastCount = fdrMap[_d[i]._id].leastCount;
      //     _d[i].maxCount = fdrMap[_d[i]._id].maxCount;
      //     _d[i].introduction = constants.Introduction;
      // }

      fdr = _.sortBy(fdr, function (item) {
        return -item.reimbursePrice;
      });
      apiHandler.OK(res, fdr);
    }, function (err) {
      apiHandler.handleErr(res, err);
    });
};

/**
 * 按照会员维护计划返回，返回计划中的药品
 * 地区不适用area，而改为region
 * @param req
 * @param res
 */
ZlycareController.prototype.searchDrugNew = function (req, res) {

  var userId = req.headers[constants.HEADER_USER_ID] || '';
  var deviceId = req.headers[constants.HEADER_DEVICE_ID] || '';
  var drugIds = [];

  if (!userId) {
    return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(1503));
  }

  var pageNum = Number(req.query.pageNum || 0);
  var pageSize = Number(req.query.pageSize || 20);

  var pageSlice = commonUtil.getCurrentPageSlice(req, pageNum, pageSize, {createdAt: -1});
  // var city = req.query.city;
  var type = req.query.type;
  var name = req.query.name;
  var keys = req.query.keys;


  // var cond = {stopPlan: false, balanceVal: {$gt: 0}};
  var cond = {stopPlan: false};//去掉balanceVal字段
  // cond.$or = [{area: '全部城市'}, {area: city}];
  if (type && name) {
    switch (type) {
      case 'province':
        cond['region.province'] = new RegExp(name, 'i');
        break;
      case 'city':
        cond['region.city'] = new RegExp(name, 'i');
        break;
      case 'county':
        cond['region.district'] = new RegExp(name, 'i');
        type = 'district';
        break;
    }
  }
  if (keys) {
    cond.drugName = new RegExp(keys, 'i');
  }

  console.log('请求参数', cond);
  var fdr, fdrMap;
  var result = co(function*() {
    var _fdr = yield FactoryDrugRelService.getFactoryDrugRel(cond, {}, pageSlice);

    fdr = JSON.parse(JSON.stringify(_fdr));

    console.log('最初的数据', fdr.length);
    var fdrRange = [];
    for (var i = 0; i < fdr.length; i++) {
      if (fdr[i].rangeUser && fdr[i].rangeUser.length > 0) {
        fdrRange.push(fdr[i]);
        fdr.splice(i, 1);
        i--;
      }
    }

    console.log('range后的数据', fdrRange.length, fdr.length);
    //会员维护计划的查询条件
    //1、已补贴：审核通过，直接查询，查到结果.length=0，删除
    //2、未补贴：审核未通过、未参加过补贴的，查询审核成功记录.length>0，删除
    for (var i = 0; i < fdrRange.length; i++) {
      // console.log('进入循环');
      console.log('freferfer', i, fdrRange[i].rangeUser);
      for (var j = 0; fdrRange[i] && fdrRange[i].rangeUser && (j < fdrRange[i].rangeUser.length); j++) {
        var fdrRangeCond = {//有一次申请通过，就算通过了
          planId: fdrRange[i].rangeUser[j].planId,
          user: userId,
          auditTime: {
            $gte: fdrRange[i].rangeUser[j].startTime,
            $lte: fdrRange[i].rangeUser[j].endTime,
          },
          checkStatus: 1
        };

        var fdrRangeTemp = yield ReimburseService.getReimburse(fdrRangeCond);

        console.log('补贴用户信息', i, j, fdrRange[i].rangeUser[j].reimburseStatus, fdrRangeTemp);
        // console.log('范围数据', fdrRangeTemp);
        if (fdrRange[i].rangeUser[j].reimburseStatus == 1) {//查询已补贴的用户

          if (fdrRangeTemp && fdrRangeTemp.length == 0) {//从fdrRange中删除
            fdrRange.splice(i, 1);
            i--;
            console.log('减少', i, j, fdrRange.length);
          }
        } else if (fdrRange[i].rangeUser[j].reimburseStatus == 2) {
          if (fdrRangeTemp && fdrRangeTemp.length > 0) {
            fdrRange.splice(i, 1);
            i--;
            console.log('增加', i, j, fdrRange.length);
          }
        }
        // console.log('第几次',j,fdrRange);
      }
    }

    // console.log('特殊操作的fdr',fdrRange);
    for (var key in fdrRange) {
      fdr.push(fdrRange[key]);
    }
    var drugIds = _.map(fdr, function (item) {
      if (item.drugId) {
        return item.drugId;
      }
    });

    // console.log('drugIds', drugIds);
    return DrugService.getDrug({_id: {$in: drugIds}});
  })
    .then(function (_d) {
      // console.log('药品信息', _d);//TODO 这里不能按照药品列表展示了，要按照会员计划循环，把所有的药品补上
      _d = JSON.parse(JSON.stringify(_d));
      var drugMap = _.indexBy(_d, '_id');

      var planIds = [];
      // console.log('drugMap', drugMap);
      for (var i = 0; i < fdr.length; i++) {
        fdr[i].planId = fdr[i]._id;
        fdr[i]._id = drugMap[fdr[i].drugId]._id;
        if (fdr[i].planId) {
          planIds.push(fdr[i].planId + '');
        }
        if (fdr[i]._id) {
          drugIds.push(fdr[i]._id + '');
        }
        fdr[i].name = drugMap[fdr[i].drugId].name;
        fdr[i].images = drugMap[fdr[i].drugId].images;
        fdr[i].desc = drugMap[fdr[i].drugId].desc;
        fdr[i].packageInfo = drugMap[fdr[i].drugId].packageInfo;
        fdr[i].introduction = constants.Introduction;
      }


      return co(function*() {
        //计算最多限补数量
        if (userId && drugIds.length && planIds.length) {
          var items = yield ReimburseService.getReimburseOnly({
            user: userId,
            planId: {$in: planIds},
            drugId: {$in: drugIds},
          }, 'checkStatus reimburseCount planId drugId createdAt');
          var item_map = _.groupBy(items, function (item) {
            return item.planId + ':' + item.drugId
          });
          fdr.forEach(function (_fdr_item) {
            var key = _fdr_item.planId + ':' + _fdr_item._id;
            var limitCount = _fdr_item.maxCount || 0;
            var rArray = item_map[key];
            if (rArray) {
              for (var i = 0; i < rArray.length; i++) {
                var r = rArray[i];
                //最近一年
                if (r.checkStatus != -1 && (r.createdAt + constants.TIME1Y) > Date.now())
                  limitCount -= r.reimburseCount;
              }
            }
            _fdr_item.limitCount = limitCount;
          })
        }
        return fdr;
      });
    })
    .then(function (fdr) {

      fdr = _.sortBy(fdr, function (item) {
        return -item.reimbursePrice;
      });
      console.log('返回的会员维护计划书', fdr.length);
      apiHandler.OK(res, fdr);
    }, function (err) {
      apiHandler.handleErr(res, err);
    });
};

ZlycareController.prototype.getMyReimburse = function (req, res) {

  var userId = req.headers[constants.HEADER_USER_ID] || '';
  if (!userId) {
    return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(3001));
  }

  ReimburseService.getReimburse({user: userId})
    .then(function (_r) {
      var retData = [];
      _r.forEach(function (item) {
        // console.log('fewfef',item.reimbursePrice,item.reimburseCount,item.reimbursePrice * item.reimburseCount);
        retData.push({
          _id: item._id,
          name: item.drugName,
          planId: item.planId,
          packageInfo: item.drugPackage,
          images: item.images,
          desc: item.drugDesc,
          drugImgs: item.drugImgs,
          reimburseImgs: item.reimburseImgs,
          reimbursePrice: item.reimbursePrice,
          reimburseCount: item.reimburseCount,
          reimburseTotal: item.reimbursePrice * item.reimburseCount,
          checkStatus: item.checkStatus,
          remark: item.remark,
          createdAt: item.createdAt
        });
      });
      apiHandler.OK(res, retData);
    }, function (err) {
      apiHandler.handleErr(res, err);
    });

};


ZlycareController.prototype.applyReimburse = function (req, res) {
  var payload = req.body;
  var fields = {
    required: ['drugId', "reimburseCount", "reimburseImgs", "drugImgs"],
    optional: ['city']
  };

  var userId = req.headers[constants.HEADER_USER_ID];
  var user = req.identity && req.identity.user ? req.identity.user : null;
  if (!userId) {
    return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(1503));
  }

  var onFailure = function (handler, type) {
    handler(res, type);
  };
  var onSuccess = function (handler, data) {
    var drug, factoryDrugPlan;
    DrugService.getDrug({_id: data.drugId})
      .then(function (_d) {
        if (!_d || !_d[0])
          throw ErrorHandler.getBusinessErrorByCode(2414);//药品不存在

        drug = _d[0];
        return FactoryDrugRelService.getFactoryDrugRel({drugId: data.drugId, stopPlan: false});
      })
      .then(function (_d) {
        if (!_d || !_d[0])
          throw ErrorHandler.getBusinessErrorByCode(2421);//

        factoryDrugPlan = _d[0];
        if (factoryDrugPlan.leastCount > data.reimburseCount) {
          throw ErrorHandler.getBusinessErrorByCode(2411);//报销数量不应小于计划的最小报销数量
        }

        if (factoryDrugPlan.maxCount < data.reimburseCount) {
          throw ErrorHandler.getBusinessErrorByCode(2412);//报销数量不应大于计划的最大报销数量
        }

        return ReimburseService.getReimburse({
          user: userId,
          planId: factoryDrugPlan._id,
          drugId: data.drugId,
          checkStatus: 1,
          createdAt: {$lt: factoryDrugPlan.createdAt + constants.TIME1Y}
        }, 'drugId reimburseCount');//每用户每年的最大申请数量
      })
      .then(function (_hasReim) {
        console.log('已经审核通过的数量', _hasReim);
        var sum = 0;
        _hasReim.forEach(function (item) {
          if (item.reimburseCount) {
            sum += item.reimburseCount;
          }
        });
        console.log('总补贴数量', sum);
        if (sum > factoryDrugPlan.maxCount) {
          throw ErrorHandler.getBusinessErrorByCode(2416);//用户已补贴数量超过计划的每用户每年可补贴最大数量
        } else if (sum + data.reimburseCount > factoryDrugPlan.maxCount) {
          var err = ErrorHandler.getBusinessErrorByCode(2419);
          if (factoryDrugPlan.maxCount == sum) {
            err.message = '您的报销数量已用完';
          } else {
            err.message += (factoryDrugPlan.maxCount - sum);
          }
          throw err;
        }

        console.log('药品图片', drug.images);
        var reimburse = {
          user: userId,
          userName: user.name,
          userPhoneNum: user.phoneNum,
          factoryCode: factoryDrugPlan.factoryCode,
          factoryName: factoryDrugPlan.factoryName,//药品厂家
          planId: factoryDrugPlan._id,//计划ID
          planName: factoryDrugPlan.planName,//厂家计划名称
          drugName: drug.name,
          drugPackage: drug.packageInfo,
          images: drug.images,
          drugId: data.drugId,
          drugDesc: drug.desc,
          reimburseImgs: data.reimburseImgs,
          drugImgs: data.drugImgs,
          reimbursePrice: factoryDrugPlan.reimbursePrice,
          reimburseCount: data.reimburseCount,
          city: data.city || ''
        };
        return ReimburseService.createReimburse(reimburse);
      })
      .then(function (_r) {
          apiHandler.OK(res, _r);
        },
        function (err) {
          console.log('err:', err);
          apiHandler.handleErr(res, err);
        });

  };

  commonUtil.validate(payload, fields, onSuccess, onFailure);
};
/**
 * 5.4.3之后使用的，使用计划ID进行查询
 * @param req
 * @param res
 */
ZlycareController.prototype.applyReimburseNew = function (req, res) {
  var payload = req.body;
  var fields = {
    required: ['planId', "reimburseCount", "reimburseImgs", "drugImgs"],
    optional: ['buyChannelId', 'buyChannelName']
  };

  var userId = req.headers[constants.HEADER_USER_ID];
  var user = req.identity && req.identity.user ? req.identity.user : null;
  if (!userId) {
    return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(1503));
  }

  var onFailure = function (handler, type) {
    handler(res, type);
  };
  var onSuccess = function (handler, data) {
    var drug, factoryDrugPlan;
    FactoryDrugRelService.getFactoryDrugRel({_id: data.planId, stopPlan: false})
      .then(function (_d) {
        if (!_d || !_d[0])
          throw ErrorHandler.getBusinessErrorByCode(2421);//

        factoryDrugPlan = JSON.parse(JSON.stringify(_d[0]));
        return DrugService.getDrug({_id: factoryDrugPlan.drugId});
      })
      .then(function (_d) {
        if (!_d || !_d[0])
          throw ErrorHandler.getBusinessErrorByCode(2414);//药品不存在

        drug = JSON.parse(JSON.stringify(_d[0]));

        if (factoryDrugPlan.leastCount > data.reimburseCount) {
          throw ErrorHandler.getBusinessErrorByCode(2411);//报销数量不应小于计划的最小报销数量
        }

        if (factoryDrugPlan.maxCount < data.reimburseCount) {
          throw ErrorHandler.getBusinessErrorByCode(2412);//报销数量不应大于计划的最大报销数量
        }

        return ReimburseService.getReimburse({
          user: userId,
          planId: factoryDrugPlan._id,
          drugId: drug._id,
          checkStatus: {$in: [0, 1]},
          createdAt: {$lt: factoryDrugPlan.createdAt + constants.TIME1Y}
        }, 'drugId reimburseCount');//每用户每年的最大申请数量
      })
      .then(function (_hasReim) {
        console.log('(已经审核通过 和 正在审核)的数量', _hasReim);
        var sum = 0;
        _hasReim.forEach(function (item) {
          if (item.reimburseCount) {
            sum += item.reimburseCount;
          }
        });
        console.log('(已经审核通过 和 正在审核)的数量：', sum);
        if (sum > factoryDrugPlan.maxCount) {
          throw ErrorHandler.getBusinessErrorByCode(2416);//用户已补贴数量超过计划的每用户每年可补贴最大数量
        } else if (sum + data.reimburseCount > factoryDrugPlan.maxCount) {
          var err = ErrorHandler.getBusinessErrorByCode(2419);
          if (factoryDrugPlan.maxCount == sum) {
            err.message = '您的报销数量已用完';
          } else {
            err.message += (factoryDrugPlan.maxCount - sum);
          }
          throw err;
        }


        if (data.buyChannelId) {
          return TagCodeService.getTagCode({_id: data.buyChannelId});
        }

      })
      .then(function (_tagCode) {
        var reimburse = {
          user: userId,
          userName: user.name,
          userPhoneNum: user.phoneNum,
          factoryCode: factoryDrugPlan.factoryCode,
          factoryName: factoryDrugPlan.factoryName,//药品厂家
          planId: factoryDrugPlan._id,//计划ID
          planName: factoryDrugPlan.planName,//厂家计划名称
          drugName: drug.name,
          drugPackage: drug.packageInfo,
          images: drug.images,
          drugId: drug._id,
          drugDesc: drug.desc,
          reimburseImgs: data.reimburseImgs,
          drugImgs: data.drugImgs,
          reimbursePrice: factoryDrugPlan.reimbursePrice,
          reimburseCount: data.reimburseCount,
          buyChannel: data.buyChannelId || '',
          buyChannelName: data.buyChannelName || '',
          province: '',
          city: '',
          district: ''
        };
        if (_tagCode && _tagCode.length > 0) {
          reimburse.province = _tagCode[0].province || '';
          reimburse.city = _tagCode[0].city || '';
          reimburse.district = _tagCode[0].district || '';
        }

        return ReimburseService.createReimburse(reimburse);
      })
      .then(function (_r) {
          apiHandler.OK(res, _r);
        },
        function (err) {
          console.log('err:', err);
          apiHandler.handleErr(res, err);
        });

  };

  commonUtil.validate(payload, fields, onSuccess, onFailure);
};

ZlycareController.prototype.getDrugCityList = function (req, res) {

  var flag = false;
  var zxs = ['北京市', '天津市', '重庆市', '上海市', '澳门特别行政区', '香港特别行政区'];
  FactoryDrugRelService.areaCount()
    .then(function (_c) {
      if (_c.indexOf('全部城市') > -1) {
        flag = true;
        return RegionService.findRegion({
          type: 2.0,
          provinceName: {$nin: zxs}
        }, 'name');
      } else {
        return _c;
      }
    })
    .then(function (_r) {
      var retData = [];
      if (flag) {
        zxs.forEach(function (item) {
          retData.push({city: item, regionPinyin: commonUtil.toPinYin(item)});
        });
        _r.forEach(function (item) {
          if (item.name) {
            retData.push({city: item.name, regionPinyin: commonUtil.toPinYin(item.name)});
          }
        });
      } else {
        _r.forEach(function (item) {
          if (item) {
            retData.push({city: item, regionPinyin: commonUtil.toPinYin(item)});
          }
        });
      }

      apiHandler.OK(res, retData);

    }, function (err) {
      apiHandler.handleErr(res, err);
    });

};

ZlycareController.prototype.getDrugAssistantPhones = function (req, res) {

  // var userId = req.headers[constants.HEADER_USER_ID] || '';
  var userId = req.query.userId;
  var drugId = req.query.drugId;
  var area = req.query.area;
  console.log('用户ID', userId);
  if (!drugId) {
    return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(3001));
  }
  if (!area) {
    return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(3001));
  }

  var retData = [];
  if (!userId) {
    console.log('用户ID不存在');
    apiHandler.OK(res, retData);
  } else {
    CustomerService.getAllInfoByID(userId)
      .then(function (user) {
        if (user && user._id && user.tagCode) {
          // return TagCodeService.getTagCode({code: user.tagCode, area: area, 'drugs.drugId': drugId})
          return TagCodeService.getTagCode({code: user.tagCode, 'drugs.drugId': drugId})
        } else {
          return null;
        }
      })
      .then(function (_tagCode) {
        // console.log('_tagCode',_tagCode);
        if (_tagCode && _tagCode[0] && _tagCode[0].contactPhoneNum) {
          retData.push(_tagCode[0].contactPhoneNum);
        }
        apiHandler.OK(res, retData);

      }, function (err) {
        apiHandler.handleErr(res, err);
      });
  }

};

/**
 * 当会员维护计划停止 或者 limitCount<leastCount时，提示"该药品已无法申请补贴"
 * @param req
 * @param res
 */
ZlycareController.prototype.getPlanDetail = function (req, res) {

  var userId = req.headers[constants.HEADER_USER_ID] || '';
  if (!userId) {
    return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(3001));
  }

  var planId = req.query.planId;
  if (!planId) {
    return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(3001));
  }
  var fdr, drug;
  var retData;
  FactoryDrugRelService.getFactoryDrugRel({_id: planId, stopPlan: false})
    .then(function (_fdr) {
      if (!_fdr || !_fdr[0])
      // throw ErrorHandler.getBusinessErrorByCode(2421);//会员维护计划不存在
        throw ErrorHandler.getBusinessErrorByCode(2442);//该药品已无法申请补贴

      fdr = JSON.parse(JSON.stringify(_fdr[0]));
      fdr.planId = fdr._id;
      return DrugService.getDrug({_id: fdr.drugId});
    })
    .then(function (_d) {
      if (!_d || !_d[0])
      // throw ErrorHandler.getBusinessErrorByCode(2414);//药品不存在
        throw ErrorHandler.getBusinessErrorByCode(2442);//该药品已无法申请补贴

      drug = JSON.parse(JSON.stringify(_d[0]));
      fdr.images = drug.images;
      fdr.packageInfo = drug.packageInfo;
      fdr.desc = drug.desc;
      fdr.name = drug.name;
      console.log('kkjbdrug', drug);
      var drug_service = Backend.service("allowance", "drugService");
      return drug_service.drugLimit(userId, [fdr.drugId], [fdr._id], [fdr]);
    })
    .then(function (_ret) {
      retData = JSON.parse(JSON.stringify(_ret[0]));
      console.log('limitCount', retData.limitCount, retData.leastCount);
      if (retData.limitCount < retData.leastCount) {
        return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(2421));//该药品已无法申请补贴
      }
      retData.introduction = constants.Introduction;
      apiHandler.OK(res, retData);
    }, function (err) {
      apiHandler.handleErr(res, err);
    });

};


// ZlycareController.prototype.modifyTagGroup = function (req, res) {
//
//     CustomerService.modifyTagGroupBoss();
// };


ZlycareController.prototype.getOneReimburse = function (req, res) {

  var userId = req.headers[constants.HEADER_USER_ID] || '';
  var reimburseId = req.query.reimburseId;
  if (!userId) {
    return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(3001));
  }

  if (!reimburseId) {
    return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(3001));
  }
  ReimburseService.getReimburse({user: userId, _id: reimburseId})
    .then(function (item) {

      console.log('fefef', item, item.length == 0);
      if (!item || !item[0]) {
        console.log('抛错')
        throw  ErrorHandler.getBusinessErrorByCode(2430);
        // return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(2430));
      }

      item = item[0];

      var retData = {
        _id: item._id,
        name: item.drugName,
        planId: item.planId,
        packageInfo: item.drugPackage,
        images: item.images,
        desc: item.drugDesc,
        drugImgs: item.drugImgs,
        reimburseImgs: item.reimburseImgs,
        reimbursePrice: item.reimbursePrice,
        reimburseCount: item.reimburseCount,
        reimburseTotal: item.reimbursePrice * item.reimburseCount,
        checkStatus: item.checkStatus,
        remark: item.remark,
        createdAt: item.createdAt
      };
      apiHandler.OK(res, retData);
    }, function (err) {
      apiHandler.handleErr(res, err);
    });
};

ZlycareController.prototype.favorite = function (req, res) {
  var payload = req.body;
  var userId = req.identity ? req.identity.userId : '';
  var user = req.identity && req.identity.user ? req.identity.user : null;
  if (!commonUtil.isUUID24bit(userId)) {
    return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
  }
  var fields = {
    required: ['authorId', 'authorType']
  };


  var authInfo;
  var onFailure = function (handler, type) {
    handler(res, type);
  };
  var onSuccess = function (handler, data) {

    Promise.resolve()
      .then(function () {
        if (data.authorType == 'doctor') {
          return ServicePackageDoctorService.findDoctorByCmsId(data.authorId);
        } else if (data.authorType == 'factory') {
          return FactoryService.getFactoryByCmsId(data.authorId);
        } else {
          throw ErrorHandler.getBusinessErrorByCode(8005);
        }
      })
      .then(function (_auth) {
        if (_auth) {
          authInfo = _auth;
          return SocialRelService.getFlewRelByRelIds(userId, _auth._id);
        }
      })
      .then(function (_rel) {
        console.log('查到的关注信息', _rel);
        if (_rel) {
          SocialRelService.updateRelByCond({user: userId, relUser: authInfo._id}, {
            isRelUserFavorite: true
          });

        } else {

          var social = {user: userId, relUser: authInfo._id, isRelUserFavorite: true, from: data.authorType};
          SocialRelService.createRel(social);
        }
        apiHandler.OK(res);
      }, function (err) {
        apiHandler.handleErr(res, err);
      });
  };

  commonUtil.validate(payload, fields, onSuccess, onFailure);
};


ZlycareController.prototype.cancelFavorite = function (req, res) {
  var payload = req.body;
  var userId = req.identity ? req.identity.userId : '';
  var user = req.identity && req.identity.user ? req.identity.user : null;
  if (!commonUtil.isUUID24bit(userId)) {
    return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
  }
  var fields = {
    required: ['authorId', 'authorType']
  };


  var authInfo;
  var onFailure = function (handler, type) {
    handler(res, type);
  };
  var onSuccess = function (handler, data) {

    Promise.resolve()
      .then(function () {
        if (data.authorType == 'doctor') {
          return ServicePackageDoctorService.findDoctorByCmsId(data.authorId);
        } else if (data.authorType == 'factory') {
          return FactoryService.getFactoryByCmsId(data.authorId);
        } else {
          throw ErrorHandler.getBusinessErrorByCode(8005);
        }
      })
      .then(function (_auth) {
        if (_auth) {
          authInfo = _auth;
          return SocialRelService.getFlewRelByRelIds(userId, authInfo._id);
        }
      })
      .then(function (_rel) {
        if (_rel) {
          SocialRelService.updateRelByCond({user: userId, relUser: authInfo._id}, {
            isRelUserFavorite: false
          });

        }
        apiHandler.OK(res);
      }, function (err) {
        apiHandler.handleErr(res, err);
      });
  };

  commonUtil.validate(payload, fields, onSuccess, onFailure);
};


ZlycareController.prototype.myFavorites = function (req, res) {

  var userId = req.headers[constants.HEADER_USER_ID] || '';
  if (!userId) {
    return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(3001));
  }


  SocialRelService.getFlewFavoritesById(userId)
    .then(function (_rels) {
      console.log('guanzhu xinxi ', _rels);
      var cmsIds = [];
      var retData = [];
      for (var i = 0; i < _rels.length; i++) {
        if (_rels[i].doctorInfo && _rels[i].doctorInfo.length > 0) {
          retData.push({
            _id: _rels[i].doctorInfo[0]._id,
            name: _rels[i].doctorInfo[0].name,
            avatar: _rels[i].doctorInfo[0].avatar,
            title: '暂无文章',
            authorId: _rels[i].doctorInfo[0].cmsUserName,
            updatedAt: _rels[i].updatedAt
          });
          cmsIds.push(_rels[i].doctorInfo[0].cmsUserName);
        } else if (_rels[i].factoryInfo && _rels[i].factoryInfo.length > 0) {
          retData.push({
            _id: _rels[i].factoryInfo[0]._id,
            name: _rels[i].factoryInfo[0].name,
            avatar: _rels[i].factoryInfo[0].avatar,
            title: '暂无文章',
            authorId: _rels[i].factoryInfo[0].cmsUserName,
            updatedAt: _rels[i].updatedAt
          });
          cmsIds.push(_rels[i].factoryInfo[0].cmsUserName);
        }
      }

      //TODO 要调用一下信息流

      proxy.get_latest_article_with_authors(cmsIds, userId)
        .then(function (err, result) {
          if (err) apiHandler.handleErr(res, err);

          if (result) {

            console.log('信息里', result);
            var articleArr = _.indexBy(result, 'author_id');
            for (var i = 0; i < retData.length; i++) {
              if (articleArr[retData[i].authorId]) {
                if (articleArr[retData[i].authorId].latest_article && articleArr[retData[i].authorId].latest_article.title) {
                  retData[i].title = articleArr[retData[i].authorId].latest_article.title;

                }
                retData[i].authorType = articleArr[retData[i].authorId].author_type || '';

              }
            }

            retData = _.sortBy(retData, function (item) {
              return -item.updatedAt;
            });
            console.log('result', retData);
            apiHandler.OK(res, retData);
          }
        })
    }, function (err) {
      apiHandler.handleErr(res, err);
    });

};

ZlycareController.prototype.getAuthorInfo = function (req, res) {

  // var userId = req.headers[constants.HEADER_USER_ID] || '';
  var userId = req.query.userId || '';
  var authorId = req.query.authorId;
  var authorType = req.query.authorType;
  if (!authorId) {
    return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(3001));
  }
  if (!authorType) {
    return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(3001));
  }

  var retData = {isFavorited: false};
  let author;
  Promise.resolve()
    .then(function () {
      if (authorType == 'doctor') {
        return ServicePackageDoctorService.findDoctorByCmsId(authorId);
      } else if (authorType == 'factory') {
        return FactoryService.getFactoryByCmsId(authorId);
      } else {
        return null;
      }
    })
    .then(function (_author) {
      _author = JSON.parse(JSON.stringify(_author));
      author = _author;
      if (_author) {
        retData.avatar = _author.avatar || '';
        retData.name = _author.name || '';
        if (authorType == 'doctor') {
          retData.title = _author.title;
          retData.department = _author.department;
          retData.hospital = _author.hospital;
          retData.doctor_id = _author._id;
        }
        if (userId) {
          return SocialRelService.findRelByRelIds(userId, _author._id);
        }
      }
    })
    .then(function (_social) {
      if (_social && _social.isRelUserFavorite) {
        retData.isFavorited = true;
      }
      console.log(author);
      if (authorType == 'doctor') {
        return servicePackageDoctorRefSreivce.findRefByDoctorId(author._id);
      }
    })
    .then(function (ref) {
      console.log(11111);
      retData.hasService = false;
      if (ref && ref.length) {
        retData.hasService = true;
      }
      console.log(22222);
      console.log('获取用户信息', retData);
      apiHandler.OK(res, retData);
    }, function (err) {
      apiHandler.handleErr(res, err);
    });
};


ZlycareController.prototype.getAuthorPageList = function (req, res) {

  var userId = req.query.userId || '';
  var deviceId = req.query.deviceId || '';
  var uuid = userId || deviceId;
  var authorId = req.query.authorId;
  var authorType = req.query.authorType;
  if (!uuid) {
    return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(3001));
  }
  if (!authorId) {
    return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(3001));
  }
  if (!authorType) {
    return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(3001));
  }

  proxy.get_article_list_with_author(authorId, uuid)
    .then(function (err, result) {
      if (err) apiHandler.handleErr(res, err);

      if (result) {
        var retData = [];
        for (var i = 0; i < result.length; i++) {
          retData[i] = {};
          retData[i].desc = result[i].abstract || '朱李叶健康头条';
          retData[i].createdAt = (new Date((new Date(result[i].publish_date)).format('yyyy-MM-dd hh:mm:ss'))).getTime();
          retData[i].title = result[i].title || '';
          retData[i].pics = result[i].image_links || [];
          retData[i].user_name = result[i].source_name || '';
          retData[i].moment_id = result[i].id;
          retData[i].displayURL = [{url: '', text: '【 ' + result[i].title + '】'}];
          retData[i].topStatus = result[i].sticky_status || 0;

          retData[i].authorId = result[i].author_id || '';
          retData[i].authorName = result[i].author_name || '';
          retData[i].authorType = result[i].author_type || '';
          retData[i].formatType = result[i].format_type || '';

        }
        console.log('用户列表信息', retData);
        apiHandler.OK(res, retData);
      }

    }, function (err) {
      apiHandler.handleErr(res, err);
    });
};
/**
 * 通过订单ID，获取订单的支付类型
 * @param req
 * @param res
 */
ZlycareController.prototype.getServicepackageInfo = function (req, res) {

  var userId = req.headers[constants.HEADER_USER_ID] || '';
  var orderId = req.query.orderId;
  if (!orderId) {
    return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(3001));
  }
  // if (!userId) {
  //     return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(3001));
  // }

  ServicePackageOrderService.findOrderByOrderIdSample(orderId)
    .then(function (_spOrder) {
      if (!_spOrder) {
        return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(2426));
      }


      console.log(_spOrder);
      var retData = {
        title: '购买服务包',
        orderId: _spOrder.orderId,
        paidType: _spOrder.paidType,
        paidTime: _spOrder.paidTime,
        price: parseFloat(_spOrder.mountOfRealPay / 100)
      };
      apiHandler.OK(res, retData);


    }, function (err) {
      apiHandler.handleErr(res, err);
    });
};

ZlycareController.prototype.deleteComment = function (req, res) {

  var userId = req.headers[constants.HEADER_USER_ID] || '';
  var commentId = req.body.commentId;
  if (!commentId) {
    return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(3001));
  }
  if (!userId) {
    return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(3001));
  }

  proxy.remove_comment(commentId)
    .then(function (err, result) {
      if (err) apiHandler.handleErr(res, err);

      apiHandler.OK(res);

    });
};


//设置支付密码
ZlycareController.prototype.setPayPassword = function (req, res) {
  var payload = req.body;
  var userId = req.identity ? req.identity.userId : '';
  var user = req.identity && req.identity.user ? req.identity.user : null;
  if (!commonUtil.isUUID24bit(userId)) {
    return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
  }
  var fields = {
    required: ['authCode', 'phoneNum', 'payPassword']
  };


  var onFailure = function (handler, type) {
    handler(res, type);
  };
  var onSuccess = function (handler, data) {

    ValidateService.validateByPhone(data.phoneNum, data.authCode)
      .then(function (v) {
        return CustomerService.setPayPassword(userId, data.payPassword);
      })
      .then(function (u) {
          console.log(u);
          apiHandler.OK(res);
          LoggerService.trace(LoggerService.getTraceDataByReq(req)); //和发送验证码的log一起用，不能删
        },
        function (err) {
          console.log(err);
          apiHandler.handleErr(res, err);
        });

  };

  commonUtil.validate(payload, fields, onSuccess, onFailure);
};


/**
 * 余额支付服务包
 * 1、是否设置过支付密码，未设置抛错，需设置支付密码
 * 2、检查余额是否够，不够抛错，余额不足
 * @param req
 * @param res
 */
ZlycareController.prototype.balancePaymentOfServicepackage = function (req, res) {
  var payload = req.body;
  var userId = req.identity ? req.identity.userId : '';
  if (!commonUtil.isUUID24bit(userId)) {
    return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
  }
  var fields = {
    required: ['orderId', 'payPassword']
  };


  var onFailure = function (handler, type) {
    handler(res, type);
  };
  var onSuccess = function (handler, data) {
    var servicePackageOrderInfo;


    ServicePackageOrderService.getServicePackageOrderInfoById(data.orderId)
      .then(function (_spoInfo) {
        if (!_spoInfo) {
          throw ErrorHandler.getBusinessErrorByCode(2426);//订单不存在
        }
        servicePackageOrderInfo = JSON.parse(JSON.stringify(_spoInfo));
        return checkBalancePayment(userId, data.payPassword, parseFloat(servicePackageOrderInfo.mountOfRealPay / 100));
      })
      .then(function () {

        return ServicePackageService.get(servicePackageOrderInfo.servicePackageId);
      })
      .then(function (_spInfo) {

        if (!_spInfo) {
          throw ErrorHandler.getBusinessErrorByCode(2424);//服务包不存在或已过期
        }


        servicePackageOrderInfo.price = parseFloat(servicePackageOrderInfo.mountOfRealPay / 100);
        servicePackageOrderInfo.payType = PayService.CONS.PAY_TYPE.SYS;
        servicePackageOrderInfo.tradeNo = servicePackageOrderInfo.orderId;
        servicePackageOrderInfo.outTradeNo = '';//余额支付时，外部订单号为空
        servicePackageOrderInfo.type = OrderService.CONS.TYPE.SERVICEPACKAGE;

        return TransactionController.payOrder(res, servicePackageOrderInfo);
      })
      .then(function () {
          apiHandler.OK(res);
        },
        function (err) {
          console.log(err);
          apiHandler.handleErr(res, err);
        });
  };

  commonUtil.validate(payload, fields, onSuccess, onFailure);
};


/**
 * 余额支付医生预约
 * 1、是否设置过支付密码，未设置抛错，需设置支付密码
 * 2、检查余额是否够，不够抛错，余额不足
 * @param req
 * @param res
 */
ZlycareController.prototype.balancePaymentOfMakeAppointment = function (req, res) {
  var payload = req.body;
  var userId = req.identity ? req.identity.userId : '';
  if (!commonUtil.isUUID24bit(userId)) {
    return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
  }
  var fields = {
    required: ['orderId', 'payPassword']
  };


  var onFailure = function (handler, type) {
    handler(res, type);
  };
  var onSuccess = function (handler, data) {
    var mkOrder;

    MakeAppointmentOrderService.findMakeAppointmentOrderServiceByCond({
      orderId: data.orderId,
      status: 100
    })
      .then(function (_mkOrder) {
        if (!_mkOrder || _mkOrder.length == 0) {
          throw ErrorHandler.getBusinessErrorByCode(2432);//预约记录不存在
        }
        mkOrder = JSON.parse(JSON.stringify(_mkOrder[0]));
        return checkBalancePayment(userId, data.payPassword, parseFloat(mkOrder.price / 100));
      })
      .then(function () {

        mkOrder.price = parseFloat(mkOrder.price / 100);
        mkOrder.payType = PayService.CONS.PAY_TYPE.SYS;
        mkOrder.tradeNo = mkOrder.orderId;
        mkOrder.outTradeNo = '';//余额支付时，外部订单号为空
        mkOrder.type = OrderService.CONS.TYPE.MAKEAPPOINTMENT;


        return TransactionController.payOrder(res, mkOrder);
      })
      .then(function () {
          apiHandler.OK(res);
        },
        function (err) {
          console.log(err);
          apiHandler.handleErr(res, err);
        });
  };

  commonUtil.validate(payload, fields, onSuccess, onFailure);
};
/**
 * 检查余额支付
 * @param userId
 * @param payPassword
 * @param payPrice
 * 返回值：账户余额
 */
var checkBalancePayment = function (userId, payPassword, payPrice) {
  return CustomerService.getAllInfoByID(userId)
    .then(function (_user) {
      user = _user;
      if (!user.payPassword || (payPassword != user.payPassword)) {
        throw ErrorHandler.getBusinessErrorByCode(1524);//单独给app端编号  支付密码错误
      }

      return TransactionMysqlService.getAccountByUserIdAndDoctorId(userId + '');
    })
    .then(function (_account) {
      if (!_account || !_account.amount || (_account.amount < payPrice)) {
        throw ErrorHandler.getBusinessErrorByCode(2203);//余额不足
      }

      return _account.amount;
    });
};
ZlycareController.prototype.getMakeAppointmentOrderInfo = function (req, res) {

  var userId = req.headers[constants.HEADER_USER_ID] || '';
  var orderId = req.query.orderId;
  if (!orderId) {
    return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(3001));
  }
  if (!userId) {
    return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(3001));
  }

  MakeAppointmentOrderService.findOrderByOrderIdSample(orderId)
    .then(function (_mkOrder) {
      if (!_mkOrder) {
        return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(2426));
      }


      console.log(_mkOrder);
      var retData = {
        title: '购买预约医生',
        orderId: _mkOrder.orderId,
        paidType: _mkOrder.paidType,
        paidTime: _mkOrder.paidTime,
        price: parseFloat(_mkOrder.price / 100)
      };
      apiHandler.OK(res, retData);


    }, function (err) {
      apiHandler.handleErr(res, err);
    });
};


ZlycareController.prototype.cmsRecommend = function (req, res) {

  // var userId = req.headers[constants.HEADER_USER_ID] || '';
  var pageId = Number(req.query.pageId);
  if (!pageId) {
    return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(3001));
  }
  // if (!userId) {
  //     return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(3001));
  // }

  let recommendNum = 5;


  proxy.get_related_article_list(pageId, recommendNum)
    .then(function (err, result) {
      if (err) self.fail(err);
      let resObj = {code: '200', msg: '', data: []};
      if (result) {

        for (var i = 0; i < result.length; i++) {
          resObj.data[i] = {};
          resObj.data[i].moment_id = result[i].id;
          resObj.data[i].user_name = result[i].source_name || '';
          resObj.data[i].createdAt = (new Date((new Date(result[i].publish_date)).format('yyyy-MM-dd hh:mm:ss'))).getTime();
          resObj.data[i].pics = result[i].image_links || [];
          resObj.data[i].desc = result[i].abstract || '朱李叶健康头条';
          resObj.data[i].authorId = result[i].author_id || '';
          resObj.data[i].authorName = result[i].author_name || '';
          resObj.data[i].authorType = result[i].author_type || '';
          resObj.data[i].formatType = result[i].format_type || '';
          resObj.data[i].title = result[i].title || '';

        }
        console.log('信息', resObj);
        apiHandler.OK(res, resObj);
      }

    });

};


module.exports = exports = new ZlycareController();
