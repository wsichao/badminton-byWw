/**
 *
 * 2030健康-用户登录
 *
 */

'user strict';

const weapp_service = Backend.service('mc_weapp', 'mc_weapp');
const user_service = Backend.service('mc_weapp', 'user');
const community_amount_price_service = Backend.service('mc_weapp', 'community_amount_price');
const share_service = Backend.service('mc_weapp', 'share');
const mc_user_info_service = Backend.model("mc_weapp", undefined, 'mc_user_info');

module.exports = {
  __rule: function (valid) {
    return valid.object({
      nick_name: valid.string(),
      phone_num: valid.string().required(),
      inviter_id: valid.string()
    });
  },
  async postAction() {
    const post = this.post;
    let header_info = this.req.headers['x-docchat-session-type'];
    //将微信头像上传到七牛
    let head = '';
    try {
      let head_url = post.head_url == "" ? "https://cdn.juliye.net/xh_logo@1.5x.png" : post.head_url; 
      head = await weapp_service.uplodeHeadUrl(head_url)
    } catch (e) {
      console.log(e)
    }
    let gender = post.gender || -1;
    let user = await user_service.loginAndSignin(post.phone_num, post.nick_name, gender, head.head_code, header_info);
    //建立用户与邀请人关系
    if (post.inviter_id) {
      if (post.inviter_id != user._id) { //本人不可扫码
        let user_role = await user_service.getRole(user._id); //城市经理不可作为扫码者
        if (!user_role) {
          let user_ref = await user_service.searchUserRef(user._id);
          if (!user_ref) {
            await user_service.buildUserRef(user._id, post.inviter_id);
            await community_amount_price_service.insertShareUser(post.inviter_id);
          }
        }
      }
    }

    let userInfo = await user_service.userInfoExist(user._id);
    if (!userInfo) { //创建userInfo,生成二维码
      let qrcode = await weapp_service.get_weapp_qr_code(user._id);
      await user_service.userInfoCreate(user._id, qrcode.qr_code);
      await community_amount_price_service.insertLoginUser(user._id);
    }
    if (userInfo && !userInfo.qcode) { //二维码不存在，生成
      let qrcode = await weapp_service.get_weapp_qr_code(user._id);
      await user_service.userInfoUpdate(user._id, qrcode.qr_code);
    }

    await share_service.setVolunteers(user._id, post.inviter_id);
    
    let mc_user = await mc_user_info_service.findOne({userId: user._id})

    let result = {
      code: '200',
      msg: '',
      data: {
        _id: user._id,
        name: user.name,
        phoneNum: user.phoneNum,
        avatar: user.avatar,
        sex: user.sex,
        sessionToken: user.sessionToken,
        withdrawMessage: mc_user.withdrawMessage
      }
    }
    return this.success(result);
  }
}