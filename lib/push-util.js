/**
 *  push-util
 *  封装推送方法
 *  Created by luomiao on 14-12-23.
 *  Copyright (c) 2014 ZLYCare. All rights reserved.
 */
var
  util = require('util'),
  Push = require('./push'),
  JPush = require("jpush-sdk");

/**
 * jgPush
 * 参考文档
 * https://github.com/jpush/jpush-api-nodejs-client/blob/master/doc/api.md
 */
exports.jPush = function (pushId, msgType, msgTitle, msgDescription, refreshMsg, careId, messageObject, callback) {

  var IS_PRODUCTION = true;

  var back = function (status, result) {
    if (callback) {
      return callback(status, result);
    } else {
      return;
    }
  };

  if (!pushId || pushId == "")
    back(true, null);

  var client = JPush.buildClient('b44e81a3cfcd4ac6f446cddc', 'd04f0f0287c7ac16af4d9cee');
  var client2 = JPush.buildClient('b44e81a3cfcd4ac6f446cddc', 'd04f0f0287c7ac16af4d9cee');

  var pushPayload = client.push().setPlatform('ios', 'android').setAudience(JPush.registration_id(pushId)).setOptions(null, 60, null, IS_PRODUCTION);

  switch (msgType) {
    case 0:
      console.log("Msg type 0");
      pushPayload.setMessage(msgTitle);
      break;
    case 1:
      console.log("Msg type 1");
      pushPayload.setMessage(JSON.stringify({
        action: 3,      // 刷新消息
        content: {
          careId: careId,
          title: msgTitle,
          message: msgDescription,
          messageObject: messageObject
        }
      }));
      // IOS 需推送notification
      client2.push().setPlatform('ios').setAudience(JPush.registration_id(pushId))
        .setOptions(null, 60, null, IS_PRODUCTION).setNotification(JPush.ios(msgDescription, 'sound', 1)).send(function (err, res) {
          if (err) {
            console.log(err.message);
          } else {
            console.log('Sendno: ' + res.sendno);
            console.log('Msg_id: ' + res.msg_id);
          }
        });
      break;
    case 2:
      console.log("Msg type 2");
      pushPayload.setMessage(JSON.stringify(refreshMsg));
      break;
    default:
      console.log("Msg type default");
      break;
  }

  console.log("begin jPush msg..." + util.inspect(pushPayload));
  pushPayload.send(function (err, res) {
    if (err) {
      console.log(err.message);
      return back(false, err);
    } else {
      console.log('Sendno: ' + res.sendno);
      console.log('Msg_id: ' + res.msg_id);
      return back(false, res);
    }
  });
};

/**
 * baiduPush
 * 参考文档
 * http://developer.baidu.com/wiki/index.php?title=docs/cplat/push/sdk/phpserver
 */
exports.baiduPush = function (userPushId, msgType, msgTitle, msgDescription, refreshMsg, callback) {

  var back = function (status, result) {
    if (callback) {
      return callback(status, result);
    } else {
      return;
    }
  };

  if (!userPushId || userPushId == "")
    back(true, null);

  var opt = {//3235210
    ak: 'UhKLwOGvIZuWktxoRKniPvwn',
    sk: 'cfiDmO9W4WhZpmQ6FBCBR8xxT8Ckn1Gm'
  };
  var client = new Push(opt);
  //pushMsg(client, userPushId, type, msgTitle, msgDescription);

  var opt = {
    aps: {
      alert: "朱李叶消息提醒",
      Sound: 'default',
      Badge: 0
    },
    push_type: 1,//推送类型,1单播,2组播,3所有
    user_id: userPushId//百度pushId
  };
  switch (msgType) {
    case 0:
      console.log("Msg type 0");
      opt["message_type"] = 0;
      opt["messages"] = JSON.stringify([msgTitle]);
      opt["msg_keys"] = JSON.stringify(["zly_push_key"]);
      break;
    case 1:
      console.log("Msg type 1");
      opt["message_type"] = 1;
      opt["messages"] = JSON.stringify([
        {
          title: msgTitle,
          description: msgDescription
        }
      ]);
      opt["msg_keys"] = JSON.stringify(["zly_push_key"]);
      break;
    case 2:
      console.log("Msg type 2");
      opt["message_type"] = 0;
      opt["aps"].alert = JSON.stringify(refreshMsg);
      opt["messages"] = JSON.stringify([refreshMsg]);
      opt["msg_keys"] = JSON.stringify(["zly_push_key"]);
      break;
    default:
      console.log("Msg type default");
      break;
  }

  console.log("begin baidu push msg..." + util.inspect(opt));
  client.pushMsg(opt, function (err, result) {
    if (err) {
      console.log(err);
      return back(false, err);
    } else {
      console.log("Push callback..." + result);
      return back(true, result);
    }
  })

};