'user strict';
let commonUtil = require('../../../lib/common-util'),
    // regions = Backend.model('drugAllowance', undefined, 'regions'),
    FactoryDrugRelService = require('./../../../app/services/FactoryDrugRelService'),
    ReimburseService = require('./../../../app/services/ReimburseService'),
    drugService = Backend.service('allowance', 'drugService'),
    TagCodeService = require('./../../../app/services/TagCodeService'),
    _ = require('underscore'),
    co = require('co');


module.exports = {
    __rule: function (valid) {
        return valid.object({
            planId: valid.array().required(),
            reimburseCount: valid.array().required(),
            reimburseImgs: valid.array().required(),
            buyChannelId: valid.string().required(),
            buyChannelName: valid.string().required(),
            isConfirmed: valid.boolean().required()
        });
    },
    mockAction: function () {
        let resObj = {
            code: '200',
            msg: '',
            /*data: {
                user: "5a9ce331d741bbbe658412f4",
                userName: '啦啦',
                userPhoneNum: '15600022839',
                factoryCode: 504991,
                factoryName: '0205日9点半厂家',
                planId: '5ab0d5630dd25d31fa6a6c98',
                planName: '123',
                drugName: '清肺止咳糖浆',
                drugPackage: '234',
                drugId: '5a78183d0dd25d7b5bfd0e0e',
                drugDesc: '44',
                reimbursePrice: 3,
                reimburseCount: 2,
                buyChannel: '5aaa320c0dd25d093b7083bb',
                buyChannelName: '澳门大药房',
                province: '澳门特别行政区',
                city: '澳门特别行政区',
                district: '路氹填海区',
                _id: '5ad40b5fbfa6485b50bebd26',
                statisticsUpdatedAt: 1523845983051,
                updatedAt: 1523845983044,
                createdAt: 1523845983044,
                isDeleted: false,
                channelCheckStatus: 100,
                remark: '',
                checkStatus: 0,
                reimburseImgs: ['FkN7TsJhMxGcKe6Rghzco-pjVaCy'],
                images: ['https://cdn.juliye.net/FpF5Kr0BLo1oxg1djJCDBqbZJ37q']

            }*/
        };
        return this.success(resObj);
    },
    postAction: function () {

        let self = this;
        let req = self.req;
        let body = self.req.body;

        let planIds = body.planId, reimburseCount = body.reimburseCount, reimburseImgs = body.reimburseImgs,
            buyChannelId = body.buyChannelId, buyChannelName = body.buyChannelName, isConfirmed = body.isConfirmed;
        // buyChannelId = '5aaa320c0dd25d093b7083bb';
        // // console.log('参数', buyChannelId,buyChannelName);
        // planIds = ['5ab0d5630dd25d31fa6a6c98',
        //     '5ab4aa610dd25d4b73fc2f42', '5ab8bce70dd25d64afb600ec'], reimburseCount = [1, 1, 1], reimburseImgs = ['76F9CF29-E181-4FE0-827E-C8B52BD9706B'];

        let user = req.identity && req.identity.user ? req.identity.user : null;

        if (!user || !user._id) {
            return self.fail(1503);
        }
        let userId = user._id;

        let result = co(function* () {
                //在运行的会员维护计划
                let factoryDrugPlanAll = yield FactoryDrugRelService.getFactoryDrugRelAll({
                    _id: {$in: planIds},
                    // stopPlan: false  //查询全部计划
                });
                factoryDrugPlanAll = JSON.parse(JSON.stringify(factoryDrugPlanAll));
                let factoryDrugPlanRun = [];
                for (let key in factoryDrugPlanAll) {
                    if (factoryDrugPlanAll[key].stopPlan == false) {
                        factoryDrugPlanRun.push(factoryDrugPlanAll[key]);
                    }
                }

                let drugIds = [], factoryDrugPlan = [];
                let factoryDrugPlanRunMap = _.indexBy(factoryDrugPlanRun, '_id');
                for (let key in planIds) {
                    if (factoryDrugPlanRunMap[planIds[key]]) {//按照planIds的顺序排序factoryDrugPlan
                        factoryDrugPlanRunMap[planIds[key]].planId = factoryDrugPlanRunMap[planIds[key]]._id;
                        factoryDrugPlanRunMap[planIds[key]].reimburseCount = reimburseCount[key];
                        factoryDrugPlan.push(factoryDrugPlanRunMap[planIds[key]]);
                        drugIds.push(factoryDrugPlanRunMap[planIds[key]].drugId);
                    }
                }


                if ((factoryDrugPlanRun.length < planIds.length) && !isConfirmed) {//部分药品无法补贴
                    let errDrug = '药品', errCount = 0;
                    let factoryDrugPlanAllMap = _.indexBy(factoryDrugPlanAll, '_id');
                    for (let key in planIds) {
                        if (!factoryDrugPlanRunMap[planIds[key]]) {
                            console.log('药品名称', factoryDrugPlanAllMap[planIds[key]]);
// errDrug.push(factoryDrugPlanMap[planIds[key]].drugName);
                            if (errCount == 0) {
                                errDrug += '"' + factoryDrugPlanAllMap[planIds[key]].drugName + '"';
                            } else {
                                errDrug += '、' + '"' + factoryDrugPlanAllMap[planIds[key]].drugName + '"';
                            }
                            errCount++;
                        }
                    }

                    if (planIds.length == errCount) {
                        return self.fail(2441);
                    }

                    errDrug += '已停止补贴，是否继续报销剩余' + (planIds.length - errCount) + '款药品？';
                    console.log('部分可报销测试', errDrug);

                    return self.success({code: '2440', msg: errDrug});

                }
                factoryDrugPlan = yield drugService.drugLimit(userId, drugIds, planIds, factoryDrugPlan);


                if (!isConfirmed) {
                    let errDrug = '药品', errCount = 0;
                    for (let key in factoryDrugPlan) {
                        if ((factoryDrugPlan[key].limitCount < reimburseCount[key])) {
                            if (errCount == 0) {
                                errDrug += '"' + factoryDrugPlan[key].drugName + '"';
                            } else {
                                errDrug += '、' + '"' + factoryDrugPlan[key].drugName + '"';
                            }
                            errCount++;
                        }
                    }

                    if (errCount) {
                        if (planIds.length == errCount) {
                            return self.fail(2441);
                        }

                        errDrug += '已停止补贴，是否继续报销剩余' + (planIds.length - errCount) + '款药品？';
                        console.log('limitCount error');
                        return self.success({code: '2440', msg: errDrug});
                    }
                }


                let tagCode = '';
                if (buyChannelId) {
                    tagCode = yield TagCodeService.getTagCode({_id: buyChannelId});
                }

                let drugInfos = yield drugService.getDrugList({_id: {$in: drugIds}});
                let drugInfoMap = _.indexBy(drugInfos, '_id');

                for (let key in factoryDrugPlan) {
                    if ((factoryDrugPlan[key].limitCount > 0) && (factoryDrugPlan[key].limitCount >= factoryDrugPlan[key].leastCount)) {//具有剩余补贴数量的计划，才可以补贴；剩余报销数>=最小补贴数才可以补贴
                        let reimburse = {
                            user: userId,
                            userName: user.name,
                            userPhoneNum: user.phoneNum,
                            factoryCode: factoryDrugPlan[key].factoryCode,
                            factoryName: factoryDrugPlan[key].factoryName,//药品厂家
                            planId: factoryDrugPlan[key]._id,//计划ID
                            planName: factoryDrugPlan[key].planName,//厂家计划名称
                            drugName: drugInfoMap[factoryDrugPlan[key].drugId].name,
                            drugPackage: drugInfoMap[factoryDrugPlan[key].drugId].packageInfo,
                            images: drugInfoMap[factoryDrugPlan[key].drugId].images,
                            drugId: drugInfoMap[factoryDrugPlan[key].drugId]._id,
                            drugDesc: drugInfoMap[factoryDrugPlan[key].drugId].desc,
                            reimbursePrice: factoryDrugPlan[key].reimbursePrice,
                            reimburseCount: factoryDrugPlan[key].reimburseCount,
                            reimburseImgs: reimburseImgs,
                            buyChannel: buyChannelId || '',
                            buyChannelName: buyChannelName || '',
                            province: '',
                            city: '',
                            district: ''
                        };
                        if (tagCode && tagCode.length > 0) {
                            reimburse.province = tagCode[0].province || '';
                            reimburse.city = tagCode[0].city || '';
                            reimburse.district = tagCode[0].district || '';
                        }
                        console.log('申请信息', reimburse);
                        let reimburseInert = yield ReimburseService.createReimburse(reimburse);
                        console.log('插入信息', reimburseInert);
                    }
                }


                return self.success({
                    code: '200',
                    msg: ''
                });
            }
        ).catch(function (err) {
            console.log(err);
        });
        return result;
    }
};
