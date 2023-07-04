/**
 * Created by Mr.Carry on 2017/8/7.
 */
"use strict";
let moment_model = Backend.model('1/moment', undefined, 'moment');
let user_model = Backend.model('common', undefined, 'customer');
let _ = require('underscore');
module.exports = {
  searchMapMomentCoordinate(keyword, coordinate){
    keyword = keyword + '';
    var regex = new RegExp(keyword, 'i');
    let cond = {
      $or: [
        {'name': regex, shopVenderApplyStatus: {$lte: 2}},
        {'shopName': regex, shopVenderApplyStatus: {$gte: 3}}
      ],
      'momentLocation': {
        $geoWithin: {
          $box: [
            coordinate[0],
            coordinate[1]
          ]
        }
      }
    };
    return user_model
      .find(cond, '_id avatar name shopVenderApplyStatus shopName shopAvatar shopLocation momentLocation momentRef')
      .populate('momentRef')
      .sort({momentUpdatedAt: -1})
      .limit(24)
  },
  convertPoint(str){
    if (!str) return;
    let arr = str.split(";");
    let coordinate = []
    arr.forEach(item=> {
      let i_1 = item.split(',')[0];
      let i_2 = item.split(',')[1];
      i_1 = parseFloat(i_1);
      i_2 = parseFloat(i_2);
      coordinate.push([i_2, i_1]);
    })
    return coordinate;
  },
  /**
   * 根据用户列表查询最大四个坐标点
   * @param user_ids
   * @returns {*|Promise.<T>}
   */
  searchMapMomentsScope: function (keyword) {
    keyword = keyword + '';
    var regex = new RegExp(keyword, 'i');
    let scope = function (params, point_type) {
      return user_model.aggregate([
        {
          '$match': {
            $or: [
              {'name': regex, shopVenderApplyStatus: {$lte: 2}},
              {'shopName': regex, shopVenderApplyStatus: {$gte: 3}}
            ],
            'source': {$ne: 'zs'},
            'momentLocation': {
              '$elemMatch': {
                '$ne': null
              }
            }
          }
        },
        {
          '$project': {
            longitude: {$slice: ['$momentLocation', 0, 1]},
            dimension: {$slice: ['$momentLocation', 1, 2]},
            _id: '$_id'
          }
        },
        {'$unwind': '$longitude'},
        {'$unwind': '$dimension'},
        {'$sort': point_type},
        {'$limit': 1}
      ]).exec();
    }
    return Backend.Deferred.all([
      scope(keyword, {longitude: -1}),
      scope(keyword, {longitude: 1}),
      scope(keyword, {dimension: -1}),
      scope(keyword, {dimension: 1})
    ])
      .then(res=> {
        let index = [];
        let cond = {};
        res.forEach(item=> {
          if (item.lenght > 0 && item[0]._id)
            index.push(item[0]._id + '');
        })
        index = _.uniq(index);
        cond = {
          $or: [
            {'name': regex, shopVenderApplyStatus: {$lte: 2}},
            {'shopName': regex, shopVenderApplyStatus: {$gte: 3}},
            {'_id': {$in: index}}
          ],
          'momentLocation': {
            '$elemMatch': {
              '$ne': null
            }
          }
        }
        return user_model
          .find(cond, '_id avatar name shopVenderApplyStatus shopName shopAvatar shopLocation momentLocation momentRef')
          .populate('momentRef')
          .sort({'momentUpdatedAt': -1})
          .limit(24)
      })
  },
  searchMapMoments: function (data) {
    let result = data.map(item=> {
      let name = '';
      let avatar = '';
      let type = 0;
      let pics = item.pics || [];
      let coordinate = item.momentLocation;
      if (item.shopVenderApplyStatus >= 3) {
        name = item.shopName || "";
        avatar = item.shopAvatar || "";
        type = 0;
      }
      else if (item.shopVenderApplyStatus <= 2) {
        name = item.name || "";
        avatar = item.avatar || "";
        type = 1;
      }

      let obj = {
        'userId': item.momentRef.userId,
        'name': name,
        'coordinate': coordinate.reverse(),
        'avatar': avatar,
        'currentMoment': item.momentRef.displayContent && item.momentRef.displayContent.substr(0, 200),
        'moment_id': item.momentRef._id,
        'type': type + '' || '',
        'momentInfo': {
          'updatedAt': item.momentRef.updatedAt,
          'pics': item.momentRef.pics,
          'momentFirstPic': item.momentRef.pics.length > 0 ? item.momentRef.pics[0] : '',
          'momentPicCount': item.momentRef.pics.length + '' || '',
          'commentCount': item.momentRef.commentCount + '' || '',
          'sharedCount': item.momentRef.sharedCount + '' || '',
          'zanCount': item.momentRef.zanCount + '' || ''
        }
      };

      return obj;
    })
    return {items: result};
  }
}