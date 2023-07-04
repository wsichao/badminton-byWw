/**
 * Created by Mr.Carry on 2017/7/26.
 */
"use strict";
let personas_model = Backend.model('1/recommend', undefined, 'personas');

module.exports = {
  findByUserId: function (user_id) {
    return personas_model.findOne({
      userId: user_id
    })
  }
}