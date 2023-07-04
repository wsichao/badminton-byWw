const mcUserInfoModel = Backend.model('mc_weapp', undefined, 'mc_user_info');
const mcConsultingModel = Backend.model('mc_weapp', undefined, 'mc_consulting');

const _ = require("underscore");

module.exports = {
  async getList(user_id) {
    const users = await mcUserInfoModel.find({
      volunteersUserId: user_id,
      isDeleted: false
    });

    const user_ids = users.map(item => {
      return item.userId + '';
    });

    const user_infos = await mcUserInfoModel.find({
      userId: {
        $in: user_ids
      },
      isDeleted: false
    })

    const user_info_index = _.indexBy(user_infos, "userId");

    let result = await mcConsultingModel.find({
      userId: {
        $in: user_ids
      },
      isDeleted: false
    }).sort({
      createdAt: -1
    });
    result = result.map(item => {
      const user_name = user_info_index[item.userId].consultingObj.name;
      const user_phone = user_info_index[item.userId].consultingObj.phoneNum;
      return {
        id: item._id,
        name: item.name,
        detail: item.detail,
        time: item.createdAt,
        user_name,
        user_phone
      };
    })
    return result;
  },
  async getAction() {
    const user_id = this.req.identity.userId;
    const result = await this.getList(user_id);
    return this.success({
      result
    });
  }
}