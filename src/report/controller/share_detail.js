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

    const userId = this.req.query.userId;

    var user = await user_model.findOne({_id:userId},"name")

    var currentDay = new Date(parseInt(datetime))

    var str = currentDay.getFullYear() + "/" + (currentDay.getMonth() + 1) + "/" + currentDay.getDate()

    currentDay = Date.parse(str) + 24*3600*1000
    var beforetime = currentDay - 24*3600*1000

    //1级分享表 
    var shareOne = await mcUserRefModel.find({createdAt:{$gt:beforetime, $lte:currentDay},pUserId:userId},"userId")
    var one = []
    for (let i = 0; i < shareOne.length; i++) {
        const e = shareOne[i].userId;
        one.unshift(e)
    }
    var shareOneDetail = await user_model.find({_id:{$in:one}},"name phoneNum")
    
    var share = await mcUserRefModel.find({pUserId:userId},"userId")
    var all = []
    for (let i = 0; i < share.length; i++) {
        const e = share[i].userId;
        all.unshift(e)
    }
  
    //2级分享表 
    var shareTwo = await mcUserRefModel.find({createdAt:{$gt:beforetime, $lte:currentDay},pUserId:{$in:all}},"userId")
    var two = []
    for (let i = 0; i < shareTwo.length; i++) {
        const e = shareTwo[i].userId;
        two.unshift(e)
    }
   
    var shareTwoDetail = await user_model.find({_id:{$in:two}},"name phoneNum")

    return this.success({
        code: "200",
        msg: "查询成功",
        data: {
            userId: user && user._id,
            userName: user && user.name,
            first_detail: shareOneDetail,
            second_detail: shareTwoDetail
        }
    });
    }
}