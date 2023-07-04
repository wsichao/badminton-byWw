const mcSceneOrderModel = Backend.model('mc_weapp', undefined, 'mc_scene_order');

module.exports = {
  async getAction() {
    //传参为时间戳 毫秒
    const datetime = this.req.query.datetime || new Date().getTime();

    //往前查几天
    const beforeday = this.req.query.beforeday || 15;
  
    var currentDay = new Date(parseInt(datetime))
    
    var str = currentDay.getFullYear() + "/" + (currentDay.getMonth() + 1) + "/" + currentDay.getDate()

    currentDay = Date.parse(str) + 24*3600*1000
    var beforetime = currentDay - beforeday*24*3600*1000
    

    var orders = await mcSceneOrderModel.find({createdAt:{$gt:beforetime, $lte:currentDay},status:{$gt: 100}})
    var mycounts = []
    var othercounts = []

    for (let j = 0; j < beforeday; j++) {
        var countOne = 0
        var countTwo = 0
        currentDay = Date.parse(str) + 24*3600*1000 - j * 24*3600*1000
        const beforetime = currentDay - 24*3600*1000
        for (let i = 0; i < orders.length; i++) {
            var share = orders[i]
            if(share.createdAt > beforetime && share.createdAt < currentDay){
                if (share.type == 0) {
                    countTwo ++
                }
                else if (share.type == 1) {
                    countOne ++
                }
            }
        }
        mycounts.unshift(countOne)
        othercounts.unshift(countTwo)
    }
    
    return this.success({
      code: "200",
      msg: "查询成功",
      data: {
          first_counts: mycounts,
          second_counts: othercounts
      }
    });
  }
}