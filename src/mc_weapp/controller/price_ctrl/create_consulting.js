const mcConsultingModel = Backend.model('mc_weapp', undefined, 'mc_consulting');
const mcUserInfoModel = Backend.model('mc_weapp', undefined, 'mc_user_info');
const userMode = Backend.model('common', undefined, 'customer');
let rp = require('request-promise');

module.exports = {
  __rule: function (valid) {
    return valid.object({
      name: valid.string().max(100).empty(''),
      detail: valid.string().max(500).empty(''),
      id: valid.string().max(100).empty(''),
    });
  },
  async createOrUpdate(name, detail, user_id, id) {
    if (id) {
      await mcConsultingModel.update({
        _id: id,
        isDeleted: false
      }, {
        name,
        detail
      })
    } else {
      await mcConsultingModel.create({
        userId: user_id,
        name,
        detail
      })
    }

  },
  async getVolunteersInfo(user_id) {
    return await mcUserInfoModel.findOne({
      userId: user_id,
      isDeleted: false
    });
  },
  async getUserInfo(user_id) {
    return await userMode.findOne({
      _id: user_id,
      isDeleted: false
    }, "name avatar");
  },
  async getResult(words) {
    let options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      qs: {
        diseasename: words
      },
      url: 'http://cms.juliye.com/document/diseasedata',
      json: true
    };
    return await rp(options);
  },
  async postAction() {
    const user_id = this.req.identity.userId;
    const name = this.post.name;
    const detail = this.post.detail;
    const id = this.post.id;
    const data = {
      is_created: false,
      is_show: true
    }
    await this.createOrUpdate(name, detail, user_id, id);

    const volunteersInfo = await this.getVolunteersInfo(user_id);
    if (volunteersInfo.volunteersUserId) {
      const user = await this.getUserInfo(volunteersInfo.volunteersUserId);
      data.name = user.name;
      data.avatar = user.avatar;
    }
    if (volunteersInfo.consultingObj) {
      data.user_name = volunteersInfo.consultingObj.name;
      data.user_phone = volunteersInfo.consultingObj.phoneNum;
    }

    if (volunteersInfo.volunteersUserId && volunteersInfo.consultingObj && volunteersInfo.consultingObj.phoneNum) {
      data.is_created = true;
    }

    const cms = await this.getResult(name);

    if (cms.data.isMatched == false) {
      data.is_show = false;
    }

    return this.success({
      code: "200",
      msg: "",
      data
    })
  }
}