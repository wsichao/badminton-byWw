const mc_scene_apply_for_model = Backend.model("mc_weapp", undefined, "mc_scene_apply_for");
const mc_scene_pre_ref_model = Backend.model("mc_weapp", undefined, "mc_scene_pre_ref");
const mcUserRefModel = Backend.model('mc_weapp', undefined, 'mc_user_ref');
const user_model = Backend.model("common", undefined, 'customer');
const mongoose = require("mongoose");

module.exports = {
  __rule: function (valid) {
    return valid.object({
      code: valid.string().empty(""),
      name: valid.string().empty(""),
      avatar: valid.string().empty(""),
      province_id: valid.string().empty(""),
      province_name: valid.string().empty(""),
      city_id: valid.string().empty(""),
      city_name: valid.string().empty(""),
      county_id: valid.string().empty(""),
      county_name: valid.string().empty(""),
      address: valid.string().empty(""),
      delivery_type: valid.array(),
      user_name: valid.string().empty("")
    });
  },
  /**
   * 检查 code 是否正确；
   * 如果 code 不为空，且 code 为正确预推荐码，则返回 true，其他返回 false;
   */
  async checkCode() {
    const code = this.post.code;
    let user_id = this.req.identity.userId;
    const is_user = (await mc_scene_apply_for_model.count({
      userId: user_id,
      isDeleted: false
    })) > 0;
    if (is_user) return "您已申请过小清单，请勿重复申请";
    if (!code) return true;
    if (!mongoose.Types.ObjectId.isValid(code)) return "该推荐码不存在";
    const is_applyfor = (await mc_scene_apply_for_model.count({
      preRefUserId: code,
      isDeleted: false
    })) > 0;
    if (is_applyfor) return "该推荐码已被使用";
    const is_real_code = (await mc_scene_pre_ref_model.count({
      _id: code,
      isDeleted: false
    })) > 0;
    if (!is_real_code) return "该推荐码不存在";
    return true;
  },
  /**
   * 提交申请
   */
  async applyFor() {
    const post = this.post;
    const code = this.post.code;
    let user_id = this.req.identity.userId;
    const user = this.req.identity.user;

    let puser = await mcUserRefModel.findOne({
      userId: user_id,
      isDeleted: false
    },"pUserId")
    let refUserId = "";
    let refUserName = "";
    let refUserPhone = "";
    if (puser != null) {
      let user = await user_model.findOne({
        _id: puser.pUserId
      },"name phoneNum")
      refUserId = puser.pUserId;
      refUserName = user.name;
      refUserPhone = user.phoneNum;
    }

    const dt = {
      userId: user_id,
      preRefUserId: post.code,
      name: post.name,
      avatar: post.avatar,
      provinceId: post.province_id,
      provinceName: post.province_name,
      cityId: post.city_id,
      cityName: post.city_name,
      countyId: post.county_id,
      countyName: post.county_name,
      address: post.address,
      deliveryType: post.delivery_type,
      userName: post.user_name,
      uName: user.name,
      uPhoneNum: user.phoneNum,
      refUserId: refUserId,
      refUserName: refUserName,
      refUserPhone: refUserPhone
    };
    await mc_scene_apply_for_model.create(dt);
    if (code) {
      await mc_scene_pre_ref_model.update({
        _id: code,
        isDeleted: false
      }, {
        isUse: true
      });
    }
  },
  async postAction() {
    const post = this.post;
    const check_code = await this.checkCode();
    if (check_code != true) {
      return this.success({
        code: "1000",
        msg: `${check_code}`
      })
    }
    try {
      await this.applyFor();
      return this.success({
        code: "200",
        msg: ""
      });
    } catch (e) {
      console.log(e);
      return this.success({
        code: "1000",
        msg: `系统错误`
      })
    }

  }
}