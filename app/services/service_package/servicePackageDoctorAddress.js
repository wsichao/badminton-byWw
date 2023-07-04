/**
 * Created by lijinxia on 2017/12/14.
 */
var
    servicePackageDoctorAddress = require('./../../models/service_package/servicePackageDoctorAddress');
var mongoose = require('mongoose');


var ServicePackageDoctorAddressService = function () {
};
ServicePackageDoctorAddressService.prototype.constructor = ServicePackageDoctorAddressService;

ServicePackageDoctorAddressService.prototype.findServicePackageDoctorRefById = function (id) {

    var  cond = {
        'isDeleted': false,
        '_id': id
    };
    return servicePackageDoctorAddress.find(cond).exec();
};


module.exports = exports = new ServicePackageDoctorAddressService();