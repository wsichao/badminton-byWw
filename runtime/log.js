let log_config = undefined;
const path = require('path');

try {
  log_config = require(path.join(__dirname, './../src/config/log'))
} catch (e) {

}

module.exports = {
  httpError() {
    if (log_config.httpError)
      log_config.httpError.apply(this);
  },
  httpInfo() {
    if (log_config.httpInfo)
      log_config.httpInfo.apply(this);
  }
}