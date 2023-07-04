/**
 * 
 * 退款日志表
 */

"use strict";
module.exports = {
  config: {
    // 订单唯一标识	
    outTradeNo: String,
    xml: {
      return_code: Array,
      return_msg: Array,
      appid: Array,
      mch_id: Array,
      nonce_str: Array,
      sign: Array,
      result_code: Array,
      transaction_id: Array,
      out_trade_no: Array,
      out_refund_no: Array,
      refund_id: Array,
      refund_channel: Array,
      refund_fee: Array,
      coupon_refund_fee: Array,
      total_fee: Array,
      cash_fee: Array,
      coupon_refund_count: Array,
      cash_refund_fee: Array,
    }
  },
  options: {
    collection: 'mcRefundLog'
  }
}