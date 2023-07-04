/**
 *
 * boss调用消息中心
 *
 * Created by yichen on 2018/4/10.
 */

'use strict';
const message_service = Backend.service('boss', 'message');
const mq_message_center = Backend.service('mq', 'message_center');
const co = require('co');
module.exports = {
  __beforeAction: function () {
    console.log('当前的环境', process.env.NODE_ENV);
    if (process.env.NODE_ENV != '_test') {
      let ip = getClientIp(this.req);
      let whiteIP = ['47.95.146.34', '39.96.77.89']; //123.56.147.196 正式公网 182.92.106.199 测试公网
      console.log('请求的ip地址', ip);
      if (whiteIP.indexOf(ip) == -1) {
        return this.fail("必须白名单内的IP才可以访问");
      }
    }
  },
  __rule: function (valid) {
    return valid.object({
      type: valid.number().required(),
      message_ref: valid.string().required()
    });
  },
  postAction: function () {
    console.log('come in');

    let self = this;
    let post = this.post;
    if (!post.type == 4 && (post.sub_type == 1 || post.sub_type == 2) && !post.drug_price_diff) {
      return self.fail(8005);
    }
    return co(function* () {
      let judge_result = yield message_service.judge_type(post);
      if (post.type == 4) {
        let result = yield mq_message_center.push_message_to_mq(judge_result);

        return self.success(result);
      } else {
        //console.log(judge_result);
        let message = yield message_service.push_and_save_message(
          judge_result.push_id,
          judge_result.notificationExtras,
          judge_result.phone_num,
          judge_result.phone_msg_model,
          judge_result.message);
        if (message) {
          return {
            code: '200'
          }
        }
      }
    });
  }
}