/**
 * Created by Mr.Carry on 2017/6/21.
 */
"use strict";
let url_info_model = Backend.model("1/city_buy", undefined, "url_info");

/**
 * 根据 URL 获取 info 信息
 * @param url
 */
let getUrlInfo = function (url) {
  return url_info_model
    .findOne({url: url})
    .then(function (data) {
      if (data) {
        return data;
      } else {
        return url_info_model.create({url: url})
      }
    }).then(function (info) {
      let obj = {
        url: info.url
      };
      if (info.title == '') {
        obj.text = info.url;
      } else {
        obj.text = info.title;
      }
      return obj;
    });
}

module.exports = {
  /**
   * 动态 URL 处理
   * @param content
   * @returns [ { 'text':'','url':'http://xxx.com' } ]
   */
  momentURL: function (content, momentURL) {
    if (momentURL && momentURL[0]) {
      return momentURL;
      /*let momentArray = JSON.parse(momentURL);
       console.log(momentArray[0], momentArray[1]);
       return JSON.parse(momentURL);*/
    }
    var reg = /(http:\/\/|https:\/\/)((\w|=|\?|\.|\/|&|-)+)/g;
    content = content.replace(reg, "|__$1$2|__");
    content = content.replace(/##跑步圣地##/g, "|__##跑步圣地##|__");
    let data = content.split('|__').map(function (item) {
      let obj = {
        url: ''
      };
      if (reg.test(item)) {
        obj.url = item;
        obj.text = '网页链接';
      } else if (item == '##跑步圣地##') {
        obj.text = item;
        let wetsite = Backend.config.getConfig(Backend.type).wetsite;
        obj.url = wetsite + '/1/activity/activity_0723';
      }
      else {
        obj.text = item;
      }
      return obj;
    });

    //let arr = data.map(function (item) {
    //  if (item.url != '') {
    //    return getUrlInfo(item.url);
    //  } else {
    //    return item;
    //  }
    //})
    //return Backend.Deferred.all(arr);

    return data;
  }
}
