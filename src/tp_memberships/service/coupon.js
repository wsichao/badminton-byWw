const coupon_model = Backend.model('tp_memberships', undefined, 'user_discount_coupon');
const member_service = Backend.service('tp_memberships', 'member_service');
const coupon_good_model = Backend.model('tp_memberships', undefined, 'discount_coupon');
const coupon_activity_model = Backend.model('tp_memberships', undefined, 'discount_coupon_activity');

module.exports = {
    /**
     * 获取当前用户会员卡信息
     * @param {*} user_id 当前用户id
     * @param {*} service_id 筛选条件 适用于当前service的优惠券
     * @param {*} page_num 分页
     * @param {*} page_size 分页
     */
    async list(user_id, service_id, page_num, page_size) {
        if(user_id){
            const skip = page_num * page_size;
            const limit = page_size;
            let cond = {
                userId: user_id,
                dueTime: { $gte: (Date.now() - 60 * 60 * 1000) },//我的优惠券列表--过期1h内依然显示
                isDeleted: false
            }
            if (service_id) {//查询可用优惠券
                let service = await member_service.getService(service_id, user_id);//查询服务详情，获取使用优惠券之前的金额
                cond.memberServices = service_id;
                cond.isUsed = false;
                cond.dueTime = { $gte: Date.now() };
                cond.workingCondition = { $lte: service.discount_price };
            }
            const coupons = await coupon_model.find(cond).limit(limit).skip(skip).sort({ createdAt: -1 });          
            let results = [];
            coupons.map(item => {
                let obj = {};
                obj._id = item._id;
                obj.name = item.name;
                obj.working_condition = item.workingCondition;
                obj.limit = item.limit;
                obj.start_time = item.createdAt;
                obj.end_time = item.dueTime;
                if (item.isUsed == false) {//未使用
                    if (obj.end_time >= Date.now()) {//未过期
                        obj.status = 100;
                    } else {//已过期
                        obj.status = 300;
                    }
                } else {//已使用
                    obj.status = 200;
                }
                results.push(obj);
            })
            return results;
        }else{
            return [];
        }

    },
    /**
     * 注册赠送的会员卡列表
     */
    async signInCoupons(user_id) {
        const cond = {
            userId: user_id,
            dueTime: { $gte: Date.now() },
            isUsed: false,
            isDeleted: false
        }
        const coupon = await coupon_model.find(cond).sort({ 'limit': -1 });
        let results = [];
        coupon.map(item => {
            let obj = {};
            obj._id = item._id;
            obj.name = item.name;
            obj.working_condition = item.workingCondition;
            obj.limit = item.limit;
            obj.start_time = item.createdAt;
            obj.end_time = item.dueTime;
            results.push(obj);
        })
        return results;

    },
    /**
     * 当前服务用户可以优惠券数量
     * @param {*} user_id 
     * @param {*} service_id 
     */
    async canUseCouponCount(user_id, service_id, price) {
        // todo 
        let num = 0;
        if(user_id){
            const cond = {
                userId: user_id,
                memberServices: service_id,
                isUsed: false,
                dueTime: { $gte: Date.now() },
                workingCondition: { $lte: price },
                isDeleted: false
            }
            let coupon = await coupon_model.find(cond);
            return coupon.length;
        }else{
            return num;
        }
    },
    /**
     * 用户购买第三方服务使用优惠券
     * @param {*} user_id 
     * @param {*} service_id 
     * @param {*} coupon_id 
     * return {
     *   can_use : true, 优惠券可不可以用
     *   coupon : {} 优惠券信息
     * }
     */
    async buyServiceUseCoupon(user_id, service_id, coupon_id, order_price) {
        const now = Date.now();
        const coupon = await coupon_model.findOne({
            isDeleted: false,
            userId: user_id,
            _id: coupon_id,
            memberServices: service_id,
            workingCondition: { $lte: order_price },
            dueTime: { $gte: now },
            isUsed: false
        })
        if (coupon) {
            await coupon_model.findOneAndUpdate(
                { _id: coupon_id, isDeleted: false },
                { isUsed: true },
                { new: true });
            return {
                can_use: true,
                coupon: coupon
            }
        } else {
            return {
                can_use: false,
                coupon: {}
            }
        }

    },
    /**
     * 用户h5 注册生成优惠券
     * @param {*} user_id 
     */
    async signInGetCoupon(user_id) {
        const now = Date.now();
        const activity = await coupon_activity_model.findOne({
            name: '新人注册赠送100元',
            activityStartTime: { $lte: now },
            activityEndTime: { $gte: now }
        });
        if (activity) {
            let coupon_goods = await coupon_good_model.find({
                _id: { $in: activity.discountCoupon },
                isDeleted: false
            })
            let coupons = [];
            coupon_goods.forEach(item => {
                let couponItem = {
                    userId: user_id,
                    discountCouponId: item._id,
                    type: item.type,
                    name: item.name,
                    limit: item.limit,
                    workingCondition: item.workingCondition,
                    dueTime: now + (item.periodOfValidity * 24 * 60 * 60 * 1000),
                    periodOfValidity: item.periodOfValidity,
                    memberServices: item.memberServices,
                };
                coupons.push(couponItem);
            })
            await coupon_model.create(coupons);
        }
    },
    /**
     * 优惠券退回用户
     * @param {*} coupon_ids 
     */
    async couponRollBack(coupon_ids) {
        await coupon_model.update(
            { _id: { $in: coupon_ids } },
            { $set: { isUsed: false } },
            { multi: true }
        )
    }
}