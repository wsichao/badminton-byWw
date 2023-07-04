/**
 * api 10087 群组成员列表
 */
const group_service = Backend.service('im', 'group');
const user_service = Backend.service('im', 'user');
const pinyin = require("pinyin");

module.exports = {
  __rule: function (valid) {
    return valid.object({
      group_id: valid.string().required()
    });
  },
  async getAction() {
    let that = this;
    const group_id = this.query.group_id;
    const result = await group_service.getGroupInfo(group_id);
    const vip_user = await group_service.getGroupPSRef(group_id);
    // 获取是否为VIP
    if (result.errno != 0) {
      return that.success({ code: '1000', msg: result.errmsg });
    }
    const memberIds = result.data.members.map(item => { return item.user_id });
    const userMap = await user_service.getUser(memberIds);
    const items = result.data.members.map(item => {
      return {
        user_id: item.user_id,
        im_id: item.im_id,
        user_name: userMap[item.user_id].user_name,
        user_avatar: userMap[item.user_id].avatar,
        role: item.user_id == vip_user ? 'vip' : item.rule,
      }
    });

    const p_style = {
      style: pinyin.STYLE_FIRST_LETTER, // 设置拼音风格
    };

    try {
      items.sort((a, b) => {
        a.user_name = a.user_name || '';
        b.user_name = b.user_name || '';
        const a_p = pinyin(a.user_name[0], p_style);
        const b_p = pinyin(b.user_name[0], p_style);
        return a_p[0][0].localeCompare(b_p[0][0], 'zh-Hans-CN', { sensitivity: 'accent' });
      });
    } catch (e) {
      console.log(e);
      console.log('拼音排序报错');
    }

    return that.success({
      code: '200',
      msg: '',
      items
    });
  }
}