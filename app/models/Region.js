/**
 * Created by zhaoyifei on 15/3/16.
 */

var
  mongodb = require('../configs/db'),
  Schema = mongodb.mongoose.Schema;


var regionSchema = new Schema({

  // 基本属性
  type: {
    type: Number,
    default: 0
  }, //数据类型: 1-省直辖市 2-地级市或者区


  createdAt: {
    type: Number,
    default: Date.now
  },
  updatedAt: {
    type: Number,
    default: Date.now
  },
  isDeleted: {
    type: Boolean,
    default: false
  },

  areaId: {
    type: String
  },
  name: {
    type: String
  },
  provinceId: {
    type: String
  },
  provinceName: {
    type: String
  },
  hospitalNum: {
    type: Number,
    default: 0
  },
  parentId: {
    type: Schema.Types.ObjectId
  }



}, {
  collection: 'regions'
});

var Region = mongodb.mongoose.model('Region', regionSchema);

module.exports = Region;