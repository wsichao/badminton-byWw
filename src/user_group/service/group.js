/**
 * 用户分组Service
 */

const co = require('co');
const user_group_model = Backend.model('user_group', undefined, 'user_group');
const content_targeting_model = Backend.model('user_group', undefined, 'contentTargeting');
const user_factory_amount_model = Backend.model('user_group', undefined, 'userFactoryAmount');
const async = require('async');
const reimburse_model = require('../../../app/models/Reimburse');
const Q = require('q');
const _ = require('underscore');
const mongoose = require('mongoose');

const getMaxTime = function (time) {
  //time 是当月的启始时间
  //获取最大时间范围
  let timeObj = new Date(time);
  timeObj.setMonth(timeObj.getMonth() + 1);
  return timeObj.getTime() - 1;
}
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

module.exports = {
  /**
   * 查询所有初级的group中符合的user
   * @return Promise<>
   */
  getAllSampleGroupMatchUser: function (user_id) {
    let self = this;
    user_id = mongoose.Types.ObjectId(user_id + '')
    return co(function* () {
      let plan_ids = yield reimburse_model.aggregate([
        {$match :
          {
            checkStatus : 1,
            user : user_id
          }
        },
        { $group: { _id: "$planId", count: { $sum: 1 } } }
        ]).exec();
      plan_ids = _.map(plan_ids,'_id');
      let sample_user_groups = yield user_group_model.find({type:10,isDeleted:false,'validRule.planId':{$in:plan_ids}})
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
      o.map = function () { emit(this.user, this.reimburseCount) }

      o.reduce = function (k, vals) { return Array.sum(vals)}

      o.query = {
        planId : group.validRule.planId,
        createdAt :{$gte : group.validRule.time,$lte :getMaxTime(group.validRule.time)},
        checkStatus : 1,
        user : user_id,
        isDeleted : false
      }
      o.out = {inline:1};
      reimburse_model.mapReduce(o, function (err, results) {
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

  /**
   * 获取当前用户的可补贴的分组
   * @param userId
   * @param group_map 定向内容会有值；否则没有值
   */
  getGroupPlanDrugs: function (userId) {
    const self = this;
    let validGroups = [];
    return co(function* (){
      // 初级分组
      const group_map = yield self.getAllSampleGroupMatchUser(userId);
      // console.log('group_map:', group_map);
      // 高级分组
      const groups = yield user_group_model.find({ type: 20, isDeleted: false,
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
   * 获取内容定向文章, 按权重排序
   * @param userId
   * @returns { articleId, weight}
   */
  getGroupArticles: function (userId) {
    const self = this;
    return co(function* (){
      const groupIds = yield self.getGroupPlanDrugs(userId);
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
        factoryId: {$first: '$factoryId'},
        startTime: {$first: '$startTime'},
      };
      const sort = {
        'startTime': -1
      };
      // console.log('aggregate:', match, group, sort);
      const contents = yield content_targeting_model.aggregate([
        {$match: match},
        {$sort: sort},
        {$group: group}
      ]).exec();
      // console.log('contents:', contents);

      let factoryIds = [];
      let article_day_map = {};
      for(let i=0; i<contents.length; i++){
        let content = contents[i];
        factoryIds.push(content.factoryId);
        let day = Math.ceil(((Date.now()-content.startTime)/(24 * 60 * 60 * 1000)));
        article_day_map[content.articleId + ''] = day;
      }
      const items = yield user_factory_amount_model.find({user: userId, factory: {$in: factoryIds}, isDeleted: false});
      // console.log('items:', items);
      let factory_amount_map = _.indexBy(items, 'factory');
      let articles = [];
      for(let i=0; i<contents.length; i++){
        let content = contents[i];
        let article = {
          _id: content.articleId,
          weight: 0,
          startTime: content.startTime
        };
        // console.log('map:', factory_amount_map, article_day_map);

        let amount = factory_amount_map[content.factoryId + ''] && factory_amount_map[content.factoryId + ''].amount || 0;
        amount = amount >= 100 ? 100 : amount;
        let day = article_day_map[content.articleId + ''] || 0;
        day = day >= 30 ? 0 : 30-day;
        console.log('weight:', amount, day);
        let weight = ((amount/100 + day/30) * 0.5).toFixed(3);
        article.weight = Number(weight);
        articles.push(article);
      }
      // console.log('articles 0:', articles);
      articles = articles.sort(function(a, b){
        if(a.weight === b.weight){
          return b.startTime - a.startTime
        }
        return b.weight - a.weight;
      });
      // console.log('articles 1:', articles);
      articles = articles.map(function(article){{
        return article._id;
      }});
      // console.log('articles:', articles);
      return articles;
    });
  }
};
