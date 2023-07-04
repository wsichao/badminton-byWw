/**
 * Created by menzhongxin on 2016/9/27.
 */
var Version = require('../models/Version');

var VersionService = function(){};
module.exports = new VersionService();

VersionService.prototype.find = function(conditions){
  return Version.find(conditions , {} , {skip: 0, limit: 1, sort: {time: -1}}).exec();
};
VersionService.prototype.findVersion = function(conditions , field,sort){
  return Version.find(conditions , field ,sort).exec();
};
VersionService.prototype.createVersion = function(version){
  return Version.create(version);
};