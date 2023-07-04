/**
 * Created by lijinxia on 2017/12/12.
 */
var VERSION = "/1",
    SignedDoctors = require('../../controllers/SignedDoctorsController');
var router = require('express').Router();

//通过地区\医院\科室\医生
router.get(VERSION + "/servicepackage/searchDoctors", SignedDoctors.searchDoctors);
//服务电话咨询
router.get(VERSION + "/servicepackage/getServicePhoneNum", SignedDoctors.getServicePhoneNum);
//预约医生列表
router.get(VERSION + "/servicePackage/make_appointment_list", SignedDoctors.makeAppointmentList);
//预约医生时间
router.get(VERSION + "/servicePackage/make_appointment_time", SignedDoctors.makeAppointmentTime);
//预约的出诊日期当天早晨七点
router.get(VERSION + "/servicepackage/sendSmsToUsers", SignedDoctors.sendSmsToUsers);
//医生所属全部服务包详情service
router.get(VERSION + "/servicepackage/getDoctorServicesDesc", SignedDoctors.getDoctorServicesDesc);

module.exports = router;