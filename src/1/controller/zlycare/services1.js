/**
 * Created by fly on 2017－07－24.
 */

"use strict";
let vip_service = Backend.service('1/zlycare', 'vip_service');
let _ = require('underscore');
module.exports = {
  //__beforeAction: function () {
  //  if(!isUserInfoAuthorized(this.req)){
  //    return this.fail(8005);
  //  }
  //},
  mockAction: function () {
    let resObj =
    {
      "items": [
        {
          "product_id": "slflfalfalsf",
          "product_name": "感康",
          "product_detail": "感康",
          "product_pics": [
            "52083A73-0918-47F4-92F5-5798C2E08093",
            "52083A73-0918-47F4-92F5-5798C2E08093",
            "52083A73-0918-47F4-92F5-5798C2E08093",
            "52083A73-0918-47F4-92F5-5798C2E08093",
            "52083A73-0918-47F4-92F5-5798C2E08093"
          ],
          "marketing_price": 20,
          "real_price": 15,
          "service_people_id": "5441f8dee1f5b4a37d9fd0db",
          "service_people_call": "18601920795",
          "service_people_name": "易翔",
          "service_people_chat_num": "808053989",
          "im_user_name": "5938c8697f202355460dcec5",
        },
        {
          "product_id": "slflfalfalsf",
          "product_name": "感康2",
          "product_detail": "感康2",
          "product_pics": [
            "52083A73-0918-47F4-92F5-5798C2E08093",
            "52083A73-0918-47F4-92F5-5798C2E08093",
            "52083A73-0918-47F4-92F5-5798C2E08093",
            "52083A73-0918-47F4-92F5-5798C2E08093",
            "52083A73-0918-47F4-92F5-5798C2E08093"
          ],
          "marketing_price": 25,
          "real_price": 15,
          "marketing_price": 20,
          "real_price": 15,
          "service_people_id": "5441f8dee1f5b4a37d9fd0db",
          "service_people_call": "18601920795",
          "service_people_name": "易翔",
          "service_people_chat_num": "808053989",
          "im_user_name": "5938c8697f202355460dcec5",
        },{
          "product_id": "slflfalfalsf",
          "product_name": "感康",
          "product_detail": "感康",
          "product_pics": [
            "52083A73-0918-47F4-92F5-5798C2E08093",
            "52083A73-0918-47F4-92F5-5798C2E08093",
            "52083A73-0918-47F4-92F5-5798C2E08093",
            "52083A73-0918-47F4-92F5-5798C2E08093",
            "52083A73-0918-47F4-92F5-5798C2E08093"
          ],
          "marketing_price": 20,
          "real_price": 15,
          "service_people_id": "5441f8dee1f5b4a37d9fd0db",
          "service_people_call": "18601920795",
          "service_people_name": "易翔",
          "service_people_chat_num": "808053989",
          "im_user_name": "5938c8697f202355460dcec5",
        },
        {
          "product_id": "slflfalfalsf",
          "product_name": "感康2",
          "product_detail": "感康2",
          "product_pics": [
            "52083A73-0918-47F4-92F5-5798C2E08093",
            "52083A73-0918-47F4-92F5-5798C2E08093",
            "52083A73-0918-47F4-92F5-5798C2E08093",
            "52083A73-0918-47F4-92F5-5798C2E08093",
            "52083A73-0918-47F4-92F5-5798C2E08093"
          ],
          "marketing_price": 25,
          "real_price": 15,
          "marketing_price": 20,
          "real_price": 15,
          "service_people_id": "5441f8dee1f5b4a37d9fd0db",
          "service_people_call": "18601920795",
          "service_people_name": "易翔",
          "service_people_chat_num": "808053989",
          "im_user_name": "5938c8697f202355460dcec5",
        },{
          "product_id": "slflfalfalsf",
          "product_name": "感康",
          "product_detail": "感康",
          "product_pics": [
            "52083A73-0918-47F4-92F5-5798C2E08093",
            "52083A73-0918-47F4-92F5-5798C2E08093",
            "52083A73-0918-47F4-92F5-5798C2E08093",
            "52083A73-0918-47F4-92F5-5798C2E08093",
            "52083A73-0918-47F4-92F5-5798C2E08093"
          ],
          "marketing_price": 20,
          "real_price": 15,
          "service_people_id": "5441f8dee1f5b4a37d9fd0db",
          "service_people_call": "18601920795",
          "service_people_name": "易翔",
          "service_people_chat_num": "808053989",
          "im_user_name": "5938c8697f202355460dcec5",
        },
        {
          "product_id": "slflfalfalsf",
          "product_name": "感康2",
          "product_detail": "感康2",
          "product_pics": [
            "52083A73-0918-47F4-92F5-5798C2E08093",
            "52083A73-0918-47F4-92F5-5798C2E08093",
            "52083A73-0918-47F4-92F5-5798C2E08093",
            "52083A73-0918-47F4-92F5-5798C2E08093",
            "52083A73-0918-47F4-92F5-5798C2E08093"
          ],
          "marketing_price": 25,
          "real_price": 15,
          "marketing_price": 20,
          "real_price": 15,
          "service_people_id": "5441f8dee1f5b4a37d9fd0db",
          "service_people_call": "18601920795",
          "service_people_name": "易翔",
          "service_people_chat_num": "808053989",
          "im_user_name": "5938c8697f202355460dcec5",
        },{
          "product_id": "slflfalfalsf",
          "product_name": "感康",
          "product_detail": "感康",
          "product_pics": [
            "52083A73-0918-47F4-92F5-5798C2E08093",
            "52083A73-0918-47F4-92F5-5798C2E08093",
            "52083A73-0918-47F4-92F5-5798C2E08093",
            "52083A73-0918-47F4-92F5-5798C2E08093",
            "52083A73-0918-47F4-92F5-5798C2E08093"
          ],
          "marketing_price": 20,
          "real_price": 15,
          "service_people_id": "5441f8dee1f5b4a37d9fd0db",
          "service_people_call": "18601920795",
          "service_people_name": "易翔",
          "service_people_chat_num": "808053989",
          "im_user_name": "5938c8697f202355460dcec5",
        },
        {
          "product_id": "slflfalfalsf",
          "product_name": "感康2",
          "product_detail": "感康2",
          "product_pics": [
            "52083A73-0918-47F4-92F5-5798C2E08093",
            "52083A73-0918-47F4-92F5-5798C2E08093",
            "52083A73-0918-47F4-92F5-5798C2E08093",
            "52083A73-0918-47F4-92F5-5798C2E08093",
            "52083A73-0918-47F4-92F5-5798C2E08093"
          ],
          "marketing_price": 25,
          "real_price": 15,
          "marketing_price": 20,
          "real_price": 15,
          "service_people_id": "5441f8dee1f5b4a37d9fd0db",
          "service_people_call": "18601920795",
          "service_people_name": "易翔",
          "service_people_chat_num": "808053989",
          "im_user_name": "5938c8697f202355460dcec5",
        },{
          "product_id": "slflfalfalsf",
          "product_name": "感康",
          "product_detail": "感康",
          "product_pics": [
            "52083A73-0918-47F4-92F5-5798C2E08093",
            "52083A73-0918-47F4-92F5-5798C2E08093",
            "52083A73-0918-47F4-92F5-5798C2E08093",
            "52083A73-0918-47F4-92F5-5798C2E08093",
            "52083A73-0918-47F4-92F5-5798C2E08093"
          ],
          "marketing_price": 20,
          "real_price": 15,
          "service_people_id": "5441f8dee1f5b4a37d9fd0db",
          "service_people_call": "18601920795",
          "service_people_name": "易翔",
          "service_people_chat_num": "808053989",
          "im_user_name": "5938c8697f202355460dcec5",
        },
        {
          "product_id": "slflfalfalsf",
          "product_name": "感康2",
          "product_detail": "感康2",
          "product_pics": [
            "52083A73-0918-47F4-92F5-5798C2E08093",
            "52083A73-0918-47F4-92F5-5798C2E08093",
            "52083A73-0918-47F4-92F5-5798C2E08093",
            "52083A73-0918-47F4-92F5-5798C2E08093",
            "52083A73-0918-47F4-92F5-5798C2E08093"
          ],
          "marketing_price": 25,
          "real_price": 15,
          "marketing_price": 20,
          "real_price": 15,
          "service_people_id": "5441f8dee1f5b4a37d9fd0db",
          "service_people_call": "18601920795",
          "service_people_name": "易翔",
          "service_people_chat_num": "808053989",
          "im_user_name": "5938c8697f202355460dcec5",
        },{
          "product_id": "slflfalfalsf",
          "product_name": "感康",
          "product_detail": "感康",
          "product_pics": [
            "52083A73-0918-47F4-92F5-5798C2E08093",
            "52083A73-0918-47F4-92F5-5798C2E08093",
            "52083A73-0918-47F4-92F5-5798C2E08093",
            "52083A73-0918-47F4-92F5-5798C2E08093",
            "52083A73-0918-47F4-92F5-5798C2E08093"
          ],
          "marketing_price": 20,
          "real_price": 15,
          "service_people_id": "5441f8dee1f5b4a37d9fd0db",
          "service_people_call": "18601920795",
          "service_people_name": "易翔",
          "service_people_chat_num": "808053989",
          "im_user_name": "5938c8697f202355460dcec5",
        },
        {
          "product_id": "slflfalfalsf",
          "product_name": "感康2",
          "product_detail": "感康2",
          "product_pics": [
            "52083A73-0918-47F4-92F5-5798C2E08093",
            "52083A73-0918-47F4-92F5-5798C2E08093",
            "52083A73-0918-47F4-92F5-5798C2E08093",
            "52083A73-0918-47F4-92F5-5798C2E08093",
            "52083A73-0918-47F4-92F5-5798C2E08093"
          ],
          "marketing_price": 25,
          "real_price": 15,
          "marketing_price": 20,
          "real_price": 15,
          "service_people_id": "5441f8dee1f5b4a37d9fd0db",
          "service_people_call": "18601920795",
          "service_people_name": "易翔",
          "service_people_chat_num": "808053989",
          "im_user_name": "5938c8697f202355460dcec5",
        },
      ]
    }
    return this.success(resObj);
  },
  getAction: function () {
    let self = this;
    let query = this.query;
    let vipType = query.vipType || 'zlycare';
    let thirdTypeId = query.thirdTypeId || '';
    let region = query.region || '';
    let keyword = query.keyword || '';
    let reg = new RegExp(keyword, 'i');
    let pageSlice = getCurrentPageSlice(this.req, 0, 20, {createdAt: 1});
    let cond = {
      vipType: vipType
    }
    if(thirdTypeId){
      cond.thirdType = thirdTypeId;
    };
    if(region){
      cond.productSalesArea = region;
    };
    if(keyword){
      cond.productName = reg;
    };
    return vip_service.getVipServicesByCond(cond, pageSlice)
    .then(function(_items){
      //console.log('_items:', _items);
      let items = (_items || []).map(function(item){
        return {
          product_id: item._id + '',
          product_name: item.productName || '',
          product_detail: item.productDetail || '',
          product_pics: item.productPics || [],
          marketing_price: item.marketingPrice,
          real_price: item.realPrice,
          service_people_id: item.servicePeopleId || '',
          service_people_call: item.servicePeopleCall || '',
          service_people_name: item.servicePeopleName || '',
          service_people_chat_num: item.servicePeopleDocChatNum || '',
          im_user_name: item.servicePeopleImUserName || '',
        }
      })
      return self.success({
        items: items
      });
    })

  }
}