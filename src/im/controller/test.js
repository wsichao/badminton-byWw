/**
 *
 * 测试用
 * Created by yichen on 2018/8/3.
 */


'user strict';
let util_service = Backend.service('im','util');
let co = require('co');


module.exports = {
  getAction: function () {
    let self = this;
    return co(function *(){
      let result = yield util_service.baseRequest('/user/create','POST',{
        user_ids: [ '5937b047381b03789aa18e82', '5ab49a3d0dd25d4b73fc2f31' ] 
      });
      return self.success(result);
    });

  }
};
