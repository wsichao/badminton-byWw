/**
 * Created by Mr.Carry on 2017/6/8.
 */
"use strict";

let service = Backend.service("1/im", "im_session");

module.exports = {
  getAction: function () {
    return service.insertSession('1', '3');
  }
}