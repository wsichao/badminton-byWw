/**
 * Created by Mr.Carry on 2017/6/21.
 */

module.exports = {
  config: {
    url: {type: String, default: '', index: true},
    title: {type: String, default: '', index: true},
    isSync: {type: Boolean, default: false}
  },
  options: {
    collection: 'urlInfo'
  }
};