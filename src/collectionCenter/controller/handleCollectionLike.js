'user strict';
let userService = Backend.service('common', 'user_service'),
    collectionCenterService = Backend.service('collectionCenter', 'collectionCenter'),
    commonUtil = require('../../../lib/common-util'),
    co = require('co');


module.exports = {
    __rule: function (valid) {
        return valid.object({
            planId: valid.string().required(),
            drugId: valid.string().required()
        });
    },
    mockAction: function () {
        let resObj = {};
        return this.success(resObj);
    },

    putAction: function () {
        let self = this;
        let req = self.req;
        let planId = req.body.planId || '';
        let drugId = req.body.drugId || '';
        let userId = self.req.identity && self.req.identity.user && self.req.identity.user._id;


        let result = co(function* () {
            let collectionInfo = yield collectionCenterService.getOneCollectionCenter(userId, planId, drugId);
            console.log('操作记录',collectionInfo);
            if(collectionInfo){//修改记录
                if(collectionInfo.isCollected){//取消收藏
                    console.log('取消收藏');
                    let udp=yield collectionCenterService.delCollectionCenter(collectionInfo._id,userId);
                }else{//收藏
                    let del=yield collectionCenterService.udpCollectionCenter(collectionInfo._id,userId);

                }

            }else{//创建记录-收藏
                let addCollection = yield collectionCenterService.insertCollectionCenter(userId, planId, drugId);
            }

            return self.success({});
        }).catch(function (err) {
            console.log(err)
        })

        return result;
    }
};