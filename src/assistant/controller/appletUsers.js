/**
 * api 10068 助理－会员  普通用户搜索功能
 * 逻辑：所有从专属医生小程序注册的，非会员用户 user from 'applet'
 * 排序：按字母
 */
const user_service = Backend.service('common', 'user_service');
const vip_member_model = Backend.model('service_package', '', 'vip_member');
const co = require('co');
const _ = require('underscore');
module.exports = {
  getAction: function () {
    const self = this;
    const keyword = this.req.query.keyword || '';
    const res = {
      code: '200',
      msg: '',
      items: []
    };
    return co(function* () {
      const appletUsers = yield user_service.getAppletUsers(keyword, '_id avatar name phoneNum createdAt');
      // console.log('appletUsers:', appletUsers);
      const appUserIds = [];
      const user_map = {};
      for(let i=appletUsers.length -1; i>-1; i--){
        appUserIds.push(appletUsers[i]._id + '');
        user_map[appletUsers[i]._id + ''] = appletUsers[i];
      };
      // console.log('appUserIds:', appUserIds, user_map);

      const vipUsers = yield vip_member_model.methods.getVipUsers(appUserIds);
      // console.log('vipUsers:', vipUsers);

      const vipUserIds = [];
      for(let i=vipUsers.length-1; i>-1; i--){
        vipUserIds.push(vipUsers[i].userId + '');
      }
      // console.log(appUserIds, vipUserIds);
      const normalUserIds = _.difference(appUserIds, vipUserIds);
      const items = normalUserIds.map(function (normalUserId) {
        const user = user_map[normalUserId];
        return {
          _id: user._id,
          name: user.name || '',
          avatar: user.avatar || '',
          phoneNum: user.phoneNum || '',
          pinyin: user.name ? toPinYin(user.name) : '',
          createdAt : user.createdAt
        };
      });
      /*res.items = items.sort(function (a, b) {
        return a.pinyin < b.pinyin; //todo: 无效
      });*/
      res.items = items;
      return self.success(res);
    })
  }
}