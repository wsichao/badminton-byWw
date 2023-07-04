const doctor_agreement_model = Backend.model('doctor_weapp', undefined, 'doctor_agreement');

module.exports = {
  async postAction() {
    const user = this.req.identity.user;
    const user_id = user._id;
    await doctor_agreement_model.create({
      userId: user_id
    })
    return this.success({
      code: '200',
      msg: ''
    });
  }
}