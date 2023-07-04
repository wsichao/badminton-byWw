const activity_service = Backend.service("mc_weapp", "activity");
module.exports = {
  async getAction() {
    const user_id = this.req.identity.userId;
    const list = await activity_service.getList();
    const user_map = await activity_service.getUserSignup(user_id);
    let res = list.map(item => {
      let obj = {
        id: item._id,
        title: item.activityName,
        time: item.conductTime,
        is_signup: false,
        address: `${item.provinceName}${item.cityName}${item.address}`
      }
      if (user_map[item._id]) {
        obj.is_signup = true;
      }
      return obj;
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