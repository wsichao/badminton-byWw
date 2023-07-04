const fs = require('fs');
const rp = require('request-promise');
const mcConsultingModel = Backend.model('mc_weapp', undefined, 'mc_consulting');
const mcUserInfoModel = Backend.model('mc_weapp', undefined, 'mc_user_info');
const userModel = Backend.model('common', undefined, 'customer');

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
      const path = __dirname + '/query_result.txt';
      const res = fs.readFileSync(path, 'utf8');
      const arr = res.split("\n").map((row, index) => {
        if (index == 0) return {};
        const columns = row.split(',');
        let obj = {};
        obj.id = columns.shift();
        obj.name = columns.shift();
        if(obj.name){
          obj.name = obj.name.replace('\"',"").replace('\"',"").replace("  ","");
        }
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
      return arr;
    } catch (e) {
      console.log(e)
      return [];
    }
  },
  async initLogin(phone, name) {
    const options = {
      method: "POST",
      body: {
        nick_name: name,
        phone_num: phone
      },
      json: true,
      url: "http://localhost:9050/mc_weapp/user/login"
    }
    await rp(options)
  },
  /**
   * 统一初始化用户
   */
  async initUsers() {
    const users = await this.getData();
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      if (!user.phone) break;
      await this.initUser(user);
    }
  },
  /**
   * 
   * @param {
   * id:"",
   * name:"",
   * phone:"",
   * introduceId:"",
   * disease:[String]
   * } user 用户信息
   */
  async initUser(user) {
    await this.initLogin(user.phone, user.name);
    const user_info = await userModel.findOne({
      phoneNum: user.phone,
      isDeleted: false
    }, "name");
    const user_id = user_info._id;
    await mcUserInfoModel.update({
      userId: user_id,
      isDeleted: false
    }, {
      "consultingObj.name": user.name,
      "consultingObj.phoneNum": user.phone
    })
    this.createConsulting(user_id, user.disease);
  },
  /**
   * 创建用户疾病问询
   * @param {*} user_id 
   * @param {*} context 
   */
  async createConsulting(user_id, contents) {
    for (let i = 0; i < contents.length; i++) {
      const content = contents[i];
      await mcConsultingModel.create({
        userId: user_id,
        name: content,
        detail: content
      })
    }

  }
}