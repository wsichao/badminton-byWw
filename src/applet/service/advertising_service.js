const advertising_model = Backend.model('applet', '', 'advertising');
module.exports = {
  /**
   * 获取有效的广告
   * @returns {*|Promise|RegExpExecArray}
   */
  getAdvertisings: function () {
    const cond = {
      isDeleted: false,
    };
    return advertising_model.find(cond, 'picture url weight', {sort: {weight: -1}});
  }
}