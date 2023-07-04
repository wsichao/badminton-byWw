const user_model = require('../../../app/models/Customer');
const mcUserInfoModel = Backend.model('mc_weapp', undefined, 'mc_user_info');
const mcUserRefModel = Backend.model('mc_weapp', undefined, 'mc_user_ref');

module.exports = {
  async getAction() {
    //传参为时间戳 毫秒
    const datetime = this.req.query.datetime || new Date().getTime();
    var currentDay = new Date(parseInt(datetime))
    var str = currentDay.getFullYear() + "/" + (currentDay.getMonth() + 1) + "/" + currentDay.getDate()
    currentDay = Date.parse(str) + 24*3600*1000 
    const beforetime = currentDay - 24*3600*1000
    //查询日期的时间戳
    var reportUser = await mcUserInfoModel.find({createdAt:{$gt:beforetime, $lte:currentDay}},'userId createdAt')
    //负责管理整个user信息
    var reports = []
    
    for ( var i = 0; i <reportUser.length; i++){
        reports.unshift(reportUser[i].userId)
    }
    reportUser = JSON.parse(JSON.stringify(reportUser))
    //查询出分享人绑定信息 
    const refUser = await mcUserRefModel.find({userId:{$in:reports}})
    for ( var i = 0; i <refUser.length; i++){
        reports.unshift(refUser[i].pUserId)
    }
 
    //用来最后便利数据 
    var lastUser = []
    for (let i = 0; i < reportUser.length; i++) {
        const reUser = reportUser[i];
        for ( var j = 0; j <refUser.length; j++){
            const ref = refUser[j]
            if (reUser.userId.toString() == ref.userId.toString()){
                reUser.pUserId = ref.pUserId
            }
        }
        lastUser.unshift(reUser)
    }
  
    //查询出的所有user信息
    const users = await user_model.find({_id:{$in:reports}},'_id name phoneNum')

    var data = []
    for (var i = 0; i < lastUser.length; i++){
        var ref = lastUser[i]
        var m = new Object()
        for (let j = 0; j < users.length; j++) {
            var user = users[j]
            if (ref.userId.toString() == user._id.toString()){
                m.user = {
                    userId: user._id,
                    name: user.name,
                    phoneNum: user.phoneNum || '',
                    createdAt: ref.createdAt
                }
                data.unshift(m)  
            }
            if (ref.pUserId != undefined) {
                if (ref.pUserId.toString() == user._id.toString()){
                    m.refUser = {
                        name: user.name,
                        phoneNum: user.phoneNum || ''
                    }
                }
            }
        }
    }

    return this.success({
      code: "200",
      msg: "查询成功",
      data: data
    });
  }
}