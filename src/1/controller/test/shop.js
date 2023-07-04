/**
 * Created by fly on 2017－06－09.
 */

'use strict';
module.exports = {
  __beforeAction: function () {
   let cookies = this.req.cookies;
   let headers = this.req.headers;
   if(!verifyWebApiToken(cookies, headers['referer'])){
   return this.fail(1003);
   }
   },
  getAction: function () {
    return this.success('ok');
  }
}