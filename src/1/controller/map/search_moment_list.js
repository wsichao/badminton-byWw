/**
 * 搜索动态列表
 * Created by yichen on 2017/8/3.
 */


/**
 * api-2507 获取所选分类的动态
 * Created by fly on 2017－06－28.
 */
'use strict';
let user_service = Backend.service('common', 'user_service');
let moment_service = Backend.service('1/moment', 'moment_service');
module.exports = {
  // __beforeAction: function () {
  //   if(!isUserInfoAuthorized(this.req)){
  //     return this.fail(8005);
  //   }
  // },
  mockAction: function () {
    let resObj = {
      itemsCount : 100,
      items: [
        {
          userId: '5441f8dee1f5b4a37d9fd0db',
          name: '易翔1',
          avatar: 'FgaWo3jnDxaq13Vlbxn8WUEujmWh',
          currentMoment: '我是易翔,我为自己代言1!'
        },
        {
          userId: '5441f8dee1f5b4a37d9fd0db',
          name: '易翔1',
          avatar: 'FgaWo3jnDxaq13Vlbxn8WUEujmWh',
          currentMoment: '我是易翔,我为自己代言1!'
        },
        {
          userId: '5441f8dee1f5b4a37d9fd0db',
          name: '易翔1',
          avatar: 'FgaWo3jnDxaq13Vlbxn8WUEujmWh',
          currentMoment: '我是易翔,我为自己代言1!'
        },
        {
          userId: '5441f8dee1f5b4a37d9fd0db',
          name: '易翔1',
          avatar: 'FgaWo3jnDxaq13Vlbxn8WUEujmWh',
          currentMoment: '我是易翔,我为自己代言1!'
        },
        {
          userId: '5441f8dee1f5b4a37d9fd0db',
          name: '易翔1',
          avatar: 'FgaWo3jnDxaq13Vlbxn8WUEujmWh',
          currentMoment: '我是易翔,我为自己代言1!'
        }
      ]
    }
    return this.success(resObj);
  },
  getAction: function () {
    let self = this;
    let req = self.req;
    let userId = req.userId;
    let user = req.user;
    let keyword = req.query.keyword ; //搜索关键字
    let coordinate = req.query.coordinate || ''; //位置信息
    let pageSlice = getCurrentPageSlice(req, 0, 24, {createdAt: -1});
    let locUserCount = 0; //区域内有位置用户count
    //验证请求参数
    if (!keyword || coordinate.indexOf(';') < 0 || coordinate.indexOf(',') < 0) {
      return this.fail(3001);
    }
    let resObj = {
      items: [],
      itemsCount: 0
    };
    let users = [];

    var options = {
      keyword : keyword
    }
    return user_service.searchAllUsersWithMoment(coordinate, options,pageSlice)
      .then(function (_result) {
        _result.items = _result.items || [];
        _result.items = JSON.parse(JSON.stringify(_result.items));
        locUserCount = _result.count;
        _result.items.forEach(function (item) {
          let picMoment = item.momentType && (item.momentType == 'pic') ? '分享图片' : '';
          let obj = {
            userId: item._id + '',
            name: item.name,
            avatar: item.avatar,
            currentMoment: item.currentMoment && item.currentMoment.substr(0, 20) || (picMoment || '')
          }
          if(item.shopVenderApplyStatus > 2){
            obj.name = item.shopName;
            obj.avatar = item.shopAvatar;
          }
          resObj.items.push(obj)
        });
        if (_result.items.length < pageSlice.limit) {
          pageSlice.limit -= _result.items.length;
          pageSlice.skip -= locUserCount;
          if(pageSlice.skip < 0){
            pageSlice.skip = 0;
          }
          return user_service.SearchNoLocationUsersByKeyword(keyword,pageSlice);
        }
      })
      .then(function(_users){
        if(_users){
          _users.forEach(function (item) {
            let picMoment = item.momentType && (item.momentType == 'pic') ? '分享图片' : '';
            let obj = {
              userId: item._id + '',
              name: item.name,
              avatar: item.avatar,
              currentMoment: item.currentMoment && item.currentMoment.substr(0, 20) || (picMoment || '')
            }
            if(item.shopVenderApplyStatus > 2){
              obj.name = item.shopName;
              obj.avatar = item.shopAvatar;
            }
            resObj.items.push(obj)
          });
        }
        return user_service.countSearchAllUsersWithMoment(options)
      })
      .then(function(_count){
        resObj.itemsCount = _count;
        return self.success(resObj);
      }, function (err) {
        return self.success(resObj);
      });
  }
}