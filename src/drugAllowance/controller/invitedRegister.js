'user strict';
let commonUtil = require('../../../lib/common-util'),
    proxy = require('./../../../app/configs/rpc').proxy,
    ValidateService = require('./../../../app/services/ValidateService'),
    userService = Backend.service('common', 'user_service'),
    invitationBonusLogService = Backend.service('activity', 'invitation_bonus_log'),
    _ = require('underscore'),
    co = require('co');


module.exports = {
    __rule: function (valid) {
        return valid.object({
            phoneNum: valid.string().required(),
            fromId: valid.string().required()
        });
    },
    mockAction: function () {
        let resObj = {
            code: '200',
            msg: '',
            data: {isNew: true}
        };
        return this.success(resObj);
    },
    postAction: function () {
        let self = this;
        let post = self.post;
        let phoneNum = post.phoneNum, authCode = post.authCode, fromId = post.fromId || '', id = post.cmsId || '',
            title;
        let result = co(function* () {
                let resObj = {code: '200', msg: '', data: {isNew: false}};
                // try {
                //     let valid = yield ValidateService.validateByPhone(phoneNum, authCode);
                // } catch (err) {
                //     console.log('错误错误', err);
                //     return self.fail(1502);
                // }

                let user = yield userService.getInfoByPhoneNum(phoneNum);
                // console.log('查到的用户信息',user);
                if (!user) {//未找到用户，进行注册
                    resObj.data.isNew = true;
                    let fromUserInfo = yield  userService.getInfoByUserId(fromId);
                    if (!fromUserInfo) {
                        return self.fail(1503);
                    }

                    let userInfo = {
                        source: 'docChat',
                        from: 'drugInvited',
                        usedApp: [],
                        phoneNum: phoneNum,
                        phoneType: commonUtil.getPhoneType(phoneNum),
                        msgReadStatus: {
                            all: true, //
                            moment: true, //是否有未读的动态
                            personal: false, //是否有未读的个人留言
                            sys: false//是否有未读的系统通知
                        },
                        fromId: fromId
                    };

                    if (fromUserInfo.tagCode) {
                        userInfo.tagCode = fromUserInfo.tagCode;
                    }


                    if (id) {
                        switch (id) {
                            case '68':
                                title = '妇幼儿';
                                break;

                        }
                        if(title){
                            userInfo.tagGroup = {
                                id: id,
                                title: title,
                                updatedAt: Date.now()
                            };
                        }
                    }

                    let newUser = yield userService.insertUserInfo(userInfo);

                    var zlycare_service = require('./../../../app/services/zlycareService');
                    zlycare_service.insertUser(newUser._id, newUser.name, newUser.phoneNum);
                    //cms打标签
                    if (id && title) {
                        proxy.update_user_keywords_with_keywordgroup(newUser._id, id)
                            .then(function (err, result) {
                                // if (err) apiHandler.handleErr(res, err);
                                console.log('cms结果', result);
                            });
                    }


                    //记录一条邀请记录
                    let inviteLog = invitationBonusLogService.registerLog(fromId, newUser._id);
                    console.log('邀请记录结果', inviteLog);
                    // coupon_service.signInGetCoupon 生成优惠券
                    const coupon_service = Backend.service('tp_memberships','coupon');
                    yield coupon_service.signInGetCoupon(newUser._id)
                    resObj.data['user_id'] = newUser._id;
                }else{
                    resObj.data['user_id'] = user._id;
                }
                
                return self.success(resObj);
            }
        ).catch(function (err) {
            console.log(err);
        });
        return result;
    }
};