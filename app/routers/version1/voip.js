var router = require('express').Router();
var VoipController = require('../../controllers/VoipController');
var CallController = require('../../controllers/CallController');
var VERSION = "/1";

//API-5001 在云信上注册accid并生成token,保存在服务器上,并返回给客户端
router.post(VERSION + '/voip/accidAndToken',VoipController.setAccidAndToken);
//API-5002 通话节点回调
router.post(VERSION + '/voip/actionCallback',VoipController.actionCallback);
//API-5003 通话节点回调
router.post(VERSION + '/voip/successCallback',VoipController.successCallback);
//API-5004 通话节点回调
router.post(VERSION + '/voip/failCallback',VoipController.failCallback);
//API-5005 更新云信accid
router.put(VERSION + '/voip/updateAccid',VoipController.updateAccid);
//API-5006 更新云信token
router.put(VERSION + '/voip/updateToken',VoipController.updateToken);
//API-5007 封禁云信accid
router.put(VERSION + '/voip/blockAccid',VoipController.blockAccid);
//API-5008 解禁云信accid
router.put(VERSION + '/voip/unblockAccid',VoipController.unblockAccid);

//API-5009 通话结束,网易云音频文件地址抄送
router.post(VERSION + '/voip/callbackVoip',VoipController.callbackVoip);

//通话评价


module.exports = router;