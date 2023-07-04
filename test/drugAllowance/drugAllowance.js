
'use strict'

let expect = require('chai').expect;
let rp = require('request-promise');
let getFixedToken = require('../util/user_ref').getFixedToken
let checkTypes = require('../util/common_util').checkTypes;


describe('药品补贴相关接口个测试', function () {
    it('api 10012 获取城市列表', function (done) {
        let user = getFixedToken();
        let options = {
            method: 'GET',
            headers: {
                'x-docchat-user-id': user.user_id,
                'x-docchat-session-token': user.token,
                'x-docchat-app-version': ''
            },
            url: 'http://localhost:9050/1/drugAllowance/searchCityList',
            body: {
            },
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

    it('api 10013 根据城市获得渠道列表', function (done) {
        let user = getFixedToken();
        let options = {
            method: 'GET',
            headers: {
                'x-docchat-user-id': user.user_id,
                'x-docchat-session-token': user.token,
                'x-docchat-app-version': ''
            },
            url: 'http://localhost:9050/1/drugAllowance/searchDrugChannel',
            body: {
            },
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

    it('api 10017 web 获取城市列表', function (done) {
        let user = getFixedToken();
        let options = {
            method: 'GET',
            headers: {
                'x-docchat-user-id': user.user_id,
                'x-docchat-session-token': user.token,
                'x-docchat-app-version': ''
            },
            url: 'http://localhost:9050/1/drugAllowance/webSearchCityList',
            body: {
            },
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