var commonUtil = require('../../../../../lib/common-util');

module.exports = {
    async getAction() {
      return this.success({
        code: '200',
        msg: "",
        data: await commonUtil.getToken()
      })
    }
  }