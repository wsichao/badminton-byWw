/**
 *
 * 外部要凭订单 （boss 导入）
 *
 * Created by yichen on 2018/6/6.
 */


"use strict";

module.exports = {
  config: {
    userId : Backend.Schema.Types.ObjectId,
    userPhone : String, //用户手机号
    medicineApprovalNo : String,	//国药准字	是
    barCode	:String,	//药品条形码	是

    drugFactory : String, //药品厂家	是
    drugName :	String,	//药品名称	是

    orderTotal :	Number, //	购买数量	是
    orderPrices:	Number, //	总价	是
    orderTime:	Number,	//购买时间	是
    orderTimeDate : String, //购买日期
    drugPackage:	String,	//药品规格	是
    channel	:String,	//所属渠道	是
    channelId : Backend.Schema.Types.ObjectId, //渠道id
    drugStoreName :	String,	//药店名称	是
    status: Number,	//该条订单字段校验 处理状态	是
      //0：数据未经过脚本处理，不可用；1：数据已经过脚本处理，不可用；2：数据经过脚本处理，可用。


    createdAt :	Number,	//创建时间	是
    updatedAt:Number,	//更新时间	是
    isDeleted:	Boolean,	//数据删除状态	是
 //false 表示可用，未删除；true 表示已删除，不可用
  },
  options: {
    collection: 'externalDrugOrder'
  }
};