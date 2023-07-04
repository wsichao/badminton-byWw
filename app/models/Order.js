/**
 * 订单信息
 * @type {exports}
 */
var
  mongodb = require('../configs/db'),
  Schema = mongodb.mongoose.Schema,
  commonOrderFields = require('./order/Order.Common'),
  phoneOrderFields = require('./order/Order.Phone'),
  newPhoneOrderFields = require('./order/Order.NewPhone'),
  adOrderFields = require('./order/Order.Ad'),
  transferOrderFields = require('./order/Order.Transfer'),
  hongbaoOrderfields = require('./order/Order.Hongbao'),
  serviceOrderfields = require('./order/Order.Service'),
  StatisticsHelper = require('../../lib/StatisticsHelper'),
  hookUpModel = StatisticsHelper.hookUpModel;

var _CONS = {// Constants Helper
};

var _genSchema = function (pluginProperties) {// Gen Schema Helper
  var retSchema = new Schema(commonOrderFields, {
    collection: "orders"
  });

  mongoosePre(retSchema, 'order');

  if (pluginProperties){
    retSchema.plugin(function (schema) {
      schema.add(pluginProperties);
    });
  }
  
  return retSchema;
};

// 1. Gen Order Schemas
var commonOrderSchema = _genSchema();
var phoneOrderSchema = _genSchema(phoneOrderFields);
var newPhoneOrderSchema = _genSchema(newPhoneOrderFields);
var adOrderSchema = _genSchema(adOrderFields);
var transferOrderSchema = _genSchema(transferOrderFields);
var hongbaoOrderSchema = _genSchema(hongbaoOrderfields);
var serviceOrderSchema = _genSchema(serviceOrderfields);
// 2. Hook Statistics Params
hookUpModel(commonOrderSchema);
hookUpModel(phoneOrderSchema);
hookUpModel(newPhoneOrderSchema);
hookUpModel(adOrderSchema);
hookUpModel(hongbaoOrderSchema);
hookUpModel(serviceOrderSchema);
// 3. Gen Models
var CommonOrder = mongodb.mongoose.model('CommonOrder', commonOrderSchema);
var PhoneOrder = mongodb.mongoose.model('PhoneOrder', phoneOrderSchema);
var NewPhoneOrder = mongodb.mongoose.model('NewPhoneOrder', newPhoneOrderSchema);
var AdOrder = mongodb.mongoose.model('AdOrder',adOrderSchema);
var TransferOrder = mongodb.mongoose.model('TransferOrder',transferOrderSchema);
var HongbaoOrder = mongodb.mongoose.model('HongbaoOrder',hongbaoOrderSchema);
var ServiceOrder = mongodb.mongoose.model('ServiceOrder',serviceOrderSchema);

PhoneOrder.selectFields = "-doctorPhoneNum -customerPhoneNum -recordurl";
NewPhoneOrder.selectFields = "-callerPhoneNum -calleePhoneNum -recordurl";
NewPhoneOrder.listSelectFields = "callerId callerName callerDocChatNum callerSex callerAvatar calleeId calleeName " +
    "calleeDocChatNum calleeSex calleeAvatar time callStatus  callWay  createdAt";
// 4. Export Models // module.exports = Order;
module.exports = exports = {
  CommonOrder: CommonOrder,
  Order: PhoneOrder, // 
  PhoneOrder: PhoneOrder,
  NewPhoneOrder: NewPhoneOrder,
  AdOrder: AdOrder,
  CONS: _CONS,
  TransferOrder:TransferOrder,
  HongbaoOrder:HongbaoOrder,
  ServiceOrder:ServiceOrder
};