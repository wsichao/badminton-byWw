/**
 * 渠道分组Service
 */

const co = require('co');
const user_channel_group_model = Backend.model('tag_code_user_group', undefined, 'userChannelGroup');
const channel_content_targeting_model = Backend.model('tag_code_user_group', undefined, 'channelContentTargeting');
const mongoose = require('mongoose');
const external_drug_order_model = Backend.model('tag_code_user_group',undefined,'external_drug_order');
const _ = require('underscore');
const Q = require('q');
/**
 * 并集、交集、差集的计算方法
 * @type {{union: groupOps.union, intersection: groupOps.intersection, difference: groupOps.difference}}
 */
const groupOps = {
  union: function (r1, r2) {
    if(r2 === undefined) return r1;
    return r1 || r2;
  },
  intersection: function (r1, r2) {
    if(r2 === undefined) return r1;
    return r1 && r2;
  },
  difference: function (r1, r2) {
    if(r2 === undefined) return r1;
    if( r1 && !r2) return true;
    return false;
  }
};

/**
 * 用户分组规则的，并集、交集、差集的计算
 * @param groups
 * @param symbols
 * @param group_map
 * @returns {*}
 */
const rulesCompute = function(groups, symbols, group_map){
  let opFuv = groupOps[symbols[0]];
  if((opFuv === undefined) || !symbols[0]){
    console.log('没有该计算方法：', symbols[0]);
    return false;
  }
  let result = opFuv(group_map[groups[0] + ''] || false, group_map[groups[1] + ''] || false);
  let index = 1;
  while(index < symbols.length){
    if(!symbols[index]){
      index++;
      continue;
    }
    opFuv= groupOps[symbols[index]];
    if(opFuv === undefined){
      console.log('没有该计算方法：', symbols[index]);
      index++;
      return false;
    }
    result = opFuv(result, group_map[groups[index+1]] || false);
    index++;
  }
  return result;
};

const getMaxTime = function (time) {
  //time 是当月的启始时间
  //获取最大时间范围
  let timeObj = new Date(time);
  timeObj.setMonth(timeObj.getMonth() + 1);
  return timeObj.getTime() - 1;
}

module.exports = {
  /**
   * 获取当前用户的所有符合的渠道会员分组，包括初级分组，和高级分组
   * @param userId
   */
  getValidChannelGroups: function (userId) {
    const self = this;
    let validGroups = [];
    return co(function* (){
      // 初级分组
      const group_map = yield self.getAllSampleGroupByUser(userId);
      // console.log('group_map:', group_map);
      // 高级分组
      const groups = yield user_channel_group_model.find({ type: 20, isDeleted: false,
        'validRule.group': {$in: Object.keys(group_map)}}, 'validRule');
      // console.log('groups:', groups);

      for(let i=0; i<groups.length; i++){
        let group = groups[i];
        let validRule = group.validRule;
        if(!validRule.group || !validRule.symbol){
          console.log(group.id +': 分组数据错误, 没有分组或者高级操作符');
          continue;
        }
        if(validRule.group.length == 1 && (group_map[group._id + ''] === true)){
          validGroups.push(group._id);
          continue;
        };
        if(validRule.group.length <  validRule.symbol.length){
          console.log(group.id +':分组数据错误，数据缺失');
        }
        const isValid = rulesCompute(validRule.group, validRule.symbol, group_map);
        if(isValid){
          validGroups.push(group._id);
        }
      }
      Object.keys(group_map).forEach(function(key){
        if(group_map[key]){
          validGroups.push(mongoose.Types.ObjectId(key));
        }
      });
      console.log('validGroups:', validGroups);
      return validGroups;
    })
  },

  /**
   * 获取渠道定向文章
   * 1、如果同一厂家多篇文章推向该用户，则只保留发布时间最近的一篇文章
   * 2、如果不同厂家的多篇文章，则按照时间倒排
   * @param userId
   * @returns { articleId, weight}
   */
  getChannelGroupArticles: function (userId) {
    const self = this;
    return co(function* (){
      const groupIds = yield self.getValidChannelGroups(userId);
      // console.log('groupIds:', groupIds);

      const match = {
        isDeleted: false,
        articleExist: true,
        isStart: true,
        startTime: {$lt: Date.now()},
        endTime: {$gt: Date.now()},
        userGroup: {$in: groupIds, $elemMatch:{$ne:null}},
      };
      const group = {
        _id: '$factoryId',
        articleId: {$first: '$articleId'},
        startTime: {$first: '$startTime'},
      };
      const sort = {
        'startTime': -1
      };
      // console.log('aggregate:', match, group, sort);
      const contents = yield channel_content_targeting_model.aggregate([
        {$match: match},
        {$group: group},
        {$sort: sort}
      ]).exec();
      // console.log('contents:', contents);
      const articles = contents.map(function(content){{
        return content.articleId;
      }});
      // console.log('articles:', articles);
      return articles;
    });
  },

  /**
   * 查询所有符合的user初级的group
   * @return Promise<>
   */
  getAllSampleGroupByUser: function (user_id) {
    let self = this;
    user_id = mongoose.Types.ObjectId(user_id + '')
    return co(function* () {
      let drug_infos = yield external_drug_order_model.aggregate([
        {$match :
          {
            status : 2,
            userId : user_id
          }
        },
        { $group: { _id: {drugFactory: '$drugFactory',drugName:'$drugName'}, count: { $sum: 1 } } }
      ]).exec();
      drug_infos = _.map(drug_infos,function(item){

        return (item._id.drugFactory + '-' + item._id.drugName)
      });
      let sample_user_groups = yield user_channel_group_model.aggregate([
        {$match : {type:10,isDeleted:false}},
        { $project:
          { drug_info: { $concat: [ "$validRule.factoryName", "-", "$validRule.drugName" ]},
            validRule : 1,
            channelId : 1
          }
        },
        {$match : {drug_info : {$in : drug_infos} }}
      ]).exec();
      let sample_user_groups_Index = {};
      //console.log(sample_user_groups);
      for(let i = 0 ; i < sample_user_groups.length ; i++){
        let item = sample_user_groups[i];
        let judge = yield self.isUserBelongGroup(item,user_id);
        console.log(judge);
        sample_user_groups_Index[item._id] = judge;
      }
      return sample_user_groups_Index;
    });
  },

  /**
   * 获取初级分组中的用户信息是否符合分组
   * @param group : 分组对象
   * @param user_id : 用户唯一标识
   * @return Promise<>
   */
  isUserBelongGroup: function (group,user_id) {
    let self =this;
    return co(function* () {
      let defer = Q.defer();
      var o = {};
      o.map = function () { emit(this.userId, this.orderTotal) }

      o.reduce = function (k, vals) { return Array.sum(vals)}

      o.query = {
        drugFactory : group.validRule.factoryName,
        drugName : group.validRule.drugName,
        orderTime :{$gte : group.validRule.time,$lte :getMaxTime(group.validRule.time)},
        status : 2,
        userId : user_id,
        isDeleted : false,
        channelId : group.channelId
      }
      o.out = {inline:1};
      external_drug_order_model.mapReduce(o, function (err, results) {
        //console.log(results);

        //console.log(group);
        if(results && results.length && results[0].value >= group.validRule.minCount
          && results[0].value <= group.validRule.maxCount){
          defer.resolve(true)
        }else{
          defer.resolve(false)
        }

      })
      return defer.promise;
    });
  },
};
