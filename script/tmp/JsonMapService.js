/**
 * Created by zhaoyifei on 14/12/29.
 */
var moment = require("moment");


var JsonMapService = function(){

};
function JsonMapService() {

}
JsonMapService.prototype.constructor = JsonMapService;

JsonMapService.prototype.changeComments = function(json1){
  var result = {"status": 0, "data": []};

  for(var i =0;i<json1.length;i++){
//    console.log(json1[i]);
    result.data.push({
      "username": json1[i].senderName,
      "user_tel": json1[i].senderPhoneNum,
      "overall": json1[i].grade,
      "manner": json1[i].grade,
      "wait_time": json1[i].grade,
      "content": json1[i].content,
      "addtime": moment.unix(json1[i].updatedAt).format("YYYY-MM-DD HH:mm:ss"),
      "bookservice": null
    });
  }
  return result;
};

var acNum = 0;
JsonMapService.prototype.changeJson = function(json1){
  var result = {
    "status":0,
    "data":[]
  };
  if(!json1||!json1.users)
  {
    return result;
  }
  for(var i=0; i < json1.users.length; i++){
    var user = {
      "dentistid": json1.users[i]._id+"",
      "realname": json1.users[i].name,
      "photo": json1.users[i].avatar,
      "telphone": json1.users[i].phoneNum,
      "jobtitle": json1.users[i].position,
      "titlelist": json1.users[i].position,
      "tags": json1.users[i].sTags.toString(),
      "speciality": json1.users[i].sTags.toString(),
      "education": json1.users[i].sTags.toString(),
      "selfintro": json1.users[i].sTags.toString(),
      "otherdesc": "",
      "book_service": "0",
      "level": "6",
      "likenum": 0,
      "commentnum": "4",
      "overall": "5",
      "manner": "5",
      "wait_time": "5",
      "clinicinfo": {
        "clinicid": "",
        "clinicname": "",
        "brand": null,
        "province": "",
        "tel": "",
        "city": "",
        "area": "",
        "address": "",
        "long": "",
        "lat": "",
        "has_parking": "0",
        "has_wifi": "1",
        "block_name": json1.users[i].hospital,
        "distance": -1
      },
      "coupon": [],
      "clinic_service_price": {
        "id": "863",
        "clinic_id": "58",
        "clinic_name": "",
        "brand_id": "0",
        "brand_name": null,
        "book_service_id": "1",
        "book_service_name": "",
        "price_desc": "150",
        "add_time": "2014-12-17 14:47:51"
      },
      "dentist_profile_pic": [],
      "openbook": []
    };
    var price_l = 0;
    var price_h = 0;
    var openbook = [];
    var now = {
      "datetime":moment(),
      "date": moment().format("YYYY-MM-DD"),
      "time": [
        {
          "scheduleid": ""+acNum++,
          "time": "14:00:00",
          "date": moment().format("YYYY-MM-DD"),
          "status": "1"
        }
      ]
    };
    var now_1 = {
      "datetime":moment().add(1,"days"),
      "date": moment().add(1,"days").format("YYYY-MM-DD"),
      "time": [
        {
          "scheduleid": ""+acNum++,
          "time": "09:00:00",
          "date": moment().add(1,"days").format("YYYY-MM-DD"),
          "status": "1"
        }
      ]
    };
    var now_2 = {
      "datetime":moment().add(2,"days"),
      "date": moment().add(2,"days").format("YYYY-MM-DD"),
      "time": [
        {
          "scheduleid": ""+acNum++,
          "time": "14:00:00",
          "date": moment().add(2,"days").format("YYYY-MM-DD"),
          "status": "1"
        }
      ]
    };
    var now_3 = {
      "datetime":moment().add(3,"days"),
      "date": moment().add(3,"days").format("YYYY-MM-DD"),
      "time": [
        {
          "scheduleid": ""+acNum++,
          "time": "16:00:00",
          "date": moment().add(2,"days").format("YYYY-MM-DD"),
          "status": "1"
        }
      ]
    };
    user.openbook.push(now);
    user.openbook.push(now_1);
    user.openbook.push(now_2);
    user.openbook.push(now_3);
    result.data.push(user);
//    for(var j=0;j<json1.resources[i].length;j++){
//      if(json1.resources[i].repeatInterval === 86400000){
//        for(var z=0;z<user.openbook.length;z++){
//          user.openbook[z].time.push({
//          {
//            "scheduleid": ""+acNum++,
//            "time": moment.unix(json1.resources[i]).format("HH:mm:ss"),
//            "date": user.openbook[z].date,
//            "status": "1"
//          }
//          })
//        }
//      }
//    }
  }

  return result;
};


JsonMapService.prototype.getHospitalList = function(status, data){
  var result = {
    "status":0,
    "data":[]
  };

//  for(var i=0; i < 10; i++) {
//    var user = {
//      "hospitalId": i + "",
//      "realname": "第"+i+"医院－fake",
//      "photo": "",
//      "telphone": "11111",
//      "nickname":i+"院",
//      "titlelist": "",
//      "tags": "tag1, tag2, tag3",
//      "speciality": "儿科, 神经, 肿瘤",
//      "address": "建外大街2号"
//
//    };
//    result.data.push(user);
//  }

  if(status){
    result.status = status;
  }
  result.data = data;
  return result;
};

JsonMapService.prototype.getopdList = function(status, data){
  var result = {
    "status":0,
    "data":[]
  };

//  for(var i=0; i < 10; i++) {
//    var user = {
//      "opdId": i + "",
//      "realname": "儿科－fake",
//      "photo": "",
//      "telphone": "11111",
//      "nickname": "",
//      "titlelist": "",
//      "tags": "tag1, tag2, tag3",
//      "specialist": "专家1, 专家2, 专家3, 专家4",
//      "doctorcount":12
//    };
//    result.data.push(user);
//  }
  if(status){
    result.status = status;
  }
  result.data = data;
  return result;
};

JsonMapService.prototype.getdoctorList = function(status, data){
  var result = {
    "status":0,
    "data":[]
  };

//  for(var i=0; i < 10; i++) {
//    var user = {
//      "doctorId": i + "专家",
//      "realname": "医生aaa",
//      "photo": "",
//      "telphone": "11111",
//      "nickname": "大刘",
//      "titlelist": "",
//      "tags": "tag1, tag2, tag3",
//      "speciality": "儿科, 神经, 肿瘤",
//      "lowprice": 10,
//      "highprice": 100
//    };
//    result.data.push(user);
//  }
  if(status){
    result.status = status;
  }
  result.data = data;
  return result;
};


JsonMapService.prototype.getdoctorDetail = function(status, data){

  var result = {
    "status":0

  };
//
//    var user = {
//      "doctorId": i + "aaa",
//      "realname": "医生aaa",
//      "photo": "",
//      "telphone": "11111",
//      "nickname": "大刘",
//      "jobtitle": "主任医师",
//      "hospital": "北大医院",
//      "outpaientdep": "儿科",
//      "titlelist": "主任医师, 主任医师, 主任医师",
//      "tags": "tag1, tag2, tag3",
//      "education": "",
//      "speciality": "儿科, 神经, 肿瘤",
//      "price": 14,
//      "address": "address1",
//      "brokers":[]
//    };
//
//  for(var i=0; i < 10; i++) {
//    var broker = {
//      "brokerId": i + "broker",
//      "realname": "代理"+i,
//      "photo": "",
//      "telphone": "11111",
//      "nickname": "大刘",
//      "titlelist": "",
//      "tags": "tag1, tag2, tag3",
//      "speciality": "儿科, 神经, 肿瘤",
//      "lowprice": 10,
//      "highprice": 100
//    };
//    user.brokers.push(broker);
//  }
  result.status = status;
  result.data = data;
  return result;
};


JsonMapService.prototype.getOrderDetail = function(status, data){

  var result = {
    orderNo: null,
    order: null,
    zly400: null

  };
  result.orderNo = data.orderNo;
  result.order = data;
  result.zly400 = status;
  return result;
};
JsonMapService.prototype.getdoctorCalendar = function(){
  var result = {
    "status":0,
    "data":[]
  };

  for(var i=0; i < 10; i++) {
    var user = {
      "doctorId": i + "专家",
      "realname": "医生aaa",
      "photo": "",
      "telphone": "11111",
      "nickname": "大刘",
      "titlelist": "",
      "tags": "tag1, tag2, tag3",
      "speciality": "儿科, 神经, 肿瘤",
      "lowprice": 10,
      "highprice": 100
    };
    result.data.push(user);
  }

  return result;
};

JsonMapService.prototype.doctorBrokerList = function(){
  var result = {
    "status":0,
    "data":[]
  };

  for(var i=0; i < 10; i++) {
    var user = {
      "brokerId": i + "专家",
      "realname": "医生aaa",
      "photo": "",
      "telphone": "11111",
      "nickname": "大刘",
      "titlelist": "",
      "tags": "tag1, tag2, tag3",
      "speciality": "儿科, 神经, 肿瘤",
      "lowprice": 10,
      "highprice": 100
    };
    result.data.push(user);
  }

  return result;
};

JsonMapService.prototype.getOrderList = function(status, data){
  var result = {
    "status":0,
    "data":[]
  };

  result.status = status;
  result.data = data;

  return result;
};

JsonMapService.prototype.orderSubmitMsg = function(data){
  var result = {
    "status":0,
    "data":data
  };

  return result;
};

module.exports = exports = new JsonMapService;