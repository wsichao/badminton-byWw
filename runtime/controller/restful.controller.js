/**
 * Created by Mr.Carry on 2017/7/17.
 */
"use strict";


/**
 * restful api 与 URL 对应,转换为对象
 * @param urlObj
 * @param restful
 * @returns {{}}
 */
const getRestFulObject = (urlObj, restful) => {
  let result = {};
  if (urlObj && urlObj.restful_url && restful) {
    let restful_url = urlObj.restful_url.split('/');
    restful = restful.split('/');
    for (let i = 0; i < restful_url.length; i++) {
      if (restful[i] != undefined) {
        let key = restful[i].replace(':', '');
        result[key] = restful_url[i] || null;
      }
    }
  }
  return result;
}

/**
 * 处理 restful api 数据
 * @param url
 */
const restFulConfig = (url) => {
  const url_arr = url.split(':/');
  let result = {
    url: url_arr[0]
  };
  if (url_arr.length > 1) {
    result.restful_url = url_arr[1];
  }
  return result;
}

module.exports = {
  restFulConfig: restFulConfig,
  getRestFulObject: getRestFulObject
}