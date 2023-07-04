/**
 * Created by fly on 2017－07－11.
 */
'use strict';
let _model = Backend.model('common', undefined, 'doctor');
let _ = require('underscore');
let reservedDocChatNum = require('../../../app/json/reservedDocChatNum');

let _distinctDocChatNum = function () {
  return _model.distinct('docChatNum', {
    isDeleted: false,
    source: 'docChat',
    applyStatus: 'done'
  }).exec();
};
module.exports = {
  applyTobeDoctor: function (data) {
    let condition = {};
    condition.source = 'docChat';
    condition.phoneNum = data.phoneNum;
    condition.applyStatus = "handling";
    condition.isDeleted = false;
    return _model.findOne(condition, "_id").exec().then(function (u) {
      if (u) {
        data.updatedAt = Date.now();
        return _model.findOneAndUpdate(condition, data, {new: true});
      } else {
        data.recommendConf = [
          RECOMMEND_BAK,
          RECOMMEND_ASS,
          RECOMMEND_AD
        ];
        return _model.create(data);
      }
    });
  },
  /**
   * 生成朱李叶健康号码
   * 规则:
   * 1. 0~
   * 2. 1~
   * 3. 2~
   * 4. 60~
   * @ 20161025 UCOM号段由7开头改为8开头
   * 5. 800000 - 819999 批量导入的UCOM账户
   * 6. 820000 - 849999 自动注册的UCOM账户
   * @ 20170103 UCOM号段8开头提升为9位,补三个0
   * 7. 800000000 - 800019999 批量导入的UCOM账户
   * 8. 800020000 - 800049999 自动注册的UCOM账户
   *
   * @param prefix 指定前缀
   * @param infixNum 指定中缀个数,大于等于3
   * @param postfix 指定后缀
   * @returns {*}
   */
  genDoctorChatNum: function (prefix, infixNum, infixMin, infixMax, postfix, existsDocChatNums) {

    prefix = prefix || "";
    postfix = postfix || "";
    if (!infixNum || infixNum <= 1) {
      throw getBusinessErrorByCode(8005);//请求参数有误
    }
    var min = 1;
    var max;
    var infixLen = infixNum;

    if (infixMin)
      min = infixMin;

    if (infixMax) {
      max = infixMax;
    } else {
      max = "";
      while (infixNum--) max += "9";
      max = Number(max);
    }

    // 查询现有的号码
    if (existsDocChatNums && existsDocChatNums.length > 0) {
      var defer = Q.defer();
      for (var i = 0; i < 1000; i++) {// 限尝试1000次,否则失败 @fixme
        var docChatNum = prefix + getRandomNumByStr(min, max, infixLen) + postfix;
        if (!_.contains(existsDocChatNums, docChatNum) && !_.contains(reservedDocChatNum, docChatNum)) {
          defer.resolve(docChatNum);
          break;
        }
      }
      return defer.promise;
    } else {
      return _distinctDocChatNum()
        .then(function (_chatNums) { //分配号码
          //Return
          for (var i = 0; i < 1000; i++) {// 限尝试1000次,否则失败 @fixme
            var docChatNum = prefix + getRandomNumByStr(min, max, infixLen) + postfix;
            if (!_.contains(_chatNums, docChatNum) && !_.contains(reservedDocChatNum, docChatNum))
              return docChatNum;
          }
          //请求处理失败
          throw getBusinessErrorByCode(8007);
        })
    }

  }
}