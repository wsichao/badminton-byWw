/**
 * 每天早上7点，发送第二天所有未就诊预约提醒
 * 提醒预约用户，而不是提醒就诊人
 * 脚本跑完后，再有人预约没有提醒
 */
const makeAppointmentOrder = require('../../../app/models/service_package/makeAppointmentOrder');
const user_model = Backend.model('common', '', 'customer');
const _async = require('async');
const sendSms = require('../../../lib/common-util').sendSms;

module.exports = {
  __beforeAction: function () {
    console.log('当前的环境', process.env.NODE_ENV);
    if (process.env.NODE_ENV != '_test') {
      let ip = getClientIp(this.req);
      let whiteIP = ['123.56.147.196', '182.92.106.199', '127.0.0.1', '172.31.1.22', '172.31.1.23','112.125.88.214']; //123.56.147.196 正式公网 182.92.106.199 测试公网
      console.log('请求的ip地址', ip);
      if (whiteIP.indexOf(ip) == -1) {
        return this.fail("必须白名单内的IP才可以访问");
      }
    }
  },
  getAction: function () {
    const now = new Date(); //2017-12-21
    const tomorrow = now.setDate(now.getDate() + 1);
    const beginTS = getDateBeginTS(tomorrow);
    const endTS = getDateEndTS(tomorrow);
    let lastObjectId = getNewObjectId();
    let hasMore = true;
    _async.whilst(
      function () {
        return hasMore;
      },
      function (cb) {
        const cond = {
          _id: {
            $lt: lastObjectId
          },
          isDeleted: false,
          status: 200,
          // 'items.0': {$exists: true}, //todo: 没有项目的是否发送短信
          orderTime: {
            $gt: beginTS,
            $lte: endTS
          }, // todo:
        };
        const options = {
          sort: {
            _id: -1
          },
          limit: 1000
        };
        let orders = [];
        makeAppointmentOrder.find(cond, 'items userId orderTime', options)
          .then(function (_orders) {
            orders = _orders;
            if (orders.length == 0) {
              hasMore = false;
              return [];
            }
            lastObjectId = orders[orders.length - 1]._id;
            const userIds = [];
            for (let i = orders.length - 1; i > -1; i--) {
              const order = orders[i];
              userIds.push(order.userId);
            }
            return user_model.find({
              _id: {
                $in: userIds
              },
              isDeleted: false
            }, 'phoneNum name');
          })
          .then(function (users) {
            users = users || [];
            const user_map = {};
            for (let i = users.length - 1; i > -1; i--) {
              const user = users[i];
              user_map[user._id] = user;
            }

            for (let i = orders.length - 1; i > -1; i--) {
              const order = orders[i];
              const userId = order.userId;
              const tplId = '2377992';
              const phoneNum = user_map[userId] && user_map[userId].phoneNum || '';
              if (phoneNum) {
                //2377992 会员name 项目items 时间date
                const userName = user_map[userId] && user_map[userId].name || '';
                const orderTime = dateFormat(order.orderTime, 'yyyy年MM月dd日hh时mm分')
                const text = '#name#=' + userName +
                  "&#date#=" + orderTime +
                  "&#items#=" + (order.items || []).slice(0, 2).join('、');
                console.log(userName, orderTime, text);
                sendSms(tplId, phoneNum, text);
              }
            }
            cb();
          })
      },
      function () {
        console.log('all have bee completed');
      }
    );
    return this.success('beginning...........');
  }
};