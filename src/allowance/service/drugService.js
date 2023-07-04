"use strict";
let co = require('co'),
    _=require('underscore'),
    ReimburseService = require('../../../app/services/ReimburseService'),
    drugModel = Backend.model('allowance','','drugModel'),
    constants = require('../../../app/configs/constants');
module.exports = {
    drugLimit: function (userId, drugIds, planIds, fdr) {
        return co(function* () {
            // console.log('限制补贴');
            //计算最多限补数量
            if (userId && drugIds.length && planIds.length) {
                var items = yield ReimburseService.getReimburseOnly({
                    user: userId,
                    planId: {$in: planIds},
                    drugId: {$in: drugIds},
                }, 'checkStatus reimburseCount planId drugId createdAt');
                var item_map = _.groupBy(items, function (item) {
                    return item.planId + ':' + item.drugId
                });

                fdr.forEach(function (_fdr_item) {
                    var key = _fdr_item.planId + ':' + _fdr_item.drugId;
                    var limitCount = _fdr_item.maxCount || 0;
                    var rArray = item_map[key];
                    if (rArray) {
                        for (var i = 0; i < rArray.length; i++) {
                            var r = rArray[i];
                            //最近一年
                            if (r.checkStatus != -1 && (r.createdAt + constants.TIME1Y) > Date.now())
                                limitCount -= r.reimburseCount;
                        }
                    }
                    _fdr_item.limitCount = limitCount;
                })
            }
            // console.log('限制补贴后的数据',fdr);
            return fdr;
        });
    },
    getOneDrug:function(drugId) {
        let cond={_id:drugId,isDeleted:false};
        return drugModel.findOne(cond);
    },
    getDrugByBarCode:function (barCode) {
        let cond={barCode:barCode,isDeleted:false};
        return drugModel.findOne(cond);
    },
    getDrugList:function (cond) {
        cond.isDeleted=false;
        return drugModel.find(cond);
    }
};
