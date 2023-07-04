const mcSceneOrderModel = Backend.model('mc_weapp', undefined, 'mc_scene_order');
const mcAccountingService = Backend.service('mc_weapp', 'accounting');
const mcSceneModel = Backend.model("mc_weapp", undefined, "mc_scene");
const mcSceneRecommendModel = Backend.model("mc_weapp", undefined, "mc_scene_recommend");

const mcSuborderService = Backend.service('mc_weapp', 'suborder');
const mcShareService = Backend.service('mc_weapp', 'share');
const mcSceneSuborderModel = Backend.model('mc_weapp', undefined, 'mc_scene_suborder');
const mcSceneSupplyModel = Backend.model('mc_weapp', undefined, 'mc_scene_supply');
const mcSceneErrandModel = Backend.model("mc_weapp", undefined, "mc_scene_errand");


module.exports = {
  __rule: function (valid) {
    return valid.object({
      qrcode: valid.string().required()
    });
  },
  async update(id,type) {
    let result;
    if (type == 0) {
      result = await mcSceneOrderModel.update({
        _id: id,
        isDeleted: false,
        status: {$ne: 600}
      }, {
        status: 600,
        endTime: Date.now()
      })
    } else if (type == 1) {
      // 修改子订单状态
      result = await mcSceneSuborderModel.update({
        _id: id,
        isDeleted: false,
        status: {$in: [200, 500]}
      }, {
        status: 600,
        endTime: Date.now()
      })
    }
    return result;

  },
  async getRId(id) {
    return (await mcSceneRecommendModel.findOne({
      _id: id
    })).userId;
  },
  async getResult(id,type) {
    const user_id = this.req.identity.userId;
    let result;
    if (type == 0) {
        let scene = await mcSceneModel.findOne({ownerUserId:user_id})
        result = await mcSceneOrderModel.findOne({
            qrcode: id,
            isDeleted: false,
            sceneId: scene._id,
            status: {$ne: 600}
        })
        //配送员信息
        result = JSON.parse(JSON.stringify(result));
        if (result) {
          let errand = await mcSceneErrandModel.findOne({_id:result.sceneErrandId})
          result.errand = errand;
        }
        

    } else if (type == 1) {
        let supply = await mcSceneSupplyModel.findOne({userId:user_id})
        result = await mcSceneSuborderModel.findOne({
            qrcode: id,
            isDeleted: false,
            supplyId: supply._id,
            status: {$ne: 600}
        })

        //添加供货商信息
        if (result) {
          result = JSON.parse(JSON.stringify(result));
          result.supplyPhone = supply.phone;
        }
        
    }
    return result
  },
  async postAction() {
    const qrcode = this.post.qrcode;
    const type = this.post.type;

    const result = await this.getResult(qrcode,type);
    if (result && result._id) {
      if (result.status == 300) {
        return this.success({
          msg: "该订单已经被退单"
        })
      }
      let up = await this.update(result._id,type);
      if (up.n > 0) {
        if (type == 1) {
          //朱李叶精选 分给分发人奖励金
          // 一级 二级分账
          const recomendUserId = await this.getRId(result.shareId);
    
          if (result.recommendPrice > 0) {
            console.log(`一级分账: user:${recomendUserId},${recomendUserId},${result._id}`);
            await mcAccountingService.recommendAward(recomendUserId, result.recommendPrice, result._id);
          }
          if (result.secondRecommendPrice > 0) {
            const u = await mcShareService.getShareGradient(recomendUserId);
            console.log(`二级分账: user:${u.p_user_id},${result.secondRecommendPrice},${result._id}`);
            await mcAccountingService.OrderRecommendSecondAward(u.p_user_id, result.secondRecommendPrice, result._id);
          }
          // 给供货商发奖金
          await mcSuborderService.fashionable(result._id);
          
        } else {
          //健康优选 全部分给清单人
          const user = await mcSceneModel.findOne({
            _id: result.sceneId
          })
          await mcAccountingService.orderOwnerAward(user.ownerUserId, result.price, result._id)
        }
       
    }else {
      return this.success({
        msg: "该订单已经被核销"
      })
    }
      
      return this.success({
          code: "200",
          msg: "核销成功"
      })

    }else {
      
      return this.success({
        msg: "你不具备核销权利"
      })
    }
    
  
  },
  async getAction() {
    const qrcode = this.query.qrcode;
    let type = 0;

    let re = await mcSceneSuborderModel.find({
      qrcode: qrcode,
      isDeleted: false
    })

    if (re.length > 0) {
      type = 1;
    }

    let result = await this.getResult(qrcode,type);
     
    if (result) {
        result.type = type;
        result.time = result.paidTime;
        result.end_time = result.endTime;
        return this.success({
            code: "200",
            msg: "扫订单成功",
            data: result  
          });
    }else{
        return this.success({
            msg: "您不支持查看此订单",
          });
    }

  }
}