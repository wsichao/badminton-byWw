/**
 * moment 相关
 * Created by yichen on 2017/6/29.
 */

"use strict";

let model = Backend.model('1/moment', undefined, 'moment');
let userModel = Backend.model('common', undefined, 'customer');
let _ = require('underscore');
let TransactionMysqlService = require('../../../../app/services/TransactionMysqlService');
module.exports = {
  findMomentById: function (id) {
    var cond = {
      _id: id,
      isDeleted: false
    }
    return model.findOne(cond).exec();
  },
  increaseCommentCount: function (id) {
    var cond = {
      _id: id,
      isDeleted: false
    }
    return model.findOneAndUpdate(
      cond,
      {$set: {updatedAt: Date.now()}, $inc: {commentCount: 1}},
      {new: true})
  },
  delMoment: function (moment_id, userId) {
    var cond = {
      _id: moment_id,
      userId: userId,
      isDeleted: false
    }
    return model.findOneAndUpdate(cond, {isDeleted: true, updatedAt: Date.now()}, {new: true})
      .then(function (_moment) {
        if (_moment) {
          var cond = {
            isDeleted: false,
            userId: userId
          }

          return model.find(cond).sort({"createdAt": -1}).limit(1)
        }
      })
      .then(function (_moment) {
        var secondMoment = _moment[0];
        var cond = {
          _id: userId,
          isDeleted: false
        }
        var update = {};
        if(secondMoment){
          update['$set'] = {
            updatedAt: Date.now(),
            currentMoment: secondMoment.displayContent,
            momentURL: secondMoment.momentURL,
            momentRef: secondMoment._id,
            momentUpdatedAt: secondMoment.createdAt,
            momentLocation: secondMoment.location || [],
            momentType: secondMoment.pics && secondMoment.pics.length > 0 && secondMoment.displayContent == "" ? "pic" : ""
          }
        }else{
          update['$set'] = {
            updatedAt: Date.now(),
            currentMoment: '',
            momentURL: [],
            momentRef: null,
            momentUpdatedAt: 0,
            momentLocation: [],
            momentType: ""
          }
        }
        return userModel.findOneAndUpdate(cond,
          update,
          {new: true})
      })
  },
  getMoments: function (cond, fields, options) {
    return model.find(cond, fields, options).exec();
  },
  getMapMomentsInfo: function (coordinate, type, options) {
    coordinate = getCoordinateFromStr(coordinate);
    let left_bottom_coordinate = coordinate.left_bottom_coordinate;
    let right_top_coordinate = coordinate.right_top_coordinate;
    let maxNum = options && options.maxNum || 24;
    let maxNumPer = options && options.maxNumPer || 2;
    console.log('maxNumPer:', maxNumPer);
    //先获取当前区域发布动态的时间靠前,maxNum个人的信息
    let cond = {
      '$or': [
        {
          'location': {
            $geoWithin: {
              $box: [
                left_bottom_coordinate,
                right_top_coordinate
              ]
            }
          }
        },
        {
          'shopLocation': {
            $geoWithin: {
              $box: [
                left_bottom_coordinate,
                right_top_coordinate
              ]
            }
          }
        },
      ],
      type: type
    };
    if (type == 'favorite') {
      let favorite_ref_ids = options && options.favorite_ref_ids || [];
      cond.userRefId = {$in: favorite_ref_ids};
      delete cond.type;
    }
    if ('all' == type) {
      delete cond.type;
    }
    let moment_options = {limit: 1000, sort: {createdAt: -1}}
    let fields = 'type originalContent pics momentLocation';
    return model.find(cond, '', moment_options)
      .then(function (_moments) {
        let userMomentsMap = {};
        let moments = [];
        let count = 0;
        let constant_type = 'special';
        for (let i = 0; i < _moments.length; i++) {
          if (count == maxNum) {
            break;
          }
          let _moment = _moments[i];
          let type = '';
          //console.log('_moment.type:', _moment.type);
          //医疗也是商户,如果是商户,只要最新的一条,用special做标示;商户作为个人发布动态最多maxNumPer条
          if (['shop', 'medical'].indexOf(_moment.type) > -1) {
            type = constant_type;
          }
          let _userMoments = userMomentsMap[_moment.userId + type];
          if (!_userMoments) {
            count++;
            userMomentsMap[_moment.userId + type] = [_moment];
            moments.push(_moment);
          } else if (_userMoments.length < maxNumPer) {
            if (type == constant_type) {
              continue;
            }
            count++;
            userMomentsMap[_moment.userId + type].push(_moment);
            moments.push(_moment);
          }
        }
        //constant_type置换为''
        let momentUserIds = Object.keys(userMomentsMap).map(function (_key) {
          return _key.replace(constant_type, '');
        });
        //去重
        momentUserIds = _.union(momentUserIds);
        return {
          moments: moments,
          momentUserIds: momentUserIds
        };
      })
  },
  /**
   * 通过moment_ids获取动态信息
   * @param ids
   * @param fields
   * @param options
   * @param userId 请求接口用户id
   * @returns {Array|{index: number, input: string}|Promise|*}
   */
  getMomentsDeepInfoByIds: function (ids, fields, options,userId) {
    let cond = {
      isDeleted: false,
      _id: {$in: ids}
    }
    //todo: momentURL
    let original_user_ids = []; //首发人IDs
    let original_user_map = {}; //首发人IDs
    let recommended_user_ids = []; //被推荐人ids
    let recommended_user_map = {};
    let user_ids = [];
    let moments = [];
    let hongbaoGetUsers;
    fields = fields || 'createdAt pics commentCount sharedCount zanCount originalUser recommendedUser hongbao isOriginal';
    return model.find(cond, fields, options).populate("hongbao").exec()
      .then(function (_moments) {
        _.extend(moments, _moments);
        //console.log(moments);
        _moments.forEach(function (_moment) {
          if (_moment.recommendedUser) {
            recommended_user_ids.push(_moment.recommendedUser + '');
            user_ids.push(_moment.recommendedUser + '');
          }
          if (_moment.originalUser && _moment.originalUser.userId) {
            original_user_ids.push(_moment.originalUser.userId);
            user_ids.push(_moment.originalUser.userId);
          }
        });
        //获取备注信息

        //推荐人信息
        let _cond = {
          isDeleted: false,
          _id: {$in: recommended_user_ids}
        }
        return userModel.find(_cond, 'name shopName shopVenderApplyStatus docChatNum').exec();
      })
      .then(function (_users) {
        recommended_user_map = _.indexBy(_users || [], '_id');
        //首发人信息
        let _cond = {
          isDeleted: false,
          _id: {$in: original_user_ids}
        }
        return userModel.find(_cond, 'name shopName shopVenderApplyStatus docChatNum').exec();
      })
      .then(function (_users) {
        original_user_map = _.indexBy(_users || [], '_id');
        var hongbaoOrders = [];
        moments.forEach(function (item) {
          if(item.hongbao && item.hongbao.order){
            hongbaoOrders.push(item.hongbao.order);
          }
        })
        if(hongbaoOrders.length){
          var sqls = TransactionMysqlService.genHongbaosCatchUsersSqls(hongbaoOrders);
          return TransactionMysqlService.execSqls(sqls);
        }
      })
      .then(function(_userArray){
        hongbaoGetUsers = _.groupBy(_userArray || [], 'innerTradeNo');
      })
      .then(function(){
        //重新装配信息
        moments = moments.map(function(moment){
          let _original_user_id = moment.originalUser && moment.originalUser.userId || '';
          let _original_user = original_user_map[_original_user_id];
          let _recommended_user_id = (moment.recommendedUser + '') || '';
          let _recommended_user = recommended_user_map[_recommended_user_id];

          let originalUser = _original_user ? {
            userName: _original_user.shopVenderApplyStatus >= 3 ? _original_user.shopName || '' : _original_user.name || '',
            docChatNum: _original_user.docChatNum
          } : null;
          let recommendedUser = _recommended_user ? {
            userName: _recommended_user.shopVenderApplyStatus >= 3 ? _recommended_user.shopName || '' : _recommended_user.name || '',
            docChatNum: _recommended_user.docChatNum
          } : null;
          let momentItem = {
            _id: moment._id, //
            updatedAt: moment.createdAt,
            pics: moment.pics || [],
            momentFirstPic: moment.pics && moment.pics[0] || '',
            momentPicCount: moment.pics ? moment.pics.length : 0,
            commentCount: moment.commentCount,
            sharedCount: moment.sharedCount,
            zanCount: moment.zanCount,
            originalUser: originalUser,
            recommendedUser: recommendedUser,
            hongbaoRestCount: moment.hongbao && (moment.hongbao.totalCount - moment.hongbao.usedCount) || 0
          }
          //红包被当前用户领取
          if(moment.hongbao && hongbaoGetUsers[moment.hongbao.order + ""]){
              for(var i = 0 ; i < hongbaoGetUsers[moment.hongbao.order + ""].length;i++){
                if(hongbaoGetUsers[moment.hongbao.order + ""][i].userId == userId){
                  momentItem.hongbaoRestCount = -1;
                  break;
                }
              }
          }
          //红包已过期
          if(moment.hongbao && moment.hongbao.expiredAt < Date.now()){
            momentItem.hongbaoRestCount = -1;
          }
          //红包动态不是首发
          if(moment.hongbao && !moment.isOriginal){
            momentItem.hongbaoRestCount = -1;
          }
          return momentItem;
        })
        return moments;
      })
  },
  findMomentAllInfoById: function (id) {
    var cond = {
      _id: id,
      isDeleted: false
    }
    return model.findOne(cond).populate("hongbao").populate('recommendedUser', 'name docChatNum shopVenderApplyStatus shopName').exec();
  },
};