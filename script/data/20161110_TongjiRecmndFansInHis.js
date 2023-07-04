/**
 * 统计历史上推荐粉丝的数据,初始化数据
 */
// TODO 1. 查询交易数据中所有的首次关注奖励列表 List【cId, fromId, createdAt】
// TODO 2. 根据奖励，查询奖励前最近一次回话订单, 获取 【toId, fromId, weight】
// TODO 3. 新增、修改
var
  Promise = require('promise'),
  _ = require('underscore'),
  commonUtil = require('../../lib/common-util'),
  OrderService = require('../../app/services/OrderService'),
  Transaction = require('../../app/services/TransactionMysqlService'),
  DoctorService = require('../../app/services/DoctorService');

Transaction.execSqls(Transaction.genFindFavRewardSql())
    .then(function(_list){
          console.log("Trx : " + _list.length + " : " );//+ JSON.stringify(_list));
          var execs = [];// 待执行promise
          var chgs = [];// 待更新数据
          var updates = [];
          // Get chgs, 
          _list.forEach(function(d){
            console.log("EachTrxs: " + d.fromId + " : " + d.userId + " : " + d.createdAt);
            var cond = {
              customerId: d.userId,
              type: "phone",
              direction: "C2D",
              createdAt: {$lt: d.createdAt},
              isDeleted: false
            };
            var chg = {}
            chg.fromId = d.fromId;
            execs.push(
                OrderService.commonFindOne(cond)//批量获取 toIds;
                .then(function(_order){
                    if (_order){
                        chg.toId = _order.doctorId;
                        console.log("New Chgs: " + JSON.stringify(chg));
                        var index = _.findIndex(chgs, chg);
                        if (index>=0){
                            chgs[index].weight += 1;
                        } else{
                            chg.weight = 1;
                            chgs.push(chg);
                        }
                    }
                }));
          });

          // Bath exec
          Promise.all(execs).then(function(){
            console.log("2. Begin updates " + chgs.length);
            chgs.forEach(function(d){
              console.log("EachChgs: " + d.fromId + " : " + d.toId)  
              updates.push(DoctorService.getDocRelByIds("recmnd_fans", d.fromId, d.toId)
              .then(function(_rel){
                if (_rel){
                  console.log("Upd Rel....");  
                  return DoctorService.addRelWeight(_rel._id, d.weight);
                }else{
                  console.log("Create Rel....");
                  return DoctorService.createRel({
                    fromId: d.fromId, 
                    fromRef: commonUtil.getObjectIdByStr(d.fromId),
                    toId: d.toId,
                    toRef: commonUtil.getObjectIdByStr(d.toId),
                    weight: d.weight
                  });
                }
              }))
            })
            console.log("Begin exec updates: " + updates.length);
            Promise.all(updates).then(function(){
              console.log("Finally End");
            }, function(err){
              console.log("Finally Err: " + err);
            })
          }, function(err){
            console.log("Err: " + err);
          })

    }) 
  