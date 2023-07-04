/**
 * controller 控制器
 * Created by Mr.Carry on 2017/5/19.
 */
"use strict";
const errConfig = require("./../error").getApiError();
const restapi_ctrl = require('./restful.controller');
const _ = require('underscore');
const controller_context = require('./controller.context')
const param_valid = require('./param.valid');
const router_config = require('./router.config');
const getControllerContext = controller_context.getControllerContext;
const response = controller_context.response;
const middleware = require("./../../src/common/middleware");
const Joi = require('joi');
/**
 * 获取 controller 模块与文件位置
 * @param url
 * @returns {{module: *, curl: string}}
 */
const getControllerPackage = (url) => {
  url = router_config.get(url);
  let url_arr = url.split('/');
  let module = url_arr[1];
  url_arr.shift();
  url_arr.shift();
  let curl = url_arr.join('/');
  curl = curl.indexOf("?") == -1 ? curl : curl.substr(0, curl.indexOf('?'));
  return {
    module: module,
    curl: curl
  }
}

const use = (express_app) => {
  express_app.use((req, res, next) => {
    let result = {};
    const method = req.method;
    // 检查是否为mock接口
    const mock = req.query.mock;
    const urlObj = restapi_ctrl.restFulConfig(req.url);

    const controller_package = getControllerPackage(urlObj.url);

    let controller_oj, restful;
    try {
      controller_oj = getController(controller_package.module, controller_package.curl);
      restful = controller_oj.restful;
    } catch (e) {
      if (e.code == "MODULE_NOT_FOUND") {
        // 未找到模块，可能有两种情况，一种是express未找到，一种是Backend框架未找到，故忽略该错误，并向下在Model模块处理该错误
      } else {
        console.log(e);
      }
      next();
      return;
    }

    // 当前Controller上下文环境
    let context = getControllerContext(req, res, urlObj, restful);
    // 将Controller object 本身方法添加到上下文环境; DOTO:Controller 方法不会覆盖上下文环境
    context = _.extend(controller_oj, context);
    // 通用中间件
    const middleware = getMiddleware().apply(context);

    if (middleware) {
      return response.apply({ req: req, res: res }, [middleware]);
    }

    // 前置事件
    if (controller_oj.__beforeAction) {
      result = controller_oj.__beforeAction.apply(context);
      if (result) {
        return response.apply({ req: req, res: res }, [result]);
      }
    }
    // 数据格式校验
    if (controller_oj.__rule) {
      result = param_valid.paramJoiRule.apply(context, [controller_oj.__rule(Joi)]);
      if (result) {
        return response.apply({ req: req, res: res }, [result]);
      }
    }

    // GET 请求调用 GetAction
    if (mock && mock == "true") {
      result = controller_oj.mockAction.apply(context);
    }
    else if (method == "GET") {
      result = controller_oj.getAction.apply(context);
    }
    // POST 请求调用 PostAction
    else if (method == "POST") {
      result = controller_oj.postAction.apply(context);
    }
    // PUT 请求调用 PutAction
    else if (method == 'PUT') {
      result = controller_oj.putAction.apply(context);
    }
    // DELETE 请求调用 DelAction
    else if (method == 'DELETE') {
      result = controller_oj.delAction.apply(context);
    } else {
      // 其他 METHOD 扩展
    }
    response.apply({ req: req, res: res }, [result]);
  })
}

const getController = (module, url) => {
  const base_url = Backend.util.getBaseUrl();
  const path = base_url + '/' + module + '/controller/' + url;
  const service = require(path);
  return service;
}

/**
 * 加载全局中间件
 */
const getMiddleware = () => {
  return middleware.method;
}


module.exports = {
  use: use,
  controller: getController
}
