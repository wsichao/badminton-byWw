/**
 * Created by yichen on 2018/7/6.
 */


'user strict';

const co = require('co');
module.exports = {
  postAction: function () {
    result = {
      code:'200',
      msg:''
    }
    return this.success(result);
  }
}