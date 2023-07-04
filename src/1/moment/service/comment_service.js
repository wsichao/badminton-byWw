/**
 * comment 相关
 * Created by yichen on 2017/6/29.
 */

"use strict";

let model = Backend.model('1/moment', undefined, 'comment');
module.exports = {
  findById: function (id) {
    var cond = {
      _id : id,
      isDeleted : false
    }
    return model.findOne(cond).exec();
  },
  createComment : function(data){
    return model.create(data);
  }
};