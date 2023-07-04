/**
 * Common
 */
var
  router = require('express').Router();

//TODO
router.get("/common/inof", function(req, res){
    res.status(200).end();
});

module.exports = router;