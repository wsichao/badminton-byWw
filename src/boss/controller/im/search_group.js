const search_service = Backend.service('boss', 'search');

module.exports = {
  __rule: function (valid) {
    return valid.object({
      page_size: valid.number().default(20),
      page_num: valid.number().default(1),
      group_ids: valid.array().default([]),
    });
  },
  getUserId(users) {
    for (let i = 0; i < users.length; i++) {
      const item = users[i];
      if (item.rule == 'owner') {
        return item.user_id;
      }
    }
  },
  async postAction() {
    // const group_ids = ['57410841542657', '57412718493697'];
    let that = this;
    const group_ids = this.post.group_ids;
    console.log(group_ids)
    if (group_ids.length == 0) {
      return this.success({
        code: '200',
        msg: '',
        data: {
          list: []
        }
      })
    }
    let result = await search_service.searchGroup(group_ids);
    if (result.errno == 0) {
      result = result.data.groups.map(item => {
        let session_time = new Date(item.create_time).getTime();
        let last_record_time = new Date(item.last_record_time).getTime();
        return {
          last_record_time: last_record_time,
          create_session_time: session_time,
          user_id: that.getUserId(item.members),
          group_id: item.id,
          group_name: item.name
        };
      })
      return this.success({
        code: "200",
        msg: "",
        data: {
          list: result
        }
      });
    } else {
      return this.success({
        code: "1000",
        msg: result.errmsg
      });
    }

  }
}