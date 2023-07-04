/**
 * api-2507 获取所选分类的动态
 * Created by fly on 2017－06－28.
 */
'use strict';
let config_service = Backend.service('common', 'config_service');
let user_service = Backend.service('common', 'user_service');
let shop_service = Backend.service('common', 'shop_service');
let moment_service = Backend.service('1/moment', 'moment_service');
module.exports = {
  __beforeAction: function () {
    if(!isUserInfoAuthorized(this.req)){
      return this.fail(8005);
    }
  },
  mockAction: function () {
    let resObj = {
      items: [
        {
          userId: '5441f8dee1f5b4a37d9fd0db',
          name: '易翔1',
          type: '-1',
          currentMoment: '我是易翔,我为自己代言1!',
          coordinate: [39.910393, 116.45598],
          couponValue: '0',
          couponValueNum: 0,
          remainMemberSize: 0,
        },
        {
          userId: '5441f8dee1f5b4a37d9fd0db',
          name: '易翔2',
          type: '1',
          currentMoment: '我是易翔,我为自己代言2!',
          coordinate: [39.910393, 116.45598],
          couponValue: '1000',
          couponValueNum: 1000,
          remainMemberSize: 10,
        }, {
          userId: '5441f8dee1f5b4a37d9fd0db',
          name: '易翔3',
          type: '-1',
          currentMoment: '我是易翔,我为自己代言3!',
          coordinate: [39.910393, 116.45598],
          couponValue: '0',
          couponValueNum: 0,
          remainMemberSize: 0,
        }, {
          userId: '5441f8dee1f5b4a37d9fd0db',
          name: '易翔4',
          type: '-1',
          currentMoment: '我是易翔,我为自己代言4!',
          coordinate: [39.910393, 116.45598],
          couponValue: '0',
          couponValueNum: 0,
          remainMemberSize: 0,
        }, {
          userId: '5441f8dee1f5b4a37d9fd0db',
          name: '易翔5',
          type: '0',
          currentMoment: '我是易翔,我为自己代言5!',
          coordinate: [39.910393, 116.45598],
          couponValue: '100',
          couponValueNum: 100,
          remainMemberSize: 20
        },
      ]
    }
    return this.success(resObj);
  },
  getAction: function () {
    let self = this;
    let req = self.req;
    let userId = req.userId;
    let user = req.user;
    let type = req.query.type || 'all';//全部 商户 医疗 收藏 金融 个人
    let coordinate = req.query.coordinate || '';
    //验证请求参数
    if (!type || coordinate.indexOf(';') < 0 || coordinate.indexOf(',') < 0) {
      return this.fail(3001);
    }
    let resObj = {
      items: []
    };

    let maxNum = 24; //首页地图最多显示动态的条数
    let maxDays = 7; //每条动态能展示的最长时间

    let users = [];
    let config_id = '5954af71b1bce56941cdeb7f';
    return config_service.getConfigInfoById(config_id)
      .then(function (_config) {
        maxNum = _config && _config.field && _config.field.maxNum || maxNum;
        maxDays = _config && _config.field && _config.field.maxDays || maxDays;

        //获取当前选择分类的用户动态
        let fuvName = type;
        let options = {
          maxDays: maxDays,
          maxNum: maxNum
        }
        if (['shop', 'medical'].indexOf(type) > -1) {
          fuvName = 'shop';
          options.shopType = type;
        }
        if (['favorite', 'personal'].indexOf(type) > -1) {
          options.favorite_ref_ids = user.favoriteDocs || [];
        }
        //console.log('get' + fuvName + 'UsersWithMoment', fuvName[0]);
        let funStr = 'get' + fuvName[0].toUpperCase() + fuvName.substring(1, fuvName.length) + 'UsersWithMoment';
        return user_service[funStr](coordinate, options);
      })
      .then(function (_users) {
        //console.log(_users);
        users = _users || [];
        users = JSON.parse(JSON.stringify(users)); //

        let _shop_ids = []; //运营商户,marketing数据为运营商户的marketing数据
        _users.forEach(function(item){
          if(item.shopProp == 1){
            _shop_ids.push(item._id + "");
          }
        })
        return shop_service.getShopInfoByUserIds(_shop_ids, 'userId cps remainMemberSize');
      })
      .then(function(_shops) {
        //console.log(shops);
        _shops = _shops || [];
        let map = {};
        _shops.forEach(function (item) {
          map[item.userId + ''] = item;
        })
        resObj.items = users.map(function (item) {
          let picMoment = item.momentType && (item.momentType == 'pic') ? '【图片】' : '';
          //console.log(picMoment);
          let marketing = item.marketing || {isMarketingClosed: true};
          let isMarketingClosed = marketing.isMarketingClosed ;
          let cps = (!isMarketingClosed) && marketing.cps || 0;
          let remainMemberSize = (!isMarketingClosed) && marketing.remainMemberSize || 0;
          if (map[item._id + '']) {
            cps = map[item._id + ''].cps || 0;
            remainMemberSize = map[item._id + ''].remainMemberSize || 0;
          }

          let isShopAuth = isShopAuthorized(item.shopVenderApplyStatus);
          let name = isShopAuth ? (item.shopName || '') : (item.name || '');
          let coordinate = isShopAuth ? (item.shopLocation ? item.shopLocation.reverse() : []) : (item.momentLocation ? item.momentLocation.reverse() : []);
          //console.log('coordinate:',coordinate);
          let obj = {
            userId: item._id + '',
            name: name,
            couponValue: isShopAuth ? cps : 0,
            coordinate: coordinate,
            currentMoment: item.currentMoment && item.currentMoment.substr(0, 20) || (picMoment || ''),
            remainMemberSize: isShopAuth ? remainMemberSize : 0
          }
          //console.log('obj:', obj.remainMemberSize);
          obj.type = isShopAuth ? (obj.shopType == "医疗" ? "1" : "0") : -1;
          obj.couponValueNum = getRandomCoupon(obj.couponValue, false);
          obj.couponValue = obj.couponValueNum + '';
          //console.log('_obj:', obj);
          return obj;
        });
        return self.success(resObj);
      }, function (err) {
        return self.success(resObj);
      });
  },
/*
  getAction: function () {
    let self = this;
    let req = self.req;
    let userId = req.userId;
    let user = req.user;
    let type = req.query.type || 'all';//全部 商户 医疗 收藏 金融 个人
    let coordinate = req.query.coordinate || '';
    //验证请求参数
    if (!type || coordinate.indexOf(';') < 0 || coordinate.indexOf(',') < 0) {
      return this.fail(3001);
    }
    let resObj = {
      items: []
    };

    let maxNum = 24; //每个人最多显示动态的条数
    let maxDays = 7; //每条动态能展示的最长时间
    let maxNumPer = 2; //每条动态能展示的最长时间

    let moments = [];
    let momentUserIds = [];
    let users = [];
    let shops = [];
    let config_id = '5954af71b1bce56941cdeb7f';
    return config_service.getConfigInfoById(config_id)
      .then(function (_config) {
        maxNum = _config && _config.field && _config.field.maxNum || maxNum;
        maxDays = _config && _config.field && _config.field.maxDays || maxDays;
        maxNumPer = _config && _config.field && _config.field.maxNumPer || maxNumPer;
        //获取当前选择分类的用户动态
        let fuvName = type;
        let options = {
          maxDays: maxDays,
          maxNum: maxNum,
          maxNumPer: maxNumPer
        }
        if(type == 'favorite'){
          options.favorite_ref_ids = user.favoriteDocs || [];
        }
        console.log('come in',coordinate, type, options);
        return moment_service.getMapMomentsInfo(coordinate, type, options);
      })
      .then(function (_res) {
        let momentsInfo = _res;
        moments = momentsInfo.moments;
        momentUserIds = momentsInfo.momentUserIds;
        //获取主账户信息
        return user_service.getInfoByUserIds(momentUserIds);
      })
    .then(function(_users) {
      users = _users;
      //获取运营商户信息
      let _shop_ids = []; //运营商户,marketing数据为运营商户的marketing数据
      users.forEach(function(item){
        if(item.shopProp == 1){
          _shop_ids.push(item._id + "");
        }
      })
      return shop_service.getShopInfoByUserIds(_shop_ids, 'userId cps remainMemberSize');
    })
    .then(function(_shops){
        shops = _shops;
        _shops = _shops || [];
        let map = {};
        _shops.forEach(function (item) {
          map[item.userId + ''] = item;
        })
        let userMap = {};
        users.forEach(function (item) {
          userMap[item._id + ''] = item;
        })
        resObj.items = moments.map(function (item) {
          let picMoment = (!item.originalContent) && (item.pics && item.pics.length > 0) ? '【图片】' : '';
          let _user = userMap[item.userId + ''];
          //是否为商户
          let isShopAuth = isShopAuthorized(_user.shopVenderApplyStatus);

          //商户是否作为商户身份显示,还是作为个人身份显示
          let isAsShop = ['shop', 'medical'].indexOf(item.type) > -1 ? true : false;

          let name = isShopAuth ? (_user.shopName || '') : (_user.name || '');
          let coordinate = (isShopAuth && isAsShop) ? (_user.shopLocation ? _user.shopLocation.reverse() : []) : (item.location ? item.location.reverse() : []);
          let marketing = isShopAuth && _user.marketing || {isMarketingClosed: true};
          let isMarketingClosed = marketing.isMarketingClosed;
          let cps = (!isMarketingClosed) && marketing.cps || 0;
          let remainMemberSize = (!isMarketingClosed) && marketing.remainMemberSize || 0;
          //运营商户信息
          if (map[item.userId + '']) {
            cps = map[item.userId + ''].cps || 0;
            remainMemberSize = map[item.userId + ''].remainMemberSize || 0;
          }
          let obj = {
            userId: item.userId + '',
            name: name,
            couponValue: (isShopAuth && isAsShop) ? cps : 0,
            coordinate: coordinate,
            currentMoment: item.originalContent && item.originalContent.substr(0, 20) || (picMoment || ''),
            remainMemberSize: (isShopAuth && isAsShop) ? remainMemberSize : 0
          }
          //console.log('obj:', obj.remainMemberSize);
          obj.type = (isShopAuth && isAsShop) ? (obj.shopType == "医疗" ? "1" : "0") : -1;
          obj.couponValueNum = getRandomCoupon(obj.couponValue, false);
          obj.couponValue = obj.couponValueNum + '';
          //console.log('_obj:', obj);
          return obj;
        });
        return self.success(resObj);
      }, function (err) {
      console.log(err);
        return self.success(resObj);
      });
  },
*/
}