/**
 * Created by outrun on 12/28/15.
 */

exports.hookUpModel = function (schema) {
  "use strict";
  schema.pre('findOneAndUpdate', function (next) {
    "use strict";
    var update = this._update || (this._update = {});
    var set = update.$set || (update.$set = {});
    set['statisticsUpdatedAt'] = Date.now();
    next();
  });
  schema.pre('save', function (next) {
    "use strict";
    if (this) {
      this['statisticsUpdatedAt'] = Date.now();
    }
    next()
  });
  schema.pre('update', function (next) {
    "use strict";
    var update = this._update || (this._update = {});
    var set = update.$set || (update.$set = {});
      set['updatedAt'] = Date.now();

    if(set['msgReadStatus.all'] || set['msgReadStatus.moment'] || set['msgReadStatus.personal']){
      return next();
    }
    set['statisticsUpdatedAt'] = Date.now();
    next();
  });
};