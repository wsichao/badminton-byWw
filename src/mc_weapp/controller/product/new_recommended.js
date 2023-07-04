const mcSceneRecommendModel = Backend.model('mc_weapp', undefined, 'mc_scene_recommend');
const mcSceneModel = Backend.model('mc_weapp', undefined, 'mc_scene');
const mcSceneGoodsModel = Backend.model('mc_weapp', undefined, 'mc_scene_goods');
const mcSceneOrderModel = Backend.model('mc_weapp', undefined, 'mc_scene_order');
const mc_scene_collection_model = Backend.model("mc_weapp", undefined, "mc_scene_collection");
const mc_scene_goods_info_model = Backend.model("mc_weapp", undefined, "mc_scene_goods_info");
const mc_scene_user_info_model = Backend.model("mc_weapp", undefined, "mc_user_info");
const weapp_service = Backend.service('mc_weapp', 'mc_weapp');
const mcSceneStockApplyModel = Backend.model('mc_weapp', undefined, 'mc_scene_stock_apply');

const mcOrder = Backend.service('mc_weapp', 'order');
const mongoose = require('mongoose');

const _ = require("underscore");


module.exports = {
  __beforeAction() {
    if (this.query.type == "") {
      this.query.type = 0;
    }
  },
  __rule: function (valid) {
    return valid.object({
      user_id: valid.string().required(),
      search: valid.string().empty(""),
      type: valid.number().required()
    });
  },
  async isCollection(recommend_user_id) {
    let user_id = this.req.identity.userId;
    const res = await mc_scene_collection_model.count({
      userId: user_id,
      "sceneRecommend.userId": recommend_user_id
    })
    return res > 0;
  },
  async getGoods(ids = [], search, type = 0, sceneid) {
    let goods_ids = ids.map(item => mongoose.Types.ObjectId(item.goodsId))
    const reg = new RegExp(search, 'i') //不区分大小写
    let cond = {
      _id: {
        $in: goods_ids
      },
      type,
      isDeleted: false,
      isShow: true
    }
    if (search) {
      cond.name = {
        "$regex": reg
      }
    }
    let res = await mcSceneGoodsModel.find(cond).sort({
      createdAt: -1
    });
    let applys = await mcSceneStockApplyModel.find({
      productId: {
        $in: goods_ids
      },
      sceneId: sceneid,
      status: 100
    })

    res = JSON.parse(JSON.stringify(res))

    //筛选出预库存数组
    let result = await mcSceneOrderModel.aggregate([
      {$match:{
          'products.id':{$in:goods_ids},
          'status':100,
          'expiredAt':{$gte:Date.now()}
      }},
      {$unwind:'$products'},
      {$match:{'products.id':{$in:goods_ids}}},
      {$group:{_id:'$products.id',total:{$sum:'$products.number'}}}
      ]).exec();

    const old_number_map = _.indexBy(result, "_id");

    //这个地方 再去搞出分类和商品的关系
    for (let i = 0; i < ids.length; i++) {
      const ele = ids[i];
      for (let j = 0; j < res.length; j++) {
        const good = res[j];
        if (good._id == ele.goodsId) {
          if (ele.categoryId) {
            good.category = ele.categoryId
          }else{
            good.category = ""
          }
           //添加库存 (如果是一级是商品里的总库存减去预扣 如果是二级按原来逻辑看清单)
          let num = 0
          if (good.storeType == 1) {
            num = good.goodsTotalStockNum
          }else {
            num = ele.sceneStockNum || 0
          }
          let old = old_number_map[good._id] || {};
          let old_count = old.total || 0;
          good.scene_stock = num - old_count
          good.store_type = good.storeType || 2
        }
      }
    }

    for (let i = 0; i < res.length; i++) {
      const good = res[i];
      for (let j = 0; j < applys.length; j++) {
        //申请筛选状态
        const apply = applys[j];
        if (apply.productId.toString() ==  good._id.toString()) {
          good.apply_status = apply.status;
        }
        
      }
    }
    return res
  },
  async getGoodsId(scene_id) {
    const res = await mc_scene_goods_info_model.find({
      sceneId: scene_id,
      isRelevance: true,
      isDeleted: false
    }, "goodsId categoryId sceneStockNum")
    if (!res) return [];
    return res;
  },
  async update(id, qscode) {
    await mcSceneRecommendModel.update({
      _id: id
    }, {
      qscode
    });
  },
  async run(item) {
    const page = 'pages/recommend_goods/recommend_goods_list/recommend_goods_list';
    let qrcode = (await weapp_service.get_weapp_qr_code(item.userId, page)).qr_code;
    await this.update(item._id, qrcode);
  },
  /**
   * 根据用户唯一标识获取推荐
   * @param {*} user_id 
   */
  async getRecommend(user_id) {
    const search = this.query.search;
    const type = this.query.type;
    let recommend = await mcSceneRecommendModel.findOne({
      userId: user_id,
      isDeleted: false
    });
    if (!recommend) return;
    if (recommend.qscode == undefined || recommend.qscode == null) {
      this.run(recommend)
    }
    const scene_id = recommend.sceneId;
    const scene = await mcSceneModel.findOne({
      _id: scene_id,
      isDeleted: false
    })
    
    if (!scene) return;
    let goods = await this.getGoodsId(scene_id); 
    
    const address = `${scene.provinceName || ""}${scene.cityName || ""}${scene.countyName || ""}${scene.address || ""}`;
    const phone = scene.isShowOwner == true ? scene.ownerPhone : '';
    return {
      scene_id: scene._id,
      merchants: scene.name,
      deliveryType: scene.deliveryType,
      address,
      phone,
      avatar: scene.avatar,
      qcode: recommend.qscode,
      goods: await this.getGoods(goods, search, type, scene_id),
      categorys: scene.categorys
    }
  },
  async collectionCount(user_id) {
    return await mc_scene_collection_model.count({
      "sceneRecommend.userId": user_id
    })
  },
  async orderCount(user_id) {
    let recommend = await mcSceneRecommendModel.findOne({
      userId: user_id,
      isDeleted: false
    });
    if (!recommend) return 0;
    const scene_id = recommend.sceneId;
    return await mcSceneOrderModel.count({
      sceneId: scene_id,
      isDeleted: false,
      status: {
        $in: [200, 300, 400, 600]
      }
    })
  },
  async getUserId(user_id) {
    const user_info = await mc_scene_user_info_model.findOne({
      preRefUserId: user_id,
      isDeleted: false
    })
    if (!user_info) return user_id;
    return user_info.userId;
  },
  async isOwner() {
    const user_id = this.req.identity.userId;
    return (await mcSceneModel.count({
      ownerUserId: user_id,
      isDeleted: false
    })) > 0;
  },
  async getAction() {
    let user_id = this.query.user_id;
    user_id = await this.getUserId(user_id);
    const result = await this.getRecommend(user_id);
    const is_collection = await this.isCollection(user_id);
    const collection_count = await this.collectionCount(user_id);
    const order_count = await this.orderCount(user_id);
    const is_owner = await this.isOwner();
    const avatar = result.avatar;
    const phone = result.phone;
    const address = result.address;
    const type = this.query.type;
    if (!result) {
      return this.success({
        code: "200",
        msg: "",
        data: {
          merchants: "",
          qcode: "",
          list: []
        }
      })
    }
    const goods = result.goods;
    const qcode = result.qcode || "";
    const merchants = result.merchants || "";
    let res = [];
    let categorys = result.categorys;
      categorys = _.filter(categorys, function (item) {
        if (item.isDeleted == true || item.type != type) {
        return false;
        }
        return true;
     })
  
    if (goods) {
      const goods_ids = goods.map(item => item._id);
      const goods_map = await mcOrder.goodsCount(goods_ids);
      let res_goods_ids = goods.map(item => item.beforeZeroGoodsId);
      res_goods_ids = _.without(res_goods_ids, undefined);
      const more_map = await mcOrder.goodsCount(res_goods_ids);
      for (let j = 0; j < categorys.length; j++) {
        const cate = categorys[j];
        let products = [];
        for (let i = 0; i < goods.length; i++) {
            const item = goods[i];
          if (item.category.toString() == cate.categoryId.toString()) {
            let sell_count = 0;
            let more_count = 0;
            if (goods_map[item._id] != undefined) {
              sell_count = goods_map[item._id]
            }
            if (more_map[item.beforeZeroGoodsId] != undefined) {
              more_count = more_map[item.beforeZeroGoodsId]
            }
            sell_count += more_count;
            
            products.push({
              product_id: item._id,
              product_img: item.img,
              product_name: item.name,
              product_detail: item.describe,
              price: item.price,
              origin_price: item.originPrice,
              is_discount: item.isDiscount || false,
              discount_price: item.discountPrice || 0,
              recommend_price: is_owner ? (item.recommendPrice || 0) : undefined,
              is_show_recommend_price: is_owner,
              sell_count,
              count: 0,
              scene_stock: item.scene_stock,
              store_type: item.store_type,
              apply_status: item.apply_status || 200
            })
          }
        
        }
        if (products.length > 0) {
          res.push({
            title: cate.categoryName,
            goods: products
          })
        }
      }
    }

    if (this.query.type == 1) {
      result.deliveryType = undefined
    } else {
      result.deliveryType = result.deliveryType.length > 0 ? result.deliveryType : [1]
    }


    return this.success({
      code: "200",
      msg: "",
      data: {
        merchants,
        qcode,
        categrays: res,
        is_collection,
        collection_count,
        order_count,
        avatar,
        phone,
        address,
        delivery_type: result.deliveryType,
        is_owner,
        scene_id: result.scene_id
      }
    })
  }
}