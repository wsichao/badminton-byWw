const mcSceneOrderModel = Backend.model('mc_weapp', undefined, 'mc_scene_order');
const mcSceneModel = Backend.model('mc_weapp', undefined, 'mc_scene');

module.exports = {
    async getAction() {
    //传参为时间戳 毫秒
    const datetime = this.req.query.datetime || new Date().getTime();

    var currentDay = new Date(parseInt(datetime))

    var str = currentDay.getFullYear() + "/" + (currentDay.getMonth() + 1) + "/" + currentDay.getDate()

    currentDay = Date.parse(str) + 24*3600*1000
    var beforetime = currentDay - 24*3600*1000

    //1级分享表 
    var orders = await mcSceneOrderModel.find({createdAt:{$gt:beforetime, $lte:currentDay},status:{$gt: 100}},"price type sceneName sceneId")
    orders = JSON.parse(JSON.stringify(orders))

    var one = []
    var two = []
    for (let i = 0; i < orders.length; i++) {
        const e = orders[i];
        e.price = e.price / 100;
        let scene = await mcSceneModel.findOne({_id:e.sceneId},"ownerName")
        e.ownerName = scene.ownerName
        if (e.type == 1) {
            one.unshift(e)
        }else
        if (e.type == 0) {
            two.unshift(e)
        }
    }
   
    return this.success({
        code: "200",
        msg: "查询成功",
        data: {
            first_detail: one,
            second_detail: two
        }
    });
    }
}