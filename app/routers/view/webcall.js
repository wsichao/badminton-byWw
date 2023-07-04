/**
 * Created by guoyichen on 2016/12/6.
 */

var
    router = require('express').Router(),
    WebCall = require('../../controllers/webCallController');

module.exports = router;
router.get("/webCall", WebCall.webcallInit);