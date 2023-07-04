const activity_service = Backend.service("mc_weapp", "activity");

module.exports = {
  __rule: function (valid) {
    return valid.object({
      activity_id: valid.string().required()
    });
  },
  async getAction() {
    const activity_id = this.query.activity_id;
    const res = await activity_service.getActivity(activity_id);

    let data = {};
    if (res) {
      data.title = res.activityName;
      data.time = res.conductTime;
      data.name = res.contactsName;
      data.phone = res.contactsPhone;
      data.address = `${res.provinceName}${res.cityName}${res.address}`;
      data.instructions = res.explain;
      data.application_fee = res.price || 0;
    }

    return this.success({
      code: "200",
      msg: "",
      data
    });
  }
}