/**
 * Created by lijinxia on 2017/12/12.
 */
let
    servicePackageDoctorRef = require('./../../models/service_package/servicePackageDoctorRef'),
    servicePackageDoctor = require('./../../models/service_package/servicePackageDoctor'),
    servicePackageDoctorAssistantRef = require('./../../models/service_package/servicePackageDoctorAssistantRef'),
    // ServicePackageDoctorAssistantRefService = require('./../../services/service_package/servicePackageDoctorAssistantRefService'),
    commonUtil = require('../../../lib/common-util');
let mongoose = require('mongoose');


let ServiceSignedDoctorsService = function () {
};
ServiceSignedDoctorsService.prototype.constructor = ServiceSignedDoctorsService;

ServiceSignedDoctorsService.prototype.getServiceSignedDoctorsByArea = function (cond,condServicePackage, option, pageSize, pageNum) {
    cond.isDeleted = false;
    condServicePackage.isDeleted = false;
    // condServicePackage['doctor.isDeleted'] = false;
    // condServicePackage['doctor.isShow'] = {$ne:false};

    console.log('参数', (pageSize + 1) * pageNum, pageNum, pageSize);
    console.log(cond)
    //通过地区查询
    return servicePackageDoctor.aggregate([
        {'$match': cond},
        {'$lookup': {from: 'servicePackageDoctorRef', localField: '_id', foreignField: 'doctorId', as: 'doctor'}},
        {'$match': condServicePackage},
        {'$skip': pageNum * pageSize},
        {'$limit': pageSize},
        {'$sort': {createdAt: 1}}
    ]).exec()
    .then(res =>{
        res = JSON.parse(JSON.stringify(res));
        let resArr = [];
        for(let i = 0;i<res.length;i++){
            let doctorArr = [];
            for(let j=0;j< res[i].doctor.length;j++){
                if(!res[i].doctor[j].isDeleted && res[i].doctor[j].isShow){
                    doctorArr.push(res[i].doctor[j]);
                }
            }
            if(doctorArr.length){
                res[i].doctor = doctorArr;
                resArr.push(res[i]);
            }
        }
        return resArr;
    })
};
// ServiceSignedDoctorsService.prototype.getServiceSignedDoctorsByServiceId = function (serviceId, option, pageSize, pageNum) {
//     let cond = {serviceId: mongoose.Types.ObjectId(serviceId), isDeleted: false};
//
//     console.log('参数', (pageSize + 1) * pageNum, pageNum, pageSize);
// //通过服务id查询
//     return servicePackageDoctorRef.aggregate([
//         {'$match': cond},
//         {'$lookup': {from: 'servicePackageDoctor', localField: 'doctorId', foreignField: '_id', as: 'doctor'}},
//         {'$skip': pageNum * pageSize}, {$limit: pageSize},
//         {'$sort': {createdAt: 1}}
//     ]).exec();
//
// };


ServiceSignedDoctorsService.prototype.getServicePhoneNumByDoctorId = function (doctorId, option) {
    let cond = {
        doctorId: mongoose.Types.ObjectId(doctorId), isDeleted: false
    };

    return servicePackageDoctorAssistantRef.aggregate([
        {'$match': cond},
        {
            '$lookup': {
                from: 'servicePackageAssistant',
                localField: 'assistantId',
                foreignField: '_id',
                as: 'doctor'
            }
        }]).exec();
};

/**
 * 发送专属医生短信
 * @param smsId 云片模板id
 * @param phoneNum 手机号码
 * @param docName 医生姓名
 * @param time 时间
 * @param isMarketing 是否是营销类短信，true-是，false-不是
 */
ServiceSignedDoctorsService.prototype.sendSms = function (smsId, phoneNum, docName, time, isMarketing) {
    var date = new Date(time);
    var hour = date.getHours();
    var minute = date.getMinutes();

    commonUtil.sendSms(smsId, phoneNum,
        "#docname#=" + docName +
        "&#timedate#=" + hour + '时' + minute + '分'
        , isMarketing);
};


ServiceSignedDoctorsService.prototype.getDoctorAllServices = function (doctorId, option) {
    var cond = {
        doctorId: mongoose.Types.ObjectId(doctorId), isDeleted: false
    };
    return servicePackageDoctorRef.aggregate([
        {'$match': cond},
        {
            '$lookup': {
                from: 'servicePackage',
                localField: 'serviceId', foreignField: '_id', as: 'serviceInfo'
            }
        }]).exec();
};
module.exports = exports = new ServiceSignedDoctorsService();