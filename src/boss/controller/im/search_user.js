const search_service = Backend.service('boss', 'search');

module.exports = {
  __rule: function (valid) {
    return valid.object({
      page_size: valid.number().default(20),
      page_num: valid.number().default(1),
      user_id: valid.string().default(undefined),
      assistant_id: valid.string().default(undefined),
    });
  },
  async postAction() {
    const page_size = this.post.page_size;
    const page_num = this.post.page_num;
    const user_id = this.post.user_id;
    const assistant_id = this.post.assistant_id;
    let result = {};
    let cond = {};
    result = await search_service.searchUser(user_id, assistant_id, page_size, page_num);
    console.log(result.data.list[0]);
    let list = result.data.list.map(item => {
      var last_record_time = 0;
      var create_session_time = 0;
      if (item.last_msg_time) {
        last_record_time = (new Date(item.last_msg_time)).getTime();
      }
      if (item.create_time) {
        create_session_time = (new Date(item.create_time)).getTime();
      }
      let obj = {
        session_id: item.session_id,
        last_record_time,
        create_session_time,
      };
      let assistant_id = item.to.user_id;
      let user_id = item.from.user_id;
      obj.user_id = user_id;
      obj.assistant_id = assistant_id;
      return obj;
    })


    return this.success({
      code: '200',
      msg: '',
      data: {
        list,
        count: result.data.count
      }
    });
  }
}