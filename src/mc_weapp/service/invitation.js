const mc_activity_model = Backend.model("mc_weapp", undefined, "mc_activity");
const mc_activity_invitation_log_model = Backend.model("mc_weapp", undefined, "mc_activity_invitation_log");

const moment = require("moment");
moment.locale("zh-cn");
const weapp_service = Backend.service('mc_weapp', 'mc_weapp');

module.exports = {
  /**
   * 创建邀请函
   * @param {*} user_id 用户唯一标识
   * @param {*} activity_id 活动唯一标识
   * @param {*} title_sub 副标题
   * @return img
   */
  async create(user_id, activity_id, title_sub) {
    try {
      // 获取活动信息
      const activity = await this.getActivity(activity_id);
      // 获取用户活动小程序二维码
      const qrcode = await this.createQrCode(`${activity.number}_${user_id}`);
      await this.log(user_id, activity_id, qrcode, title_sub);
      return await this.imgSynthesis(activity.time,
        activity.address,
        activity.concats,
        activity.title_main,
        title_sub,
        qrcode,
        activity.explain);
    } catch (e) {
      console.log(e)
    }

  },
  async log(user_id, activity_id, img, title_sub) {
    await mc_activity_invitation_log_model.create({
      userId: user_id,
      invitationImg: img,
      titleSub: title_sub,
      activityId: activity_id
    })

  },
  /**
   * 获取活动信息
   * @param {*} activity_id 活动唯一标识
   * @return { time,address,concats,title_main }
   */
  async getActivity(activity_id) {
    const res = await mc_activity_model.findOne({
      _id: activity_id,
      isDeleted: false
    });
    const provinceName = res.provinceName;
    const cityName = res.cityName;
    let address = res.address;
    const activityName = res.activityName;
    const contactsName = res.contactsName;
    const contactsPhone = res.contactsPhone;
    const conductTime = res.conductTime;
    const explain = res.explain;
    const id = res._id;
    const number = res.incremenId;
    const time = `${moment(conductTime).format("YYYY年MM月DD日 HH:mm")}`;
    address = `${provinceName}${cityName}${address}`;
    const concats = `联系人 : ${contactsName} ${contactsPhone}`;
    return {
      id,
      number,
      time,
      address,
      concats,
      title_main: activityName,
      explain
    }
  },
  /**
   * 生成用户邀请函小程序二维码
   * @param {*} user_id 用户唯一标识
   * @retirn qrcode
   */
  async createQrCode(user_id) {
    // TODO : V6.13.0
    const page = 'pages/invitation/join_activity/join_activity';
    // const page = 'pages/index/index'
    let qrcode = await weapp_service.get_weapp_qr_code(user_id, page);
    return qrcode.qr_code;
  },
  /**
   * 生成邀请函
   * @param {*} time 时间
   * @param {*} address 地址
   * @param {*} concats 联系人
   * @param {*} title_main 主标题
   * @param {*} title_sub 副标题
   * @param {*} qrcode 邀请函小程序二维码
   * @param {*} detail 详情
   * @return 七牛 key
   */
  async imgSynthesis(time, address, concats, title_main, title_sub, qrcode, detail = "") {
    return {
      time,
      address,
      concats,
      title_main,
      title_sub,
      qrcode,
      detail
    };
  }

}