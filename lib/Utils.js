/**
 * Created by zhaoyifei on 14-9-28.
 */

var uuid_24bit_style = /\w{24}/;

exports.isUUID24bit = function(uuid){
  return uuid_24bit_style.test(uuid);
};

