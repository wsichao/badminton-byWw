/**
 * Created by lijinxia on 2017/9/7.
 */
var
    VipMembershipTrades = require('../models/VipMembershipTrades');
function VipMembershipTradesService() {
}
VipMembershipTradesService.prototype.constructor = VipMembershipTrades;

module.exports = new VipMembershipTradesService();