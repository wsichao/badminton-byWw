/**
 *  api configs
 *  配置信息
 *  Created by Jacky.L on 4/16/14.
 *  Copyright (c) 2014 ZLYCare. All rights reserved.
 */
module.exports = {
  uri_path: '/api/v1',
  uri_path2: '/api/v2',
  fileUpload: 'fileUpload',
  fileChunkSize: 1024 * 1024,
  pageSizeSmall: 10,
  pageSizeBig: 100,
  pageSize20: 20,
  pageSize1000: 1000,
  pageNow: 1,


  ERR_NO_PATIENT_ID: '请指定会员UUID',
  ERR_NO_USER: '用户不存在',
  ERR_NO_PATIENT: '会员不存在',
  ERR_NO_DOCTOR: '医生不存在',
  ERR_DOCTOR_BIND: '医生已绑定',
  ERR_WRONG_PWD: '密码错误',
  ERR_NEED_PARAMS: '参数不全',
  ERR_PARAMS: '参数有问题',
  ERR_NO_RES: "未找到有效资源",
  ERR_TIME_AREA: "时间段参数设置异常",
  ERR_REPEAT_PHONE: "手机号重复注册",
  ERR_AUTH_CODE: "验证码错误",
  ERR_AUTH_CODE_EXPIRED: "验证码已过期",
  ERR_DUPLICATE_TAG: '标签已存在',

  ERROR_CODE: -1,
  OK_CODE: 0,

  HTTP_200_MSG: '一切正常',
  HTTP_201_MSG: '创建成功',
  UPT_SUS_MSG: '更新成功',
  HTTP_202_MSG: '请求已接受,正在处理中',

  HTTP_300_MSG: '请求资源有多个引用地址',
  HTTP_301_MSG: '请求资源已被移动',
  HTTP_304_MSG: '缓存文档未改变',

  HTTP_400_MSG: '请求参数错误',
  HTTP_401_MSG: '请求未经授权',
  HTTP_403_MSG: '禁止请求该资源',
  HTTP_404_MSG: '请求资源不存在',
  HTTP_405_MSG: '禁止使用该请求方法',
  HTTP_406_MSG: '请求资源类型不兼容',
  HTTP_409_MSG: '请求资源冲突',

  HTTP_500_MSG: '服务端异常',
  HTTP_503_MSG: '服务器维护中',

  NOT_ENOUGH_MSG: '余额不足,请充值',

  NULL_MSG: '',
  NULL_DATA: {}
};