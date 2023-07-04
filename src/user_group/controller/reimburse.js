'use strict';
const userFactoryAmount = Backend.service('user_group','userFactoryAmount');
const reimburse_service = Backend.service('user_group','reimburse');
const co = require('co');

module.exports = {
  __beforeAction: function () {
    console.log('当前的环境', process.env.NODE_ENV);
    if (process.env.NODE_ENV != '_test') {
      let ip = getClientIp(this.req);
      let whiteIP = ['123.56.147.196', '182.92.106.199', '127.0.0.1', '172.31.1.22', '172.31.1.23','112.125.88.214'];//123.56.147.196 正式公网 182.92.106.199 测试公网
      console.log('请求的ip地址', ip);
      if (whiteIP.indexOf(ip) == -1) {
        return this.fail("必须白名单内的IP才可以访问");
      }
    }
  },
  postAction(){
    console.log('come in');
    const self = this;
    const reimburseId = this.req.body.reimburseId || '';
    const resObj = {
      code: '200',
      msg: ''
    };
    if(!reimburseId){
      resObj.code = '';
      resObj.msg = 'id 数据错误';
      return self.fail(resObj);
    }
    let result = co(function* (){
      let reimburse = yield reimburse_service.getReimburseById(reimburseId, 'user factoryCode reimbursePrice reimburseCount checkStatus');
      if(!reimburse){
        resObj.code = '';
        resObj.msg = '未找到该补贴记录';
        return resObj;
      }
      if(reimburse.checkStatus != 1){
        resObj.code = '';
        resObj.msg = '该补贴记录未通过审核';
        return resObj;
      }
      let factory = yield reimburse_service.getFactoryInfoByCode(reimburse.factoryCode, '_id');
      if(!factory){
        resObj.code = '';
        resObj.msg = '未找到该补贴记录相关的厂家';
        return resObj;
      }
      const amount = reimburse.reimbursePrice * reimburse.reimburseCount;
      console.log('amount:', amount);
      yield userFactoryAmount.updateAmount(reimburse.user, factory._id, Number(amount.toFixed(2)));
      return resObj;
    });
    return this.success(result);
  }
};