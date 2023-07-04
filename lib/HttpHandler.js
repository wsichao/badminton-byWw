/**
 * HTTP Handlers
 * Author: Evan Liu
 * Copyright (c) 2014 ZLYCare. All rights reserved.
 */

function handler(code) {
  return function (req, res) {
    res.send(code);
  }
}

exports.internalError = handler(500);
exports.notImplemented = handler(501);
exports.forbidden = handler(403);
