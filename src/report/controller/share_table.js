const mcUserRefModel = Backend.model('mc_weapp', undefined, 'mc_user_ref');

module.exports = {
    async getAction() {
        var pageNum = this.req.query.pageNum || 0
        var pageSize = this.req.query.pageSize || 10
      
        var result = await mcUserRefModel.aggregate([
            {$group:{_id:"$pUserId", first_count:{$sum:1}}},{$sort:{first_count:-1,_id:1}},
            {
            $lookup:{
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "user"
                }
            },
            {
              $unwind:"$user"
            },{
                $project:{
                    "name":"$user.name",
                    "phoneNum":"$user.phoneNum",
                    "userId":"$user._id",
                    "first_count":"$first_count",
                    _id:0
                }
            }])
            .skip(pageNum * pageSize)
            .limit(pageSize)
            .exec()

        var count = await mcUserRefModel.aggregate([
            {$group:{_id:"$pUserId", first_count:{$sum:1}}},
            {
            $lookup:{
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "user"
                }
            },
            {
                $unwind:"$user"
            },
            {
                $project:{
                    _id:1
                }
            }]).exec()

            for (let i = 0; i < result.length; i++) {
                const d = result[i];
                var id_arr = []
                var follows = await mcUserRefModel.find({pUserId:d.userId})
                follows.forEach(function(e){
                    id_arr.push(e.userId)
                })
                var second_count = await mcUserRefModel.find({pUserId:{$in:id_arr}}).count()
                d.second_count = second_count
            }

        return this.success({
            code: "200",
            msg: "查询成功",
            tatol_count: count.length,
            data: result
        });
    }
  }