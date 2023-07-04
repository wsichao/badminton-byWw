const mc_doctor_model = Backend.model('mc_weapp', undefined, 'mc_doctor');
const service_man_model = Backend.model('mc_weapp', undefined, 'mc_service_man');
const order_model = Backend.model('mc_weapp', undefined, 'mc_order');
module.exports = {
  /**
   * 2030 小程序 查询诊断报告
   * @param {*} diagnosis_order 当前order对象
   */
  async getReportInfo(diagnosis_order) {
    if (!(diagnosis_order.status == 600 || diagnosis_order.status == 700)) {
      return '专家诊断未完成'
    }
    let service_man_info = await service_man_model.findOne({
      '_id': diagnosis_order.serviceManId,
      'isDeleted': false
    });
    if (!service_man_info) {
      return '被服务人信息不存在'
    }
    let member = this.getOrdinaryInfo(service_man_info, diagnosis_order.status);
    let data = {
      member
    };
    if (diagnosis_order.isPreFrom == true) {
      member.original_price = service_man_info.servicePrice;
      member.price = service_man_info.servicePrice - diagnosis_order.price;
    } else {
      member.original_price = member.price;
    }
    let result = [];
    let doctors = await mc_doctor_model.find({
      '_id': {
        $in: service_man_info.recommendDoctor
      },
      isDeleted: false
    });
    doctors.forEach(doctor => {
      let item = {
        "doctor_id": doctor._id,
        "name": doctor.name || '',
        "avatar": doctor.avatar || '',
        "title": doctor.title || '',
        "department": doctor.department || '',
        "hospital": doctor.hospital || '',
        "desc": doctor.desc || '',
        "speciality": doctor.speciality || ''
      }
      result.push(item);
    });
    data.doctor_recommend = result;
    return data
  },
  async member_servive_order_detail(member_order) {
    if (member_order.status != 200) {
      return '会员服务订单不存在'
    }

    let service_man_info = await service_man_model.findOne({
      '_id': member_order.serviceManId,
      'isDeleted': false
    });
    if (!service_man_info) {
      return '被服务人信息不存在'
    }
    let member = this.getOrdinaryInfo(service_man_info, 800);
    let data = {
      member
    };

    const order_type_0 = await order_model.findOne({
      serviceOrderId: member_order._id,
      type: 0,
      isDeleted: false
    }, 'isPreFrom');

    if (order_type_0.isPreFrom == true) {
      member.original_price = member_order.originalPrice;
      member.price = member_order.price;
    } else {
      member.original_price = member.price;
    }

    let doctor = await mc_doctor_model.findOne({
      '_id': member_order.doctorId,
      'isDeleted': false
    });
    data.doctor_choose = {
      "doctor_id": doctor._id,
      "name": doctor.name || '',
      "avatar": doctor.avatar || '',
      "title": doctor.title || '',
      "department": doctor.department || '',
      "hospital": doctor.hospital || '',
      "desc": doctor.desc || '',
      "speciality": doctor.speciality || ''
    }
    return data
  },
  getOrdinaryInfo(service_man_info, status) {
    return {
      "name": service_man_info.name || '',
      "sex": service_man_info.sex || '',
      "age": service_man_info.age || null,
      "chronic_disease_name": service_man_info.chronicDiseaseName || '',
      "drug_fee_range": service_man_info.drugFeeRange || '',
      "case_img": service_man_info.caseImg || [],
      "drug_fee_img": service_man_info.drugFeeListImg || [],
      "disease_time": service_man_info.dieaseTime || null,
      "info_provided": service_man_info.provideInfo || '',
      "current_situation": service_man_info.currentStatus || '',
      "expected_results": service_man_info.expectedResults || '',
      "analysis_results": service_man_info.currentAnalysis || '',
      "advice": service_man_info.expertsRecommend || '',
      "price": service_man_info.servicePrice || null,
      "order_status": status || null,
      "programme": status != 700 ? service_man_info.serviceScheme : ''
    }
  }

}