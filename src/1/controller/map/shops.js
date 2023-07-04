/**
 * Created by fly on 2017－06－06.
 */
'use strict';
let user_service = Backend.service('common', 'user_service');
let shop_service = Backend.service('common', 'shop_service');
module.exports = {
  __beforeAction: function () {
    return userInfoAuth(this.req, {
      items: []
    });
  },
  mockAction: function () {
    let resObj = {
      items: [
        {
          _id: '57d77e24f52e142136bd8573',
          shopName: '温馨小店',
          shopType: '0',
          couponValue: '0.5',
          couponValueNum: 0.5,
          coordinate: [39.911758734809, 116.466264919705],
          currentMoment: '有优惠!'
        },
        {
          _id: '5819ed2593740e996bf3f824',
          shopName: '温馨小店2',
          shopType: '1',
          couponValue: '0.8',
          couponValueNum: 0.8,
          coordinate: [39.911758744809, 116.466264929705],
          currentMoment: '有返现!'
        },
        {
          _id: '5819ed2593740e996bf3f824',
          shopName: '温馨小店3',
          shopType: '0',
          couponValue: '1.8',
          couponValueNum: 1.8,
          coordinate: [39.911758744809, 116.466264929705],
          currentMoment: ''
        },{
          _id: '5819ed2593740e996bf3f824',
          shopName: '温馨小店4',
          shopType: '0',
          couponValue: '1.8',
          couponValueNum: 1.8,
          coordinate: [39.911758744809, 116.466264929705],
          currentMoment: ''
        },{
          _id: '5819ed2593740e996bf3f824',
          shopName: '温馨小店5',
          shopType: '0',
          couponValue: '3.8',
          couponValueNum: 3.8,
          coordinate: [39.911758744809, 116.466264929705],
          currentMoment: '有优惠!'
        },{
          _id: '5819ed2593740e996bf3f824',
          shopName: '温馨小店6',
          shopType: '0',
          couponValue: '0.8',
          couponValueNum: 0.8,
          coordinate: [39.911758744909, 116.466264919705],
          currentMoment: ''
        },
      ]
    };
    return this.success(resObj);
  },
  getAction: function () {
    let query = this.req.query;
    let coordinate = query.coordinate || '';
    //验证请求参数
    if(coordinate.indexOf(';') < 0 || coordinate.indexOf(',') < 0){
      return this.fail(3001);
    }
    let resObj = {
      items: []
    }
    let maxSize = 24;
    //获取方形坐标内的商铺
    let shops = [];
    //todo: 获取了所有的数据
    let res_promise = user_service.getShopsInRectMapArea(coordinate)
    .then(function(_shops){
      shops = _shops || [];
      shops = JSON.parse(JSON.stringify(shops)); //todo: ??必要么,原来的接口需要更改?
      let _shop_ids = [];
      _shops.forEach(function(item){
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
        map[item.userId] = item;
      })
      shops.forEach(function (item) {
        if (map[item._id + '']) {
          //console.log(map[item._id + ''].cps);
          item.marketing.cps = map[item._id + ''].cps || 0;
          item.marketing.remainMemberSize = map[item._id + ''].remainMemberSize || 0;
        }
      });
      let result = shops.map(function (item) {
        let hasMomment = isInSomeNatureDay(item.momentUpdatedAt || 0, momentVisibleDays);
        let obj = {
          _id: item._id,
          shopName: item.shopName,
          shopType: item.shopType,
          couponValue: item.marketing.cps,
          coordinate: item.shopLocation ? item.shopLocation.reverse() : [],
          currentMoment: hasMomment ? item.currentMoment : '', //3个自然日
          remainMemberSize: item.marketing.remainMemberSize
        }
        //console.log('obj:', obj.remainMemberSize);
        obj.shopType = obj.shopType == "医疗" ? "1" : "0";
        obj.couponValueNum = getRandomCoupon(obj.couponValue, false);
        obj.couponValue = obj.couponValueNum + '';
        //console.log('_obj:', obj);
        return obj;
      })
      result.sort(function (x, y) {
        return x.couponValueNum - y.couponValueNum;
      })
      result = result.reverse().splice(0, maxSize);
      resObj.items = result;
      //console.log('result:',result);
      let restNum = maxSize - result.length;
      console.log('restNum:', restNum);
      if (restNum > 0) {
        return user_service.getUsersInRectMapArea(coordinate, {limit: restNum});
      }else{
        return [];
      }
    })
    .then(function(_users){
      //console.log('_users:', _users);
      _users = JSON.parse(JSON.stringify(_users));
      _users.forEach(function(_user){
        let picMoment = _user.momentType && (_user.momentType == 'pic') ? '【图片】' : '';
        let item = {
          _id: _user._id,
          shopName: _user.name || '',
          shopType: '-1',
          couponValue: '0',
          couponValueNum: 0,
          coordinate: _user.momentLocation && _user.momentLocation.reverse() || [],
          currentMoment: _user.currentMoment && _user.currentMoment.substr(0, 20) || (picMoment || ''),
          remainMemberSize: 0,
        }
        resObj.items.push(item);
      });
      return resObj;
    }, function (err) {
      console.log('err:', err);
    });
    return this.success(res_promise);
  }
}