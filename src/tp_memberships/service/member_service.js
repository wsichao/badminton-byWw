const tp_member_service_model = Backend.model('tp_memberships', undefined, 'tp_member_service');
const tp_member_service_classification_model = Backend.model('tp_memberships', undefined, 'tp_member_service_classification');
const card_type_service = Backend.service('tp_memberships', 'card_type');
const servicePackageDoctorRefModel = require('./../../../app/models/service_package/servicePackageDoctorRef');
const servicePackageDoctorModel = require('./../../../app/models/service_package/servicePackageDoctor');


const _ = require('underscore');

module.exports = {
  /**
   * 根据分类获取服务列表
   * @param {*} classification_id 分类唯一标识
   * @param {*} user_id 用户唯一标识
   * @param {*} args 
   */
  async list(classification_id, user_id, args = {
    page_num: 1,
    page_size: 20
  }) {
    const skip = (args.page_num - 1) * args.page_size;
    const limit = args.page_size;
    const cond = {
      isDeleted: false,
      _id: classification_id
    }
    const classification_result = await tp_member_service_classification_model.findOne(cond);
    const service_ids = classification_result.memberServiceIds;
    const service_cond = {
      _id: {
        $in: service_ids.map(item => {
          return item + '';
        })
      },
      isDeleted: false,
      isShow: true
    };
    const services = await tp_member_service_model.find(service_cond).limit(limit).skip(skip).sort({
      weight: -1
    });
    let card_type_ids = services.map(item => {
      return item.membershipCardTypeId + ''
    });
    card_type_ids = _.filter(card_type_ids, function (id) {
      if (id != "undefined") return true;
    })
    let cardTypeIndex = await card_type_service.getCardTypeInfo(card_type_ids);
    let userCardIndex = {};
    if (user_id) {
      const userCards = await card_type_service.getUserCard(user_id);
      userCardIndex = this.userCardIndex(userCards)
    }
    return services.map(item => {
      let obj = {};
      obj._id = item._id || '';
      obj.name = item.name || '';
      obj.detail = item.smallDetail || '';
      obj.price = item.price || 0;
      obj.discount_price = item.discountPrice || 0;
      obj.small_img = item.smallImg || '';
      obj.big_img = item.bigImg || '';
      obj.is_must_member = item.isMustMember || false;
      obj.card_id = item.membershipCardTypeId || '';
      obj.is_user_card = userCardIndex[obj.card_id] || false;
      const card = cardTypeIndex[obj.card_id] || {};
      obj.interests = card.interests || [];
      return obj;
    })
  },
  /**
   * 根据服务id获取服务信息
   * @param {*} service_id 服务唯一标识
   * @param {*} user_id 用户唯一标识
   * @param {*} args 
   */
  async getService(service_id, user_id) {
    const service_cond = {
      _id: service_id,
      isDeleted: false,
    };
    const item = await tp_member_service_model.findOne(service_cond);
    let cardTypeIndex = await card_type_service.getCardTypeInfo([item.membershipCardTypeId]);
    let userCardIndex = {};
    if (user_id) {
      const userCards = await card_type_service.getUserCard(user_id);
      userCardIndex = this.userCardIndex(userCards)
    }
    let obj = {};
    obj._id = item._id || '';
    obj.name = item.name || '';
    obj.detail = item.smallDetail || '';
    obj.price = item.price || 0;
    obj.discount_price = item.discountPrice || 0;
    obj.small_img = item.smallImg || '';
    obj.big_img = item.bigImg || '';
    obj.is_must_member = item.isMustMember || false;
    obj.card_id = item.membershipCardTypeId + '';
    obj.is_user_card = userCardIndex[obj.card_id] || false;
    const card = cardTypeIndex[obj.card_id] || {};
    obj.interests = card.interests || [];
    obj.card_original_price = card.price;
    obj.card_price = card.price;
    obj.card_detail_url = card.link;
    obj.detail_url = item.detail;

    if (card.activity) {
      const start_time = card.activity.startTime;
      const end_time = card.activity.endTime;
      const current_time = Date.now();
      if (current_time >= start_time && current_time <= end_time) {
        obj.card_price = card.activity.discountPrice;
      }
    }
    return obj;
  },

  userCardIndex(userCards) {
    let map = {}
    userCards.forEach(item => {
      if (item.type == 1) {
        map[item.card._id + ''] = true;
      }
    });
    return map;
  },

  async cardServiceGroup() {
    const cond = {
      isDeleted: false,
      isShow: true
    }

    const result = await tp_member_service_model.find(cond);

    return _.groupBy(result, 'membershipCardTypeId');
  },
  /**
   * 有单次服务的医生列表
   */
  async spServices() {
    const cond = {
      isDeleted: false,
      serviceType: 'once',
      isShow: true
    }
    const result = await servicePackageDoctorRefModel.find(cond, 'doctorId');
    let doctor_ids = result.map(item => {
      return item.doctorId + '';
    });
    doctor_ids = _.uniq(doctor_ids);
    let doctors = await servicePackageDoctorModel.find({
      isDeleted: false,
      _id: {
        $in: doctor_ids
      }
    });
    doctors = doctors.map(item => {
      const hospital = `${item.province}${item.city}${item.town}${item.hospital}`;
      let obj = {};
      obj._id = item._id;
      obj.name = item.name;
      obj.img = item.avatar;
      obj.title = item.title;
      obj.department = item.department;
      obj.hospital = hospital;
      obj.big_img = '';

      return obj;
    })
    return doctors;
  }
}