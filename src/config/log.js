'use strict'
function httpLogHandle(self) {
  const res = self.res;
  const status_code = res.statusCode
  const data = self.data;
  const code = data && data.code || ''
  if(status_code && (status_code != 200 || status_code != '200')){
    setHttpErrLog(res, data);
  }else if(data && (data.errmsg != undefined)){
    setHttpErrLog(res, data.errmsg);
  }else if(code && (code != 200 || code != '200')){
    setHttpErrLog(res, getBusinessErrorByCode(code))
  }else{
    setHttpLog(res);
  }
}
module.exports = {
  httpError() {
    // httpLogHandle(this)
  },
  httpInfo() {
    // httpLogHandle(this)
  }
};