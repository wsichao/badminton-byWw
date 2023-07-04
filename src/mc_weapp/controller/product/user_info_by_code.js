const mcSceneRecommendModel = Backend.model('mc_weapp', undefined, 'mc_scene_recommend');
const mcSceneApplyforModel = Backend.model('mc_weapp', undefined, 'mc_scene_apply_for');
const mcScenePreRefModel = Backend.model('mc_weapp', undefined, 'mc_scene_pre_ref');
const mcSceneModel = Backend.model('mc_weapp', undefined, 'mc_scene');
const mcUserInfoModel = Backend.model('mc_weapp', undefined, 'mc_user_info');

const userMode = Backend.model('common', undefined, 'customer');

module.exports = {
  __rule: function (valid) {
    return valid.object({
      recommend_user_id: valid.string().required()
    });
  },
  async getUseCodePhone() {
    const code = this.query.recommend_user_id;
    const res = await mcSceneApplyforModel.findOne({
      preRefUserId: code,
      isDeleted: false
    });
    if (!res) return "";
    const u = await userMode.findOne({
      _id: res.userId,
      isDeleted: false
    })
    const s = u.phoneNum.split('');
    s.splice(3, 4, '****');
    return s.join('');
  },
  // 检查该预推荐码是否未用过
  async isNotUsed() {
    const code = this.query.recommend_user_id;
    const count = await mcSceneApplyforModel.count({
      preRefUserId: code,
      isDeleted: false
    })
    return count == 0;
  },

  // 检查用户是否已经拥有小清单
  async isUserMerchant() {
    let user_id = this.req.identity.userId;
    const count = await mcSceneModel.count({
      ownerUserId: user_id,
      isDeleted: false
    })
    return count > 0;
  },
  // 检查是否有绑定的推荐人
  async isRecommend() {
    const code = this.query.recommend_user_id;
    if (code.length < 24) {
      return false;
    }
    const u = await mcUserInfoModel.count({
      preRefUserId: code
    })
    if (!u) return false;
    return true;
  },
  // 检查是否为预推荐码
  async isPreCode() {
    const code = this.query.recommend_user_id;
    if (code.length < 24) {
      return false;
    }
    const count = await mcScenePreRefModel.count({
      _id: code
    })
    return count > 0;
  },
  async getStatus() {
    // 1. 检查该码是否为预推荐码; is false return 200;
    const is_pre_code = await this.isPreCode();
    if (!is_pre_code) {
      return {
        status: 200
      };
    }

    // 检查该推荐码是否未使用
    const is_not_used = await this.isNotUsed();
    if (is_not_used) {
      //  检查用户是否已绑定小清单; is true return 400;
      const is_used_owner = await this.isUserMerchant();
      if (is_used_owner) {
        return {
          status: 400,
          msg: '您已经拥有个人清单，无需重复申请'
        }
      } else {
        return {
          status: 0
        };
      }
    } else {
      const is_recommend = await this.isRecommend();
      if (is_recommend) {
        return {
          status: 200
        };
      } else {
        const p = await this.getUseCodePhone();
        return {
          status: 300,
          msg: `二维码已被${p}使用`
        };
      }
    }
  },
  async getAction() {
    const res = await this.getStatus();
    return this.success({
      code: "200",
      msg: "",
      data: res
    });
  }
}