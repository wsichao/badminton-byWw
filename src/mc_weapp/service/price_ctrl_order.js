const wx_controller = require('../../../app/controllers/WXController');
const order_util = Backend.service('tp_memberships', 'common_order');
const mcMemberOrderModel = Backend.model('mc_weapp', undefined, 'mc_price_ctrl_member_order');
const mcActivityOrderModel = Backend.model('mc_weapp', undefined, 'mc_activity_order');
const mc_activity = Backend.model("mc_weapp", undefined, "mc_activity");

const mcDirectorOrderModel = Backend.model('mc_weapp', undefined, 'mc_director_order');
const mcSceneOrderModel = Backend.model('mc_weapp', undefined, 'mc_scene_order');
const mcSceneErrandModel = Backend.model('mc_weapp', undefined, 'mc_scene_errand');

const mcUserInfoModel = Backend.model('mc_weapp', undefined, 'mc_user_info');
const mcShareService = Backend.service('mc_weapp', 'share');
const communityAmountPrice = Backend.service('mc_weapp', 'community_amount_price');
const commonUtil = require('../../../lib/common-util');
const mcAccountingService = Backend.service('mc_weapp', 'accounting');
const mcSubOrderService = Backend.service('mc_weapp', 'suborder');

const mcRecommendOrderModel = Backend.model('mc_weapp', undefined, 'mc_scene_recommend');
const mcSceneSupplyModel = Backend.model('mc_weapp', undefined, 'mc_scene_supply');
const mcSceneModel = Backend.model("mc_weapp", undefined, "mc_scene");
const mcSceneManager = Backend.model("mc_weapp", undefined, "mc_scene_manager");

const mcSceneGoodsInfoModel = Backend.model("mc_weapp", undefined, "mc_scene_goods_info");
const mcSceneGoodsModel = Backend.model('mc_weapp', undefined, 'mc_scene_goods');


const off = Backend.service('mc_weapp', 'official_accounts');

const _ = require("underscore");

//这里加了个锁 用来在更改总库存的时候保证数据安全  
var AsyncLock = require('async-lock');
var lock = new AsyncLock();

module.exports = {
  async createOrder(user_id, openid, req) {
    // const price = 2000 * 100;
    let price = 1;
    if (process.env.NODE_ENV != '_test') {
      price = 200000;
    }

    let orderId = await order_util.createOrderId('D');
    // create model
    const Order = {
      userId: user_id,
      price,
      status: 100,
      orderId,
      name: "朱李叶会员服务（预定）",
      wxTimeStamp: Date.now(), //微信时间戳
    }

    // create wechat order
    const wx_res = await wx_controller.WXPayApplet2030Member(req, {
      money: Order.price,
      tradeNo: orderId,
      body: Order.name,
      openid
    });

    Order.wxOrderId = wx_res.prepayId;

    await mcMemberOrderModel.create(Order);

    return Order;
  },
  async createActivityOrder(user_id, openid, req, price, activity_id) {
    let orderId = await order_util.createOrderId('B');
    const activity = await mc_activity.findOne({
      _id: activity_id,
      isDeleted: false
    })
    // create model
    const Order = {
      userId: user_id,
      price,
      status: 100,
      orderId,
      name: "活动报名费",
      activityId: activity._id,
      provinceName: activity.provinceName,
      cityName: activity.cityName,
      address: activity.address,
      activityName: activity.activityName,
      contactsName: activity.contactsName,
      contactsPhone: activity.contactsPhone,
      conductTime: activity.conductTime,
      explain: activity.explain,
      wxTimeStamp: Date.now(), //微信时间戳
    }

    // create wechat order
    const wx_res = await wx_controller.WXPayApplet2030Member(req, {
      money: Order.price,
      tradeNo: orderId,
      body: Order.name,
      openid
    });

    Order.wxOrderId = wx_res.prepayId;

    await mcActivityOrderModel.create(Order);

    return Order;
  },
  async createOrderV2(user_id, openid, req, type = 0) {
    // const price = 2000 * 100;
    let price = 1;
    if (process.env.NODE_ENV == 'production') {
      switch (type) {
        case 0:
          price = 2800 * 100;
          break;
        case 1:
          price = 5800 * 100;
          break;
        case 2:
          price = 9800 * 100;
          break;
        default:
          price = 2800 * 100;
          break;
      }
    } else {
      switch (type) {
        case 0:
          price = 1;
          break;
        case 1:
          price = 2;
          break;
        case 2:
          price = 3;
          break;
        default:
          price = 1;
          break;
      }
    }

    let orderId = await order_util.createOrderId('D');
    // create model
    const Order = {
      userId: user_id,
      price,
      status: 100,
      orderId,
      name: `朱李叶会员服务（${price/100}）`,
      wxTimeStamp: Date.now(), //微信时间戳
    }

    // create wechat order
    const wx_res = await wx_controller.WXPayApplet2030Member(req, {
      money: Order.price,
      tradeNo: orderId,
      body: Order.name,
      openid
    });

    Order.wxOrderId = wx_res.prepayId;

    await mcMemberOrderModel.create(Order);

    return Order;
  },
  async createSceneOrder(user_id, openid, req, post) {
    let price = post.product.price || 0;
    price = price - post.product.discount_price;
    let orderId = await order_util.createOrderId('P');
    // create model
    const Order = {
      userId: user_id,
      price,
      status: 100,
      orderId,
      wxTimeStamp: Date.now(), //微信时间戳
      shareId: post.recommend._id,
      sceneId: post.recommend.sceneId,
      sceneName: post.scene.name,
      contactName: post.name,
      contactPhone: post.phone,
      contactAddress: post.address,
      note: post.note,
      products: post.product.products,
      type: post.type,
      discountPrice: post.product.discount_price,
      recommendPrice: post.product.recommend_price,
      secondRecommendPrice: post.product.second_recommend_price,
      deliveryType: post.delivery_type,
      expiredAt: (Date.now() + 5*60*1000)
    }
    if (post.type == 0) {
      Order.name = `本店优选订单`;
      Order.sceneErrandId = post.errand._id;
    } else if (post.type == 1) {
      Order.name = `本店严选订单`;
    }
    
    // 修改用户收件人信息
    if (post.name) {
      await mcUserInfoModel.update({
        userId: user_id,
        isDeleted: false
      }, {
        "recipientInfo.name": Order.contactName,
        "recipientInfo.phoneNum": Order.contactPhone,
        "recipientInfo.address": Order.contactAddress,
      })
    }
    
    //如果press 大于 就创建wx 订单
    if (price > 0) {
       // create wechat order
      const wx_res = await wx_controller.WXPayApplet2030Member(req, {
        money: Order.price,
        tradeNo: orderId,
        body: Order.name,
        openid
      });
      Order.wxOrderId = wx_res.prepayId;
    } 
   
    let order = await mcSceneOrderModel.create(Order);

    //如果 price 为0了 直接拆单
    if (price == 0 && order.status == 100 && order.type == 1) {
      //修改order内商品的对应清单的总库存
      await this.cutStock(order.orderId);
      await this.paySceneSuccess(order.orderId);
    }

    return Order;
  },
  async createdirectorOrder(user_id, openid, req) {
    let price = 1;
    if (process.env.NODE_ENV == 'production') {
      price = 1000 * 100;
    }

    let orderId = await order_util.createOrderId('A');
    // create model
    const Order = {
      userId: user_id,
      price,
      status: 100,
      orderId,
      name: `升级主管`,
      wxTimeStamp: Date.now(), //微信时间戳
    }

    // create wechat order
    const wx_res = await wx_controller.WXPayApplet2030Member(req, {
      money: Order.price,
      tradeNo: orderId,
      body: Order.name,
      openid
    });

    Order.wxOrderId = wx_res.prepayId;

    await mcDirectorOrderModel.create(Order);

    return Order;
  },
  /**
   * 支付完成处理
   * 1、修改订单状态为200
   * 2、处理分账 暂未处理
   *    普通上级分账金额
   * @param {*} order_id 
   */
  async paySuccess(order_id, user_id, price) {
    await mcMemberOrderModel.update({
      orderId: order_id,
      isDeleted: false
    }, {
      status: 200,
      paidTime: Date.now()
    })
    // 一级 二级分账
    const u = await mcShareService.getShareGradient(user_id);
    await communityAmountPrice.insertPShsre(u.p_user_id, price);
    await communityAmountPrice.insertDirector(u.d_user_id, price);
  },
  /**
   * 支付完成处理(活动报名)
   * 1、修改订单状态为200
   * @param {*} order_id 
   */
  async payActivitySuccess(order_id) {
    await mcActivityOrderModel.update({
      orderId: order_id,
      isDeleted: false
    }, {
      status: 200,
      paidTime: Date.now()
    })
  },
  /**
   * 支付完成处理(成为主管)
   * 1、修改订单状态为200
   * 2、处理分账 暂未处理
   *    普通上级分账金额
   * @param {*} order_id 
   */
  async payDirectorSuccess(order_id, user_id) {
    await mcDirectorOrderModel.update({
      orderId: order_id,
      isDeleted: false
    }, {
      status: 200,
      paidTime: Date.now()
    })
    // 用户升级为主管
    await mcUserInfoModel.update({
      userId: user_id,
      isDeleted: false
    }, {
      role: "director"
    })
  },
  /**
   * 支付完成后，删除清单内对应商品的库存
   * @param order_id 订单id
   */
  async cutStock(order_id) {
    const order = await mcSceneOrderModel.findOne({
      orderId: order_id,
      isDeleted: false
    })
    //取出商品
    const prd_map = _.indexBy(order.products, "id");
    const product_ids = order.products.map(item => {
      return item.id;
    }); 

    lock.acquire("stock", async function() {
      //这里晒出商品去判断类型
      let goods = await mcSceneGoodsModel.find({_id:{$in: product_ids}},"goodsTotalStockNum storeType")
       for (let i = 0; i < goods.length; i++) {
         const good = goods[i];
         let stock_count = 0;
         //商品库存 一级取商品 二级去清单 info 里
         if (good.storeType == 1) {
           stock_count = good.goodsTotalStockNum
           let order_count = prd_map[good._id].number;
            let up = {
              $set: {
                goodsTotalStockNum: stock_count - order_count
                }
            }
            await mcSceneGoodsModel.findOneAndUpdate({_id:good._id},up,{new: true});
         }else{
          let info = await mcSceneGoodsInfoModel.findOne({sceneId:order.sceneId, goodsId:good._id},"goodsId sceneStockNum");
          stock_count = info.sceneStockNum;
          let order_count = prd_map[good._id].number;
          let up = {
            $set: {
              sceneStockNum: stock_count - order_count
              }
          }
          console.log(up)
          await mcSceneGoodsInfoModel.findOneAndUpdate({sceneId:order.sceneId, goodsId:good._id},up,{new: true});
         }
         
       }
    })
  },
  /**
   * 支付完成后，给配送员发短信通知
   */
  async paySceneSuccess(order_id) {
    await mcSceneOrderModel.update({
      orderId: order_id,
      isDeleted: false
    }, {
      status: 200,
      paidTime: Date.now()
    })

    const order = await mcSceneOrderModel.findOne({
      orderId: order_id,
      isDeleted: false
    })
    if (order.discountPrice && order.discountPrice != 0) {
      mcAccountingService.productDiscount(order.userId, order.discountPrice);
    }
    
    console.log("拆分订单之前"+order_id);
    let orders = await mcSubOrderService.createSubOrder(order_id);
    console.log("拆分订单之后"+order_id);
    
    if (orders) {
      for (let i = 0; i < orders.length; i++) {
        const ord = orders[i];
        //拼接 remark
        let remark = ""
        for (let j = 0; j < ord.products.length; j++) {
          const pro = ord.products[j];
          remark += pro.name + "*" + pro.number
        }
        //拼接 支付时间
        let payTime = new Date(ord.paidTime).format("YYYY-MM-dd hh:mm:ss")
        //推荐人
        const shareId = ord.shareId;
        let share = await mcRecommendOrderModel.findOne({_id:shareId})
        let union = await mcUserInfoModel.findOne({userId:share.userId})
        if (union.unionid) {
          off.postOrderTemplate("",union.unionid,ord.orderId,ord.price,payTime,remark)
        }
        
        //供应商
        const supplyId = ord.supplyId;
        let supply = await mcSceneSupplyModel.findOne({_id:supplyId})
        let un = await mcUserInfoModel.findOne({userId:supply.userId})
        off.postOrderTemplate("",un.unionid,ord.orderId,ord.supplyPrice,payTime,remark)

        //商务经理
        const sceneId = ord.sceneId;
        let scene = await mcSceneModel.findOne({_id:sceneId})
        let manage = await mcSceneManager.findOne({_id:scene.sceneManagerId})
        let manun = await mcUserInfoModel.findOne({userId:manage.userId})
        off.postOrderTemplate(scene.name,manun.unionid,ord.orderId,ord.price,payTime,remark)
      }
    }

    if (order.type == 1) return;

    const cene_errand_user_id = order.sceneErrandId;
    const obj = await mcSceneErrandModel.findOne({
      _id: cene_errand_user_id,
      isDeleted: false
    });
    const user_phone = order.contactPhone
    const phone = obj.phone;
    const name = obj.name;
    const scene_name = order.sceneName;

    // 给配送人员发送短信
    console.log(`scene_name: ${scene_name}   name: ${name}  phone: ${phone} 发送短信通知   user_phone: ${user_phone}`);
    // commonUtil.sendSms("3151762", user_phone, `#name#=${name}&#phone#=${phone}`);
    commonUtil.sendSms("3151766", phone, `#scene#=${scene_name}`);
  }
}