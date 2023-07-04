/**
 * Created by fly on 2018－01－17.
 */

const AuthBase = require('./AuthBase');
const not_get_methods = ['post', 'put', 'delete', 'options'];
//get请求,需要验证id和token
const get_need_auth_map = {
  '/1/customer/membership': true,
  '/1/customer/payment': true,
  '/1/customer/income': true,
  '/1/customer/wallet': true,
  '/1/customer/privateInfoById': true,
  '/1/customer/publicInfoById': true,
  '/1/customer/search': true,
  '/1/customer/transaction': true,
  '/1/customer/msgReadStatus': true,
  '/1/customer/message': true,
  '/1/customer/getPartInfoByPhoneNum': true,
  '/1/zlycare/trade': true,
  '/1/zlycare/types': true,
  '/1/zlycare/services': true,
  '/1/servicepackage/orders': true,
  '/1/servicepackage/get': true,
  '/1/servicePackage/make_appointment_orders': true,
  '/1/servicepackage/doctors': true,
  '/1/servicepackage/order_status': true,
  '/1/customer/shop/types': true,
  '/1/zlycare/seniormembers': true,
  '/1/membership/trades': true,
  '/1/membership/expired_cards': true,
  '/1/membership/membership': true,
  '/1/zlycare/senior_services': true,
  '/1/zlycare/vip_services': true,
  '/1/zlycare/senior_trades': true,
  '/1/zlycare/vip_trades': true,
  '/1/zlycare/member_info': true,
  '/1/customer/membershipList': true,
  '/1/activity/coupon': true,
  '/1/activity/coupons': true,
  '/1/applet/get_health_records': true,
  '/1/assistant/user/info': true,
  '/1/assistant/user/update_info': true,
  '/1/assistant/doctors': true,
  '/1/assistant/appointments': true,
  '/1/assistant/memberships': true,
  '/1/assistant/appletUsers': true,
  '/1/assistant/servicePackage/make_appointment_orders': true,
  '/1/assistant/member_service_package': true,
  '/1/im/group/transfer_owner': true,
  '/1/im/group/member_list': true,
  '/1/im/group/members': true,
  '/1/im/group/info': true,
  '/1/tp_memberships/order_list': true,
  '/1/tp_memberships/scan_qr_code': true,
  '/1/assistant/doctor_list': true,
  '/1/assistant/appointments': true,
  '/1/tp_memberships/coupon/sign_in_coupons': true,
  '/1/tp_memberships/coupon/list': true,
  '/1/service_package/create_common_patient': true,
  '/mc_weapp/user/orders': true,
  '/mc_weapp/user/info': true,
  '/mc_weapp/user/share': true,
  '/mc_weapp/user/extend_info': true,
  '/mc_weapp/home_page_order': true,
  '/mc_weapp/report/report_info': true,
  '/1/sp_assistant/order_lists': true,
  '/1/sp_assistant/doctor_lists': true,
  '/1/sp_assistant/user_info': true,
  '/mc_weapp/buy_advance/order_list': true,
  '/mc_weapp/order/my_order': true,
  '/doctor_weapp/my_info': true,
  '/1/assistant/appointment_statistical': true,
  '/1/assistant/evaluation_count': true,
  '/doctor_weapp/order_info': true,
  '/doctor_weapp/users': true,
  '/doctor_weapp/order_list': true,
  '/mc_weapp/price_ctrl/updirector_code': true,
  '/mc_weapp/price_ctrl/update_superior': true,
  '/mc_weapp/price_ctrl/consultings': true,
  '/mc_weapp/price_ctrl/share_users': true,
  '/mc_weapp/price_ctrl/disease_items': true,
  '/mc_weapp/price_ctrl/public_subsidies_statistical': true,
  '/mc_weapp/price_ctrl/consultings_to_me': true,
  '/mc_weapp/price_ctrl/detail': true,
  '/mc_weapp/price_ctrl/is_user_name': true,
  '/mc_weapp/price_ctrl/user_balance': true,
  '/mc_weapp/price_ctrl/care_users': true,
  '/mc_weapp/price_ctrl/find_user_setting': true,
  '/mc_weapp/price_ctrl/get_real_userinfo': true,
  '/mc_weapp/price_ctrl/activitys': true,
  '/mc_weapp/price_ctrl/get_activity_info': true,
  '/mc_weapp/order/create_director_quota': true,
  '/mc_weapp/price_ctrl/sub_share_users': true,
  '/mc_weapp/product/recommended': true,
  '/mc_weapp/product/distributions': true,
  '/mc_weapp/product/distribution_info': true,
  '/mc_weapp/product/recipient': true,
  '/mc_weapp/product/collection_list': true,
  '/mc_weapp/product/distribution_order': true,
  '/mc_weapp/product/distribution_order_cancel': true,
  '/mc_weapp/product/distribution_determine': true,
  '/mc_weapp/order/list': true,
  '/mc_weapp/product/recommended_types': true,
  '/mc_weapp/product/activity/my_recommended': true,
  '/mc_weapp/product/activity/recommended': true,
  '/mc_weapp/product/user_info': true,
  '/mc_weapp/product/user_info_by_code': true,
  '/mc_weapp/product/applyfor_merchant_info': true,
  '/mc_weapp/product/info': true,
  '/mc_weapp/product/join_or_del_scence': true,
  '/mc_weapp/product/forwarded_in_scene': true,
  '/mc_weapp/product/click_log': true,
  '/mc_weapp/product/forwarding_log': true,
  '/mc_weapp/product/order_info': true
};

//非get请求,不需要验证id和token
const not_get_not_auth_map = {
  '/login': true,
  '/1/customer/login': true,
  '/1/push/notification': true,
  '/1/push/message': true,
  '/1/transactions/alipayDeposit': true,
  '/1/transactions/wxRechargeNotify': true,
  '/1/customer/setPwdByAuthCode': true,
  '/1/zlycare/page/unInterested': true,
  '/1/customer/thirdPartyRegister': true,
  '/1/customer/thirdPartyLogin': true,
  '/1/feedFlow/tagUser': true,
  '/1/feedFlow/unInterestedAd': true,
  '/1/servicePackage/alipayDeposit': true,
  '/1/servicePackage/wxRechargeNotify': true,
  '/1/doctor_comment/bossRegister': true,
  '/wechat/snsapi_userinfo': true,
  '/drug_auditor_manager/registered': true,
  '/1/drugAllowance/invitedRegister': true,
  '/1/drugAllowance/drug_audit': true,
  '/boss/message': true,
  '/mq/drug_difference': true,
  '/user_group/reimburse': true,
  '/tag_code_user_group/init_user': true,
  '/1/assistant/userlogin': true,
  '/1/applet/login_third': true,
  '/1/applet/login_phone': true,
  '/weapp/get_phone': true,
  '/boss/im/search_user_sessions': true,
  '/boss/im/search_group': true,
  '/boss/im/search_user': true,
  '/boss/im/search_group_sessions': true,
  '/boss/im/chat_records': true,
  '/boss/im/stop_diagnosis_msg': true,
  '/mc_weapp/get_phone': true,
  '/mc_weapp/user/login': true,
  '/mc_weapp/user/mc_partner_applyfor': true,
  '/mc_weapp/user/boss_set_user_qr_code': true,
  '/boss/user_update_pwd': true,
  '/1/sp_assistant/login': true,
  '/doctor_weapp/login': true,
  '/mc_weapp/refund': true,
  '/boss/sms': true,
  '/mc_weapp/product/activity/sign_up_1': true,
  '/mc_weapp/product/activity/2/sign_up': true,
  '/mc_weapp/product/activity/sign_up_2': true
}


/**
 * url验证
 * 请求URL,不包含域名与'?'及其后面请求参数部分
 * method为英文小写
 */
class UrlAuth extends AuthBase {
  constructor(url) {
    super(url);
  }
  needAuth(method) {
    const url = this.url;
    console.log(url, method);
    if (method == 'get' && get_need_auth_map && get_need_auth_map[url]) {
      return true;
    } else if (not_get_methods.indexOf(method) > -1 && not_get_not_auth_map && !not_get_not_auth_map[url]) {
      return true;
    }
    return false;
  }
}

module.exports = UrlAuth;