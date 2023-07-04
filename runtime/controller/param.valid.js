/**
 * controller 参数校验
 * Created by Mr.Carry on 2017/12/27.
 */
const rule = require('./../rule');
const ErrorCls = require('./controller.class').ErrorCls;
let API_VALID_DEFAULT_CODE;
const _ = require('underscore');

module.exports = {
  /**
   * 参数检查
   * @param {*} config 校验规则配置
   * @returns [ error_msg_1,error_msg_2, ... ]
   */
  paramJoiRule(config) {
    if (!config)
      throw Error('参数校验 config 配置不能为空');
    const req = this.req;
    const res = this.res;
    const method = req.method;
    const error_obj = new ErrorCls();
    if (!API_VALID_DEFAULT_CODE) {
      API_VALID_DEFAULT_CODE = Backend.config.getConfig()['API_VALID_DEFAULT_CODE'] || 422;
    }
    const code = API_VALID_DEFAULT_CODE;
    const restful_object = this.restful_object;

    let params = {};
    if (method == "GET") {
      params = this.query;
    }
    else if (method == "POST" || method == "PUT" || method == "DELETE") {
      params = this.post;
    }

    if (restful_object) {
      params = _.extend(params, restful_object);
    }

    let valid_result = rule.joiValid(config, params);

    if (valid_result.error) {
      let msg = [];
      msg = valid_result.error.details.map((item) => {
        return item.message;
      })
      error_obj.run = function () {
        res.status(code).send(msg.join(' '));
      }
    } else {
      if (method == "GET") {
        this.query = valid_result.value;
      }
      else if (method == "POST" || method == "PUT" || method == "DELETE") {
        this.post = valid_result.value;
      }
      if (restful_object) {
        for (let p in restful_object) {
          this[p] = valid_result.value[p];
        }
      }
      return;
    }
    return error_obj;
  }
};