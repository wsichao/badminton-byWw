const fs = require('fs');
const rp = require('request-promise');
const mcUserInfoModel = Backend.model('mc_weapp', undefined, 'mc_user_info');
const mcUserRefModel = Backend.model('mc_weapp', undefined, 'mc_user_ref');

const userModel = Backend.model('common', undefined, 'customer');
const _ = require("underscore");
let data_arr = null;

module.exports = {
  /**
   * 获取升级脚本数据
   * @return [{
   * id:"",
   * name:"",
   * phone:"",
   * introduceId:"",
   * disease:[String]
   * }]
   */
  async getData() {
    try {
      if (data_arr) return data_arr;
      const path = __dirname + '/query_result.txt';
      const res = fs.readFileSync(path, 'utf8');
      const arr = res.split("\n").map((row, index) => {
        if (index == 0) return {};
        const columns = row.split(',');
        let obj = {};
        obj.id = columns.shift();
        obj.name = columns.shift();
        obj.phone = columns.shift();
        obj.introduceId = columns.shift();
        obj.disease = columns.join(",");
        try {
          obj.disease = JSON.parse(obj.disease);
          obj.disease = JSON.parse(obj.disease);
        } catch (e) {
          obj.disease = []
        }
        obj.disease = obj.disease.map(item => {
          return item.conn;
        })
        return obj;
      })
      arr.shift();
      data_arr = arr;
      return arr;
    } catch (e) {
      console.log(e)
      return [];
    }
  },
  async initUsers() {
    const users = await this.getData();
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      if (!user.phone) break;
      await this.initUser(user);
    }
  },
  async getUserRef(user) {
    if (!user.phone) return null;
    const dt = await this.getData();
    const phone = user.phone;
    const index_map = _.indexBy(dt, "id");
    if (user.introduceId == 0) {
      return null;
    }
    if (!index_map[user.introduceId]) {
      console.log(user)
      return null;
    }
    const p_phone = index_map[user.introduceId].phone;
    const users = await userModel.find({
      phoneNum: {
        $in: [phone, p_phone]
      }
    }, "name phoneNum");
    const index_user = _.indexBy(users, "phoneNum");
    return {
      phone: index_user[phone],
      p_phone: index_user[p_phone]
    }
  },
  async initUser(user) {
    try {
      const t_u = await this.getUserRef(user);
      if (!t_u) return;
      let volunteersUserId = t_u.p_phone._id;

      const user_id = t_u.phone._id;
      const user_info = await mcUserInfoModel.findOne({
        userId: user_id
      })
      const user_ref = await mcUserRefModel.findOne({
        userId: user_id
      })

      if (!user_info || !user_info.volunteersUserId) {
        await this.updateVolunteersUserId(user_id, volunteersUserId);
      }
      if (!user_ref) {
        await this.updateRefUserId(user_id, volunteersUserId);
      }
    } catch (e) {
      console.log(e)
    }

  },
  async updateVolunteersUserId(user_id, volunteersUserId) {
    await mcUserInfoModel.update({
      userId: user_id
    }, {
      volunteersUserId,
      volunteersUserTime: Date.now()
    })
  },
  async updateRefUserId(user_id, volunteersUserId) {
    await mcUserRefModel.create({
      userId: user_id,
      pUserId: volunteersUserId
    })
  }
}