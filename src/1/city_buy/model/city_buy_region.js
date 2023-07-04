/**
 * Created by yichen on 2017/5/31.
 */
/**
 * 全城购地区
 * @type {{config: {}, options: {collection: string}}}
 */
module.exports = {
  config: {
    createdAt: {type: Number, default: Date.now},
    updatedAt: {type: Number, default: Date.now},
    isDeleted: {type: Boolean, default: false},

    areaId: {type: Number},
    name: {type: String},
    provinceId: {type: Number}
  },
  options: {
    collection: 'areas'
  }
}