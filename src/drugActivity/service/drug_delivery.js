/**
 * Created by yichen on 2018/5/15.
 */

"use strict";
const model = Backend.model('drugActivity',undefined,'drug_delivery');
const co = require('co');
module.exports = {
  list_by_location: function (location,pageSize,pageNum,type,name) {
    pageSize = pageSize || 20;
    let result = co(function* () {
      let deliverys,result = [];
      let cond = {isDeleted:false};
      if (type && name) {
        switch (type) {
          case 'province':
            cond['province'] = new RegExp(name, 'i');
            break;
          case 'city':
            cond['city'] = new RegExp(name, 'i');
            break;
          case 'county':
            cond['district'] = new RegExp(name, 'i');
            break;
        }
      }
      if(location){
        location = location.split(',').reverse();
        location[0] = parseFloat(location[0])
        location[1] = parseFloat(location[1])
        // deliverys = yield model.aggregate({
        //   $geoNear:{
        //     near:location,
        //     distanceField:"distance",    //指定查询出来的距离数据的别名
        //     $limit : pageSize,
        //     $skip : pageSize*pageNum
        //   }
        // }).exec()
        cond['location'] = {
          $near: location
        }
        deliverys = yield model.find(cond).skip(pageSize*pageNum).limit(pageSize)
      }else{
        deliverys = yield model.find(cond).skip(pageSize*pageNum).limit(pageSize);
      }
      deliverys.forEach(function(item){
        let resItem = {
          _id:	item._id,
          channelName	:item.channelName,
          address	: item.province + item.city + item.district +  item.address,
          phoneNum	:item.phoneNum,
          image	:item.avatar,
          distance :  ''
        }
        if(location && item.location.toString() != [0,0].toString()){
          //console.log(location);
          let distance = global.getDistance(location,item.location);
          resItem.distance = Math.round(distance/100)/10 + 'km'
        }
        result.push(resItem);
      });
      return {code:200,items:result};
    }).catch(function (err) {
      console.log(err);
    })
    return result
  },
}
