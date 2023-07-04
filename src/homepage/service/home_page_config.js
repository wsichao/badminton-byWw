/**
 * 首页配置 service
 */
const ms_banner_ip = (process.env.NODE_ENV == "production") ? "http://10.170.240.206:18080" : 'http://172.31.1.22:18080';
const service_classification_model = Backend.model("tp_memberships", undefined, "tp_member_service_classification");
const rp = require('request-promise');
module.exports = {
  /**
   * banner 配置
   */
  async banners() {
    const data = await this.getMs();
    if (data.status != '200') {
      return [];
    } else {
      return data.result.map(item => {
        let obj = {};
        if (item.slotName == 'top_banner') {
          obj.imgPosition = "top"
        } else if (item.slotName == 'mid_banner') {
          obj.imgPosition = "middle"
        }
        obj.id = item.id || '';
        obj.activityName = item.title || '';
        obj.img = item.mediaImg || '';
        obj.redirectLink = item.mediaLink || '';
        obj.share = {};
        obj.share.title = item.shareTitle || '';
        obj.share.context = item.shareContent || '';
        obj.share.url = item.shareLink || '';
        obj.remark = item.title || '';
        return obj;
      });
    }
  },
  async getMs() {
    try {
      const url = ms_banner_ip;
      return await rp({
        uri: `${url}/ad/view/plans`,
        qs: {
          appName: "care"
        },
        json: true
      });
    } catch (e) {
      return {
        code: "1000"
      }
    }
  },
  /**
   * 服务配置
   */
  async services() {
    const cond = {
      isDeleted: false,
      isShow: true
    }
    return await service_classification_model.find(cond).sort({
      weight: -1
    });
  },
  /**
   * 首页配置
   */
  async homeConfig() {
    const banners_config = await this.banners();
    const services_config = await this.services();
    let top_banner_config = [];
    let mid_banner_config = [];
    let member_services_type = [];

    // 顶部banner
    banners_config.forEach(item => {
      if (item.imgPosition == 'top') {
        top_banner_config.push({
          img: item.img || '',
          url: item.redirectLink || '',
          share: item.share || ''
        });
      } else if (item.imgPosition == 'middle') {
        mid_banner_config.push(item);
      }
    });
    // 专属医生
    member_services_type.push({
      _id: '',
      name: '专属医生配置',
      small_img: 'https://cdn.juliye.net/hpwCFhQT.png',
      big_img: '',
      type: 0
    });
    // 服务
    services_config.forEach(item => {
      member_services_type.push({
        _id: item._id || '',
        name: item.name || '',
        small_img: item.smallImg || '',
        big_img: item.bigImg || '',
        type: 1
      });
    })
    // 药店配置
    member_services_type.push({
      _id: '',
      name: '药店配置',
      small_img: 'https://cdn.juliye.net/kjIovSbc.png',
      big_img: '',
      type: 2
    });

    // 中部banner配置
    mid_banner_config.forEach(item => {
      member_services_type.push({
        _id: '',
        name: '',
        small_img: '',
        big_img: '',
        type: 3,
        banner: {
          img: item.img || '',
          url: item.redirectLink || '',
          share: item.share || ''
        }
      });
    })

    return {
      top_banner_config,
      member_services_type
    }

  }
}