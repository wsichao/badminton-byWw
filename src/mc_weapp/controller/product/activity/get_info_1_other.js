const mc_scene_activity_other_model = Backend.model("mc_weapp", undefined, "mc_scene_activity_other");
const _ = require("underscore");
module.exports = {
  __rule: function (valid) {
    return valid.object({
      keywords: valid.string().empty(""),
      type: valid.number().empty(""),
    });
  },
  async find() {
    const query = this.query;
    let type = query.type;
    const keywords = query.keywords;
    if (type == "") type = 0;
    if (type == 0) {
      const res = await mc_scene_activity_other_model.findOne({
        name: "activity_1"
      })
      return res.data.map(item => {
        return item.name;
      })
    } else if (type == 1) {
      const res = await mc_scene_activity_other_model.findOne({
        name: "activity_1",
        "data.name": keywords
      })
      if (!res) return [];
      return _.find(res.data, function (item) {
        if (item.name == keywords) return true;
      }).list;
    }
  },
  async getAction() {
    const dt = await this.find();
    return this.success({
      code: "200",
      msg: "",
      data: dt
    });
  }

}