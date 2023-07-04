/**
 * Created by yichen on 2017/5/31.
 */

var
  mongodb = require('../configs/db'),
  Schema = mongodb.mongoose.Schema;


var AreaSchema = new Schema({

  createdAt: {type: Number, default: Date.now},
  updatedAt: {type: Number, default: Date.now},
  isDeleted: {type: Boolean, default: false},

  areaId: {type: Number},
  name: {type: String},
  provinceId: {type: Number}



},{
  collection: 'areas'
});

var Area = mongodb.mongoose.model('Area', AreaSchema);

module.exports = Area;