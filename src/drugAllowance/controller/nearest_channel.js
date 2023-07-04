/**
 *
 * 通过经纬度获取最近渠道
 *
 * Created by yichen on 2018/4/16.
 */
const tag_code_service = Backend.service('tag_code','tag_code');
const co =require('co')

'use strict';
module.exports = {
  __rule: function(valid){
    return valid.object({
      location : valid.string().required()
    });
  },
  getAction: function () {
    console.log('come in');
    let self = this;
    let location = this.query.location.split(',').reverse();
    let result =co(function* () {
      let result = yield tag_code_service.find_near_tag_code(location);
      console.log(result);
      let resObj =  {
        name : result[0].title,
        _id:result[0]._id
      }
      console.log(resObj);
      return self.success(resObj);
    })
    return result;
  },
  mockAction: function () {
    let res_obj ={
      "name": "mock",
      "_id": "mock"
    }
    return this.success(res_obj);
  }
}