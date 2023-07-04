const card_type_service = Backend.service('tp_memberships', 'card_type');
const member_service = Backend.service('tp_memberships', 'member_service');
const sp_vipmember_model = Backend.model('service_package', undefined, 'vip_member');
const _ = require('underscore');

module.exports = {
  /**
   * 
   * @param {*} type user; all_third; 
   * user为用户购买的会员卡，包括专属医生。
   * all_third为用户购买与未购买的会员卡，不包括专属医生
   * @param {*} user_id 用户唯一标识
   * @param {*} user_name 用户名
   * @param {*} user_img 用户头像
   */
  async list(type, user_id, user_name, user_img) {
    const cardServiceGroup = await member_service.cardServiceGroup();
    // 获取全部卡
    const all_card_type = await card_type_service.getAllCardType();
    // 获取用户会员卡
    let user_cards = await card_type_service.getUserCard(user_id, user_name, user_img);
    user_cards = this.addService(user_cards, cardServiceGroup);
    // 未拥有的卡片集合
    let unhave_card_type = this.check_cards(all_card_type, user_cards);
    unhave_card_type = this.addService(unhave_card_type, cardServiceGroup);
    // 创建专属医生卡
    const sp_card_type = await this.createSPCardType(user_id, user_name, user_img);

    if (type == 'user') {
      return [].concat(user_cards, sp_card_type);
    } else if (type == 'all_third') {
      return [].concat(user_cards, unhave_card_type);
    }
  },
  /**
   * 用户未购买过的卡
   * @param {*} all_card_type 全部卡类型
   * @param {*} user_cards 用户已购买卡
   */
  check_cards(all_card_type, user_cards) {
    const ids = user_cards.map(item => {
      return item.card._id + '';
    });

    const arr = _.filter(all_card_type, item => {
      return ids.indexOf(item.card._id + '') == -1;
    });

    return arr;
  },
  /**
   * 创建虚拟专属医生卡
   * @param {*} user_id 
   */
  async createSPCardType(user_id, user_name, user_img) {
    // 查询用户是否为专属医生会员
    const count = await sp_vipmember_model.count({
      isDeleted: false,
      userId: user_id
    });
    if (count == 0) return [];
    const card = {
      "_id": "",
      "name": "专属医生权益",
      "img": "8hu35wxz.png",
      "price": 0,
      "original_price": 0,
      "detail_url": ""
    }

    const interests = [{
        "img": "b92ed2%23zsdoc@3x.png",
        "name": "公立医院\n指定医师"
      },
      {
        "img": "b92ed2%23zsassistant@3x.png",
        "name": "专属助理\n全程服务"
      },
      {
        "img": "b92ed2%23zsdate@3x.png",
        "name": "预约就诊\n无需排队"
      },
      {
        "img": "b92ed2%23zsseedoctor@3x.png",
        "name": "因需诊疗\n细致充分"
      },
      {
        "img": "b92ed2%23vipdiscount@3x.png",
        "name": "助产麻醉\n专享特价"
      },
      {
        "img": "b92ed2%23zsfreechat@3x.png",
        "name": "期间保健\n免费咨询"
      }
    ]

    const type = 1;
    const card_duetime = 0;
    const is_sp_card = true;

    const services = await member_service.spServices();

    const result = {
      card,
      interests,
      type,
      user_name,
      user_img,
      card_duetime,
      is_sp_card,
      services
    }
    return [result];
  },
  addService(interests, cardServiceGroup) {
    let result = interests.map(item => {
      let groups = cardServiceGroup[item.card._id + ''];
      if (groups && groups.length > 0) {
        let services = groups.map(service => {
          let s = {};
          s._id = service._id;
          s.name = service.name;
          s.img = service.smallImg;
          s.big_img = service.bigImg;
          s.detail = service.smallDetail;
          s.title = '';
          s.department = '';
          s.hospital = '';
          return s;
        })
        item.services = services;
      } else {
        item.services = [];
      }
      return item;
    })
    return result;
  }
}