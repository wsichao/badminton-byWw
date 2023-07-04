const membership_card_type_model = Backend.model('tp_memberships', undefined, 'tp_membership_card_type');
const membership_card_model = Backend.model('tp_memberships', undefined, 'tp_membership_card');
const _ = require('underscore');

module.exports = {
  async getCardTypeInfo(ids) {
    const cond = {
      isDeleted: false,
      _id: {
        $in: ids
      }
    }

    let cards = await membership_card_type_model.find(cond);
    cards = cards.map(item => {
      item._id = item._id + '';
      return item;
    })
    return _.indexBy(cards, '_id');
  },
  /**
   * 获取所有卡
   */
  async getAllCardType() {
    const cond = {
      isDeleted: false
    }
    let result = await membership_card_type_model.find(cond);
    result = result.map(item => {
      let obj = {};
      let card = {}
      obj.card = card;
      card._id = item._id;
      card.name = item.name;
      card.img = item.logo;
      card.price = item.price;
      card.original_price = item.price;
      card.detail_url = item.link;
      // 处理活动价格
      if (item.activity && item.activity.startTime && item.activity.endTime) {
        const startTime = item.activity.startTime;
        const endTime = item.activity.endTime;
        const discountPrice = item.activity.discountPrice;
        const current_time = Date.now();
        if (current_time >= startTime && current_time <= endTime) {
          card.price = discountPrice;
        }
      }
      obj.interests = item.interests;
      obj.type = 0;

      obj.user_name = '';
      obj.user_img = '';
      obj.card_duetime = 0;
      obj.is_sp_card = false;

      return obj;
    })
    // 未处理推荐
    return result;
  },
  /**
   * 获取用户生效中的卡片
   * @param {*} user_id 用户唯一标识
   * @param {*} user_name 用户名
   * @param {*} user_img 用户头像
   */
  async getUserCard(user_id, user_name, user_img) {
    if(!user_id) return [];
    const cond = {
      isDeleted: false,
      userId: user_id,
      dueTime:{$gt:Date.now()}
    }
    let result = await membership_card_model.find(cond);
    if (result.length == 0) return [];
    const ids = result.map(item => {
      return item.cardId + '';
    });
    const cardTypeIndex = await this.getCardTypeInfo(ids);
    result = result.map(item => {
      const cardInfo = cardTypeIndex[item.cardId + ''];
      let obj = {};
      let card = {};
      obj.card = card;
      card._id = cardInfo._id;
      card.name = cardInfo.name;
      card.img = cardInfo.logo;
      card.price = cardInfo.price;
      card.original_price = cardInfo.price;
      card.detail_url = cardInfo.link;
      // 处理活动价格
      if (cardInfo.activity && cardInfo.activity.startTime && cardInfo.activity.endTime) {
        const startTime = cardInfo.activity.startTime;
        const endTime = cardInfo.activity.endTime;
        const discountPrice = cardInfo.activity.discountPrice;
        const current_time = Date.now();
        if (current_time >= startTime && current_time <= endTime) {
          card.price = discountPrice;
        }
      }

      obj.interests = cardInfo.interests;
      const current_time = Date.now();
      // 检查会员卡是否过期
      if (current_time <= item.dueTime) {
        obj.type = 1;
      } else {
        obj.type = 2;
      }


      obj.user_name = user_name;
      obj.user_img = user_img;
      obj.card_duetime = item.dueTime;
      obj.is_sp_card = false;

      return obj;
    });
    return result;
  }
}