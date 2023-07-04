'use strict';
const group_service = Backend.service('user_group','group');
const co = require('co');

module.exports = {
  getAction(){
    let result = co(function*(){
      let dt = yield group_service.getGroupArticles('5a9ce331d741bbbe658412f4');
      console.log('dt:', dt);
      return { name : dt};
    })
    return this.success(result);
  }
};