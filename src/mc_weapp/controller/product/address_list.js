const mcUserInfoModel = Backend.model('mc_weapp', undefined, 'mc_user_info');
const mongoose = require("mongoose")

module.exports = {
  async getAction() {
    let user_id = this.req.identity.userId;
    const user_info = await mcUserInfoModel.aggregate([
      {
        $match: {userId:mongoose.Types.ObjectId(user_id) }
      },
      { 
        $unwind: "$shopAddressInfo"
      },
      {$match:{'shopAddressInfo.isDeleted':{$ne:true}}}
    ]).exec();

    //查找出最大权重值
    const maxWeight = await mcUserInfoModel.aggregate([{ $match : { userId:mongoose.Types.ObjectId(user_id), isDeleted: {$ne:true}} },{$project: {weight: {$max: "$shopAddressInfo.defaultWeight"}}}]).exec()
    let max = 0
    if (maxWeight[0]) {
      max = maxWeight[0].weight
    }

    let result = user_info.map((user)=>{
      let address = user.shopAddressInfo;
        return {
            name: address.name,
            phone_num: address.phoneNum, //联系方式
            province: address.province, //省名称
            province_id: address.provinceId, //省 id
            city: address.city, //市名称
            city_id: address.cityId, //市 id
            county: address.county, //县名称
            county_id: address.countyId, //县id
            info_address: address.infoAddress, //收货地址
            is_default: max == 0 ? false : address.defaultWeight == max,
            address_id: address._id
        }
    })
    return this.success({
      code: "200",
      msg: "请求地址列表成功",
      item: result
    });
  }
}