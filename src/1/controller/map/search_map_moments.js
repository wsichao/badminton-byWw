/**
 * api-2427 地图动态搜索
 * Created by Mr.Carry on 2017/8/3.
 */
"use strict";
let map_service = Backend.service('1/moment', 'map_service');


module.exports = {
  getAction: function () {
    let keyword = this.query.keyword;
    let coordinate = this.query.coordinate;
    //lat1,lon1;lat2,lon
    coordinate = map_service.convertPoint(coordinate);
    //let coordinate = [[116.406823, 39.886692], [116.496774, 39.939754]];
    let result;
    if (coordinate) {
      result = map_service
        .searchMapMomentCoordinate(keyword, coordinate)
        .then(data=> {
          return map_service.searchMapMoments(data);
        })
    } else {
      result = map_service
        .searchMapMomentsScope(keyword)
        .then(data=> {
          return map_service.searchMapMoments(data);
        })
    }


    return this.success(result);
  },
  mockAction: function () {
    let result = {'items': [], "max_coordinate": "40.003943,116.197918;39.776346,116.58244"};
    for (var i = 0; i < 24; i++) {
      let item = {
        "momentInfo": {
          "updatedAt": "1501574783968",
          "pics": [
            "FrqgMD8dS6F6uuXaIM8hJIWPF-o-",
            "FjVnkfzUxXUJpDupiOQ0agmc6DEV",
          ],
          "momentFirstPic": "FrqgMD8dS6F6uuXaIM8hJIWPF-o-",
          "momentPicCount": "2",
          "commentCount": "3",
          "sharedCount": "4",
          "zanCount": "5",
        },

        "originalUser": {
          "userName": "张小彬",
          "docChatNum": "801218684"
        },
        "recommendedUser": {
          "userName": "张小彬",
          "docChatNum": "801218684"
        },
        "userId": "5937b047381b03789aa18e82",
        "name": "张小彬",
        "avatar": "0BD68011-826B-4716-B85A-FE99C08F4910",
        "type": i % 2 == 0 ? 0 : 1,
        "currentMoment": "这只是个mock",
        "coordinate": [39.906569, 116.39792 + i / 10],
        "moment_id": '59819054043dda8624a76b5d'
      }
      result.items.push(item);
    }
    return this.success(result);
  }
}