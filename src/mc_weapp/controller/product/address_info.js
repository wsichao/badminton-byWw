const mcUserInfoModel = Backend.model('mc_weapp', undefined, 'mc_user_info');
const mongoose = require("mongoose")

module.exports = {
    async getAction() {
        let user_id = this.req.identity.userId;
        let address_id = this.query.address_id;
        let isDefault = this.query.is_default || false; 
        let user_info = await mcUserInfoModel.findOne({
            userId: user_id,
            shopAddressInfo:{'$elemMatch':{_id:address_id, isDeleted:{$ne:true}}}
        },{shopAddressInfo:{'$elemMatch':{_id:address_id, isDeleted: {$ne:true}}}})
        
        let maxWeight = 0;
        const max = await mcUserInfoModel.aggregate([{ $match : { userId:mongoose.Types.ObjectId(user_id), isDeleted: {$ne:true}} },{$project: {weight: {$max: "$shopAddressInfo.defaultWeight"}}}]).exec()
        if (max[0]) {
            maxWeight = max[0].weight
            //用来获取默认地址
            if (isDefault) {
                user_info = await mcUserInfoModel.findOne({
                    userId: user_id,
                    shopAddressInfo:{'$elemMatch':{"defaultWeight":max[0].weight, isDeleted: {$ne:true}}}
                },{shopAddressInfo:{'$elemMatch':{"defaultWeight":max[0].weight, isDeleted: {$ne:true}}}})
            }
        }
        let result = {}
        if (user_info != null) {
            let address = user_info.shopAddressInfo[0]
            result = {
               name: address.name,
               phone_num: address.phoneNum,
               province: address.province,
               province_id: address.provinceId,
               city: address.city, //市名称
               city_id: address.cityId, //市 id
               county: address.county, //县名称
               county_id: address.countyId, //县id
               info_address: address.infoAddress, //收货地址
               is_default: address.defaultWeight == maxWeight,
               address_id: address._id
            }
        }

        return this.success({
            code: "200",
            msg: "",
            data: result
        });
    },
    //添加和更改地址详情
    async postAction() {
        let user_id = this.req.identity.userId;
        let address_id = this.post.address_id;
        let name = this.post.name || "";
        let phoneNum = this.post.phone_num || "";
        let province = this.post.province || "";
        let provinceId = this.post.province_id || -1;
        let city = this.post.city || "";
        let cityId = this.post.city_id || -1;
        let county = this.post.county || "";
        let countyId = this.post.county_id || -1;
        let infoAddress = this.post.info_address || "";
        let isDefault = this.post.is_default || false;
        let defaultWeight = 0;
        if (isDefault) {
            defaultWeight = new Date().getTime();
        }
        //如果有 addres_id 就是更改 要不为添加
        if (address_id == undefined || address_id == "") {
            //判断是不是第一个如果是第一个也是默认
            const user = await mcUserInfoModel.aggregate([
                {
                  $match: {userId:mongoose.Types.ObjectId(user_id) }
                },
                { 
                  $unwind: "$shopAddressInfo"
                },
                {$match:{'shopAddressInfo.isDeleted':{$ne:true}}}
              ]).exec();

            if (user.length == 0) {
                defaultWeight = new Date().getTime();
            }
            const user_info = await mcUserInfoModel.update(
                { userId: user_id },
                { $push: { shopAddressInfo: {name,phoneNum,province,provinceId,city,cityId,county,countyId,infoAddress,defaultWeight,isDeleted: false}}})
            
            if (user_info.ok == 1) {
                return this.success({
                    code: "200",
                    msg: "添加地址成功"
                });
            }
        }else {
            const user_info = await mcUserInfoModel.update({
                userId: user_id,
                shopAddressInfo: { $elemMatch: {_id: address_id} }
                },{ $set: { "shopAddressInfo.$": {_id: address_id,name,phoneNum,province,provinceId,city,cityId,county,countyId,infoAddress,defaultWeight,isDeleted: false} } })
            
            if (user_info.ok == 1) {
                return this.success({
                    code: "200",
                    msg: "更改地址成功"
                });
            }
        }
    }
}