/**
 * Created by lijinxia on 2017/9/7.
 */
var
    DynamicSample = require('../models/DynamicSample');
function DynamicSampleService() {
}
DynamicSampleService.prototype.constructor = DynamicSample;

DynamicSampleService.prototype.genSample = function (userId, info) {
    if (!userId || !info || isNaN(info.type) || !info.targetId || isNaN(info.action) || !info.tags) {
        console.log('info err');
    }
    var sample = {
        userId: userId,
        type: info.type,
        targetId: info.targetId,
        action: info.action,
        tags: info.tags
    };
    return DynamicSample.create(sample);
};

module.exports = new DynamicSampleService();