/**
 * Created by Mr.Carry on 2017/6/12.
 */

"use strict";
let _ = require('underscore');

let item1 = [4,5,4,0,0,0];
let item2 = [3,0,0,3,4,0];

let x = (function () {
  let arr = item1.map((item1_val, index)=> {
    let item2_val = item2[index];
    return item1_val * item2_val;
  })
  return _.reduce(arr, function (memo, num) {
    return memo + num;
  }, 0);
})();


let y = (function () {
  let item1_arr = item1.map((item)=> {
    return Math.pow(item, 2);
  })
  let item2_arr = item2.map((item)=> {
    return Math.pow(item, 2);
  })

  let item1_sum = _.reduce(item1_arr, function (memo, num) {
    return memo + num;
  }, 0);

  let item2_sum = _.reduce(item2_arr, function (memo, num) {
    return memo + num;
  }, 0);

  return Math.sqrt(item1_sum) * Math.sqrt(item2_sum);
})()

console.log(x)
console.log(y)
console.log(x/y)