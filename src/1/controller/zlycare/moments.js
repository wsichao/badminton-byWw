/**
 * Created by Mr.Carry on 2017/7/25.
 */
"use strict";
let moment_service = Backend.service('1/moment', 'moment');

//get_article_list
module.exports = {
  //__beforeAction: function () {
  //  return userInfoAuth(this.req, {});
  //},
  getAction(){
    let pageSize = this.query.pageSize;
    let pageNum = this.query.pageNum;
    let options = getCurrentPageSlice(this.req, 0, 20);
    this.req.query.pageSize = 5;
    let recommend_options = getCurrentPageSlice(this.req, 0, 5);
    let user_id = this.req.userId;
    let banner=this.req.banner||'推荐';

    return this.success(moment_service.findByZlyCare(options, recommend_options, user_id));
  },
  mockAction: function () {
    return this.success({
      "items": [
        {
          "displayURL": [
            {
              "text": "hahah",
              "url": ""
            }
          ],
          "pics": [
            "C4468C6C-2A6C-43FD-B70C-B20879B14C53"
          ],
          "moment_id": "593e5cbd4f42d85a1225c0de",
          "create_at": "1499756682887",
          "user_name": "张小彬"
        }
      ]
    });
  }
}