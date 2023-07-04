const mcUserRefModel = Backend.model('mc_weapp', undefined, 'mc_user_ref');
const user_model = require('../../../app/models/Customer');

module.exports = {
    __rule: function (valid) {
        return valid.object({
            userId: valid.string().required()
        });
    },
  async getAction() {
    //传参为时间戳 毫秒
    const datetime = this.req.query.datetime || new Date().getTime();

    //往前查几天
    const beforeday = this.req.query.beforeday || 15;

    //往前查几天
    const userId = this.req.query.userId;

    var user = await user_model.findOne({_id:userId},"name")
  
    var currentDay = new Date(parseInt(datetime))
    
    var str = currentDay.getFullYear() + "/" + (currentDay.getMonth() + 1) + "/" + currentDay.getDate()

    currentDay = Date.parse(str) + 24*3600*1000
    var beforetime = currentDay - beforeday*24*3600*1000
    //1级分享表 直接查出过去的分享
    var shareOne = await mcUserRefModel.find({createdAt:{$gt:beforetime, $lte:currentDay},pUserId:userId})
    var day_counts = []
    
        for (let j = 0; j < beforeday; j++) {
            var count = 0
            currentDay = Date.parse(str) + 24*3600*1000 - j * 24*3600*1000
            const beforetime = currentDay - 24*3600*1000
            for (let i = 0; i < shareOne.length; i++) {
                var share = shareOne[i]
                if(share.createdAt > beforetime && share.createdAt < currentDay){
                    count ++
                }
            }
            day_counts.unshift(count)
        }
    
    //2级分享表
    var shares = await mcUserRefModel.find({pUserId:userId},"userId")
    var all = []
    for (let i = 0; i < shares.length; i++) {
        const e = shares[i].userId;
        all.unshift(e)
    }
 
    var shareTwo = []
    currentDay = Date.parse(str) + 24*3600*1000
    var beforetime = currentDay - beforeday*24*3600*1000
    for (let i = 0; i < all.length; i++) {
        const share = all[i];
        var shareArray = await mcUserRefModel.find({createdAt:{$gt:beforetime, $lte:currentDay},pUserId:share})
        shareTwo = shareTwo.concat(shareArray)
    }

    var share_counts = []
        for (let j = 0; j < beforeday; j++) {
            var count = 0
            currentDay = Date.parse(str) + 24*3600*1000 - j * 24*3600*1000
            const beforetime = currentDay - 24*3600*1000
            for (let i = 0; i < shareTwo.length; i++) {
                var share = shareTwo[i]
                if(share.createdAt > beforetime && share.createdAt < currentDay){
                    count ++
                }
            }
            share_counts.unshift(count)
        }

    return this.success({
      code: "200",
      msg: "查询成功",
      data: {
          userId: user._id,
          userName: user.name,
          first_counts: day_counts,
          second_counts: share_counts
      }
    });
  }
}