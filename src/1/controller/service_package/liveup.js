const servicePackageModel = require('./../../../../app/models/service_package/servicePackage');
const servicePackageDoctorRefModel = require('./../../../../app/models/service_package/servicePackageDoctorRef');
const co = require('co');

module.exports = {
  getAction() {
    let that = this;
    return co(function* () {
      let servicePackages = yield servicePackageModel.find({ isDeleted: false });
      for (let i = 0; i < servicePackages.length; i++) {
        let item = servicePackages[i];
        let id = item._id;
        let desc = item.desc;
        yield servicePackageDoctorRefModel.update({ serviceId: id }, {
          desc: desc
        }, { multi: true });
      }
      return that.success({ name: 1 });
    })
  }
}