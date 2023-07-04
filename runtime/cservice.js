/**
 * Created by Mr.Carry on 2017/5/18.
 */

'use strict';
const util = require("./util");
const service_map = {};
const base_url = util.getBaseUrl();

const getService = (module, cservice) => {
  let path = base_url + '/' + module + '/service/' + cservice;
  let service = undefined;
  try {
    if (service_map[path]) return service_map[path];
    service = require(path);
    
  } catch (e) {
    console.log(e);
  }

  for (let fun in service) {
    service[fun] = service[fun].bind(service);
  }
  service_map[path] = service;
  return service;
}

module.exports = {
  getService: getService
}
