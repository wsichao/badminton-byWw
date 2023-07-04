const crypto = require('crypto');

let cryptoStr = function (str) {
  const hash = crypto.createHash('md5');
  hash.update(str);
  return hash.digest('hex').toUpperCase();
};

module.exports = {
  postAction() {
    return this.success({ name: 'token check success' });
  },
  getAction() {
    return this.success({
      new_pwd: cryptoStr(this.query.new_pwd).toLocaleUpperCase(),
      old_pwd: cryptoStr(this.query.old_pwd).toLocaleUpperCase(),
    });
  }
}