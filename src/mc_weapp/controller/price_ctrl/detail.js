const accounting_service = Backend.service("mc_weapp", "accounting");

module.exports = {
  async getAction() {
    const user_id = this.req.identity.userId;
    let res = await accounting_service.getRecords(user_id);
    res = res.map(item => {
      let type = ''
      switch (item.type) {
        case 0:
          type = '+';
          break;
        case 1:
          type = '-';
          break;
      }
      item.type = type;
      return item;
    })
    return this.success({
      code: "200",
      msg: "",
      data: {
        items: res
      }
    });
  }
}