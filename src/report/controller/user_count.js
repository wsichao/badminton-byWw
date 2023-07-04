const mcUserInfoModel = Backend.model('mc_weapp', undefined, 'mc_user_info');

module.exports = {
  async getAction() {
    //传参为时间戳 毫秒
    const datetime = this.req.query.datetime || new Date().getTime();
    //往前查几天
    const beforeday = this.req.query.beforeday || 1;
    //用户注册数
    const count = await mcUserInfoModel.find().count();

    var currentDay = new Date(parseInt(datetime))
  
    var str = currentDay.getFullYear() + "/" + (currentDay.getMonth() + 1) + "/" + currentDay.getDate()
    var day_counts = []
    for (let index = 0; index < beforeday; index++) {
      currentDay = Date.parse(str) + 24*3600*1000 - index * 24*3600*1000
      const beforetime = currentDay - 24*3600*1000
      const every_count = await mcUserInfoModel.find({createdAt:{$gt:beforetime, $lte:currentDay}}).count();
      day_counts.unshift(every_count)
    }
    
    return this.success({
      code: "200",
      msg: "查询成功",
      data: {
        total_count: count,
        every_counts: day_counts
      }
    });
  }
}