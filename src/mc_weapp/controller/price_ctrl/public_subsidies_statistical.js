const mcConsultingModel = Backend.model('mc_weapp', undefined, 'mc_consulting');
const mcShareService = Backend.service('mc_weapp', 'share');
const mcUserInfoModel = Backend.model('mc_weapp', undefined, 'mc_user_info');
const mcUserRefModel = Backend.model('mc_weapp', undefined, 'mc_user_ref');
const mcAccountingService = Backend.service('mc_weapp', 'accounting');

module.exports = {
  async getConsultingNumber(user_id) {
    const users = await mcUserInfoModel.find({
      volunteersUserId: user_id,
      isDeleted: false
    })
    const user_ids = users.map(item => {
      return item.userId;
    })
    const result = await mcConsultingModel.count({
      userId: {
        $in: user_ids
      },
      isDeleted: false
    }, "_id");
    return result;
  },
  async getShareUsers(user_id) {
    let ref_list = await mcShareService.getUserIds(user_id);
    return ref_list.map(item => {
      return item.user_id
    });
  },
  async getSubShareUsers(user_id) {
    const children_users = await mcUserRefModel.find({
      pUserId: user_id,
      isDeleted: false
    }, "userId");
    const children_users_id = children_users.map(item => {
      return item.userId;
    });
    return await mcUserRefModel.count({
      pUserId: {
        $in: children_users_id
      },
      isDeleted: false
    });
  },
  async getCareNumber(user_id) {
    return await mcUserInfoModel.count({
      volunteersUserId: user_id,
      isDeleted: false
    })
  },
  async getShareNumber(user_id) {
    return await mcUserRefModel.count({
      pUserId: user_id,
      isDeleted: false
    })
  },
  async getUserAmount(user_id) {
    const accounting = await mcAccountingService.getUserAccount(user_id);
    return {
      grant_price: accounting.grant_price,
      withdrawal_price: accounting.withdrawal_price
    }
  },
  async getAction() {
    const user_id = this.req.identity.userId;
    let data = {
      grant_price: 0,
      withdrawal_price: 0,
      care_number: 0,
      share_number: 0
    };
    const user_amount = await this.getUserAmount(user_id);
    data.grant_price = user_amount.grant_price;
    data.withdrawal_price = user_amount.withdrawal_price;
    data.care_number = await this.getCareNumber(user_id);
    data.consulting_number = await this.getConsultingNumber(user_id);
    data.share_number = await this.getShareNumber(user_id);
    data.sub_share_number = await this.getSubShareUsers(user_id);
    return this.success({
      code: '200',
      msg: '',
      data
    });
  }
}