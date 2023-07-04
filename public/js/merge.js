/**
 * *****************************************************************************
 * App顶级模块
 * *****************************************************************************
 */
// Declare app level module which depends on views, and components
'use strict';

var app = angular.module('myApp', [
  'ngRoute',//第三方路由模块
  'myApp.login',
  'myApp.home',
  'myApp.indicator',  //指标统计界面
  'myApp.doctor',  //所有医生
  'myApp.customers',//所有患者
  'myApp.rechargeCustomers',//充值患者
  'myApp.doctorOrders',//医生所有订单
  'myApp.customerOrders',//患者所有订单
  'myApp.rechargeDetail',//患者充值详情
  'myApp.allOrders',  //所有电话订单
  'myApp.allExclusiveDoctorOrders',  //所有专属医生订单
  'myApp.applyTobeDoctor', //申请成为医生列表
  'myApp.applyWithdraw',  //医生提现申请
  'myApp.favorites',  //收藏医生的患者列表
  'myApp.queryByDevices', //查询医生的设备列表
  'myApp.addDoctor',  //新增医生
  'myApp.validDoctor',  //所有成单的医生
  'myApp.sfActivity',   //拜年活动统计
  'myApp.exclusiveDoctorInterested'   //对专属医生服务感兴趣的用户
]).
  config(['$routeProvider', function ($routeProvider) {
    $routeProvider.otherwise({redirectTo: '/login'});//index
  }]);

var getHeadToken = function () {
  return {
    "x-docchat-user-id": window.localStorage.getItem('username'),
    "x-docchat-session-token": window.localStorage.getItem('sessionToken')
  };
};


/**
 * *****************************************************************************
 * 登陆模块
 * *****************************************************************************
 */
angular.module('myApp.login', ['ngRoute'])
  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/login', {
      templateUrl: 'operation/login.html',
      controller: 'loginCtrl'
    });
  }])

  .controller('loginCtrl', function ($scope, $http) {
    if (window.localStorage.getItem('username')) {
      window.location = '/#/home';
    }

    $scope.login = function () {
      $http({
        method: 'post',
        url: '1/operation/login',
        data: {
          username: $('#username').val(),
          password: $('#pw').val()  // $.md5($('#pw').val()
        }
      })
        .success(function (user) {
          window.localStorage.setItem('username', user.username);
          window.localStorage.setItem('sessionToken', user.sessionToken);
          //window.sessionStorage.setItem('username', user.username);
          //window.sessionStorage.setItem('sessionToken', user.sessionToken);

          window.location = '/#/home';
        }).error(function (data) {
          alert(data.msg);
        });
    };
  });

/**
 * *****************************************************************************
 * 主界面
 * *****************************************************************************
 */
angular.module('myApp.home', ['ngRoute'])
  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/home', {
      templateUrl: 'operation/home.html',
      controller: 'homeCtrl'
    });
  }])
  .controller('homeCtrl', function ($scope, $http) {
    //console.log("getHeadToken-->" + JSON.stringify(getHeadToken()));
  });

/**
 * *****************************************************************************
 * 指标统计界面
 * *****************************************************************************
 */
angular.module('myApp.indicator', ['ngRoute'])
  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/indicator', {
      templateUrl: 'operation/indicator.html',
      controller: 'indicatorCustomerCtrl'
    });
  }])
  .controller('indicatorCustomerCtrl', function ($scope, $http) {
    var url = '/1/operation/indicatorStatistics';
    $scope.pageNum = 0;
    $scope.pageSize = 20;

    $http({
      url: url + "?pageNum=" + $scope.pageNum + "&pageSize=" + $scope.pageSize,
      method: 'GET',
      headers: getHeadToken()
    }).success(function (res) {
      $scope.datas = res
    });

    //下一页
    $scope.NextPage = function () {
      $scope.pageNum++;
      $http({
        url: url + "?pageNum=" + $scope.pageNum + "&pageSize=" + $scope.pageSize,
        method: 'GET',
        headers: getHeadToken()
      }).success(function (res) {
        $scope.datas = res
      });
    };

    //上一页
    $scope.PrePage = function () {
      if ($scope.pageNum >= 1) {
        $scope.pageNum--;
        $http({
          url: url + "?pageNum=" + $scope.pageNum + "&pageSize=" + $scope.pageSize,
          method: 'GET',
          headers: getHeadToken()
        }).success(function (res) {
          $scope.datas = res
        });
      }
    };
  });

/**
 * *****************************************************************************
 * 医生统计界面
 * *****************************************************************************
 */
angular.module('myApp.doctor', ['ngRoute'])
  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/doctor', {
      templateUrl: 'operation/doctor.html',
      controller: 'doctorCtrl'
    });
  }])
  .controller('doctorCtrl', function ($scope, $http) {
    $scope.pageNum = 0;
    $scope.pageSize = 20;

    $http({
      url: '/1/operation/allDoctorStatistics?pageNum=' + $scope.pageNum + "&pageSize=" + $scope.pageSize,
      method: 'GET',
      headers: getHeadToken()
    }).success(function (res) {
      console.log("Result: " + res.length);
      $scope.datas = res
    });

    //下一页
    $scope.NextPage = function () {
      $scope.pageNum++;
      $http({
        url: '/1/operation/allDoctorStatistics?pageNum=' + $scope.pageNum + "&pageSize=" + $scope.pageSize,
        method: 'GET',
        headers: getHeadToken()
      }).success(function (res) {
        $scope.datas = res
      });
    };

    //上一页
    $scope.PrePage = function () {
      if ($scope.pageNum >= 1) {
        $scope.pageNum--;
        $http({
          url: '/1/operation/allDoctorStatistics?pageNum=' + $scope.pageNum + "&pageSize=" + $scope.pageSize,
          method: 'GET',
          headers: getHeadToken()
        }).success(function (res) {
          $scope.datas = res
        });
      }
    };

    //跳医生订单界面
    $scope.orders = function (doctorId) {
      window.location = '/#/doctorOrders?id=' + doctorId;
    };

    //跳收藏医生的患者列表界面
    $scope.favorites = function (doctorId) {
      window.location = '/#/favorites?id=' + doctorId;
    };
    //跳查询医生的设备列表界面
    $scope.queryByDevices = function (doctorId) {
      window.location = '/#/queryByDevices?id=' + doctorId;
    };

  });

/**
 * *****************************************************************************
 * 患者统计界面
 * *****************************************************************************
 */
angular.module('myApp.customers', ['ngRoute'])
  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/customers', {
      templateUrl: 'operation/customers.html',
      controller: 'customersCtrl'
    });
  }])
  .controller('customersCtrl', function ($scope, $http) {
    $scope.pageNum = 0;
    $scope.pageSize = 20;

    $http({
      url: '/1/operation/allCustomerStatistics?pageNum=' + $scope.pageNum + "&pageSize=" + $scope.pageSize,
      method: 'GET',
      headers: getHeadToken()
    }).success(function (res) {
      console.log("Result: " + res.length);
      $scope.datas = res
    });

    //下一页
    $scope.NextPage = function () {
      $scope.pageNum++;
      $http({
        url: '/1/operation/allCustomerStatistics?pageNum=' + $scope.pageNum + "&pageSize=" + $scope.pageSize,
        method: 'GET',
        headers: getHeadToken()
      }).success(function (res) {
        $scope.datas = res
      });
    };

    //上一页
    $scope.PrePage = function () {
      if ($scope.pageNum >= 1) {
        $scope.pageNum--;
        $http({
          url: '/1/operation/allCustomerStatistics?pageNum=' + $scope.pageNum + "&pageSize=" + $scope.pageSize,
          method: 'GET',
          headers: getHeadToken()
        }).success(function (res) {
          $scope.datas = res
        });
      }
    };

    //跳患者订单界面
    $scope.orders = function (id) {
      window.location = '/#/customerOrders?id=' + id;
    };

    $scope.rechargeDetail = function (id) {
      window.location = '/#/rechargeDetail?id=' + id;
    };

  });


/**
 * *****************************************************************************
 * 充值患者统计界面
 * *****************************************************************************
 */
angular.module('myApp.rechargeCustomers', ['ngRoute'])
  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/rechargeCustomers', {
      templateUrl: 'operation/rechargeCustomers.html',
      controller: 'rechargeCustomerCtrl'
    });
  }])
  .controller('rechargeCustomerCtrl', function ($scope, $http) {
    var url = '/1/operation/allRechargeCustomerStatistics';
    $scope.pageNum = 0;
    $scope.pageSize = 20;

    $http({
      url: url + "?pageNum=" + $scope.pageNum + "&pageSize=" + $scope.pageSize,
      method: 'GET',
      headers: getHeadToken()
    }).success(function (res) {
      //console.log("Result: " + res.length);
      $scope.datas = res
    });

    //下一页
    $scope.NextPage = function () {
      $scope.pageNum++;
      $http({
        url: url + "?pageNum=" + $scope.pageNum + "&pageSize=" + $scope.pageSize,
        method: 'GET',
        headers: getHeadToken()
      }).success(function (res) {
        $scope.datas = res
      });
    };

    //上一页
    $scope.PrePage = function () {
      if ($scope.pageNum >= 1) {
        $scope.pageNum--;
        $http({
          url: url + "?pageNum=" + $scope.pageNum + "&pageSize=" + $scope.pageSize,
          method: 'GET',
          headers: getHeadToken()
        }).success(function (res) {
          $scope.datas = res
        });
      }
    };

    //跳患者订单界面
    $scope.orders = function (id) {
      window.location = '/#/customerOrders?id=' + id;
    };

    $scope.rechargeDetail = function (id) {
      window.location = '/#/rechargeDetail?id=' + id;
    };

  });


var directionFilter = function (direction, byetype) {
  var data;
  if (direction == 'C2D') {
    data = '患者/';
    if (byetype == '-10' || byetype == '-3' || byetype == '3')
      data += '患者';
    else if (byetype == '-9' || byetype == '4')
      data += '医生';

  } else {
    data = '医生/';
    if (byetype == '-10' || byetype == '-3' || byetype == '3')
      data += '医生';
    else if (byetype == '-9' || byetype == '4')
      data += '患者';
  }

  return data;
};

var callStatusFilter = function (callStatus, failedReason) {
  if (callStatus == 'failed') {
    var message = '通话失败';
    if (failedReason == 1303)
      message += '(余额不足)';
    else if (failedReason == 1402)
      message += '(有欠费订单)';
    else if (failedReason == 1301)
      message += '(医生不在线)';
    else if (failedReason == 1302)
      message += '(医生正忙)';
    else if (failedReason == 1304)
      message += '(患者正忙)';

    return message;
  } else if (callStatus == 'busy')
    return '通话中';
  else if (callStatus == 'over')
    return '通话结束';
  else if (callStatus == 'waitingSS')
    return '通话失败(第三方外呼失败)';
};

var callPriceFilter = function (callPrice) {
  if (!callPrice)
    return "";

  var message = '医生起步价-每分钟价:' + callPrice.initiateIncome + '-' + callPrice.incomePerMin +
    '患者起步价-每分钟价:' + callPrice.initiatePayment + '-' + callPrice.paymentPerMin +
    '折扣率:' + callPrice.discount;

  return message;
};

var recodeurlFilter = function (recordurl) {
  if (!recordurl)
    return '';
  else
    return '下载';
};

Date.prototype.format = function (format) {
  var date = {
    "M+": this.getMonth() + 1,
    "d+": this.getDate(),
    "H+": this.getHours(),
    "m+": this.getMinutes(),
    "s+": this.getSeconds(),
    "q+": Math.floor((this.getMonth() + 3) / 3),
    "S+": this.getMilliseconds()
  };
  if (/(y+)/i.test(format)) {
    format = format.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
  }
  for (var k in date) {
    if (new RegExp("(" + k + ")").test(format)) {
      format = format.replace(RegExp.$1, RegExp.$1.length == 1
        ? date[k] : ("00" + date[k]).substr(("" + date[k]).length));
    }
  }
  return format;
};

var couponConsumedFilter = function (isConsumed, time) {
  if (isConsumed)
    return new Date(time).format("yyyy-MM-dd HH:mm") + '';
  else
    return '未使用';
};

var validCustomersFilter = function (customers) {
  var result = "";
  for (var i = 0; i < customers.length; i++) {
    result += customers[i].name + "(" + customers[i].count + "),";
  }

  return result;
};

var exclusiveDoctorPriceAndTimeFilter = function (price, startTime, endTime) {
  console.log(price + "---" + startTime + "---" + endTime);
  if (startTime == 0 || endTime == 0)
    return price + "元/年";

  return price + "元/年，有效期：" + new Date(startTime).format("yyyy.MM.dd") + "-" + new Date(endTime).format("yyyy.MM.dd");
};


/**
 * *****************************************************************************
 * 所有电话订单
 * *****************************************************************************
 */
angular.module('myApp.allOrders', ['ngRoute'])
  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/allOrders', {
      templateUrl: 'operation/orders.html',
      controller: 'allOrdersCtrl'
    });
  }])
  .filter('directionFilter', function () {
    return directionFilter;
  })
  .filter('callStatusFilter', function () {
    return callStatusFilter;
  })
  .filter('callPriceFilter', function () {
    return callPriceFilter;
  })
  .filter('recodeurlFilter', function () {
    return recodeurlFilter;
  })
  .controller('allOrdersCtrl', function ($scope, $http, $routeParams) {
    var url = '/1/operation/allOrders';
    $scope.showAll = true;
    $scope.pageNum = 0;
    $scope.pageSize = 20;

    $http({
      url: url + "?pageNum=" + $scope.pageNum + "&pageSize=" + $scope.pageSize,
      method: 'GET',
      headers: getHeadToken()
    }).success(function (res) {
      $scope.datas = res
    });

    //切换订单类型
    $scope.switchType = function () {
      $scope.pageNum = 0;

      if ($scope.showAll) {
        url = '/1/operation/allValidOrders';
        $scope.showAll = false;
      } else {
        url = '/1/operation/allOrders';
        $scope.showAll = true;
      }

      $http({
        url: url + "?pageNum=" + $scope.pageNum + "&pageSize=" + $scope.pageSize,
        method: 'GET',
        headers: getHeadToken()
      }).success(function (res) {
        $scope.datas = res
      });
    };

    //下一页
    $scope.NextPage = function () {
      $scope.pageNum++;
      $http({
        url: url + "?pageNum=" + $scope.pageNum + "&pageSize=" + $scope.pageSize,
        method: 'GET',
        headers: getHeadToken()
      }).success(function (res) {
        $scope.datas = res
      });
    };

    //上一页
    $scope.PrePage = function () {
      if ($scope.pageNum >= 1) {
        $scope.pageNum--;
        $http({
          url: url + "?pageNum=" + $scope.pageNum + "&pageSize=" + $scope.pageSize,
          method: 'GET',
          headers: getHeadToken()
        }).success(function (res) {
          $scope.datas = res
        });
      }
    };

  });


/**
 * *****************************************************************************
 * 所有专属医生订单
 * *****************************************************************************
 */
angular.module('myApp.allExclusiveDoctorOrders', ['ngRoute'])
  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/allExclusiveDoctorOrders', {
      templateUrl: 'operation/allExclusiveDoctorOrders.html',
      controller: 'allExclusiveDoctorOrdersCtrl'
    });
  }])
  .filter('exclusiveDoctorPriceAndTimeFilter', function () {
    return exclusiveDoctorPriceAndTimeFilter;
  })
  .controller('allExclusiveDoctorOrdersCtrl', function ($scope, $http, $routeParams) {
    var url = '/1/operation/allExclusiveDoctorOrders';
    $scope.pageNum = 0;
    $scope.pageSize = 20;

    $http({
      url: url + "?pageNum=" + $scope.pageNum + "&pageSize=" + $scope.pageSize,
      method: 'GET',
      headers: getHeadToken()
    }).success(function (res) {
      $scope.datas = res
    });

    //下一页
    $scope.NextPage = function () {
      $scope.pageNum++;
      $http({
        url: url + "?pageNum=" + $scope.pageNum + "&pageSize=" + $scope.pageSize,
        method: 'GET',
        headers: getHeadToken()
      }).success(function (res) {
        $scope.datas = res
      });
    };

    //上一页
    $scope.PrePage = function () {
      if ($scope.pageNum >= 1) {
        $scope.pageNum--;
        $http({
          url: url + "?pageNum=" + $scope.pageNum + "&pageSize=" + $scope.pageSize,
          method: 'GET',
          headers: getHeadToken()
        }).success(function (res) {
          $scope.datas = res
        });
      }
    };

  });


/**
 * *****************************************************************************
 * 医生订单界面
 * *****************************************************************************
 */
angular.module('myApp.doctorOrders', ['ngRoute'])
  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/doctorOrders', {
      templateUrl: 'operation/orders.html',
      controller: 'doctorOrdersCtrl'
    });
  }])
  .filter('directionFilter', function () {
    return directionFilter;
  })
  .filter('callStatusFilter', function () {
    return callStatusFilter;
  })
  .filter('callPriceFilter', function () {
    return callPriceFilter;
  })
  .filter('recodeurlFilter', function () {
    return recodeurlFilter;
  })
  .controller('doctorOrdersCtrl', function ($scope, $http, $routeParams) {
    var url = '/1/operation/doctorOrders';
    $scope.pageNum = 0;
    $scope.pageSize = 20;

    $http({
      url: url + "?showAll=true&userId=" + $routeParams.id + "&pageNum=" + $scope.pageNum + "&pageSize=" + $scope.pageSize,
      method: 'GET',
      headers: getHeadToken()
    }).success(function (res) {
      $scope.datas = res
    });

    //下一页
    $scope.NextPage = function () {
      $scope.pageNum++;
      $http({
        url: url + "?showAll=true&userId=" + $routeParams.id + "&pageNum=" + $scope.pageNum + "&pageSize=" + $scope.pageSize,
        method: 'GET',
        headers: getHeadToken()
      }).success(function (res) {
        $scope.datas = res
      });
    };

    //上一页
    $scope.PrePage = function () {
      if ($scope.pageNum >= 1) {
        $scope.pageNum--;
        $http({
          url: url + "?showAll=true&userId=" + $routeParams.id + "&pageNum=" + $scope.pageNum + "&pageSize=" + $scope.pageSize,
          method: 'GET',
          headers: getHeadToken()
        }).success(function (res) {
          $scope.datas = res
        });
      }
    };

  });

/**
 * *****************************************************************************
 * 患者订单界面
 * *****************************************************************************
 */
angular.module('myApp.customerOrders', ['ngRoute'])
  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/customerOrders', {
      templateUrl: 'operation/orders.html',
      controller: 'customerOrdersCtrl'
    });
  }])
  .filter('directionFilter', function () {
    return directionFilter;
  })
  .filter('callStatusFilter', function () {
    return callStatusFilter;
  })
  .filter('callPriceFilter', function () {
    return callPriceFilter;
  })
  .filter('recodeurlFilter', function () {
    return recodeurlFilter;
  })
  .controller('customerOrdersCtrl', function ($scope, $http, $routeParams) {
    var url = '/1/operation/customerOrders';
    $scope.pageNum = 0;
    $scope.pageSize = 20;

    $http({
      url: url + "?showAll=true&userId=" + $routeParams.id + "&pageNum=" + $scope.pageNum + "&pageSize=" + $scope.pageSize,
      method: 'GET',
      headers: getHeadToken()
    }).success(function (res) {
      $scope.datas = res
    });

    //下一页
    $scope.NextPage = function () {
      $scope.pageNum++;
      $http({
        url: url + "?showAll=true&userId=" + $routeParams.id + "&pageNum=" + $scope.pageNum + "&pageSize=" + $scope.pageSize,
        method: 'GET',
        headers: getHeadToken()
      }).success(function (res) {
        $scope.datas = res
      });
    };

    //上一页
    $scope.PrePage = function () {
      if ($scope.pageNum >= 1) {
        $scope.pageNum--;
        $http({
          url: url + "?showAll=true&userId=" + $routeParams.id + "&pageNum=" + $scope.pageNum + "&pageSize=" + $scope.pageSize,
          method: 'GET',
          headers: getHeadToken()
        }).success(function (res) {
          $scope.datas = res
        });
      }
    };

  });


/**
 * *****************************************************************************
 * 患者充值详情界面
 * *****************************************************************************
 */
angular.module('myApp.rechargeDetail', ['ngRoute'])
  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/rechargeDetail', {
      templateUrl: 'operation/rechargeDetail.html',
      controller: 'rechargeDetailCtrl'
    });
  }])
  .controller('rechargeDetailCtrl', function ($scope, $http, $routeParams) {
    var url = '/1/operation/customerRechargeDetail';
    $scope.pageNum = 0;
    $scope.pageSize = 20;

    $http({
      url: url + "?userId=" + $routeParams.id + "&pageNum=" + $scope.pageNum + "&pageSize=" + $scope.pageSize,
      method: 'GET',
      headers: getHeadToken()
    }).success(function (res) {
      $scope.datas = res
    });

    //下一页
    $scope.NextPage = function () {
      $scope.pageNum++;
      $http({
        url: url + "?userId=" + $routeParams.id + "&pageNum=" + $scope.pageNum + "&pageSize=" + $scope.pageSize,
        method: 'GET',
        headers: getHeadToken()
      }).success(function (res) {
        $scope.datas = res
      });
    };

    //上一页
    $scope.PrePage = function () {
      if ($scope.pageNum >= 1) {
        $scope.pageNum--;
        $http({
          url: url + "?userId=" + $routeParams.id + "&pageNum=" + $scope.pageNum + "&pageSize=" + $scope.pageSize,
          method: 'GET',
          headers: getHeadToken()
        }).success(function (res) {
          $scope.datas = res
        });
      }
    };

  });

/**
 * *****************************************************************************
 * 医生申请界面
 * *****************************************************************************
 */
angular.module('myApp.applyTobeDoctor', ['ngRoute'])
  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/applyTobeDoctor', {
      templateUrl: 'operation/applyTobeDoctor.html',
      controller: 'applyTobeDoctorCtrl'
    });
  }])
  .filter('callPriceFilter', function () {
    return callPriceFilter;
  })
  .controller('applyTobeDoctorCtrl', function ($scope, $http, $routeParams) {
    var url = '/1/operation/allDoctorApply';
    $scope.pageNum = 0;
    $scope.pageSize = 20;

    var getData = function () {
      $http({
        url: url + "?pageNum=" + $scope.pageNum + "&pageSize=" + $scope.pageSize,
        method: 'GET',
        headers: getHeadToken()
      }).success(function (res) {
        $scope.datas = res
      });
    };

    getData();

    $scope.handle = function (id, handle) {
      $http({
        method: 'post',
        url: '/1/operation/applyHandle',
        headers: getHeadToken(),
        data: {
          'doctorId': id,
          'handle': handle
        }

      }).success(function (res) {
        getData();
      }).error(function (e) {
        alert('添加失败:' + JSON.stringify(e));
      });
    };

    //下一页
    $scope.NextPage = function () {
      $scope.pageNum++;
      $http({
        url: url + "?pageNum=" + $scope.pageNum + "&pageSize=" + $scope.pageSize,
        method: 'GET',
        headers: getHeadToken()
      }).success(function (res) {
        $scope.datas = res
      });
    };

    //上一页
    $scope.PrePage = function () {
      if ($scope.pageNum >= 1) {
        $scope.pageNum--;
        $http({
          url: url + "?pageNum=" + $scope.pageNum + "&pageSize=" + $scope.pageSize,
          method: 'GET',
          headers: getHeadToken()
        }).success(function (res) {
          $scope.datas = res
        });
      }
    };

  });

/**
 * *****************************************************************************
 * 申请提现界面
 * *****************************************************************************
 */
angular.module('myApp.applyWithdraw', ['ngRoute'])
  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/applyWithdraw', {
      templateUrl: 'operation/applyWithdraw.html',
      controller: 'applyWithdrawCtrl'
    });
  }])
  .filter('statusFilter', function () {
    return function (status) {
      switch (status) {
        case 0:
          return '新建申请';
        case 1:
          return '已受理';
        case 2:
          return '已批准';
        case -1:
          return '系统拒绝';
        default:
          return '拒绝';
      }
    };
  })
  .controller('applyWithdrawCtrl', function ($scope, $http, $routeParams) {
    var url = '/1/operation/allWithdrawApply';
    $scope.pageNum = 0;
    $scope.pageSize = 20;

    $http({
      url: url + "?pageNum=" + $scope.pageNum + "&pageSize=" + $scope.pageSize,
      method: 'GET',
      headers: getHeadToken()
    }).success(function (res) {
      $scope.datas = res
    });

    //下一页
    $scope.NextPage = function () {
      $scope.pageNum++;
      $http({
        url: url + "?pageNum=" + $scope.pageNum + "&pageSize=" + $scope.pageSize,
        method: 'GET',
        headers: getHeadToken()
      }).success(function (res) {
        $scope.datas = res
      });
    };

    //上一页
    $scope.PrePage = function () {
      if ($scope.pageNum >= 1) {
        $scope.pageNum--;
        $http({
          url: url + "?pageNum=" + $scope.pageNum + "&pageSize=" + $scope.pageSize,
          method: 'GET',
          headers: getHeadToken()
        }).success(function (res) {
          $scope.datas = res
        });
      }
    };

  });

/**
 * *****************************************************************************
 * 收藏医生的患者列表界面
 * *****************************************************************************
 */
angular.module('myApp.favorites', ['ngRoute'])
  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/favorites', {
      templateUrl: 'operation/favorites.html',
      controller: 'favoritesCtrl'
    });
  }])
  .controller('favoritesCtrl', function ($scope, $http, $routeParams) {
    var url = '/1/operation/favorites';
    //$scope.pageNum = 0;
    //$scope.pageSize = 20;

    $http({
      url: url + "?doctorId=" + $routeParams.id,
      method: 'GET',
      headers: getHeadToken()
    }).success(function (res) {
      $scope.datas = res
    });

    ////下一页
    //$scope.NextPage = function () {
    //  $scope.pageNum++;
    //  $http({
    //    url: url + "?doctorId=" + $routeParams.id + "&pageNum=" + $scope.pageNum + "&pageSize=" + $scope.pageSize,
    //    method: 'GET',
    //    headers: getHeadToken()
    //  }).success(function (res) {
    //    $scope.datas = res
    //  });
    //};
    //
    ////上一页
    //$scope.PrePage = function () {
    //  if ($scope.pageNum >= 1) {
    //    $scope.pageNum--;
    //    $http({
    //      url: url + "?doctorId=" + $routeParams.id + "&pageNum=" + $scope.pageNum + "&pageSize=" + $scope.pageSize,
    //      method: 'GET',
    //      headers: getHeadToken()
    //    }).success(function (res) {
    //      $scope.datas = res
    //    });
    //  }
    //};

  });

/**
 * *****************************************************************************
 * 查询过医生的设备对应账户列表
 * *****************************************************************************
 */
angular.module('myApp.queryByDevices', ['ngRoute'])
  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/queryByDevices', {
      templateUrl: 'operation/queryByDevices.html',
      controller: 'queryByDevicesCtrl'
    });
  }])
  .controller('queryByDevicesCtrl', function ($scope, $http, $routeParams) {
    var url = '/1/operation/queryByDevices';

    $http({
      url: url + "?doctorId=" + $routeParams.id,
      method: 'GET',
      headers: getHeadToken()
    }).success(function (res) {
      $scope.datas = res
    });
  });

/**
 * *****************************************************************************
 * 新增医生
 * *****************************************************************************
 */
angular.module('myApp.addDoctor', ['ngRoute'])
  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/addDoctor', {
      templateUrl: 'operation/addDoctor.html',
      controller: 'addDoctorCtrl'
    });
  }])
  .controller('addDoctorCtrl', function ($scope, $http, $routeParams) {
    var url = '/1/operation/addDoctor';

    $scope.doctor = {
      callPrice: {}
    };

    $scope.create = function () {
      if (!($('#hospitals_key_value').val())) {
        alert('请选择医院');
        return;
      }
      if (!($('#departments_key_value').val())) {
        alert('请选择科室');
        return;
      }
      if (!$scope.doctor.realName) {
        alert('请输入医生姓名');
        return;
      }
      //if (!$scope.doctor.position) {
      //  alert('请输入医生职称');
      //  return;
      //}
      if (!$scope.doctor.phoneNum) {
        alert('请输入医生电话');
        return;
      }
      if (!$scope.doctor.sex) {
        alert('请输入医生性别');
        return;
      }
      if (!$scope.doctor.docChatNum) {
        alert('请输入医生医聊号');
        return;
      }
      if (!$scope.doctor.callPrice.discount) {
        alert('请输入医生电话折扣');
        return;
      }
      if (!$scope.doctor.callPrice.doctorInitiateTime) {
        alert('请输入医生起步时长');
        return;
      }
      if (!$scope.doctor.callPrice.initiateIncome) {
        alert('请输入医生起步价');
        return;
      }
      if ($scope.doctor.callPrice.incomePerMin == 'undefined') {
        alert('请输入起步时长后每分钟医生收入');
        return;
      }
      if ($scope.doctor.callPrice.customerInitiateTime == 'undefined') {
        alert('请输入患者起步时长');
        return;
      }
      if ($scope.doctor.callPrice.initiatePayment == 'undefined') {
        alert('请输入患者起步价');
        return;
      }
      if ($scope.doctor.callPrice.paymentPerMin == 'undefined') {
        alert('请输入起步时长后每分钟患者支出');
        return;
      }

      var hospital = getHospital();
      $scope.doctor.hospitalId = hospital.hospitalId;
      $scope.doctor.hospital = hospital.hospitalName;
      $scope.doctor.departmentId = hospital.departmentId;
      $scope.doctor.department = hospital.departmentName;

      $scope.doctor.applyStatus = 'done';
      $scope.doctor.password = 'e10adc3949ba59abbe56e057f20f883e';

      console.log("doctor:" + JSON.stringify($scope.doctor));

      $http({
        method: 'post',
        url: url,
        headers: getHeadToken(),
        data: $scope.doctor
      }).success(function () {
        alert('添加成功！');
        //clearForm();
      }).error(function (e) {
        alert('添加失败:' + JSON.stringify(e));
      });
    };

    function getHospital() {
      var hospital = {};
      hospital.provinceId = $('#province_id_value').val();
      hospital.provinceName = $('#province_name_value').val();
      hospital.districtId = $('#area_value').val();
      hospital.districtName = $('#area_key_value').val();
      hospital.hospitalId = $('#hospitals_value').val();
      hospital.hospitalName = $('#hospitals_key_value').val();
      hospital.departmentId = $('#departments_value').val();
      hospital.departmentName = $('#departments_key_value').val();
      return hospital;
    }

    function clearForm() {
      $scope.doctor = {};
      $('#area_key_value').val('');
      $('#hospitals_key_value').val('');
      $('#departments_key_value').val('');
      $('#departments_value').val('');
      $('#hospitals_value').val('');
      $('#area_value').val('');
    }
  });

/**
 * *****************************************************************************
 * 成单医生统计
 * *****************************************************************************
 */
angular.module('myApp.validDoctor', ['ngRoute'])
  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/validDoctor', {
      templateUrl: 'operation/validDoctor.html',
      controller: 'validDoctorCtrl'
    });
  }])
  .filter('validCustomersFilter', function () {
    return validCustomersFilter;
  })
  .controller('validDoctorCtrl', function ($scope, $http, $routeParams) {
    var url = '/1/operation/doctorValidOrderNumAndCustomers';

    $http({
      url: url,
      method: 'GET',
      headers: getHeadToken()
    }).success(function (res) {
      $scope.datas = res
    });
  });


/**
 * *****************************************************************************
 * 拜年活动统计界面
 * *****************************************************************************
 */
angular.module('myApp.sfActivity', ['ngRoute'])
  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/sfActivity', {
      templateUrl: 'operation/sfActivity.html',
      controller: 'sfActivityCtrl'
    });
  }])
  .filter('couponConsumedFilter', function () {
    return couponConsumedFilter;
  })
  .controller('sfActivityCtrl', function ($scope, $http, $routeParams) {
    var url = '/1/operation/sfActivity';
    //$scope.pageNum = 0;
    //$scope.pageSize = 20;

    $http({
      url: url,
      method: 'GET',
      headers: getHeadToken()
    }).success(function (res) {
      $scope.datas = res
    });

    //跳患者订单界面
    $scope.orders = function (id) {
      window.location = '/#/customerOrders?id=' + id;
    };
  });

/**
 * *****************************************************************************
 * 对专属医生服务感兴趣的用户
 * *****************************************************************************
 */
angular.module('myApp.exclusiveDoctorInterested', ['ngRoute'])
  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/exclusiveDoctorInterested', {
      templateUrl: 'operation/exclusiveDoctorInterested.html',
      controller: 'exclusiveDoctorInterestedCtrl'
    });
  }])
  .controller('exclusiveDoctorInterestedCtrl', function ($scope, $http, $routeParams) {
    var url = '/1/operation/exclusiveDoctorInterested';

    $http({
      url: url,
      method: 'GET',
      headers: getHeadToken()
    }).success(function (res) {
      $scope.datas = res
    });

  });