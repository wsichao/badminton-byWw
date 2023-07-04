/**
 *
 * 渠道号相关service
 *
 * Created by yichen on 2018/4/17.
 */

const model = require('../../../app/models/TagCode');

'use strict';
module.exports = {
  /**
   * 发送消息队列
   */
  find_near_tag_code(location){
    let cond = {
      "location": {
        $near: location
      }
    }
    return model.find(cond).limit(1)
  }

}