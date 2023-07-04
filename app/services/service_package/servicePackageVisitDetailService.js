/**
 * Created by lijinxia on 2017/12/15.
 */
var
    // commonUtil = require('../../lib/common-util'),
    // constants = require('../configs/constants'),
    ServicePackageVisitDetail = require('./../../models/service_package/servicePackageVisitDetail');
var mongoose = require('mongoose');


var ServicePackageVisitDetailService = function () {
};
ServicePackageVisitDetailService.prototype.constructor = ServicePackageVisitDetailService;
//
// ServicePackageVisitDetailService.prototype.getServiceSignedDoctorsByArea = function (cond, option, pageSize, pageNum) {
//     cond.isDeleted = false;
//
//     console.log('参数', (pageSize + 1) * pageNum, pageNum, pageSize);
//
//     //通过地区查询
//     // return servicePackageDoctor.aggregate([{'$match': cond},
//     //     {'$lookup': {from: 'servicePackageDoctorRef', localField: '_id', foreignField: 'doctorId', as: 'doctor'}},
//     //     {'$skip': pageNum * pageSize},
//     //     {'$limit': pageSize}
//     // ]).exec();
//
// };

ServicePackageVisitDetailService.prototype.findVisitDetailByDoctorIdObject= function (doctorId) {
console.log('不出诊时间查询');

    var cond = {doctorId: mongoose.Types.ObjectId(doctorId),isDeleted: false};
    // var cond = {doctorId:  doctorId, isDeleted: false};


    return ServicePackageVisitDetail.aggregate([{'$match': cond},
        {
            '$lookup': {
                from: 'servicePackageDoctorAddress',
                localField: 'addressId',
                foreignField: '_id',
                as: 'addressInfo'
            }
        }]).exec();
};

ServicePackageVisitDetailService.prototype.findVisitDetailByCond= function (cond) {
    console.log('不出诊时间查询');

    cond.isDeleted=false;
    // var cond = {doctorId:  doctorId, isDeleted: false};


    return ServicePackageVisitDetail.aggregate([{'$match': cond},
        {
            '$lookup': {
                from: 'servicePackageDoctorAddress',
                localField: 'addressId',
                foreignField: '_id',
                as: 'addressInfo'
            }
        }]).exec();
};
module.exports = exports = new ServicePackageVisitDetailService();