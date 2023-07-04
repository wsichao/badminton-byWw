const mcUserRefModel = Backend.model('mc_weapp', undefined, 'mc_user_ref');
const mcUserInfoModel = Backend.model('mc_weapp', undefined, 'mc_user_info');
const userModel = Backend.model('common', undefined, 'customer');

const _ = require("underscore");

module.exports = {
  async getRef(user_id) {
    const result = await mcUserRefModel.find({
      pUserId: user_id,
      isDeleted: false
    });
    return result.map(item => {
      return {
        user_id: item.userId + '',
        time: item.createdAt
      }
    });
  },
  async getVolunteers(user_id) {
    const result = await mcUserInfoModel.find({
      volunteersUserId: user_id,
      isDeleted: false
    })
    return result.map(item => {
      return {
        user_id: item.userId + '',
        time: item.volunteersUserTime
      }
    });
  },
  async filter(ref_list) {
    const user_ids = ref_list.map(item => {
      return item.user_id
    });

    const result = await mcUserInfoModel.find({
      userId: {
        $in: user_ids
      }
    })

    const result_index = _.indexBy(result, 'userId');

    return _.filter(ref_list, function (item) {
      const user_id = item.user_id;
      if (result_index[user_id] && result_index[user_id].volunteersUserId && result_index[user_id].volunteersUserId != user_id) {
        return false
      }
      return true;
    })
  },
  async getUserIds(user_id) {
    let ref_list = await this.getRef(user_id);
    const volunteers_list = await this.getVolunteers(user_id);

    ref_list = await this.filter(ref_list, user_id);

    ref_list = ref_list.concat(volunteers_list);

    return _.uniq(ref_list, false, "user_id");
  },
  /**
   * 获取用户分享的用户
   * @param {*} user_id 
   */
  async getUserRef(user_id) {
    let result = await mcUserRefModel.find({
      pUserId: user_id,
      isDeleted: false
    }).sort({
      createdAt: -1
    });
    const user_ids = result.map(item => {
      return item.userId + '';
    });
    const sub_share_users = await mcUserRefModel.find({
      pUserId: {
        $in: user_ids
      },
      isDeleted: false
    });
    const sub_share_users_map = _.groupBy(sub_share_users, "pUserId");
    const user_list = await userModel.find({
      _id: {
        $in: user_ids
      }
    })
    const result_index = _.indexBy(user_list, '_id');
    result = result.map(item => {
      const user = result_index[item.userId];
      let avatar = "";
      let user_id = "";
      let name = "";
      let time = 0;
      let sub_share_num = 0;
      if (user) {
        user_id = user._id;
        avatar = user.avatar;
        name = user.name;
        time = item.createdAt;
        if (sub_share_users_map[item.userId]) {
          sub_share_num = sub_share_users_map[item.userId].length;
        }
      }

      return {
        user_id,
        avatar,
        name,
        time,
        sub_share_num
      }
    })
    return result;
  },
  /**
   * 获取用户分享的用户
   */
  async getSubUserRef(user_id) {
    let result = await mcUserRefModel.find({
      pUserId: user_id,
      isDeleted: false
    }).sort({
      createdAt: -1
    });
    const user_ids = result.map(item => {
      return item.userId + '';
    });
    const user_list = await userModel.find({
      _id: {
        $in: user_ids
      }
    })
    const result_index = _.indexBy(user_list, '_id');
    result = result.map(item => {
      let avatar = "";
      let name = "";
      let time = 0;
      const user = result_index[item.userId];
      if (user) {
        avatar = user.avatar;
        name = user.name;
        time = item.createdAt;
      }

      return {
        avatar,
        name,
        time
      }
    })
    return result;
  },
  /**
   * 获取用户分享的用户
   * @param {*} user_id 
   */
  async getUserCareRef(user_id) {
    let result = await mcUserInfoModel.find({
      volunteersUserId: user_id,
      isDeleted: false
    }).sort({
      volunteersUserTime: -1
    })
    const user_ids = result.map(item => {
      return item.userId + '';
    });
    const user_list = await userModel.find({
      _id: {
        $in: user_ids
      }
    })
    const result_index = _.indexBy(user_list, '_id');
    result = result.map(item => {
      const user = result_index[item.userId];
      let avatar = "";
      let name = "";
      let time = 0;
      if (user) {
        avatar = user.avatar;
        name = user.name;
        time = item.createdAt;
      }

      return {
        avatar,
        name,
        time
      }
    })
    return result;
  },
  async setVolunteers(user_id, volunteers_id) {
    if (user_id == volunteers_id) return;
    const user_count = await userModel.count({
      _id: volunteers_id,
      isDeleted: false
    });
    if (user_count == 0) return;
    const user_info = await mcUserInfoModel.findOne({
      userId: user_id,
      isDeleted: false,
    })
    if (user_info.volunteersUserId) return;
    await mcUserInfoModel.update({
      userId: user_id,
      isDeleted: false,
    }, {
      volunteersUserId: volunteers_id,
      volunteersUserTime: Date.now()
    });
  },
  /**
   * 获取用户的上级与上上级
   * @param {*} user_id 
   * @return { p_user_id,d_user_id }
   */
  async getShareGradient(user_id) {
    let p_user_id;
    let d_user_id;
    const ref_user = await mcUserRefModel.findOne({
      userId: user_id,
      isDeleted: false
    })
    if (ref_user) {
      p_user_id = ref_user.pUserId;
    }

    if (p_user_id) {
      const p_ref_user = await mcUserRefModel.findOne({
        userId: p_user_id,
        isDeleted: false
      })
      if (p_ref_user) {
        const count = await mcUserInfoModel.count({
          userId: p_ref_user.pUserId,
          role: "director"
        })
        if (count > 0) {
          d_user_id = p_ref_user.pUserId;
        }
      }
    }
    return {
      p_user_id,
      d_user_id
    }
  }
}