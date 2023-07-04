'use strict'

let expect = require('chai').expect;
let rp = require('request-promise');
let getFixedToken = require('../util/user_ref').getFixedToken;
let checkTypes = require('../util/common_util').checkTypes;


describe('用户评价回复医生相关接口个测试', function () {
    it('api 10006 评价回复', function (done) {
        let user = getFixedToken();
        let options = {
            method: 'POST',
            headers: {
                'x-docchat-user-id': user.user_id,
                'x-docchat-session-token': user.token,
                'x-docchat-app-version': ''
            },
            url: 'http://localhost:9050/1/doctor_comment/commentReply',
            body: {
                "commentId":'5a9e38a8e32b03d7101176ec',
                "doctorId":'5a3b30820dd25d035d25ea4f',
                "content": 'test',
            },
            json: true
        };
        rp(options)
            .then(function(res){
                expect(res).to.be.an('object');
                expect(res).to.include.keys(['code', 'msg']);
                expect(res.code).to.be.a('string');
                expect(res.msg).to.be.a('string');
                done();
            });
    });
    it('api 10008 查看评价回复列表', function (done) {
        let options = {
            method: 'GET',
            headers: {
            },
            url: 'http://localhost:9050/1/doctor_comment/getCommentReplyList',
            qs: {
                commentId: '5a9e38a8e32b03d7101176ec',
            },
            json: true
        };
        rp(options)
            .then(function(res){
                expect(res).to.be.an('object');
                expect(res).to.include.keys(['items']);
                expect(res.items).to.be.an('array');
                let type_obj = {
                    "_id": String,
                    "user": {
                        "_id": String,
                        "name": String,
                        "avatar": String
                    },
                    "content": String,
                    "replyTime": Number,
                    "like_count": Number,
                    "is_liked": Boolean,
                    "weight":Number
                };
                console.log('完成数据',res.items);
                res.items.forEach(function(item){
                    console.log('得到的用户数据',item);
                    return checkTypes(item, type_obj);
                });
                done();
            })
    });
    it('api 10009 评价回复点赞、取消点赞', function (done) {
        let user = getFixedToken();
        let options = {
            method: 'PUT',
            headers: {
                'x-docchat-user-id': user.user_id,
                'x-docchat-session-token': user.token,
                'x-docchat-app-version': ''
            },
            url: 'http://localhost:9050/1/doctor_comment/handleCommentReplyLike',
            body: {
                "commentReplyId": '5a9e67e9bc26c20d18bb8442',
            },
            json: true
        };
        rp(options)
            .then(function(res){
                expect(res).to.be.an('object');
                expect(res).to.include.keys(['code', 'msg']);
                expect(res.code).to.be.a('string');
                expect(res.msg).to.be.a('string');
                done();
            });
    });
})
