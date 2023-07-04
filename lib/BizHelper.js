/**
 * Created by outrun on 11/2/15.
 */

var commonUtil = require('./common-util'),
  Promise = require('promise'),
  Q = require('q'),
  mongoose = require('mongoose'),
  querystring = require('querystring'),
  apiHandler = require('../app/configs/ApiHandler'),
  serverConf = require('../app/configs/server'),
  ErrorHandler = require('./ErrorHandler'),
  _ = require('underscore');

var ObjectId = mongoose.Types.ObjectId;

var ctl = {
  post: function (req, res, fields, onSuc, onErr) {
    var payload = req.body;

    var _onErr = function (handler, type) {
      handler(res, type);
    };

    commonUtil.validate(payload, fields, onSuc, onErr || _onErr);
  },
  _post: function (req, res, fields, onSuc, onErr) {
    var payload = req.body;
    var _onErr = function (handler, type) {
      handler(res, type);
    };
    var _onSuc = function (handler, data) {
      if (ctl.isDocClient(req)) {
        data.profileId = ctl.getProfileId(req);
      } else {
        data.userId = ctl.getUserId(req);
      }
      data.pageSlice = commonUtil.getCurrentPageSlice(req, 0, 20, {createdAt: -1});

      var caller = {req: req, res: res};

      _res.data(res, onSuc.call(caller, data));
    };

    commonUtil.validate(payload, fields, _onSuc, onErr || _onErr);
  },
  post2: function (req, res, fields, onSuc, onErr) {
    return ctl.get(req, res, fields, onSuc, onErr);
  },
  get: function (req, res, fields, onSuc, onErr) {

    var goRight = true, data = new Object;
    var _onErr = function () {
      apiHandler.OUTER_DEF(res, ErrorHandler.getBusinessErrorByCode(8005));
    };
    var params = (_.extend/*Own*/(req.body, req.query, req.params), req.body);

    if (fields != null && fields instanceof Object) {
      if (fields['required'] instanceof Array) {
        try {
          fields['required'].forEach(function (name) {
            if (params[name] === undefined) throw new Error('not enough attribute');
            data[name] = params[name];
          })
        } catch (e) {
          if (e.message === 'not enough attribute') goRight = false;
        }
      }

      if (goRight && fields['optional'] instanceof Array) {
        fields['optional'].forEach(function (name) {
          params[name] && (data[name] = params[name]);
        })
      }
    } else
      data = params;

    if (goRight) {
      if (data['userId'] === undefined) {
        data['userId'] = ctl.getUserId(req);
      }
      if (data['profileId'] == undefined) {
        data['profileId'] = ctl.getProfileId(req);
      } else {
        data['clientProfileId'] = ctl.getProfileId(req);
      }
      if (data['identity'] === undefined) {
        data['identity'] = req.identity || {};
      }
    }

    data.pageSlice = commonUtil.getCurrentPageSlice(req, 0, 20, {createdAt: -1});

    var caller = {req: req, res: res};

    if (goRight && onSuc) _res.data(res, onSuc.call(caller, data));
    else typeof onErr === 'function' ? onErr() : _onErr();
  },
  put: function (req, res, fields, onSuc, onErr) {
    // closure scope
    return ctl.post(req, res, fields, onSuc, onErr);
  },
  _put: function (req, res, fields, onSuc, onErr) {
    // closure scope
    return ctl._post(req, res, fields, onSuc, onErr);
  },
  put2: function (req, res, fields, onSuc, onErr) {
    return ctl.get(req, res, fields, onSuc, onErr);
  },
  delete: function (req, res, fields, onSuc, onErr) {
    "use strict";
    return ctl.get(req, res, fields, onSuc, onErr);
  },
  getUserId: function (req) {
    //if (util.isIn(process.env.NODE_ENV, ['test', '_test']))
    //  return req.query.userId || req.body.userId || req.identity && req.identity.userId;
    //else
    return req.identity && req.identity.userId;
  },
  getProfileId: function (req) {
    "use strict";
    if (!ctl.isDocClient(req)) {
      return null;
    }

    //if (process.env.NODE_ENV in ['test', '_test']) {
    //  return req.query.profileId || req.body.profileId || req.identity && req.identity.userId;
    //} else
    return req.identity && req.identity.userId;
  },
  isLogin: function (req) {
    "use strict";
    if (req.identity && req.identity.userId && req.identity.sessionToken) return true;
    return false
  },
  isDocClient: function (req) {
    "use strict";
    return req.identity.applicationId == serverConf.APPLICATIONS_ID.JULIYE_DOCTOR;
  },
  switchAgent: function (req) {
    if (req && req['User-Agent'] !== undefined) {
      var userAgent = req['User-Agent'];
      if (/Android/.test(userAgent)) {
        return 'android';
      } else if (/iOS/.test(userAgent)) {
        return 'ios';
      } else {
        return undefined;
      }
    } else {
      return undefined;
    }
  }
};

var _res = {
  data: function (res, promise) {
    if (!promise) {
      apiHandler.OUTER_DEF(res, ErrorHandler.getBusinessErrorByCode(8007));
      return;
    }
    if (!(promise instanceof Promise)) {
      promise = Promise.resolve(promise);
    }

    promise.then(function (data) {
      if (!(data instanceof _res.obj.HandedOver)) {
        // if (typeof data !== 'string') {
        //   data = JSON.stringify(data)
        // }
        apiHandler.OK(res, data);
      }
    }, function (err) {
      if (err.code === 30000) {
        apiHandler.warningErr(res, err);
      }
      else {
        apiHandler.OUTER_DEF(res, err);
      }

    })
  },
  msg: function (res, promise) {
    if (!promise) {
      apiHandler.OUTER_DEF(res, ErrorHandler.getBusinessErrorByCode(8007));
      return;
    }
    if (!(promise instanceof Promise))
      promise = Promise.resolve(promise);

    promise.then(function (msg) {
      if (!(msg instanceof _res.obj.HandedOver)) {
        apiHandler.OK(res, {code: '0000', msg: msg});
      }
    }, function (err) {
      apiHandler.OUTER_DEF(res, err);
    })
  },
  obj: {
    HandedOver: function HandedOver() {
    }
  }
};

var svc = {
  thenData: function (mass, promise) {
    promise || (promise = util.getPromise());

    return promise.then(function () {
      return mass;
    }, function (err) {
      throw err;
    });
  },
  thenMsg: function (msg, promise) {
    promise || (promise = util.getPromise());

    return promise.then(function () {
      return {code: '0000', msg: msg};
    }, function (err) {
      throw err;
    });
  },
  errThrower: {
    right: function (isRight, code) {
      if (isRight)
        throw ErrorHandler.getBusinessErrorByCode(code);
    },
    wrong: function (isWrong, code) {
      svc.errThrower.right(!isWrong, code);
    },
    exist: function (obj, code) {
      svc.errThrower.right(util.isExist(obj), code);
    },
    notExist: function (obj, code) {
      svc.errThrower.right(util.isNotExist(obj), code);
    },
    blank: function (obj, code) {
      svc.errThrower.right(util.isBlank(obj), code);
    },
    notBlank: function (obj, code) {
      "use strict";
      svc.errThrower.right(util.isNotBlank(obj), code);
    },
    anyBlank: function (objs, code) {
      "use strict";
      if (objs instanceof Array) {
        objs.forEach(function (obj) {
          svc.errThrower.blank(obj, code)
        })
      } else
        svc.errThrower.blank(obj, code)
    },
    equal: function (obj1, obj2, code) {
      svc.errThrower.right(obj1 == obj2, code);
    },
    unequal: function (obj1, obj2, code) {
      svc.errThrower.right(obj1 != obj2, code);
    },
    in: function (val, obj, code) {
      "use strict";
      svc.errThrower.right(util.isIn(val, obj), code);
    },
    notIn: function (val, obj, code) {
      "use strict";
      svc.errThrower.right(!util.isIn(val, obj), code);
    }
  }
};

var util = {
  isNotExist: function (obj) {
    return obj === null || obj === undefined;
  },
  isExist: function (obj) {
    return !util.isNotExist(obj)
  },
  isBlank: function (obj) {

    if (obj === undefined || obj === null || obj === 'null' || obj === 'undefined' || obj === '') {
      return true;
    } else if ((obj instanceof Array) && obj.length == 0) {
      return true;
    } else if (obj instanceof Object) {
      var objStr = obj.toString();
      if (objStr === '' || objStr === '{}') {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }

  },
  isNotBlank: function (obj) {
    return !util.isBlank(obj);
  },
  isAnyBlank: function (obj, option) {
    // option has
    if (option && option.has && option.has instanceof Array) {
      for (var i = 0; i < option.has.length; i++) {
        if (arguments.callee(obj[option.has[i]])) {
          return true;
        }
      }
      return false;
    }
    if (!(obj instanceof Object))
      return util.isBlank(obj);

    if (obj instanceof Array) {
      try {
        obj.forEach(function (item) {
          if (util.isAnyBlank(item)) throw new Error('hasBlank');
        });
        return false;
      } catch (e) {
        if (e.message == 'hasBlank')
          return true;
        else
          return false;
      }
    } else {
      if (JSON.stringify(obj) === '{}')
        return true;
      for (var key in obj) {
        if (obj.propertyIsEnumerable(key)) {
          if (util.isBlank(obj[key]))
            return true;
        }
      }
    }
    return false;
  },
  isAllIn: function (obj, model) {
    if (obj === null || obj === undefined)
      return false;
    if (model === null || model === undefined)
      return true;
    for (var key in model) {
      if (model.propertyIsEnumerable(key)) {
        if (obj[key] === null || obj[key] === undefined || !util.isIn(obj[key], model[key]))
          return false
      }
    }
    return true;
  },
  isIn: function (val, obj) {
    //model[key].indexOf(obj[key]) === -1
    if (obj instanceof Array) {
      try {
        obj.forEach(function (item) {
          if (val == item) {
            throw new Error('in');
          }
        });
      } catch (e) {
        if (e.message == 'in')
          return true;
      }
    } else
      return false;

    return false;
  },
  isPromise: function (obj) {
    if (obj instanceof Promise) {
      return true
    } else {
      return false;
    }
  },
  toColl: function (mass, type) {
    if (util.isExist(mass)) {
      if (typeof mass === 'string') {
        mass = JSON.parse(mass);
      }

      if (mass instanceof type) {
        return {result: mass, valid: true};
      } else {
        return {result: undefined, valid: false};
      }
    } else {
      return {result: undefined, valid: true};
    }
  },
  toObjId: function (arr) {
    if (util.isExist(arr)) {
      if (typeof arr === 'string') {
        return new ObjectId(arr);
      } else if (arr instanceof Array) {
        return _.map(arr, function (str) {
          if (typeof str === 'string') {
            return new ObjectId(str);
          }
        })
      } else {
        return undefined;
      }
    } else {
      return undefined;
    }
  },
  clone: function (obj) {
    "use strict";
    return JSON.parse(JSON.stringify(obj));
  },
  objCompare: function (ori, ref) {
    "use strict";
    if (util.isBlank(ref)) {
      return true;
    } else {
      for (var key in ref) {
        if (ref.hasOwnProperty(key)) {
          if (ori[key] != ref[key])
            return false;
        }
      }
      return true;
    }
  },
  arrPluck: function (arr, val, except) {
    "use strict";
    var retArr = [];
    if (arr instanceof Array) {
      arr.forEach(function (obj) {
        if (!util.objCompare(obj, except)) {
          retArr.push(obj[val]);
        }
      });
      return retArr;
    } else {
      return retArr;
    }
  },
  arr2Obj: function (arr, id, vals, except) {
    "use strict";
    var retObj = {};
    if (arr instanceof Array) {
      var len = arr.length, obj, valsArr;
      for (var i = 0; i < len; i++) {
        obj = arr[i];
        valsArr = [];
        for (var r = 0; r < vals.length; r++) {
          valsArr.push(obj[vals[r]]);
        }
        retObj[obj[id]] = valsArr;
      }
      return retObj;
    } else {
      return retObj;
    }
  },
  arrFindIndex: function (arr, obj) {
    "use strict";
    if (!(arr instanceof Array) || util.isBlank(obj)) {
      return -1;
    }
    var keys = Object.keys(obj);
    var matched = true, retInd = -1;
    arr.forEach(function (o, i) {
      for (var i = 0; i < keys.length; i++) {
        if (o[keys[i]] !== obj[keys[i]]) {
          matched = false;
        }
      }
      if (matched) {
        retInd = i - 1;
      }
    });
    return retInd;
  },
  arrFilter: function (arr, fn) {
    var _arr = [], _arrOpp = [];
    _.forEach(arr, function (o) {
      if (fn(o)) {
        _arr.push(o);
      } else {
        _arrOpp.push(o);
      }
    });

    return {
      arr: _arr,
      arrOpp: _arrOpp
    }
  },
  toDateStr: function (date) {
    "use strict";
    var dateStr = (date.getYear() + 1900) + '-' + (date.getMonth() + 1) + '-' + date.getDate();
    return dateStr;
  },
  getPromise: function (data) {
    return new Promise(function (resolve, reject) {
      data && resolve(data) || resolve();
    });
  },
  YEAR_TIME: 1000 * 60 * 60 * 24 * 365,
  genAge: function (time) {
    "use strict";

    if (util.isNotExist(time)) {
      return undefined;
    }

    var now = Date.now();
    var dValue = now - new Date(time),
      age;
    if (isNaN(dValue)) {
      age = 1;
    } else {
      age = Math.floor(dValue / util.YEAR_TIME);
      age = age <= 0 ? 1 : age;
    }
    return age;
  },
  genBirthday: function (age) {
    "use strict";
    var year = new Date().getFullYear();
    var birthday = new Date(new String(year - age))
    return birthday;
  },
  genUrl: function (url, params) {
    var paramStr
    if (typeof  params === 'string') {
      paramStr = params
    } else {
      paramStr = querystring.encode(params)
    }
    if (/\?/.test(url)) {
      return url + '&' + paramStr
    } else {
      return url + '?' + paramStr
    }
  },
  thunk: function (fn) {
    "use strict";
    return function () {
      var args = Array.prototype.slice.call(arguments);
      return function (callback) {
        args.push(callback);
        return fn.apply(this, args);
      }
    }
  },
  /**
   * callback function caller
   * @param fn
   * @returns {*|promise}
   */
  cfcall: function (fn) {
    "use strict";
    var deferred = Q.defer();
    fn(function (data) {
      deferred.resolve(data);
    });
    return deferred.promise;
  },
  /**
   * args function caller
   * @param fn
   */
  afcall: function (fn, args) {
    "use strict";
    var deferred = Q.defer();
    args['callback'] = function (data) {
      deferred.resolve(data);
    };
    fn.call(this, args);
    return deferred.promise;
  },

};
var biz = {
  initFunc: function (bag, funcs) {
    // upper scope was linked to funcs
    var _funcs = bag.funcs = bag.funcs || new Object,
      $funcs = _funcs.$funcs = funcs;
    for (var funcKey in $funcs) {
      if ($funcs.propertyIsEnumerable(funcKey))
      // additional scope
        (function (funcKey) {
          _funcs.__defineGetter__(funcKey, function () {
            return $funcs[funcKey].bind(bag);
          })
        })(funcKey);
    }
  },
  init: function (that, args, funcs) {
    var self = this;
    // new bag
    var bag = that.bag = {
      diy: new Object
    };

    if (!funcs) return;
    this.initFunc(bag, funcs);
  },
  // intrusive
  hangAge: function (objs, bdName, ageName) {
    bdName = bdName || 'birthday';
    ageName = ageName || 'age';


    function _hangAge(item) {
      if (item[bdName]) {
        item[ageName] = util.genAge(item[bdName]);
      }
    }

    if (objs === null || objs === undefined)
      return;
    else if (objs instanceof Array) {
      objs.forEach(function (item) {
        _hangAge(item);
      });
    } else if (objs instanceof Object)
      _hangAge(objs);
  }
};

var $f = {
  partial: function (f) {
    var _args = _.toArray(_.rest(arguments));
    return function () {
      var args = _.toArray(arguments);
      return f.apply(f, Array.prototype.concat.call(_args, args));
    }
  },
  partialT: function (f) {
    var _args = _.toArray(_.rest(arguments));
    return function () {
      var args = _.toArray(arguments);
      return f.apply(f, Array.prototype.concat.call(args, _args));
    }
  },
  curry1: function (f) {
    return function (x) {
      return f(x)
    }
  },
  curry2: function (f) {
    return function (x) {
      return function (y) {
        return f(y, x);
      }
    }
  },
  curry3: function (f) {
    return function (x) {
      return function (y) {
        return function (z) {
          return f(z, y, x);
        }
      }
    }
  },
  curry: function (level) {

    return function (f) {
      var _args = [];

      function _f(arg) {
        _args.push(arg);

        if (_args.length == level) {
          return Function.prototype.apply.call(f, null, Array.prototype.reverse.call(_args));
        } else {
          return _f
        }
      }

      return _f;

    }

  },
  segmentMissionsPromise: function (missions, segment, interval) {

    var deferred = Q.defer();

    var retObj = retObj || {
        sucCount: 0,
      };

    segment = segment || 500;
    interval = interval || 0;

    function timeoutF(missions) {
      if (missions.length == 0) {
        deferred.resolve(retObj);
      } else {
        var m1 = _.first(missions, segment);
        setTimeout(function () {
          Promise.all($f.aryfcall(m1)).then(function (missionResults) {
            if (missionResults instanceof Array) {
              retObj.sucCount += missionResults.length;
            }

            setTimeout(function () {
              timeoutF(_.rest(missions, segment))
            }, interval);

          })
        }, 0);

      }
    }

    timeoutF(missions);

    return deferred.promise;
  },
  lazyPromise: function (obj) {
    var _f = function (fin) {
      _calls.push(fin);
      return _f;
    };

    var isLP = obj && obj.toString() === _f.toString() || false;

    var _calls = isLP ? obj._calls : [];
    var _target = isLP ? obj._target : obj;
    var onCatch

    _f._calls = _calls;
    _f._target = _target;

    _f.value = function () {

      var reduce = function (f, p, fun) {
        return f(p, fun);
      };

      var promiseF = function (p, fun) {
        if (util.isPromise(fun)) {
          return fun;
        } else {
          return p.then($f.partial(fun, _target))
        }
      };

      var reduceF = $f.partial(reduce, promiseF);

      var p = _.reduce(_calls, reduceF, Promise.resolve());

      if (onCatch) {
        if (_.isFunction(p.catch)) {
          p.catch(onCatch)
        } else {
          p.then(new Function, onCatch)
        }
      }
      return p
    };

    _f.catch = function (onRejected) {
      onCatch = function (e) {
        return onRejected(e)
      }
      return _f
    }

    return _f;
  },
  lazySync: function (obj) {
    var _calls = [];

    function _f(fn) {
      _calls.push(fn);
      return _f;
    }

    function thunk(call) {
      call(obj);
    }

    _f.value = function () {
      return _.each(_calls, thunk);
    };

    return _f;
  },
  aryfcall: function (ary, target) {
    return _.map(ary, function (fn) {
      if (_.isFunction(fn)) {
        return fn.apply(target);
      } else {
        return fn;
      }
    })
  },
  aryfcallAsync: function (ary, target) {
    return _.map(ary, function (fn) {
      if (_.isFunction(fn)) {
        setTimeout(fn.apply(target));
      } else {
        setTimeout(fn);
      }
    })
  }
};

module.exports = exports = {
  ctl: ctl,
  svc: svc,
  res: _res,
  biz: biz,
  util: util,
  f: $f,
  err: svc.errThrower,
};