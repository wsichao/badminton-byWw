/**
 * Created by fly on 2017－05－27.
 */

'use strict';
let _model = Backend.model('common', undefined, 'customer');
let moment_msg_model = Backend.model('common', undefined, 'moment_msg');
let config_service = Backend.service('common', 'config_service');
let moment_service = Backend.service('1/moment', 'moment_service');
let doctor_service = Backend.service('common', 'doctor_service');
let invite_service = Backend.service('1/red_paper', 'invite_record_service');

let momentUserFields = '_id  name shopName avatar shopAvatar marketing shopType shopProp shopVenderApplyStatus momentLocation momentRef shopLocation currentMoment momentUpdatedAt momentType';

let _genFreeMembershipForTheNew = function (userId) {
  let createMembership = Backend.service('1/membership', 'membership_card').createMembership;
  let createMembershipTrade = Backend.service('1/membership', 'membership_trade').createMembershipTrade;
  let config_id = FREE_MEMBERSHIP_FOR_NEW_CONFIG_ID;
  let trade = null;
  return config_service.getConfigInfoById(config_id)
    .then(function (_config) {
      if (!_config) {
        return;
      }
      let field = _config.field;
      let membershipInfo = field && field.membership || {};
      let now_ts = Date.now();
      let activity_begin_ts = field && field.beginAt || now_ts;
      let activity_end_ts = field && field.endAt || (now_ts + 1);
      //活动未开始或者活动结束
      if (now_ts < activity_begin_ts || now_ts > activity_end_ts) {
        return;
      }
      let membership_id = getNewObjectId();
      let membership = {
        _id: membership_id,
        userId: userId,
        validAt: membershipInfo.validAt || now_ts,
        expiredAt: membershipInfo.expiredAt || getDateEndTSInNaturalDays(now_ts, 7),
        cardNo: membershipInfo.cardNo || FREE_MEMBERSHIP_FOR_NEW,
        balance: membershipInfo.balance || 10,
        totalVal: membershipInfo.totalVal || 10,
      }
      trade = {
        userId: userId,
        type: 'get',
        value: membership.totalVal,
        memberships: [{
          membershipId: membership_id,
          cardNo: membership.cardNo,
          cost: membership.totalVal
        }]
      }
      //console.log(membership, trade);
      return createMembership(membership)
        .then(function () {
          return createMembershipTrade(trade);
        });
    }, function (err) {
      console.log(err);
      return;
    })
};
module.exports = {
  getInfoByUserId: function (user_id, fields, optoins) {
    let cond = {
      isDeleted: false,
      _id: user_id,
    }
    fields = fields || '';
    optoins = optoins || {};
    return _model.findOne(cond, fields, optoins).exec()
  },
  getInfoByUserIds: function (user_ids, fields, optoins) {
    let cond = {
      isDeleted: false,
      _id: { $in: user_ids },
    }
    fields = fields || '';
    optoins = optoins || {};
    return _model.find(cond, fields, optoins).exec()
  },
  getInfoByDocChatNums: function (docChatNums, fields, optoins) {
    let cond = {
      isDeleted: false,
      docChatNum: { $in: docChatNums },
    }
    fields = fields || '';
    optoins = optoins || {};
    return _model.find(cond, '', optoins).exec()
  },
  getInfoByPhoneNum: function (phoneNum, fields, optoins) {
    let cond = {
      isDeleted: false,
      phoneNum: phoneNum,
    }
    fields = fields || '';
    optoins = optoins || {};
    return _model.findOne(cond, '', optoins);
  },
  insertUserInfo: function (user) {

    return _model.create(user);
  },
  /**
   * 获取地图上矩形区域GPS坐标内的商铺；可领券数>0或者有新动态的商户
   * @param coordinate 左下坐标;右上坐标 eg: coordinate=lat1,lon1;lat2,lon2
   * @param options
   */
  getShopsInRectMapArea: function (coordinate, options) {
    coordinate = getCoordinateFromStr(coordinate);
    let left_bottom_coordinate = coordinate.left_bottom_coordinate;
    let right_top_coordinate = coordinate.right_top_coordinate;
    let validTS = getDateEndTS(Date.now()) - momentVisibleDays * 24 * 60 * 60 * 1000; //3个自然日内动态会显示
    let match = {
      'shopLocation': {
        $geoWithin: {
          $box: [
            left_bottom_coordinate,
            right_top_coordinate
          ]
        }
      },
      //'marketing.cps':{$ne:null},
      'isDeleted': false,
      'shopVenderApplyStatus': { $in: shopAuthorizedStatus },
      '$or': [
        {
          momentRef: { $ne: null },
          currentMoment: { $nin: [null, ''] },
          momentUpdatedAt: { $gt: validTS }, //b - 3 < a
          'marketing.isMarketingClosed': { $ne: true },
          'shopProp': { $nin: opShopProp },
        },
        {
          //'marketing.cps': {$gte: 1},
          'marketing.remainMemberSize': { $gt: 0 },
          'marketing.isMarketingClosed': { $ne: true },
          'shopProp': { $nin: opShopProp },
        },
        {
          'shopProp': { $in: opShopProp }
        }]
    };
    return _model.find(match, "_id marketing shopName shopType shopLocation shopProp currentMoment momentUpdatedAt")
      .sort({ "marketing.cps": -1 })
      .exec();
  },
  /**
   * 获取地图上矩形区域GPS坐标内的有动态非商户用户,动态为最近3天内;
   * @param coordinate 左下坐标;右上坐标 eg: coordinate=lat1,lon1;lat2,lon2
   * @param options
   */
  getUsersInRectMapArea: function (coordinate, options) {
    coordinate = getCoordinateFromStr(coordinate);
    let left_bottom_coordinate = coordinate.left_bottom_coordinate;
    let right_top_coordinate = coordinate.right_top_coordinate;
    let validTS = getDateEndTS(Date.now()) - momentVisibleDays * 24 * 60 * 60 * 1000; //3个自然日内动态会显示
    let match = {
      //'momentLocation.0': {ne: 0},
      //'momentLocation.1': {ne: 0},
      'momentLocation': {
        //$exists: true,
        $geoWithin: {
          $box: [
            left_bottom_coordinate,
            right_top_coordinate
          ]
        }
      },
      'isDeleted': false,
      //'shopVenderApplyStatus': {$nin: shopAuthorizedStatus},
      momentRef: { $ne: null },
      '$or': [
        { currentMoment: { $nin: [null, ''] } },
        { momentType: 'pic' },
      ],
      momentUpdatedAt: { $gt: validTS }, //b - 3 < a
      //'shopProp': {$nin: opShopProp}
    };
    let limit = options && options.limit || 24;
    return _model.find(match, "_id  name  momentLocation currentMoment momentType momentUpdatedAt")
      .sort({ "momentUpdatedAt": -1 }).limit(limit)
      .exec();
  },
  /**
   * 新用户送10元会员额度，有效期7天，活动时间：上线时间开始，截止日期未定
   * @param userId
   * @returns {promise}
   */
  genFreeMembershipForTheNew: _genFreeMembershipForTheNew,
  /**
   * 发布动态的用户为自己所收藏的
   * @param coordinate
   * @param favorite_ref_ids, 所收藏的用户的副账户id
   * @returns {Promise|Array|{index: number, input: string}|*}
   */
  getFavoriteUsersWithMoment: function (coordinate, options) {
    //todo:@易翔 是否同时显示商户,商户动态和作为个人的动态, 结果为:不显示商户作为个人的动态
    //收藏的包含商户和非商户
    //有momentLocation为非商户
    //无momentLocation,有shopLocation为商户
    coordinate = getCoordinateFromStr(coordinate);
    let left_bottom_coordinate = coordinate.left_bottom_coordinate;
    let right_top_coordinate = coordinate.right_top_coordinate;
    let favorite_ref_ids = options && options.favorite_ref_ids || [];
    let maxDays = options && options.maxDays || momentVisibleDays;
    let maxNum = options && options.maxNum || 24;
    let validTS = getDateEndTS(Date.now()) - maxDays * 24 * 60 * 60 * 1000; //n个自然日内动态会显示
    let match = {
      doctorRef: { $in: favorite_ref_ids },
      'isDeleted': false,
      momentRef: { $ne: null },
      momentUpdatedAt: { $gt: validTS }, //b - 3 < a
      $and: [
        {
          $or: [
            {
              //有momentLocation为非商户
              shopVenderApplyStatus: { $nin: shopAuthorizedStatus },
              'momentLocation': {
                //$exists: true,
                $geoWithin: {
                  $box: [
                    left_bottom_coordinate,
                    right_top_coordinate
                  ]
                }
              }
            },
            { //商户
              shopVenderApplyStatus: { $in: shopAuthorizedStatus },
              'shopLocation': {
                //$exists: true,
                $geoWithin: {
                  $box: [
                    left_bottom_coordinate,
                    right_top_coordinate
                  ]
                }
              }
            },
          ]
        },
        {
          $or: [
            { currentMoment: { $nin: [null, ''] } },
            { momentType: 'pic' }
          ]
        }
      ]
    };
    let limit = options && options.maxNum || 24;
    return _model.find(match, momentUserFields)
      .sort({ "momentUpdatedAt": -1 }).limit(limit)
      .exec();
  },
  /**
   * 获取地图上矩形区域GPS坐标内的商铺；有新动态的商户;分为医疗或者非医疗
   * @param coordinate 左下坐标;右上坐标 eg: coordinate=lat1,lon1;lat2,lon2
   * @param options
   */
  getShopUsersWithMoment: function (coordinate, options) {
    coordinate = getCoordinateFromStr(coordinate);
    let left_bottom_coordinate = coordinate.left_bottom_coordinate;
    let right_top_coordinate = coordinate.right_top_coordinate;
    let maxDays = options && options.maxDays || momentVisibleDays;
    let maxNum = options && options.maxNum || 24;
    let validTS = getDateEndTS(Date.now()) - maxDays * 24 * 60 * 60 * 1000; //n个自然日内动态会显示
    let shopType = options && options.shopType || 'shop';
    let match = {
      'shopLocation': {
        $geoWithin: {
          $box: [
            left_bottom_coordinate,
            right_top_coordinate
          ]
        }
      },
      'isDeleted': false,
      momentRef: { $ne: null },
      momentUpdatedAt: { $gt: validTS }, //b - 3 < a
      'shopVenderApplyStatus': { $in: shopAuthorizedStatus },
      $and: [
        {
          '$or': [
            {
              'marketing.isMarketingClosed': { $ne: true },
              'shopProp': { $nin: opShopProp },
            },
            {
              'shopProp': { $in: opShopProp }
            }
          ]
        },
        {
          $or: [
            { currentMoment: { $nin: [null, ''] } },
            { momentType: 'pic' }
          ]
        }
      ]
    };
    if (shopType == 'shop') {
      match.shopType = { $nin: specialShopTypes }
    } else if (shopType == 'medical') {
      match.shopType = { $in: specialShopTypes }
    }
    return _model.find(match, momentUserFields)
      .limit(maxNum)
      .sort({ "momentUpdatedAt": -1 })
      .exec();
  },
  /**
   * 获取地图上矩形区域GPS坐标内的金融动态
   * @param coordinate
   * @param options
   * @returns {Promise|Array|{index: number, input: string}|*}
   */
  getFinanceUsersWithMoment: function (coordinate, options) {
    coordinate = getCoordinateFromStr(coordinate);
    let left_bottom_coordinate = coordinate.left_bottom_coordinate;
    let right_top_coordinate = coordinate.right_top_coordinate;
    let maxDays = options && options.maxDays || momentVisibleDays;
    let maxNum = options && options.maxNum || 24;
    let validTS = getDateEndTS(Date.now()) - maxDays * 24 * 60 * 60 * 1000; //n个自然日内动态会显示
    let match = {
      docChatNum: /^806/,
      'momentLocation': {
        $geoWithin: {
          $box: [
            left_bottom_coordinate,
            right_top_coordinate
          ]
        }
      },
      //'marketing.cps':{$ne:null},
      'isDeleted': false,
      momentRef: { $ne: null },
      momentUpdatedAt: { $gt: validTS }, //b - 3 < a
      $or: [
        { currentMoment: { $nin: [null, ''] } },
        { momentType: 'pic' }
      ]
    };
    return _model.find(match, momentUserFields)
      .limit(maxNum)
      .sort({ "momentUpdatedAt": -1 })
      .exec();
  },
  /**
   * 获取地图上矩形区域GPS坐标内,非商户,非医疗,非金融,动态
   * @param coordinate
   * @param favorite_ref_ids
   * @param options
   * @returns {Promise|Array|{index: number, input: string}|*}
   */
  getPersonalUsersWithMoment: function (coordinate, options) {
    //
    coordinate = getCoordinateFromStr(coordinate);
    let left_bottom_coordinate = coordinate.left_bottom_coordinate;
    let right_top_coordinate = coordinate.right_top_coordinate;
    let favorite_ref_ids = options && options.favorite_ref_ids || [];
    let maxDays = options && options.maxDays || momentVisibleDays;
    let maxNum = options && options.maxNum || 24;

    let validTS = getDateEndTS(Date.now()) - maxDays * 24 * 60 * 60 * 1000; //n个自然日内动态会显示
    let match = {
      //doctorRef: {$nin: favorite_ref_ids},//非收藏, @易翔 注释掉的原因:非商户,非医疗,非金融为个人
      docChatNum: /^80[^6]/, //非金融
      'shopVenderApplyStatus': { $nin: shopAuthorizedStatus }, //非商户,注释掉的原因:通过momentLocation来控制
      'momentLocation': {
        $geoWithin: {
          $box: [
            left_bottom_coordinate,
            right_top_coordinate
          ]
        }
      },
      'isDeleted': false,
      momentRef: { $ne: null },
      momentUpdatedAt: { $gt: validTS }, //b - 3 < a
      $or: [
        { currentMoment: { $nin: [null, ''] } },
        { momentType: 'pic' }
      ]
    };
    let fields = momentUserFields.replace('shopVenderApplyStatus', '');
    return _model.find(match, fields)
      .limit(maxNum)
      .sort({ "momentUpdatedAt": -1 })
      .exec();
  },
  /**
   * 获取地图上矩形区域GPS坐标内,所有,动态
   * @param coordinate
   * @param options
   * @returns {Promise.<T>|Promise}
   */
  getAllUsersWithMoment: function (coordinate, options) {
    coordinate = getCoordinateFromStr(coordinate);
    let left_bottom_coordinate = coordinate.left_bottom_coordinate;
    let right_top_coordinate = coordinate.right_top_coordinate;
    let maxDays = options && options.maxDays || momentVisibleDays;
    let maxNum = options && options.maxNum || 24;

    let validTS = getDateEndTS(Date.now()) - maxDays * 24 * 60 * 60 * 1000; //n个自然日内动态会显示
    let match_shop = {
      $or: [
        { currentMoment: { $nin: [null, ''] } },
        { momentType: 'pic' }
      ],
      shopVenderApplyStatus: { $in: shopAuthorizedStatus },
      'shopLocation': {
        $geoWithin: {
          $box: [
            left_bottom_coordinate,
            right_top_coordinate
          ]
        }
      },
      'isDeleted': false,
      momentRef: { $ne: null },
      momentUpdatedAt: { $gt: validTS }, //b - 3 < a
    };
    let match_other = {
      //非商户
      shopVenderApplyStatus: { $nin: shopAuthorizedStatus },//商户只显示一条动态
      'momentLocation': {
        $geoWithin: {
          $box: [
            left_bottom_coordinate,
            right_top_coordinate
          ]
        }
      },
      $or: [
        { currentMoment: { $nin: [null, ''] } },
        { momentType: 'pic' }
      ],
      'isDeleted': false,
      momentRef: { $ne: null },
      momentUpdatedAt: { $gt: validTS }, //b - 3 < a
    };
    let left_num = 0;
    let users = [];
    return _model.find(match_shop, momentUserFields)
      .limit(maxNum)
      .sort({ "momentUpdatedAt": -1 })
      .exec()
      .then(function (_shops) {
        //商户身份
        users = users.concat(_shops);
        //left_num = maxNum - _shops.length;
        //console.log('left_num:', left_num);
        //若商户发布带momentLocation的商户作为非商户身份,所以fields过滤掉shopVenderApplyStatus
        let fields = momentUserFields.replace('shopVenderApplyStatus', '');
        return _model.find(match_other, fields)
          .limit(maxNum)
          .sort({ "momentUpdatedAt": -1 })
          .exec()
      })
      .then(function (_others) {
        users = users.concat(_others);
        users.sort(function (x, y) {
          return y.momentUpdatedAt - x.momentUpdatedAt;
        });
        users = users.splice(0, maxNum);
        //console.log('users:', users);
        return users;
      })
  },
  /**
   * 搜索地图上矩形区域GPS坐标内,所有,动态
   * @param coordinate
   * @param options
   * @param pageSlice
   * @returns {Promise.<T>|Promise}
   */
  searchAllUsersWithMoment: function (coordinate, options, pageSlice) {
    coordinate = getCoordinateFromStr(coordinate);
    let left_bottom_coordinate = coordinate.left_bottom_coordinate;
    let right_top_coordinate = coordinate.right_top_coordinate;
    let exp = options && options.keyword ? new RegExp(options.keyword + '', 'i') : '';
    let condition = {
      $and: [
        {
          $or: [
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
            {
              'momentLocation': {
                $geoWithin: {
                  $box: [
                    left_bottom_coordinate,
                    right_top_coordinate
                  ]
                }
              },
            }
          ]
        },
        {
          $or: [
            {
              name: exp
            },
            {
              shopName: exp
            }
          ]
        }

      ],
      'isDeleted': false,
    }
    let result = {
      count: 0,
      items: []
    }
    return _model.find(condition, momentUserFields, pageSlice)
      .exec()
      .then(function (users) {
        result.items = users;
        console.log(1111111);
        return _model.count(condition, momentUserFields).exec()
      })
      .then(function (_count) {
        console.log(2222222);
        result.count = _count;
        return result;
      })
  },
  /**
   * count搜索地图上矩形区域GPS坐标内,所有,动态
   * @param coordinate
   * @param options\
   * @returns {Promise.<T>|Promise}
   */
  countSearchAllUsersWithMoment: function (options) {
    let exp = options && options.keyword ? new RegExp(options.keyword + '', 'i') : '';
    let condition = {
      $or: [
        {
          name: exp
        },
        {
          shopName: exp
        }
      ],
      'isDeleted': false,
    }
    return _model.count(condition)
      .exec()
  },
  /**
   * 搜索没有位置信息的用户
   * @param coordinate
   * @param options\
   * @returns {Promise.<T>|Promise}
   */
  SearchNoLocationUsersByKeyword: function (keyword, pageSlice) {
    let exp = keyword && keyword ? new RegExp(keyword + '', 'i') : '';
    let condition = {
      $and: [
        {
          $or: [
            {
              'shopLocation': { $exists: false }
            },
            {
              'shopLocation': []
            }

          ]
        },
        {
          $or: [
            {
              'momentLocation': { $exists: false }
            },
            {
              'momentLocation': []
            }

          ]
        },
        {
          $or: [
            {
              name: exp
            },
            {
              shopName: exp
            }
          ]
        }

      ],
      'isDeleted': false,
    };
    return _model.find(condition, momentUserFields, pageSlice);
  },
  getFavoriteUsersById: function (user_id) {
    let cond = {
      _id: user_id,
      isDeleted: false,
    }
    return _model.findOne(cond, 'favoriteDocs').exec();
  },
  /**
   * 发动态触发红包: 用户每天可获取该红包的次数
   * @param user_id
   * @param default_times 由配置文件给出,否则默认10次
   */
  getRestTimesToday: function (user_id, default_times) {
    let day = dateFormat(new Date(), 'yyyy-MM-dd');
    let key = day + '_' + user_id + '_rest_times';
    default_times = default_times || 10;
    return Backend.cache.get(key)
      .then(function (_val) {
        //console.log(key, _val);
        if (_val) {
          return Number(_val);
        }
        Backend.cache.setAt(key, default_times);
        return default_times;
      })
  },
  /**
   * 抢到红包以后关注发红包的用户
   */
  robRedPaperFollow: function (user_id, follow_id) {
    let that = this;
    return _model.update({ _id: user_id },
      {
        $push: { favoriteDocs: follow_id }
      }
    )
  },
  /**
   * 发动态触发红包: 减少用户每天可获取该红包的次数
   * @param user_id
   * @param default_times 由配置文件给出,否则默认10次
   */
  reduceRestTimesToday: function (user_id, default_times) {
    let day = dateFormat(new Date(), 'yyyy-MM-dd');
    let key = day + '_' + user_id + '_rest_times';
    default_times = default_times || 10;
    return Backend.cache.get(key)
      .then(function (_val) {
        if (_val && _val != 'null') {
          _val = Number(_val);
          _val = _val - 1;
        } else {
          _val = 9;
        }
        Backend.cache.setAt(key, _val);
        return _val;
      })
  },

  genUserFromWeb: function (inviter_id, phone) {
    let isRegistered = false;
    let condition = {};
    condition.phoneNum = phone;
    condition.isDeleted = false;
    let fields = '';
    let resObj = {
      isRegistered: false,
      isNewUser: false,
      invitee_id: ''
    }
    return _model.findOne(condition, fields)
      .exec().then(function (user) {
        if (user) {
          return invite_service.getInviteRecordByUserId(user._id + '')
            .then(function (_res) {
              if (_res) {
                resObj.isNewUser = true;
              }
              resObj.isRegistered = true;
              resObj.invitee_id = user._id + '';
              return resObj;
            })
        } else {
          //新用户注册
          let u = {
            source: 'docChat',
            usedApp: ['docChat'], //?
            from: 'web_invite',
            phoneNum: phone,
            phoneType: getPhoneType(phone),
            favoriteDocs: [DoctorId_00120],
            collectedDocs: [DoctorId_00120],
            deviceId: '',
            msgReadStatus: {
              all: true, //
              moment: true, //是否有未读的动态
              personal: false, //是否有未读的个人留言
              sys: false//是否有未读的系统通知
            }
          };
          // 4月24号前新用户免费送25元额度
          /*if(Date.now() < 1493049599000){
           u["membership.balance"] = 25
           }*/
          /* if (from == "webCall") {
           commonUtil.sendSms("1675196", phone, "#url#=" + constants.customerPublicDownloadURL);
           }*/
          var user;
          return _model.create(u)
            .then(function (_u) {
              user = _u;
              return _model.findOne({ _id: twoFourHotLineTeamId }, "momentRef")
            })
            .then(function (_twofour) {
              var momentData = {
                moment: _twofour.momentRef,
                momentUser: twoFourHotLineTeamId,
                msgCreatedAt: Date.now()
              }
              var data = {
                userId: user._id,
                momentList: [
                  momentData
                ]
              }
              //console.log(data);
              moment_msg_model.create(data);
            })
            .then(function () {
              var startNum = '801';
              var randNum = 6;
              var min = 1;
              return doctor_service.genDoctorChatNum(startNum, randNum, min);
            })
            .then(function (docChatNum) {
              console.log("docChatNum:" + docChatNum);
              var docData = {};
              docData.applyStatus = 'done';
              docData.docChatNum = docChatNum;
              docData.phoneNum = phone;
              docData.callPrice = {
                customerInitiateTime: 5,
                doctorInitiateTime: 5,
                initiatePayment: 0,
                initiateIncome: 0,
                paymentPerMin: 0,
                incomePerMin: 0,
                canLackMoney: false,
                lackedMoney: 0
              };
              docData.online = true;
              return doctor_service.applyTobeDoctor(docData);
            })
            .then(function (_doctor) {
              var update = {};
              update.doctorRef = _doctor._id;
              update.docChatNum = _doctor.docChatNum;
              var condition = {
                _id: user._id,
                isDeleted: false
              }
              return _model.findOneAndUpdate(condition, update, { new: true });
            })
            .then(function (_user) {
              //新用户送10元会员额度

              return _genFreeMembershipForTheNew(user._id + '');
            })
            .then(function () {
              return {
                isNewUser: true,
                isRegistered: false,
                invitee_id: user._id + ''
              }
            })
        }

      });
  },
  /**
   * 通过userIds和关键词查询用户
   * @param userIds
   * @param keyword
   * @param fields
   * todo:v5.28.0-增加查询就诊人
   */
  gentUsersByName: function (userIds, keyword, fields) {
    const cond = {
      _id: { $in: userIds },
      isDeleted: false
    };
    if (keyword) {
      cond.$or = [
        { name: new RegExp(keyword + '', 'i') },
        { phoneNum: keyword }
      ];
    }
    return _model.find(cond, fields || undefined);
  },
  /**
   *  通过关键词查询微信小程序用户
   * @param keyword
   * @param fields
   */
  getAppletUsers: function (keyword, fields) {
    const cond = {
      isDeleted: false,
      from: 'applet'
    };
    if (keyword) {
      keyword = keyword.replace(/\*/g,'\\*');
      cond.$or = [
        { name: new RegExp(keyword + '', 'i') },
        { phoneNum: keyword }
      ];
      delete cond["from"]; 
    };
    return _model.find(cond, fields || undefined).sort({createdAt:1});
  }
};
