const order_util = Backend.service('tp_memberships', 'common_order');
const wx_controller = require('../../../app/controllers/WXController');
const order_model = Backend.model("mc_weapp", undefined, 'mc_order');
const member_order_model = Backend.model("mc_weapp", undefined, 'mc_price_ctrl_member_order');
const mc_director_order_model = Backend.model("mc_weapp", undefined, 'mc_director_order');
const mc_scene_order_model = Backend.model("mc_weapp", undefined, 'mc_scene_order');
const mcActivityOrderModel = Backend.model('mc_weapp', undefined, 'mc_activity_order');
const mcSceneOrderModel = Backend.model('mc_weapp', undefined, 'mc_scene_order');
const mcSceneRecommendModel = Backend.model('mc_weapp', undefined, 'mc_scene_recommend');

const service_man_model = Backend.model('mc_weapp', undefined, 'mc_service_man');
const mc_user_ref_model = Backend.model('mc_weapp', undefined, 'mc_user_ref');
const mc_user_role_model = Backend.model('mc_weapp', undefined, 'mc_user_role');
const mc_user_info_model = Backend.model('mc_weapp', undefined, 'mc_user_info');
const mc_service_model = Backend.model('mc_weapp', undefined, 'mc_service');
const pre_order_model = Backend.model("sp_assistant", undefined, 'mc_pre_order');
const mc_figure = Backend.model("mc_weapp", undefined, 'mc_figure');
const _ = require('underscore');
const doctor_service = Backend.service('mc_weapp', 'doctor');

module.exports = {
  /**
   * 2030 小程序 下单
   * @param {*} user_id 用户id
   * @param {*} openid openid
   * @param {*} req req对象
   */
  async create_order(user_id, openid, req) {
    const type = 0;
    let result = {
      code: '200',
      msg: '',
      data: {}
    }
    const service_info = await mc_service_model.findOne({
      sericeNumber: type,
      isDeleted: false
    }, 'name desc price')
    const now = Date.now();
    let orderId = await order_util.createOrderId('T');
    let new_order = {
      userId: user_id, //用户id
      price: service_info.price, // 价格
      status: 100, //100 未支付  200 支付成功 
      orderId, //订单id
      wxOrderId: '', //微信订单id
      wxTimeStamp: now, //微信时间戳
      name: service_info.name,
      desc: service_info.desc
    };
    let wx_res;
    if (openid) {
      wx_res = await wx_controller.WXPayApplet2030(req, {
        money: new_order.price,
        tradeNo: orderId,
        body: service_info.name,
        openid
      });
    } else {
      wx_res = await wx_controller.WXPayApp2030(req, {
        money: new_order.price,
        tradeNo: orderId,
        body: service_info.name
      });
    }

    new_order.wxOrderId = wx_res.prepayId;
    let insert_new_order = await order_model.create(new_order);
    result.data = {
      "order_id": insert_new_order.orderId,
      "wx_order_id": insert_new_order.wxOrderId,
      "wx_time_stamp": insert_new_order.wxTimeStamp,
      "price": insert_new_order.price,
      order_desc: service_info.name
    }
    return result;
  },
  /**
   * 支付订单
   * @param {*} orderId 
   */
  async pay_order(order) {
    var cond = {
      isDeleted: false,
      orderId: order.orderId
    }
    if (order.type == 0) {
      var update = {
        $set: {
          status: 200,
          paidTime: Date.now()
        }
      }
      if (order.assistantId) { //助理端帮下单
        let condition = {
          isDeleted: false,
          orderId: order.orderId,
        }
        let update_first = {
          $set: {
            status: 200,
          }
        }
        await pre_order_model.findOneAndUpdate(condition, update_first, {
          new: true
        });
      }
    }
    if (order.type == 1) {
      let time = new Date();
      let service_info = await mc_service_model.findOne({
        sericeNumber: order.type,
        isDeleted: false
      });
      let due_time = time.setMonth(time.getMonth() + service_info.duration);
      var update = {
        $set: {
          status: 200,
          paidTime: Date.now(),
          dueTime: due_time
        }
      }
      let condition = {
        isDeleted: false,
        status: 600,
        serviceOrderId: order._id
      }
      let update_first = {
        $set: {
          status: 800,
        }
      }
      await order_model.findOneAndUpdate(condition, update_first, {
        new: true
      });
    }

    return await order_model.findOneAndUpdate(cond, update, {
      new: true
    });
  },
  /**
   * 新增/编辑 被服务人信息
   * @param {*} user_id 
   * @param {*} data 
   */
  async insert_mc_service_man(user_id, data) {
    let order = await order_model.findOne({
      orderId: data.order_id,
      isDeleted: false,
      status: {
        '$in': [200, 400]
      }
    });
    if (!order) {
      return {
        code: '8005',
        msg: '订单不存在'
      }
    }
    let service_man_info = {};
    if (data.name) {
      service_man_info.name = data.name;
    }
    if (data.phone_num) {
      service_man_info.phoneNum = data.phone_num;
    }
    if (data.sex || data.sex === '') {
      service_man_info.sex = data.sex;
    }
    if (data.age || data.age === 0) {
      service_man_info.age = data.age;
    }
    if (data.chronic_disease_name || data.chronic_disease_name === '') {
      service_man_info.chronicDiseaseName = data.chronic_disease_name;
    }
    if (data.drug_fee_range || data.drug_fee_range === '') {
      service_man_info.drugFeeRange = data.drug_fee_range;
    }
    if (data.case_img) {
      service_man_info.caseImg = data.case_img;
    }
    if (data.drug_fee_list_img) {
      service_man_info.drugFeeListImg = data.drug_fee_list_img;
    }
    if (data.diease_time || data.diease_time === 0) {
      service_man_info.dieaseTime = data.diease_time
    }
    let result = {
      code: 200,
      msg: '',
      data: {}
    }
    if (order.serviceManId) {
      // 编辑
      result.data = await service_man_model.findOneAndUpdate({
        _id: order.serviceManId
      }, {
        $set: service_man_info
      }, {
        new: true
      });
      await order_model.findOneAndUpdate({
        orderId: data.order_id,
        isDeleted: false
      }, {
        $set: {
          status: 300
        }
      }, {
        new: true
      });
    } else {
      // 新增
      let new_service_man = await service_man_model.create(service_man_info);
      await order_model.findOneAndUpdate({
        orderId: data.order_id,
        isDeleted: false
      }, {
        $set: {
          serviceManId: new_service_man._id,
          status: 300
        }
      }, {
        new: true
      });
      result.data = new_service_man;
    }
    return result;
  },
  /**
   * 查询被服务人信息 
   * @param {*} user_id 
   * @param {*} order_id 
   */
  async get_mc_service_man(order_id) {
    const order = await order_model.findOne({
      orderId: order_id,
      isDeleted: false
    });
    if (!order || !order.serviceManId) {
      return {
        code: '8005',
        msg: '订单不存在'
      }
    }
    const service_man = await service_man_model.findOne({
      _id: order.serviceManId,
      isDeleted: false
    });
    let result = {
      code: 200,
      msg: '',
      data: {
        "name": service_man.name || '',
        "phone_num": service_man.phoneNum || '',
        "sex": service_man.sex || '',
        "age": service_man.age || null,
        "chronic_disease_name": service_man.chronicDiseaseName || '',
        "drug_fee_range": service_man.drugFeeRange || '',
        "case_img": service_man.caseImg || [],
        "drug_fee_list_img": service_man.drugFeeListImg || [],
        "diease_time": service_man.dieaseTime || null,
      }
    };
    return result;
  },
  async getOrder(model, cond) {
    return await model.find(cond);
  },
  async get_mc_order_list(user_id) {
    const cond = {
      userId: user_id,
      isDeleted: false,
      status: {
        $gt: 100
      }
    }
    let order_list = await order_model.find(cond);

    let member_order_list = await member_order_model.find(cond);

    let mc_scene_order_list = await mc_scene_order_model.find(cond);

    let director_order_list = await mc_director_order_model.find(cond);

    let activity_order_list = await mcActivityOrderModel.find(cond);

    director_order_list = director_order_list.map(item => {
      item.name = "升级主管";
      return item;
    })

    order_list = order_list.concat(member_order_list);
    order_list = order_list.concat(director_order_list);
    order_list = order_list.concat(mc_scene_order_list);
    order_list = order_list.concat(activity_order_list);

    let result = {
      code: '200',
      msg: '',
      items: []
    }

    order_list.forEach(item => {
      let resItem = {
        "order_id": item.orderId,
        "order_name": item.name,
        "price": item.price,
        "is_service_man": item.serviceManId ? true : false,
        "paid_time": item.paidTime || null,
        "is_service_man": item.serviceManId ? true : false
      }
      result.items.push(resItem);
    });

    result.items = _.sortBy(result.items, "paid_time").reverse();
    return result;
  },
  /**
   * 城市经理获取自己的推广记录
   * @param {*} user_id 
   */
  async get_mc_manager_extend(user_id) {
    const role = await mc_user_role_model.findOne({
      userId: user_id,
      isDeleted: false,
      type: 0
    });
    if (!role) {
      return {
        code: '8005',
        msg: '此人不是城市经理'
      }
    }
    const manager_info = await mc_user_info_model.findOne({
      userId: user_id,
      isDeleted: false
    })
    if (!manager_info) {
      return {
        code: '8005',
        msg: '此人不是城市经理'
      }
    }
    const child_node = await mc_user_ref_model.find({
      rootUserId: user_id,
      isDeleted: false
    });
    let user_ids = child_node.map(item => {
      return item.userId;
    });
    const manager_create_time = role.createdAt;
    let result = {
      code: '200',
      msg: '',
      data: {
        qr_code: manager_info.qcode,
        list: []
      }
    };
    let startTime = new Date(manager_create_time).setMonth(new Date(manager_create_time).getMonth() + 1)
    // 查询每个月下线的消费记录
    let now_to_next_month_time = new Date().setMonth(new Date().getMonth() + 1);
    for (let startTimeAt = startTime; startTimeAt < now_to_next_month_time; startTimeAt = new Date(startTimeAt).setMonth(new Date(startTimeAt).getMonth() + 1)) {
      let preTime = new Date(startTimeAt).setMonth(new Date(startTimeAt).getMonth() - 1);
      let orderCount = await order_model.count({
        isDeleted: false,
        userId: {
          $in: user_ids
        },
        status: {
          $gte: 200
        },
        type: 0,
        paidTime: {
          $gte: preTime,
          $lt: startTimeAt
        }
      });
      let resItem = {
        "date": startTimeAt,
        "invite_num": orderCount
      }
      result.data.list.push(resItem);
      startTime = startTimeAt;
    }
    return result;
  },
  /**
   * 获取订单列表
   * @param {*} cond 订单查询条件
   */
  async getOrders(cond) {
    let orders = await order_model.find(cond).sort({
      createdAt: -1
    });
    let serviceManId = [];
    orders.forEach(element => {
      if (element.serviceManId) {
        serviceManId.push(element.serviceManId);
      }
    });
    let conditions = {
      _id: {
        $in: serviceManId
      },
      isDeleted: false,
    }
    let serviceMans = await service_man_model.find(conditions);
    let serviceManList = _.indexBy(serviceMans, '_id');
    let result = [];
    orders.forEach(item => {
      let resItem = {
        name: item.serviceManId ? serviceManList[item.serviceManId].name : '',
        create_time: item.paidTime,
        price: item.price,
        service_type: item.name,
        order_id: item.orderId
      }
      result.push(resItem);
    });
    return result;
  },
  /**
   * 2030 小程序 专属会员服务下单
   * @param {*} user_id 用户id
   * @param {*} openid openid
   * @param {*} doctor_id 医生id
   * @param {*} order_id 诊断服务订单id
   * @param {*} req req对象
   */
  async create_service_order(user_id, doctor_id, order_id, openid, req) {
    let result = {
      code: '200',
      msg: '',
      data: {}
    }
    //查询诊断服务订单，获取被服务人唯一标识
    let diagnosis_order = await order_model.findOne({
      'orderId': order_id,
      'status': 600,
      'type': 0,
      'isDeleted': false
    }, 'serviceManId isPreFrom price doctorId assistantId');
    if (!diagnosis_order) {
      return {
        code: '8006',
        msg: '订单不存在'
      }
    }
    //查询被服务人model,获取服务价格
    let service_man_info = await service_man_model.findOne({
      '_id': diagnosis_order.serviceManId,
      'isDeleted': false
    }, 'servicePrice');
    if (!service_man_info) {
      return {
        code: '8005',
        msg: '被服务人信息未建立或该医生不在推荐列表'
      }
    }
    const now = Date.now();
    let orderId = await order_util.createOrderId('T');
    let service_info = await mc_service_model.findOne({
      sericeNumber: 1,
      isDeleted: false
    }, 'name desc sericeNumber');
    let new_order = {
      userId: user_id, //用户id
      price: service_man_info.servicePrice, // 价格
      status: 100, //100 未支付  200 支付成功 
      orderId, //订单id
      type: service_info.sericeNumber, //专属会员服务
      doctorId: doctor_id, //关联医生id
      wxOrderId: '', //微信订单id
      wxTimeStamp: now, //微信时间戳
      name: service_info.name,
      desc: service_info.desc,
      serviceManId: diagnosis_order.serviceManId
    };
    //如果是预定订单
    if (diagnosis_order.isPreFrom) {
      new_order.originalPrice = service_man_info.servicePrice;
      new_order.price = service_man_info.servicePrice - diagnosis_order.price;
      new_order.doctorId = diagnosis_order.doctorId;
      new_order.assistantId = diagnosis_order.assistantId;
    }
    let wx_res;
    if (openid) {
      wx_res = await wx_controller.WXPayApplet2030(req, {
        money: new_order.price,
        tradeNo: orderId,
        body: service_info.name,
        openid
      });
    } else {
      wx_res = await wx_controller.WXPayApp2030(req, {
        money: new_order.price,
        tradeNo: orderId,
        body: service_info.name
      });
    }
    new_order.wxOrderId = wx_res.prepayId;
    let insert_new_order = await order_model.create(new_order);
    let cond = {
      orderId: order_id,
      type: 0,
      isDeleted: false
    }
    let update = {
      $set: {
        serviceOrderId: insert_new_order._id
      }
    }
    await order_model.findOneAndUpdate(cond, update, {
      new: true
    }).exec();
    result.data = {
      "order_id": insert_new_order.orderId,
      "wx_order_id": insert_new_order.wxOrderId,
      "wx_time_stamp": insert_new_order.wxTimeStamp,
      "price": insert_new_order.price,
      "order_desc": service_info.name,
    }
    return result;
  },
  /*
   * 获取首页 订单列表
   * @param {*} user_id 
   */
  async get_home_page_order_list(user_id) {
    const orders = await order_model
      .find({
        userId: user_id,
        isDeleted: false,
        status: {
          $gt: 100
        },
        $or: [{
          type: 0,
          status: {
            $lt: 800
          }
        }, {
          type: 1,
          status: 200
        }]
      })
      .sort({
        createdAt: -1
      });
    let service_man_ids = [];
    service_order_ids = [];
    orders.forEach(item => {
      if (item.serviceManId) {
        service_man_ids.push(item.serviceManId);
      }
      if (item.status == 800) {
        service_order_ids.push(item.serviceOrderId);
      }
    })
    const service_mans = await service_man_model.find({
      isDeleted: false,
      _id: {
        $in: service_man_ids
      }
    });
    const service_orders = await order_model.find({
      isDeleted: false,
      _id: {
        "$in": service_order_ids
      },
      type: 1
    });
    let result = {
      code: '200',
      msg: '',
      items: []
    };
    const service_man_index = _.indexBy(service_mans, '_id');
    const service_order_index = _.indexBy(service_orders, '_id');
    orders.forEach(item => {
      let resItem = {
        "service_name": item.name,
        "service_man_name": "",
        "status": item.status,
        "order_id": item.orderId || '',
        "_id": item._id || '',
        "due_time": item.dueTime || null,
        "type": '',
        "created_at": item.createdAt
      }
      if (item.serviceManId && service_man_index[item.serviceManId]) {
        resItem.service_man_name = service_man_index[item.serviceManId].name;
      }
      if (item.status == 800 && item.serviceOrderId && service_order_index[item.serviceOrderId]) {
        resItem.due_time = service_order_index[item.serviceOrderId].dueTime;
        resItem.service_name = service_order_index[item.serviceOrderId].name;
        resItem.order_id = service_order_index[item.serviceOrderId].orderId;
      }
      if (item.type == 1 && item.status == 200) {
        resItem.status = 800;
      }
      result.items.push(resItem);
    })
    return result;
  },
  /**
   * 预购商品下单
   * @param {*} user_id 用户唯一标识
   * @param {*} arg 前端数据包
   * @param {*} req req对象
   */
  async create_pre_order(user_id, arg, req) {
    let result = {
      code: '200',
      msg: '',
      data: {}
    }
    //查询预购商品订单，获取orderid,serviceman等信息
    let cond = {
      isDeleted: false,
      _id: arg._id,
    }
    let pre_order = await pre_order_model.findOne(cond);
    if (pre_order.userId != user_id) {
      return {
        code: '8005',
        msg: '用户信息不正确'
      }
    }
    let orderId = await order_util.createOrderId('T');
    //创建订单
    const now = Date.now();
    let new_order = {
      userId: user_id, //用户id
      price: pre_order.price, // 价格
      status: 100, //100 未支付  200 支付成功 
      orderId: orderId, //订单id
      type: pre_order.type == 2 ? 0 : pre_order.type,
      doctorId: pre_order.doctorId, //关联医生id
      wxOrderId: '', //微信订单id
      wxTimeStamp: now, //微信时间戳
      name: pre_order.name,
      desc: pre_order.desc,
      assistantId: pre_order.assistantId,
      isPreFrom: true
    };
    let wx_res;
    if (arg.openid) {
      wx_res = await wx_controller.WXPayApplet2030(req, {
        money: new_order.price,
        tradeNo: orderId,
        body: pre_order.name,
        openid: arg.openid,
      });
    } else {
      wx_res = await wx_controller.WXPayApp2030(req, {
        money: new_order.price,
        tradeNo: orderId,
        body: pre_order.name
      });
    }
    new_order.wxOrderId = wx_res.prepayId;
    let insert_new_order = await order_model.create(new_order);
    //更新预购买订单
    let conditions = {
      isDeleted: false,
      _id: pre_order._id,
    }
    let update = {
      $set: {
        orderId: insert_new_order.orderId,
      }
    }
    await pre_order_model.findOneAndUpdate(conditions, update, {
      new: true
    });
    result.data = {
      "order_id": insert_new_order.orderId,
      "wx_order_id": insert_new_order.wxOrderId,
      "wx_time_stamp": insert_new_order.wxTimeStamp,
      "price": insert_new_order.price,
      order_desc: pre_order.name
    }
    return result;
  },
  /**
   *查询最新订单和三个数 
   * @param {*} user_id 
   */
  async get_home_page_info(user_id) {
    let result = {
      code: '200',
      msg: '',
      data: {}
    };
    if (user_id) {
      let order = await order_model
        .find({
          userId: user_id,
          isDeleted: false,
          status: {
            $gt: 100
          },
        })
        .sort({
          paidTime: -1
        })
        .limit(1);
      let mc_pre_orders = await pre_order_model.find({
        isDeleted: false,
        userId: user_id,
        status: 100,
        type: 2
      }).sort({
        createdAt: -1
      }).limit(1);
      if (order.length && mc_pre_orders.length) {
        if (order[0].paidTime > mc_pre_orders[0].createdAt) {
          result.data.order = await this.format_result('other', order[0]);
        } else {
          result.data.order = await this.format_result('buy_advance', mc_pre_orders[0]);
        }
      }
      if (order.length && !mc_pre_orders.length) {
        result.data.order = await this.format_result('other', order[0]);
      }
      if (!order.length && mc_pre_orders.length) {
        result.data.order = await this.format_result('buy_advance', mc_pre_orders[0]);
      }
    }
    //查询三个统计数
    let data_info = await mc_figure.findOne({
      isDeleted: false
    });
    let numbers = {};
    if (!data_info) {
      let new_data = {
        coDoctorsNum: 2864,
        serviceMemberNum: 18328,
        userSavings: 2100
      }
      let datas = await mc_figure.create(new_data);
      numbers = {
        co_doctors_num: datas.coDoctorsNum,
        service_member_num: datas.serviceMemberNum,
        user_savings: datas.userSavings
      }
    } else {
      numbers = {
        co_doctors_num: data_info.coDoctorsNum,
        service_member_num: data_info.serviceMemberNum,
        user_savings: data_info.userSavings
      }
    }
    result.data.numbers = numbers;
    return result;

  },
  /**
   * 
   * @param {*} type 订单类型
   * @param {*} info 订单信息
   */
  async format_result(type, info) {
    let resItem = {
      "service_name": info.name,
      "service_man_name": "",
      "status": info.status,
      "order_id": info.orderId || '',
      "_id": info._id || "",
      "due_time": info.dueTime || null,
      "type": type,
      "created_at": info.createdAt
    }
    if (type == 'buy_advance') {
      resItem.service_man_name = info.service_man_name;
      resItem.status = 600;
      resItem.due_time = null;
      // TODO: 6.7.0 获取医生信息
      const doctorMap = await doctor_service.getDoctorInfoListMap([info.doctorId]);
      if (doctorMap) {
        resItem.doctor_name = doctorMap[info.doctorId].name || "";
      } else {
        resItem.doctor_name = "";
      }

    }
    if (type == 'other') {
      const service_mans = await service_man_model.findOne({
        isDeleted: false,
        _id: info.serviceManId
      });
      if (service_mans) {
        resItem.service_man_name = service_mans.name || '';
      }
      if (info.status == 200 && info.type == 1) {
        resItem.status = 800;
      }
    }
    return resItem;
  },
  /**
   * 商品在清单中的销售数量
   * @param {商品id} goodsId 
   */
  async goodsCountForScene(userId, goodsId) {

    let orders = await mcSceneOrderModel.find({
      isDeleted: false,
      status: {
        $in: [200, 300, 400, 600]
      },
      products: {
        $elemMatch: {
          id: goodsId
        }
      }
    }, "products")
    if (!orders) orders = [];
    const counts = orders.map(order => {
      const new_obj = _.find(order.products, function (item) {
        if ((item.id + "") == goodsId) return true;
      })
      return new_obj.number
    })

    const sum = _.reduce(counts, function (memo, num) {
      return memo + num;
    }, 0);
    return sum;
  },
  async goodsCount(goods_ids) {
    let orders = await mcSceneOrderModel.find({
      isDeleted: false,
      status: {
        $in: [200, 300, 400, 600]
      },
      products: {
        $elemMatch: {
          id: {
            $in: goods_ids
          }
        }
      }
    }, "products")
    let arr = [];
    orders.forEach(item => {
      arr = arr.concat(item.products);
    })
    let map = {};
    arr.forEach(item => {
      if (!map[item.id]) {
        map[item.id] = 0;
      }
      map[item.id] = map[item.id] + item.number;
    })
    return map;
  }
}