/**
 * Created by Mr.Carry on 2017/5/18.
 */
"use strict";

module.exports = {
  getHomeList: function () {
    console.log(1)
    var product = Backend.model('home', undefined, 'users');
    return product.find({"name": "我哦"}, "_id source name").exec();
  }
}