const path = require('path');
let router_config = undefined;

try {
  router_config = require(path.join(__dirname, '../../src/config/router'))
} catch (e) {

}

module.exports = {
  get(url) {
    if (!router_config) return url;
    const keys = Object.keys(router_config);
    for (let i = 0; i < keys.length; i++) {
      let router_key = keys[i];
      let reg = new RegExp('^/' + router_key, 'i');
      let result = reg.test(url);
      if (result) return url.replace(router_key, router_config[router_key]);
    }
    return url;
  }
}