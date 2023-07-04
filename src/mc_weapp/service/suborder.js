const mcSceneSuborderModel = Backend.model('mc_weapp', undefined, 'mc_scene_suborder');
const mcSceneOrderModel = Backend.model('mc_weapp', undefined, 'mc_scene_order');
const mcSceneGoodsModel = Backend.model('mc_weapp', undefined, 'mc_scene_goods');
const mcSceneSupplyModel = Backend.model('mc_weapp', undefined, 'mc_scene_supply');
const mcAccountingService = Backend.service('mc_weapp', 'accounting');
const random = require('string-random')

const _ = require("underscore");

/**
 * 子订单相关接口
 */
module.exports = {
  async createSubOrder(order_id) {
    await mcSceneOrderModel.update({
      orderId: order_id
    },{
      qrcode: await this.creatQrCode()
    })
    const order = await mcSceneOrderModel.findOne({
      orderId: order_id,
      type: 1,
      isDeleted: false
    })
    if (!order) return;
    const products = order.products;
    const discountPriceObj = {
      discountPrice: order.discountPrice
    }
    const new_products = await this.productsCls(products, discountPriceObj);
    if (!new_products || new_products.length == 0) return;
    let options = await this.subOrderHandler(order, new_products);
    try {
      console.log("生成子订单之前"+order_id);
      await mcSceneSuborderModel.create(options);
      return options
    } catch (e) {
      console.log(e)
    }
  },
  /**
   * 生成一个不重复的qr_code
   *  
   */
  async creatQrCode() {
    let ran = random(12, {letters: false}); 
    //如果已经有了订单号 就把订单号加1继续循环 知道没有
    while(await mcSceneOrderModel.findOne({qrcode: ran}) || 
       await mcSceneSuborderModel.findOne({qrcode: ran})){
        ran += 1;
        ran +'';
    }
    //返回二维码号
    return ran;
  },
  /**
   * 订单分账
   * @param {*} order_id 
   */
  async fashionable(order_id) {
    const order = await mcSceneSuborderModel.findOne({
      _id: order_id
    });
    await this.orderFashionable(order);
  },
  async orderFashionable(order) {
    // const products = order.products;
    const supplyId = order.supplyId;
    const sum = order.supplyPrice;
    if (!supplyId) {
      console.log(`订单:${order._id} 供应商不存在，不进行分账`);
      return;
    }
    if (sum == 0) {
      console.log(`订单:${order._id} 分账金额为 0，不进行分账`);
      return
    };
    const supply = await mcSceneSupplyModel.findOne({
      _id: supplyId
    });
    const userId = supply.userId;
    // 进行分账
    console.log(`给用户${userId}发钱,金额:${sum}`);
    await mcAccountingService.subOrderAward(userId, sum, order._id);
    await mcSceneSuborderModel.update({
      _id: order._id
    }, {
      isPaySupply: true
    })
  },
  async subOrderHandler(order, products) {
    let codes = []
    for (let i = 0; i < products.length; i++) {
        codes.push(await this.creatQrCode())
    }
    //总的抵扣金
    let total_dis_price = order.discountPrice;
    return products.map((item, index) => {
      //这里拆分抵扣金 order 为主订单
      let rel_dis_price = 0;
      if (total_dis_price > 0) {
        for (let i = 0; i < item.products.length; i++) {
          const pro = item.products[i];
          rel_dis_price += pro.discountPrice;
        }
        if (total_dis_price < rel_dis_price) {
          rel_dis_price = total_dis_price;
        }
        total_dis_price -= rel_dis_price;
      }
      let obj = {
        userId: order.userId,
        sceneOrderId: order._id,
        price: item.price,
        status: 200,
        isPaySupply: false,
        products: item.products,
        sceneId: order.sceneId,
        sceneName: order.sceneName,
        name: order.name,
        deliveryType: order.deliveryType,
        contactName: order.contactName,
        contactPhone: order.contactPhone,
        contactAddress: order.contactAddress,
        note: order.note,
        sceneErrandId: order.sceneErrandId,
        recommendPrice: item.recommendPrice,
        secondRecommendPrice: item.secondRecommendPrice,
        shareId: order.shareId,
        orderId: order.orderId + "_" +(index + 1),
        paidTime: order.paidTime,
        qrcode: codes[index],
        discountPrice: rel_dis_price
      }
      if (item.supplyId != 'undefined') {
        obj.supplyId = item.supplyId;
        obj.supplyName = item.supplyName;
        obj.supplyPrice = item.supplyPrice;
      }
      return obj;
    })
  },
  /**
   * 商品分类
   * @return [{
   *  supplyId:ObjectId, // 供应商唯一标识
   *  supplyPrice:Number, // 供应商价格
   *  products:[{    
        id: ObjectId // 商品唯一标识
        name: String  // 商品名
        img: String // 商品图片
        number: Number // 商品件数
        price: Number // 单价
        isDiscount: Boolean // 是否有折扣
        discountPrice: Number // 折扣金额
        recommendPrice: Number  //推荐人奖励
        secondRecommendPrice: Number //推荐人奖励(二级),
        supplyPrice: Number
      }],
      price:Number, //商品总金额
   * }]
   */
  async productsCls(products, discountPriceObj) {
    try {
      products = JSON.parse(JSON.stringify(products));
    } catch (e) {
      products = [];
    }

    const ids = products.map(item => item.id);
    let ps = await mcSceneGoodsModel.find({
      _id: {
        $in: ids
      },
      isDeleted: false
    });

    const o_map = _.indexBy(ps, "_id");
    products = products.map(item => {
      if (o_map[item.id]) {
        let supply = o_map[item.id];
        item.supplyId = supply.supplyId;
        item.supplyPrice = supply.supplyPrice;
        item.supplyName = supply.supplyName;
      }
      return item;
    })
    const group = _.groupBy(products, "supplyId", []);
    const products_map = _.indexBy(products, "_id");
    let new_products = [];

    for (let p in group) {
      const item = group[p];
      let recommendPrice = 0;
      let secondRecommendPrice = 0;
      if (item.length == 0) return;
      let obj = {};
      const supplyId = p;
      let supplyPrice = 0;
      const supplyName = item[0].supplyName;

      let currentPrice = 0;
      for (let i = 0; i < item.length; i++) {
        let t = item[i];
        let price = t.price;
        let discountPrice = t.discountPrice;
        let number = t.number;
        let p_supply_price = 0;

        if (products_map[t._id]) {
          p_supply_price = products_map[t._id].supplyPrice || 0;
          t.supplyPrice = p_supply_price;
        }


        if (t.isDiscount) {
          if (discountPriceObj.discountPrice >= discountPrice) {
            price = price - discountPrice;
            discountPriceObj.discountPrice = discountPriceObj.discountPrice - discountPrice;
          } else {
            price = price - discountPriceObj.discountPrice;
            discountPriceObj.discountPrice = 0;
          }

        };
        currentPrice += price * number;
        recommendPrice += (t.recommendPrice || 0) * number;
        secondRecommendPrice += (t.secondRecommendPrice || 0) * number;;
        supplyPrice += p_supply_price * number;
      }
      obj.supplyId = supplyId;
      obj.supplyPrice = supplyPrice;
      obj.supplyName = supplyName;
      obj.price = currentPrice;
      obj.products = item;
      obj.recommendPrice = recommendPrice;
      obj.secondRecommendPrice = secondRecommendPrice;
      new_products.push(obj);
    }
    return new_products;
  }
}