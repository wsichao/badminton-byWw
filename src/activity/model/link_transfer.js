/**
 *
 * 有奖链接转化成短链接（使用uuid）
 *
 * Created by yichen on 2018/3/30.
 */


"use strict";

module.exports = {
  config: {
    realLink: {
      type: String
    }
  },
  options: {
    collection: 'linkTransfer'
  },
  methods : {
    set_link : function(realLink){
      return this.create({realLink:realLink});
    },
    find_link : function(realLink){
      return this.findOne({realLink:realLink})
    },
    get_link : function (uuid) {
      return this.findOne({_id:uuid});
    }
  }
};