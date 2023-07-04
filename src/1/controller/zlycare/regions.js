/**
 * Created by fly on 2017－07－24.
 */
/**
 * Created by fly on 2017－07－24.
 */

"use strict";
let config_service = Backend.service('common', 'config_service');
module.exports = {
  __beforeAction: function () {
    /*return userInfoAuth(this.req, {
     items: []
     });*/
  },
  mockAction: function () {
    let resObj =
    {
      "items": [
        {
          city: '北京',
          regionPinyin: 'Beijing'
        },{
          city: '天津',
          regionPinyin: 'Tianjin'
        },{
          city: '郑州',
          regionPinyin: 'Zhengzhou'
        },{
          city: '西安',
          regionPinyin: 'Xian'
        },{
          city: '上海',
          regionPinyin: 'Shanghai'
        },
      ]
    }
    return this.success(resObj);
  },
  getAction: function () {
    let self = this;
    let type = self.req.query.type || 'zlycare';
    switch (type) {
      case 'zlycare': {
        return config_service.getZlycareCities()
          .then(function(_cities){
            let cities = _cities.map(function(_city){
              return {
                city: _city,
                regionPinyin: toPinYin(_city)
              }
            });
            return self.success({
              items: cities
            });
          });
        break;
      }
        default: {
          return self.success({
            items: []
          });
        }
    }


  }
}