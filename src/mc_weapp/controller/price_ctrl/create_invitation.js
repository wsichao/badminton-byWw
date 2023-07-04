const activity_service = Backend.service("mc_weapp", "activity");

module.exports = {
  __rule: function (valid) {
    return valid.object({
      title: valid.string().empty(""),
      activity_id: valid.string().required(),
    });
  },
  async postAction() {
    const title_sub = this.post.title;
    const user_id = this.req.identity.userId;
    const activity_id = this.post.activity_id;
    const res = await activity_service.createInvitation(user_id, activity_id, title_sub);
    return this.success({
      code: "200",
      msg: "",
      data: res
    });
  }
}