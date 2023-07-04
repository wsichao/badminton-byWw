/**
 * controller 控制器
 * Created by Mr.Carry on 2017/5/19.
 */
"use strict";
let errConfig = require("./error").getApiError();
let restapi_ctrl = require('./restful.controller');

let DisplayCls = function () {
};

/**
 * 处理上下文环境,检测restful参数,并赋值
 * @param req
 * @param res
 * @param urlObj
 * @param restful
 * @returns {}
 */
let getControllerContext = (req, res, urlObj, restful)=> {
  let result = {
    success: (data)=> {
      if (!data.then) {
        let deferred = Backend.Deferred.defer();
        deferred.resolve(data);
        return deferred.promise;
      }
      return data;
    },
    fail: (fail_msg)=> {
      let deferred = Backend.Deferred.defer();
      let httpCode = 400;
      if (typeof fail_msg == "string") {
        deferred.resolve({"errmsg": fail_msg});
      } else {
        let value = errConfig[fail_msg + ''];
        httpCode = value.httpCode;
        deferred.resolve({code: value.code, msg: value.msg});
      }
      res.status(httpCode);
      return deferred.promise;
    },
    display: (render, data)=> {
      let display_obj = new DisplayCls();
      let deferred = Backend.Deferred.defer();
      display_obj.render = render;
      if (!data.then) {
        let deferred = Backend.Deferred.defer();
        deferred.resolve(data);
        data = deferred.promise;
      }
      display_obj.data = data;
      return display_obj;

    },
    req: req,
    res: res,
    post: req.body,
    query: req.query
  };
  if (urlObj && urlObj.restful_url) {
    let restfulObj = restapi_ctrl.getRestFulObject(urlObj, restful);
    for (let p in restfulObj) {
      result[p] = restfulObj[p];
    }
  }
  return result;
}


/**
 * 返回请求数据
 * @param res
 * @param result
 */
function response(res, result) {
  // render 渲染页面
  if (result instanceof DisplayCls) {
    result.data.then(function (dt) {
      res.render(result.render, dt);
    });
  }
  // restful api
  else {
    result.then(function (data) {
      res.send(data)
    })
  }

}

/**
 * 获取 controller 模块与文件位置
 * @param url
 * @returns {{module: *, curl: string}}
 */
function getControllerPackage(url) {
  let url_arr = url.split('/')
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


function use(express_app) {
  express_app.use((req, res, next)=> {
    let result = {};
    let method = req.method;
    // 检查是否为mock接口
    let mock = req.query.mock;
    let urlObj = restapi_ctrl.restFulConfig(req.url);

    let controller_package = getControllerPackage(urlObj.url);

    let controller_oj, restful;
    try {
      controller_oj = getController(controller_package.module, controller_package.curl);
      restful = controller_oj.restful;
    } catch (e) {
      // console.log(e);
      next();
      return;
    }


    // 通用中间件
    let middleware = getMiddleware().apply(getControllerContext(req, res, urlObj, restful));

    if (middleware) {
      return response(res, middleware);
    }

    // 前置事件
    if (controller_oj.__beforeAction) {
      result = controller_oj.__beforeAction.apply(getControllerContext(req, res, urlObj, restful));
      if (result) {
        return response(res, result);
      }
    }

    /**
     * 找不到对应方法时,打印编译错误提示
     */
    // GET 请求调用 GetAction
    if (mock && mock == "true") {
      result = controller_oj.mockAction.apply(getControllerContext(req, res, urlObj, restful));
    }
    else if (method == "GET") {
      result = controller_oj.getAction.apply(getControllerContext(req, res, urlObj, restful));
    }
    // POST 请求调用 PostAction
    else if (method == "POST") {
      result = controller_oj.postAction.apply(getControllerContext(req, res, urlObj, restful));
    }
    // 其他 METHOD 扩展
    else if (method == 'PUT') {
      result = controller_oj.putAction.apply(getControllerContext(req, res, urlObj, restful));
    }
    else if (method == 'DELETE') {
      result = controller_oj.delAction.apply(getControllerContext(req, res, urlObj, restful));
    } else {
      // 其他 METHOD 扩展
    }
    response(res, result);
  })
}
let getController = (module, url)=> {
  let base_url = Backend.util.getBaseUrl();
  let service = require(base_url + '/' + module + '/controller/' + url);
  return service;
}

let getMiddleware = ()=> {
  let middleware = require("./../src/common/middleware");
  return middleware.method;
}


module.exports = {
  use: use,
  controller: getController
}
