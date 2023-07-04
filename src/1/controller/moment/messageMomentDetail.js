
/**
 * 消息列表跳转动态详情
 * Created by yichen on 2017/6/28.
 */

'use strict';
let service = Backend.service("1/moment","moment_service");
let userService = Backend.service("common","user_service");
let moment_msg_service = Backend.service("1/city_buy", "moment_msg");
let _ = require("underscore");
module.exports = {
  getAction:function () {
    let that = this;
    var userId = this.query.userId;
    var momentId = this.query.momentId;
    var result = {};
    return service.findMomentAllInfoById(momentId)
      .then(function (_moment) {
        if(!_moment){
          return that.fail(8005)
        }
        _moment = JSON.parse(JSON.stringify(_moment));
        var momentURL = _moment && _moment.momentURL;
        _moment.displayURL = moment_msg_service.momentURL(_moment.displayContent, momentURL || []);
        if (_moment.location && _moment.location.length > 0) _moment.location = _moment.location.reverse();
        // 检查用户是否点赞该动态
        _moment.isZan = _.contains(_moment.zanUsers, userId);
        if(_moment.recommendedUser){
          _moment.recommendedUser.userName = _moment.recommendedUser.name;
          if (_moment.recommendedUser.shopVenderApplyStatus > 2) {
            _moment.recommendedUser.userName = _moment.recommendedUser.shopName || _moment.recommendedUser.name || '';
          }
          _moment.recommendedUser.userId = _moment.recommendedUser._id;
          delete _moment.recommendedUser.name;
          delete _moment.recommendedUser._id;
        }
        result.moment = _moment;
        return userService.getInfoByUserId(_moment.userId,"name avatar sex docChatNum shopName")
      })
      .then(function (_user) {
        _user = JSON.parse(JSON.stringify(_user));
        _user.name = _user.shopName || _user.name;
        _user.userId = _user._id;
        result.momentUser = _user;
        return that.success(result);

      })
  }
}
