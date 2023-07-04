const mcLiveModel = Backend.model("mc_weapp", undefined, "mc_live");
const mcSceneModel = Backend.model('mc_weapp', undefined, 'mc_scene');

module.exports = {
  async getLives(pageSize,pageNum) {
    let lives = await mcLiveModel.aggregate([
      {$sort:{
          createdAt:-1
      }},
      {$limit:1},
      {$unwind: "$roomInfo"},
      {$skip: pageNum*pageSize},
      {$limit:pageSize}
      ]).exec();
    
    let res =lives.map(live=>{
        return live.roomInfo
      })

      return res.map(l=>{
        return {
          name: l.name,
          cover_img: l.cover_img,
          start_time: l.start_time * 1000,
          end_time: l.end_time * 1000,
          anchor_name: l.anchor_name,
          roomid: l.roomid,
          live_status: l.live_status,
          _id: l._id
        }
      })
  },

  //sort -1 为后开播的
  async getLivesForStatus(status,sort) {
    let lives = await mcLiveModel.aggregate([
      {$sort:{
          createdAt:-1
      }},
      {$limit:1},
      {$unwind: "$roomInfo"},
      {$match: {"roomInfo.live_status": status}},
      {$sort: {"roomInfo.start_time":sort}}
      ]).exec();
      let res =lives.map(live=>{
        return live.roomInfo
      })

      return res.map(l=>{
        return {
          name: l.name,
          cover_img: l.cover_img,
          start_time: l.start_time * 1000,
          end_time: l.end_time * 1000,
          anchor_name: l.anchor_name,
          roomid: l.roomid,
          live_status: l.live_status,
          _id: l._id
        }
      })
  },
  async isOwner(user_id) {
    return (await mcSceneModel.count({
      ownerUserId: user_id,
      isDeleted: false
    })) > 0;
  },
  async getAction() {
    let pageSize = parseInt(this.query.page_size) || 20;
    let pageNum = parseInt(this.query.page_num) || 0;
    let data = []
     //增加条件判断
    let user_id = this.req.identity.userId;
    if (user_id.length == 0 || ! await this.isOwner(user_id) ) {
      return this.success({
        code: "10001",
        msg:"暂无权限获取",
        data: []
      })
    }
    //如果请求的是一个 返回条件需要判断
    if (pageSize == 1) {
      // ① 从“直播中”的直播中，找出直播开始时间最晚的；
      data = await this.getLivesForStatus(101,-1)  
      if (data.length == 0) {
        // ② 不满足①时，从“未开播”的，找出直播开始时间最早的；
        data = await this.getLivesForStatus(102,1)
        if (data.length == 0) {
          // ③ 不满足②时，从“已结束”的中找出直播结束时间最晚的；
          data = await this.getLivesForStatus(103,-1)
        }
      }
      data = data[0] || {}
      data = [data]
      
    }else {
      data = await this.getLives(pageSize,pageNum)
      
    }

   return this.success({
      code: "200",
      msg:"拉取直播列表成功",
      data: data
   })
    
  }
}