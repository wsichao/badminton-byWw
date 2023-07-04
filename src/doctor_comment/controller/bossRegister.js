/**
 * Created by lijinxia on 2018/3/1.
 */
'user strict';
let userService = Backend.service('common', 'user_service'),
    commonUtil = require('../../../lib/common-util'),
    co = require('co');


module.exports = {
    __rule: function (valid) {
        return valid.object({
            phoneNum: valid.string().required(),
            name: valid.string().required(),
            avatar: valid.string().required()
        });
    },
    __beforeAction: function () {
        console.log('当前的环境',process.env.NODE_ENV );
        if (process.env.NODE_ENV != '_test') {
            let ip = getClientIp(this.req);
            let whiteIP = ['123.56.147.196', '182.92.106.199', '127.0.0.1', '172.31.1.22', '172.31.1.23','112.125.88.214'];//123.56.147.196 正式公网 182.92.106.199 测试公网
            console.log('请求的ip地址', ip);
            if (whiteIP.indexOf(ip) == -1) {
                return this.fail("必须白名单内的IP才可以访问");
            }
        }
    },
    mockAction: function () {
        let resObj = {
            _id: '5a0519a7c9938a64073cd682',
            phoneNum: '15600022839',
            name: "哈哈",
            avatar: 'Fi4HdkqzzIDfmsaPULX0jjh2Dgri'

        };
        return this.success(resObj);
    },

    postAction: function () {
        let self = this;
        let req = self.req;
        let phoneNum = req.body.phoneNum || '';
        let name = req.body.name || '';
        let avatar = req.body.avatar || '';
        // if (!phoneNum) {
        //     return this.fail(8005);
        // }
        // if (!name) {
        //     return this.fail(8005);
        // }
        // if (!avatar) {
        //     return this.fail(8005);
        // }

        let result = co(function*() {
            let user = yield userService.getInfoByPhoneNum(phoneNum);
            if (user) {
                console.log('找到用户', user);
                return self.fail(1215);
            }

            var userInfo = {
                source: 'zlyBoss',
                from: 'zlyBossComment',
                usedApp: [],
                phoneNum: phoneNum,
                phoneType: commonUtil.getPhoneType(phoneNum),
                msgReadStatus: {
                    all: true, //
                    moment: true, //是否有未读的动态
                    personal: false, //是否有未读的个人留言
                    sys: false//是否有未读的系统通知
                }
            };

            if (name) {
                userInfo.name = name;
                userInfo.pinyinName = toPinYin(name);
            }
            if (avatar) {
                userInfo.avatar = avatar;
            }

            let res = yield userService.insertUserInfo(userInfo);
            let resObj = {_id: res._id, name: res.name, avatar: res.avatar, phoneNum: res.phoneNum}
            return self.success(resObj);
        }).catch(function (err) {
            console.log(err)
        })

        return result;
    }
};