const service = Backend.service('mc_weapp', 'price_ctrl_order');
const mcSceneRecommendModel = Backend.model("mc_weapp", undefined, "mc_scene_recommend");
const mcSceneGoodsModel = Backend.model("mc_weapp", undefined, "mc_scene_goods");
const mcSceneGoodsInfoModel = Backend.model("mc_weapp", undefined, "mc_scene_goods_info");
const mcSceneErrandModel = Backend.model("mc_weapp", undefined, "mc_scene_errand");
const mcSceneModel = Backend.model("mc_weapp", undefined, "mc_scene");
const mcSceneOrderModel = Backend.model("mc_weapp", undefined, "mc_scene_order");
const mcAccountingService = Backend.service('mc_weapp', 'accounting');
const _ = require("underscore");

const mongoose = require('mongoose');

module.exports = {
  __rule: function (valid) {
    return valid.object({
      openid: valid.string().required(),
      products: valid.array(),
      name: valid.string(),
      phone: valid.string(),
      note: valid.string().empty(""),
      share_user_id: valid.string(),
      type: valid.number().default(0)
    });
  },
  async getScene(id) {
    return await mcSceneModel.findOne({
      _id: id,
      isDeleted: false
    })
  },
  async getRecommend(user_id) {
    const res = await mcSceneRecommendModel.findOne({
      userId: user_id,
      isDeleted: false
    })
    if (!res) return {};
    return res;
  },
  async getSceneErrand(scene_id) {
    const errand = await mcSceneModel.findOne({
      _id: scene_id,
      isDeleted: false
    });
    if (!errand || errand.sceneErrand.length == 0) return;
    const id = errand.sceneErrand[0];
    return await mcSceneErrandModel.findOne({
      _id: id,
      isDeleted: false
    })
  },
  async getProducts(products) {
    const number_map = _.indexBy(products, "product_id");
    const product_ids = products.map(item => {
      return item.product_id;
    });
    const goods = await mcSceneGoodsModel.find({
      _id: {
        $in: product_ids
      },
      isDeleted: false,
      isShow: true
    });
    let res = [];
    let price = 0; 
    let discount_price = 0;
    let recommend_price = 0;
    let second_recommend_price = 0;
    res = goods.map(item => {
      const number = number_map[item._id];
      price += (item.price * number.product_number);
      if (item.isDiscount == true) {
        discount_price += ((item.discountPrice || 0) * number.product_number);
      }
      if (item.recommendPrice) {
        recommend_price += ((item.recommendPrice || 0) * number.product_number);
      }
      if (item.secondRecommendPrice) {
        second_recommend_price += ((item.secondRecommendPrice || 0) * number.product_number);
      }
      return {
        id: item._id,
        name: item.name,
        img: item.img,
        price: item.price,
        number: number.product_number,
        isDiscount: item.isDiscount,
        discountPrice: item.discountPrice,
        recommendPrice: item.recommendPrice,
        secondRecommendPrice: item.secondRecommendPrice
      };
    })
    let user_id = this.req.identity.userId;
    discount_price = await mcAccountingService.getUserUseAccount(user_id, discount_price);
    return {
      products: res,
      price,
      discount_price,
      recommend_price,
      second_recommend_price
    }
  },
  async screenProducts(products, sceneId) {
    const product_ids = products.map(item => {
      return mongoose.Types.ObjectId(item.product_id);
    });
    //筛选所有商品详情
    const goods = await mcSceneGoodsModel.find({
      _id: {
        $in: product_ids
      },
      isDeleted: false
    });
    const goodsmap = _.indexBy(goods, "_id");

     //筛选出预库存数组
     let result = await mcSceneOrderModel.aggregate([
      {$match:{
          'products.id':{$in:product_ids},
          'status':100,
          'expiredAt':{$gte:Date.now()}
      }},
      {$unwind:'$products'},
      {$match:{'products.id':{$in:product_ids}}},
      {$group:{_id:'$products.id',total:{$sum:'$products.number'}}}
      ]).exec();
    const old_number_map = _.indexBy(result, "_id");

    //筛选出每个商品的库存
    let stocks = await mcSceneGoodsInfoModel.find({goodsId:{$in:product_ids},sceneId: sceneId},"sceneStockNum goodsId")
    const stock_map = _.indexBy(stocks, "goodsId");
    
    let change = false;
    let map = [];
    
    for (let i = 0; i < products.length; i++) {
      const prd = products[i];
      const good = goodsmap[prd.product_id];
      if (good.isShow == false) {
        change = true;
        map.push({
          product_id: prd.product_id,
          product_number: 0
        })
      }else { 
        //如果是一级 库存取 goods 里的 如果是二级取清单里面的
        let total_count = 0;
        if (good.storeType == 1) {
          total_count = good.goodsTotalStockNum
        }else {
          total_count = stock_map[prd.product_id].sceneStockNum
        }
        let old = old_number_map[prd.product_id] || {};
        let old_count = old.total || 0;
        let new_count = prd.product_number;
        if (total_count - old_count - new_count < 0) {
          change = true;
          map.push({
            product_id: prd.product_id,
            product_number: total_count - old_count > 0 ? (total_count - old_count) : 0
          })
        }else {
          map.push({
            product_id: prd.product_id,
            product_number: new_count
          })
        }
      }
     
    }

    if (change) {
      return map
    } else {
      return null
    }
  },
  async postAction() {
    const self = this;
    const post = this.post;
    let user_id = this.req.identity.userId;
    post.recommend = await this.getRecommend(post.share_user_id);
    if (!post.recommend.sceneId) {
      return this.success({
        code: "1000",
        msg: "该用户无推荐的场景"
      })
    }
    //这里筛查库存
    let screen = await this.screenProducts(post.products, post.recommend.sceneId);
    if (screen != null) {
      return self.success({
        code: "100",
        msg: "某些商品库存不足,请重新提交订单",
        screen
      });
    }
   
    post.scene = await this.getScene(post.recommend.sceneId);
    if (post.products.length > 0) {
      post.product = await this.getProducts(post.products);
    }else {
      return self.success({
        code: "101",
        msg: "订单提交的商品数为0"
      });
    }
    
    post.errand = await this.getSceneErrand(post.recommend.sceneId);

    // 检查用户公益补助是否足额
    // return this.success({
    //   post
    // });

    let result = await service.createSceneOrder(user_id, post.openid, self.req, post);
    let data = {};
    data.order_id = result.orderId;
    data.wx_order_id = result.wxOrderId;
    data.wx_time_stamp = result.wxTimeStamp;
    data.price = result.price;
    data.order_desc = result.name;

    return self.success({
      code: "200",
      msg: "",
      data
    });
  }
}