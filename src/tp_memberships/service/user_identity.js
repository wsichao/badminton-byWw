const card_model = Backend.model('tp_memberships', undefined, 'tp_membership_card');
const supplier_model = Backend.model('tp_memberships', undefined, 'tp_member_supplier');
const vip_member_model = Backend.model('service_package',undefined,'vip_member');
const mongoose = require('mongoose');

module.exports = {
    async identity(userId) {
        let result = ['sample'];
        let cards = await card_model.find({ userId, dueTime: { $gt: Date.now() },isDeleted:false });
        if (cards.length) {
            result.push('member');
        }
        let is_member = await vip_member_model.methods.isVipMember(userId);
        if(is_member && !result[1]){
            result.push('member');
        }
        let suppliers = await supplier_model.aggregate([
            { "$match": { "isDeleted": false }},
            { "$project": { "cts": "$serviceUsers" } },
            { "$unwind": "$cts" },
            { "$match": { "cts.userId": mongoose.Types.ObjectId(userId)  }}
        ]).exec()
        if(suppliers && suppliers.length){
            result.push('shop');
        }
        return result;
    }
}