const service_evaluation_model = Backend.model('service_package', undefined, 'service_evaluation');
const user_model = Backend.model('common', undefined, 'customer');

module.exports = {
  __rule(valid) {
    return valid.object({
      sp_order_id: valid.string().required()
    });
  },
  async getAction() {
    const sp_order_id = this.query.sp_order_id;
    const user_id = this.req.identity.userId;
    const user = await user_model.findOne({
      _id: user_id,
      isDeleted: false
    }, 'name');
    const name = user.name || "";
    let result = await service_evaluation_model.find({
      servicePackageOrderId: sp_order_id,
      userId: user_id,
      isDeleted: false
    }).sort({
      createdAt: -1
    });
    result = result.map(item => {
      return {
        name,
        create_time: item.createdAt,
        evaluation_desc: item.doctorEvaluationDesc,
        star_rating: item.doctorStarRating
      }
    })
    return this.success({
      code: "200",
      msg: "",
      items: result
    });
  }
}