"use strict";
let collectionCenter = Backend.model('collectionCenter', undefined, 'collectionCenter'),
    mongoose = require('mongoose'),
    ObjectId = mongoose.Types.ObjectId,
    async = require('async'),
    co = require('co'),
    _ = require('underscore'),
    Q = require('q');
module.exports = {
    getOneCollectionCenter: function (userId, planId, drugId) {
        let collection = {user: userId, type: '1', planId: planId, drugId: drugId,isCollected:true,isDeleted:false};
        return collectionCenter.findOne(collection);
    },
    getCollectionCenterCond: function (userId, planIds, drugIds) {
        let collection = {user: userId, type: '1', planId: {$in: planIds}, drugId: {$in: drugIds}, isCollected: true,isDeleted:false};
        return collectionCenter.find(collection);
    },
    getCollectionCenterList: function (userId, bookmark, pageSize) {
        let cond = {user: new ObjectId(userId), type: '1', isCollected: true,isDeleted:false};

        // if (bookmark > 1) {
        //     cond.createdAt = {$lt: bookmark};
        // }

        return collectionCenter.aggregate([
            {'$match': cond},
            {'$lookup': {from: 'factoryDrugRel', localField: 'planId', foreignField: '_id', as: 'factoryDrugRelInfo'}},
            {'$lookup': {from: 'drug', localField: 'drugId', foreignField: '_id', as: 'drugInfo'}},
            {'$sort': {collectedAt: -1}},
            // {'$limit': pageSize}
        ]).exec();
    },
    insertCollectionCenter: function (userId, planId, drugId) {
        let collection = {user: userId, type: '1', planId: planId, drugId: drugId};
        return collectionCenter.create(collection);
    },
    udpCollectionCenter: function (id, userId) {
        return collectionCenter.findOneAndUpdate({_id: id, user: userId}, {
            collectedAt: Date.now(),
            isCollected: true,
            isDeleted:false
        }, {new: true});
    },
    delCollectionCenter: function (id, userId) {
        return collectionCenter.findOneAndUpdate({_id: id, user: userId,isCollected: true,isDeleted:false}, {
            isCollected: false,
            collectedAt: Date.now()
        }, {new: true});
    },
    getUserCollections:function (userId) {
        return collectionCenter.find({user: userId,isCollected: true,isDeleted:false});
    },
    getCollectionsByPlanId : function(drug_id){
      let cond = {
        planId : drug_id,
        isDeleted : false,
        type:1,
        isCollected : true
      }
      let collections = [];
      let defer = Q.defer();
      return co(function* () {
        let userCount =  yield collectionCenter.count(cond);
        var counter = 0;
        async.whilst(
          function () {
            return counter < userCount/1000 ;
          },
          function (cb) {
            co(function* () {
              let colections_one_page =  yield collectionCenter.find(cond).skip(counter*1000).limit(1000);
              collections = collections.concat(colections_one_page);
              counter++;
              cb();
            })
          },
          function (err, result) {
            //console.log(collections);
            defer.resolve(collections);
            console.log('all has completed');
          });
        return defer.promise;
      });

    }
};