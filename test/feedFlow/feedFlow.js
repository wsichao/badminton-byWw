
'use strict'

let expect = require('chai').expect;
let rp = require('request-promise');
let getFixedToken = require('../util/user_ref').getFixedToken
let checkTypes = require('../util/common_util').checkTypes;


describe('信息流相关接口个测试', function () {
    it('api 10011 获取信息流推荐文章', function (done) {
        let user = getFixedToken();
        let options = {
            method: 'GET',
            headers: {
                'x-docchat-user-id': user.user_id,
                'x-docchat-session-token': user.token,
                'x-docchat-app-version': ''
            },
            url: 'http://localhost:9050/1/feedFlow/cmsRecommend?pageId=241840',
            json: true
        }
        rp(options)
            .then(function(res){
                expect(res).to.be.an('object');
                expect(res).to.include.keys(['code', 'msg','data']);
                expect(res.code).to.be.a('string');
                expect(res.msg).to.be.a('string');
                expect(res.data).to.be.a('array');
                done();
            })
    });
});