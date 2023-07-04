/**
 * Created by Mr.Carry on 2017/6/6.
 */

"use strict";

let Errors = require("./../common/Errors.json");

for (let p in Errors) {
  let value = Errors[p];
  value.msg = value.businessMessage;
}

module.exports = {
  method: function () {
    return Errors;
  }
}