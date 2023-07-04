/**
 * api 10093 获取可添加群成员列表
 */
const group_service = Backend.service('im', 'group');
const pinyin = require("pinyin");
module.exports = {
  __rule: function (valid) {
    return valid.object({
      pageSize: valid.number().default(0),
      pageNum: valid.number().default(20),
    });
  },
  async getAction() {
    const page_size = this.query.pageSize;
    const page_num = this.query.pageNum;
    let result = await group_service.getUserList({
      page_size,
      page_num
    });
    const p_style = {
      style: pinyin.STYLE_FIRST_LETTER, // 设置拼音风格
    };
    try {
      result.sort((a, b) => {
        a.user_name = a.user_name || '';
        b.user_name = b.user_name || '';
        const a_p = pinyin(a.user_name[0], p_style);
        const b_p = pinyin(b.user_name[0], p_style);
        return a_p[0][0].localeCompare(b_p[0][0]);
      });
    } catch (e) {
      console.log(e);
      console.log('拼音排序报错');
    }

    return this.success({
      code: '200',
      msg: '',
      items: result
    });
  }
}