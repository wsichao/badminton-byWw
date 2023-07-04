// boss 修改APP用户密码
const user_service = Backend.service('boss', 'user');
module.exports = {
  __beforeAction: function () {
    console.log('当前的环境', process.env.NODE_ENV);
    if (process.env.NODE_ENV != '_test') {
      let ip = getClientIp(this.req);
      let whiteIP = ['47.95.146.34', '39.96.77.89']; //123.56.147.196 正式公网 182.92.106.199 测试公网
      console.log('请求的ip地址', ip);
      if (whiteIP.indexOf(ip) == -1) {
        return this.fail("必须白名单内的IP才可以访问");
      }
    }
  },
  __rule: function (valid) {
    return valid.object({
      user_id: valid.string().required()
    });
  },
  async getAction() {
    try {
      const user_id = this.query.user_id;
      // TODO 6.3.0 : checking user info
      const msg = await user_service.checkUser(user_id);
      if (msg != true) {
        return this.success({
          code: '1000',
          msg
        });
      }
      // TODO 6.3.0 : get the phone number
      const phone_num = await user_service.getPhoneNum(user_id);
      // TODO 6.3.0 : update the user pwd
      await user_service.updatePwd(phone_num);
    } catch (e) {
      console.log(e);
      return this.success({
        code: '1000',
        msg: '系统错误'
      })
    }

    return this.success({
      code: '200',
      msg: ''
    });
  }
}