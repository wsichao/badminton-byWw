const servicePackageDoctorAssistantRef = require('../../../app/models/service_package/servicePackageDoctorAssistantRef');
const servicePackageDoctor = require('../../../app/models/service_package/servicePackageDoctor');
let ServicePackageAssistantService = require('../../../app/services/service_package/servicePackageAssistantService');
let ServicePackageDoctorAssistantRefService = require('../../../app/services/service_package/servicePackageDoctorAssistantRefService');
let servicePackageDoctorService = require('../../../app/services/service_package/servicePackageDoctorService');
let makeAppointmentOrder = require('../../../app/models/service_package/makeAppointmentOrder');
let servicePackageOrderModel = require('../../../app/models/service_package/servicePackageOrder');
module.exports = {
  async findDoctorsByAssistantId(assistantId) {
    const cond = {
      isDeleted: false,
      assistantId: assistantId
    };
    return servicePackageDoctorAssistantRef.find(cond);
  },
  async getDoctorsByIds(doctorIds) {
    let cond = {
      'isDeleted': false,
      '_id': {
        $in: doctorIds
      }
    };
    let fields = 'name hospital';
    return servicePackageDoctor.find(cond, fields);
  },
  async getAppointmentsByDoctorId(args) {
    const skip = args.page_num * args.page_size;
    const limit = args.page_size;
    const now = Date.now();
    const beginTS = getDateBeginTS(now);
    const endTS = getDateEndTS(now);
    let beginAt = args.beginAt || beginTS;
    let endAt = args.endAt || endTS;
    const item_type = args.items;
    let cond = {};
    if (args.doctor_ids.length > 0) { //按选择的医生查询
      if (args.status == -100) { //查询全部就诊状态
        cond = {
          isDeleted: false,
          doctorId: {
            $in: args.doctor_ids
          },
          status: {
            $in: [200, 300, 400]
          },
          orderTime: {
            $gt: beginAt,
            $lte: endAt
          }
        };
      } else {
        cond = {
          isDeleted: false,
          doctorId: {
            $in: args.doctor_ids
          },
          status: args.status,
          orderTime: {
            $gt: beginAt,
            $lte: endAt
          }
        };
      }
    } else { //查询全部医生
      let doctors = await ServicePackageDoctorAssistantRefService.findDoctorsByAssistant(args.assistantId);
      let doctorIds = doctors.map(doctorId => doctorId.doctorId);
      const fields = 'name avatar title hospital department hospitalId';
      doctors = await servicePackageDoctorService.getDoctorsByIds(doctorIds, fields);
      const hospitalIds = [];
      doctors.forEach(doctor => {
        if (hospitalIds.indexOf(doctor.hospitalId) < 0) {
          hospitalIds.push(doctor.hospitalId);
        }
      });
      // 通过医院获取医生
      doctors = await servicePackageDoctorService.getDoctorsByHospitalIds(hospitalIds, fields);
      doctorIds = doctors.map(doctor => doctor._id);
      if (args.status == -100) { //查询全部状态
        cond = {
          isDeleted: false,
          status: {
            $in: [200, 300, 400]
          },
          doctorId: {
            $in: doctorIds
          },
          orderTime: {
            $gt: beginAt,
            $lte: endAt
          }
        };
      } else {
        cond = {
          isDeleted: false,
          status: args.status,
          doctorId: {
            $in: doctorIds
          },
          orderTime: {
            $gt: beginAt,
            $lte: endAt
          }
        };
      }

    }
    if (item_type && item_type != '') {
      cond.items = item_type;
    }
    return makeAppointmentOrder.find(cond).sort({
      "orderTime": 1
    }).limit(limit).skip(skip);

  },
  /**
   * 查询医生统计结果
   * @param {*} doctor_id 医生唯一标识
   * @return {doctor_name ,current_member_num , total_member_num} 医生名字, 当前服务会员数 , 累计服务会员数
   */
  async getDoctorStatistical(doctor_id) {
    if (!doctor_id) {
      return {
        doctor_name: '',
        current_member_num: 0,
        total_member_num: 0
      }
    }
    const current_member_num = (await servicePackageOrderModel.distinct("userId", {
      doctorId: doctor_id,
      isDeleted: false,
      deadlinedAt: {
        $gte: Date.now()
      }
    })).length;
    
    const total_member_num = (await servicePackageOrderModel.distinct("userId", {
      doctorId: doctor_id,
      isDeleted: false
    })).length;

    const doctor = await servicePackageDoctor.findOne({
      _id: doctor_id
    }, "name")

    return {
      doctor_name: doctor.name,
      current_member_num: current_member_num,
      total_member_num: total_member_num
    }
  }
}