/**
 * controller context 控制器上下文环境
 * Created by Mr.Carry on 2017/12/26.
 */
const errConfig = require("./../error").getApiError();
const restapi_ctrl = require('./restful.controller');
const Promise = require('bluebird');
const co = require('co');
const log = require('./../log');
const controller_class = require('./controller.class');
const DisplayCls = controller_class.DisplayCls;
const ErrorCls = controller_class.ErrorCls;

const success = (data) => {
  if (!data.then) {
    return Promise.resolve(data);
  }
  return data;
}
/**
* 错误处理
* @returns statusCode 200 , { code : code,msg : 'msg' }
*/
const fail = (fail_msg) => {
  if (typeof fail_msg == "string") {
    return Promise.resolve({ "errmsg": fail_msg });
  } else {
    let value = errConfig[fail_msg + ''];
    return Promise.resolve({ code: value.code, msg: value.msg });
  }
}

/**
* http 请求错误处理
*/
const error = (code, msg) => {
  code = code || 400;
  msg = msg || 'Bad Request';
  let error_obj = new ErrorCls();
  error_obj.msg = msg;
  error_obj.run = function (res) {
    res.status(code).send(msg);
  }
  return error_obj;
}

const display = (render, data) => {
  let display_obj = new DisplayCls();
  display_obj.render = render;
  if (!data.then) {
    data = Promise.resolve(data);
  }
  display_obj.data = data;
  return display_obj;
}

module.exports = {
  /**
    * 处理上下文环境,检测restful参数,并赋值
    * @param req
    * @param res
    * @param urlObj
    * @param restful
    * @returns {}
  */
  getControllerContext(req, res, urlObj, restful) {
    let result = {
      success: success,
      /**
       * 错误处理
       * @returns statusCode 200 , { code : code,msg : 'msg' }
       */
      fail: fail,
      /**
       * http 请求错误处理
       */
      error: error,
      display: display,
      req: req,
      res: res,
      post: req.body,
      query: req.query,
      restful_object: undefined
    };
    if (urlObj && urlObj.restful_url) {
      let restful_object = restapi_ctrl.getRestFulObject(urlObj, restful);
      result.restful_object = restful_object;
      for (let p in restful_object) {
        result[p] = restful_object[p];
      }
    }
    return result;
  },
  /**
    * 返回请求数据
    * @param res
    * @param result
  */
  response(result) {
    let that = this;
    let res = that.res;
    // render 渲染页面
    if (result instanceof DisplayCls) {
      co(function* () {
        let dt = yield result.data;
        that.data = dt;
        res.render(result.render, dt);
        log.httpInfo.apply(that);
      })
    }
    // http status code error
    else if (result instanceof ErrorCls) {
      result.run(res);
      that.data = result.msg;
      log.httpError.apply(that);
    }
    // restful api
    else {
      co(function* () {
        let dt = yield result;
        that.data = dt;
        res.send(dt);
        log.httpInfo.apply(that);
      })
    }
  }
};