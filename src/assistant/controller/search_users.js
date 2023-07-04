/**
 *  10116 助理APP 查询/搜索/筛选用户
 */

const user_search_service = Backend.service('common', 'user_search');
const assistant_service = Backend.service('assistant', 'doctor');
module.exports = {
  __rule: function (valid) {
    return valid.object({
      keywords: valid.string(),
      doctorid: valid.string(),
      page_size: valid.number(),
      page_num: valid.number(),
      // TODO 6.8.0
      status: valid.number().default(-100)
    });
  },
  async getAction() {
    const self = this;
    const query = this.req.query;
    // TODO 6.8.0 修改 Data 数据结构，添加医生统计信息
    const res = {
      code: '200',
      msg: '',
      items: []
    };
    const items = await user_search_service.search_users(query);
    res.items = items;
    const {
      doctor_name,
      current_member_num,
      total_member_num
    } = await assistant_service.getDoctorStatistical(query.doctorid);
    res.doctor_name = doctor_name;
    res.current_member_num = current_member_num;
    res.total_member_num = total_member_num;
    return self.success(res);
  }
}