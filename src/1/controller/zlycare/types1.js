/**
 * Created by fly on 2017－07－24.
 */
'use strict';
let product_catalog_service = Backend.service('1/zlycare', 'product_catalog_service');
module.exports = {
  //__beforeAction: function () {
  //  if(!isUserInfoAuthorized(this.req)){
  //    return this.fail(8005);
  //  }
  //},
  mockAction: function () {
    var resObj = {
      "items": [
        {
          "type_id": "1",
          "type_name": "中药",
          "sub_types": [
            {
              "sub_type_id": "11",
              "sub_type_name": "男科",
              "third_types": [
                {
                  "third_type_id": "111",
                  "third_type_name": "男性不育111"
                },{
                  "third_type_id": "112",
                  "third_type_name": "男性不育112"
                },{
                  "third_type_id": "113",
                  "third_type_name": "男性不育113"
                },{
                  "third_type_id": "114",
                  "third_type_name": "男性不育114"
                },{
                  "third_type_id": "115",
                  "third_type_name": "男性不育115"
                },{
                  "third_type_id": "116",
                  "third_type_name": "男性不育116"
                },{
                  "third_type_id": "117",
                  "third_type_name": "男性不育117"
                },{
                  "third_type_id": "118",
                  "third_type_name": "男性不育118"
                },{
                  "third_type_id": "119",
                  "third_type_name": "男性不育119"
                },
              ]
            },{
              "sub_type_id": "21",
              "sub_type_name": "男科",
              "third_types": [
                {
                  "third_type_id": "211",
                  "third_type_name": "男性不育211"
                },{
                  "third_type_id": "212",
                  "third_type_name": "男性不育212"
                },{
                  "third_type_id": "213",
                  "third_type_name": "男性不育213"
                },{
                  "third_type_id": "214",
                  "third_type_name": "男性不育214"
                },{
                  "third_type_id": "215",
                  "third_type_name": "男性不育215"
                },{
                  "third_type_id": "216",
                  "third_type_name": "男性不育216"
                },{
                  "third_type_id": "217",
                  "third_type_name": "男性不育217"
                },{
                  "third_type_id": "218",
                  "third_type_name": "男性不育218"
                },{
                  "third_type_id": "219",
                  "third_type_name": "男性不育219"
                },
              ]
            },{
              "sub_type_id": "31",
              "sub_type_name": "男科",
              "third_types": [
                {
                  "third_type_id": "311",
                  "third_type_name": "男性不育311"
                },{
                  "third_type_id": "312",
                  "third_type_name": "男性不育312"
                },{
                  "third_type_id": "313",
                  "third_type_name": "男性不育313"
                },{
                  "third_type_id": "314",
                  "third_type_name": "男性不育314"
                },{
                  "third_type_id": "315",
                  "third_type_name": "男性不育315"
                },{
                  "third_type_id": "316",
                  "third_type_name": "男性不育316"
                },{
                  "third_type_id": "317",
                  "third_type_name": "男性不育317"
                },{
                  "third_type_id": "318",
                  "third_type_name": "男性不育318"
                },{
                  "third_type_id": "319",
                  "third_type_name": "男性不育319"
                },
              ]
            },
          ]
        },
        {
          "type_id": "2",
          "type_name": "中药2",
          "sub_types": [
            {
              "sub_type_id": "22",
              "sub_type_name": "男科",
              "third_types": [
                {
                  "third_type_id": "221",
                  "third_type_name": "男性不育111"
                },{
                  "third_type_id": "222",
                  "third_type_name": "男性不育112"
                },{
                  "third_type_id": "223",
                  "third_type_name": "男性不育113"
                },{
                  "third_type_id": "224",
                  "third_type_name": "男性不育224"
                },{
                  "third_type_id": "225",
                  "third_type_name": "男性不育225"
                },{
                  "third_type_id": "226",
                  "third_type_name": "男性不育226"
                },{
                  "third_type_id": "227",
                  "third_type_name": "男性不育227"
                },{
                  "third_type_id": "228",
                  "third_type_name": "男性不育228"
                },{
                  "third_type_id": "229",
                  "third_type_name": "男性不育229"
                },
              ]
            },{
              "sub_type_id": "23",
              "sub_type_name": "男科",
              "third_types": [
                {
                  "third_type_id": "2311",
                  "third_type_name": "男性不育2311"
                },{
                  "third_type_id": "2312",
                  "third_type_name": "男性不育2312"
                },{
                  "third_type_id": "2313",
                  "third_type_name": "男性不育2313"
                },{
                  "third_type_id": "2314",
                  "third_type_name": "男性不育2314"
                },{
                  "third_type_id": "2315",
                  "third_type_name": "男性不育2315"
                },{
                  "third_type_id": "2316",
                  "third_type_name": "男性不育2316"
                },{
                  "third_type_id": "2317",
                  "third_type_name": "男性不育2317"
                },{
                  "third_type_id": "2318",
                  "third_type_name": "男性不育2318"
                },{
                  "third_type_id": "2319",
                  "third_type_name": "男性不育2319"
                },
              ]
            },{
              "sub_type_id": "24",
              "sub_type_name": "男科",
              "third_types": [
                {
                  "third_type_id": "2411",
                  "third_type_name": "男性不育2411"
                },{
                  "third_type_id": "2412",
                  "third_type_name": "男性不育2412"
                },{
                  "third_type_id": "2413",
                  "third_type_name": "男性不育2413"
                },{
                  "third_type_id": "2414",
                  "third_type_name": "男性不育2414"
                },{
                  "third_type_id": "2415",
                  "third_type_name": "男性不育2415"
                },{
                  "third_type_id": "2416",
                  "third_type_name": "男性不育2416"
                },{
                  "third_type_id": "2417",
                  "third_type_name": "男性不育2417"
                },{
                  "third_type_id": "2418",
                  "third_type_name": "男性不育2418"
                },{
                  "third_type_id": "2419",
                  "third_type_name": "男性不育2419"
                },
              ]
            },
          ]
        },
        {
          "type_id": "3",
          "type_name": "中药3",
          "sub_types": [
            {
              "sub_type_id": "31",
              "sub_type_name": "男科",
              "third_types": [
                {
                  "third_type_id": "3121",
                  "third_type_name": "男性不育3121"
                },{
                  "third_type_id": "3122",
                  "third_type_name": "男性不育3122"
                },{
                  "third_type_id": "3123",
                  "third_type_name": "男性不育3123"
                },{
                  "third_type_id": "3124",
                  "third_type_name": "男性不育3124"
                },{
                  "third_type_id": "3125",
                  "third_type_name": "男性不育3125"
                },{
                  "third_type_id": "3126",
                  "third_type_name": "男性不育3126"
                },{
                  "third_type_id": "3127",
                  "third_type_name": "男性不育3127"
                },{
                  "third_type_id": "3128",
                  "third_type_name": "男性不育3128"
                },{
                  "third_type_id": "3129",
                  "third_type_name": "男性不育3129"
                },
              ]
            },{
              "sub_type_id": "32",
              "sub_type_name": "男科",
              "third_types": [
                {
                  "third_type_id": "3221",
                  "third_type_name": "男性不育3221"
                },{
                  "third_type_id": "3222",
                  "third_type_name": "男性不育3222"
                },{
                  "third_type_id": "3223",
                  "third_type_name": "男性不育3223"
                },{
                  "third_type_id": "3224",
                  "third_type_name": "男性不育3224"
                },{
                  "third_type_id": "3225",
                  "third_type_name": "男性不育3225"
                },{
                  "third_type_id": "3226",
                  "third_type_name": "男性不育3226"
                },{
                  "third_type_id": "3227",
                  "third_type_name": "男性不育3227"
                },{
                  "third_type_id": "3228",
                  "third_type_name": "男性不育3228"
                },{
                  "third_type_id": "3229",
                  "third_type_name": "男性不育3229"
                },
              ]
            },{
              "sub_type_id": "33",
              "sub_type_name": "男科",
              "third_types": [
                {
                  "third_type_id": "3321",
                  "third_type_name": "男性不育3321"
                },{
                  "third_type_id": "3322",
                  "third_type_name": "男性不育3322"
                },{
                  "third_type_id": "3323",
                  "third_type_name": "男性不育3323"
                },{
                  "third_type_id": "3324",
                  "third_type_name": "男性不育3324"
                },{
                  "third_type_id": "3325",
                  "third_type_name": "男性不育3325"
                },{
                  "third_type_id": "3326",
                  "third_type_name": "男性不育3326"
                },{
                  "third_type_id": "3327",
                  "third_type_name": "男性不育3327"
                },{
                  "third_type_id": "3328",
                  "third_type_name": "男性不育3328"
                },{
                  "third_type_id": "3329",
                  "third_type_name": "男性不育3329"
                },
              ]
            },
          ]
        }
      ]
    }
    return this.success(resObj);
  },
  getAction: function () {
    let self = this;
    let req = self.req;
    let type = req.query.type || 'zlycare';
    return product_catalog_service.getCatalogs(type)
    .then(function(_items){
      return self.success({
        items: _items
      });
    })
  }
}

