const search_service = Backend.service('boss', 'search');

module.exports = {
  __rule: function (valid) {
    return valid.object({
      page_size: valid.number().default(20),
      page_num: valid.number().default(1),
      user_id: valid.string().required(),
      type: valid.string().default('user'),
      to_id: valid.string().required()
    });
  },
  async postAction() {
    const page_size = this.post.page_size;
    const page_num = this.post.page_num;
    const user_id = this.post.user_id;
    const type = this.post.type;
    const to_id = this.post.to_id;
    const msgType = type == 'user' ? 'chat' : 'chatgroup';

    // 获取消息记录
    const result = await search_service.record(user_id, to_id, msgType, {
      page_num,
      page_size
    });
    const list = result.data.records.map(record => {
      let obj = {};
      obj.time = new Date(record.send_chat_time).getTime();
      const payload = record.payload;
      const bodies = record.payload.bodies[0];
      obj.user_id = record.from.user_id;
      const b_type = bodies.type;
      let type = '';
      let value = '';
      if (b_type == 'audio') {
        value = bodies.url;
        type = 'voice';
      } else if (b_type == 'txt') {
        value = bodies.msg;
        type = 'text';
      } else if (b_type == 'img') {
        value = bodies.url;
        type = 'image';
      }
      obj.type = type;
      obj.value = value;
      return obj;
    })

    return this.success({
      code: '200',
      msg: '',
      data : {
        list,
        count: result.data.count,
        page_size: result.data.pageSize,
        page_num: result.data.currentPage,
        totoal_page: result.data.totalPages,
      }
    });
  }
}