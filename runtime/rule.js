/**
 * Created by Mr.Carry on 2017/12/25.
 * 数据类型校验
 */
'use strict';

const Joi = require('joi');

module.exports = {
    joiValid(conf, obj) {
        return Joi.validate(obj, conf, { allowUnknown: true });
    }
}