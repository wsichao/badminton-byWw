/**
 * api 20002 医生全部评价
 */
const service_evaluation_model = Backend.model("service_package", undefined, 'service_evaluation');
const user_model = Backend.model("common", undefined, 'customer');
const _ = require("underscore");

module.exports = {
  __rule(valid) {
    return valid.object({
      doctor_id: valid.string().required(),
      page_size: valid.number().default(20),
      page_num: valid.number().default(0)
    });
  },
  async postAction() {
    const doctor_id = this.post.doctor_id;
    const page_size = this.post.page_size;
    const page_num = this.post.page_num;
    let result = await service_evaluation_model.find({
        doctorId: doctor_id,
        isDeleted: false,
        isShow: true
      })
      .skip(page_num * page_size)
      .limit(page_size)
      .sort({
        createdAt: -1
      })
    const user_ids = result.map(item => {
      return item.userId
    });
    const users = await user_model.find({
      _id: {
        $in: user_ids
      },
      isDeleted: false
    }, "name avatar");
    const user_map = _.indexBy(users, "_id");
    result = result.map(item => {
      const user = user_map[item.userId];
      let name = user.name;

      if (name && name.length > 1) {
        if (name.length == 2) {
          name = `${name[0]}*`;
        } else {
          const s = _.range(name.length - 2).map(() => '*').join('');
          name = `${name[0]}${s}${name[name.length - 1]}`;
        }
      }
      const avatar = user.avatar;
      return {
        create_time: item.createdAt,
        evaluation_desc: item.doctorEvaluationDesc,
        star_rating: item.doctorStarRating,
        name,
        avatar
      };
    })

    return this.success({
      code: "200",
      msg: "",
      items: result
    });
  }
}