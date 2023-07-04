

'use strict'

let expect = require('chai').expect;
let rp = require('request-promise');
let getFixedToken = require('../util/user_ref').getFixedToken
let checkTypes = require('../util/common_util').checkTypes;


describe('用户评价医生相关接口个测试', function () {
  it('api 10002 用户评价', function (done) {
    let user = getFixedToken();
    let options = {
      method: 'POST',
      headers: {
        'x-docchat-user-id': user.user_id,
        'x-docchat-session-token': user.token,
        'x-docchat-app-version': ''
      },
      url: 'http://localhost:9050/1/doctor_comment/comment',
      body: {
        "comment": '123123123123',
        "doctor_id":'5a4449830dd25d4ea890bf69'
      },
      json: true
    }
    rp(options)
      .then(function(res){
        expect(res).to.be.an('object');
        expect(res).to.include.keys(['code', 'msg']);
        expect(res.code).to.be.a('string');
        expect(res.msg).to.be.a('string');
        done();
      })
  });
  it('api 10005 用户给评论点赞', function (done) {
    let user = getFixedToken();
    let options = {
      method: 'PUT',
      headers: {
        'x-docchat-user-id': user.user_id,
        'x-docchat-session-token': user.token,
        'x-docchat-app-version': ''
      },
      url: 'http://localhost:9050/1/doctor_comment/like_comment',
      body: {
        "comment_id": '5993b6307659a1ef0d9b1a96',
      },
      json: true
    }
    rp(options)
      .then(function(res){
        expect(res).to.be.an('object');
        expect(res).to.include.keys(['code', 'msg']);
        expect(res.code).to.be.a('string');
        expect(res.msg).to.be.a('string');
        done();
      })
  });
  it('api 10004 医生评价列表', function (done) {
    let options = {
      method: 'GET',
      headers: {
      },
      url: 'http://localhost:9050/1/doctor_comment/comment_list',
      qs: {
        doctor_id: '5a4449830dd25d4ea890bf69',
      },
      json: true
    }
    rp(options)
      .then(function(res){
        expect(res).to.be.an('object');
        expect(res).to.include.keys(['items', 'weight','bookmark']);
        expect(res.weight).to.be.a('number');
        expect(res.bookmark).to.be.a('number');
        expect(res.items).to.be.an('array');
        let type_obj = {
          "_id": String,
          "user": {
            "_id": String,
            "name": String,
            "avatar": String
          },
          "content": String,
          "commentTime": Number,
          "like_count": Number,
          "reply_count": Number,
          "is_liked": Boolean
        }
        res.items.forEach(function(item){
          return checkTypes(item, type_obj);
        })
        done();
      })
  });
})