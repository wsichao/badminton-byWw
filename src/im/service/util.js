const request = require('request');
const baas_url = 'http://bc.juliye.net';   //'http://10.81.233.161:8360'
const app_id = (process.env.NODE_ENV == "production") ? "4fce4819-a79b-4c97-8c6e-dbc4bafc100c" : 'ae7c5e90-c32a-416c-9a4a-fc1a4d08df0c'//'29dd5e70-530b-4a3e-bec5-6f76fb2a9d99';
const app_secret = (process.env.NODE_ENV == "production") ? "8bd524ab-f0fb-462a-a8c2-c30cbb37d4ed" : 'ff8a12e4-c145-4978-b91f-18089cbb0fc8' //'be53e3e4-667f-463a-a1bf-6a708d1ae522';
module.exports = {
  /**
   * im 公共请求方法
   * @param url 请求参数
   * @param method 方法
   * @param data 数据
   */
  baseRequest: function (url, method, data) {
    let requestUrl = baas_url + '/im/open' + url;
    let defer = Backend.Deferred.defer();
    let options = {
      url: requestUrl,
      method: method,
      json: true,
      headers: {
        "content-type": "application/json",
        "baas-app-id": app_id,
        "baas-app-secret": app_secret
      }
    };
    if (method.toUpperCase() == 'GET') {
      options.url += '?a=1';
      for (var key in data) {
        options.url += ('&' + key + '=' + data[key]);
      }
    } else if (method.toUpperCase() == 'POST') {
      options.body = data;
    }
    //console.log(options);
    request(options, function (error, response, data) {
      console.log(error);
      console.log(data);
      defer.resolve(data);
    });
    return defer.promise;
  }
}