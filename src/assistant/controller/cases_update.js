/**
 *
 *
 * 健康档案修改
 *
 * Created by yichen on 2018/7/6.
 */




'user strict';

const disease_case_model = Backend.model('service_package',undefined,'disease_case');
const co = require('co');
module.exports = {
  __rule: function (valid) {
    return valid.object({
      case_id: valid.string().required()
    });
  },
  postAction: function () {
    const self = this;
    const post = this.post;
    let user_id = this.req.identity.userId;
    let result = co(function* () {

      let update = {};
      if(post.check_time){
        update.checkTime = post.check_time
      }
      if(post.selected_reservations){
        update.selectedReservations = post.selected_reservations
      }
      if(post.check_detail || post.check_detail === ''){
        update.checkDetail = post.check_detail
      }
      if(post.check_imgs){
        update.checkImgs = post.check_imgs
      }
      let disease_case =
        yield disease_case_model.findOneAndUpdate({_id:post.case_id,isDeleted:false},{$set:update},{new:true});

      if(!disease_case){
        return {
          code : '8005',
          msg : "参数有误"
        }
      }

      return {
        code : '200',
        msg : ''
      }

    });
    return self.success(result);
  }
}