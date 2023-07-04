/**
 *  红包生成算法相关
 *  DocChat-backend
 *  Created by Jacky.L on 1/17/17.
 *  Copyright (c) 2014 ZLYCare. All rights reserved.
 */
var _ = require("underscore");

var CONS = {
  MIN: 1,
  MAX: 20000
};

var genInitMoney = function (money, number) {
  return {
    leftMoney: (money - number * CONS.MIN),
    leftNumber: number,
    avg: (money / number)
  };
};
var genNextRandomMoney = function (avg, leftMoney, leftSize) {

  if (leftMoney <= 0 || leftSize <= 0) return null;

  var min = 0;
  var max = max(avg, leftMoney / leftSize);

  return money + 0.01;
};
// 获取随机整数
var getRandomInt = function (min, max) {
  // Return (min, max)
  min = Math.ceil(min || 0);
  max = Math.floor(max || 0);
  return Math.floor(Math.random() * (max - min)) + min;
};
var getRandomIntInclusive = function (min, max) {
  // Return [min, max]
  min = Math.ceil(min || 0);
  max = Math.floor(max || 0);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
// 平方
var sqr = function (n) {
  return n * n;
};
// 开方
var sqrt = function (n) {
  return Math.sqrt(n);
};
// 非平均概率随机数
var xRandom = function (min, max) {
  return sqrt(getRandomInt(0, sqr(max - min)));
};
var toNumberFixed = function (n, isFloor) {
  // 四舍五入
  //return Math.floor(n * 100) * 0.01;
  if (!isFloor)
    return Math.ceil(n * 100) * 0.01;
  else
    return Math.floor(n * 100) * 0.01;
};
/**
 * 乘以100
 * @param n
 * @param isFloor 是否向下取整
 * @returns {number}
 */
var to100MultiInt = function (n, isFloor) {
  //return Math.floor(n * 100);
  // Math.round 把一个数字四舍五入为最接近的整数
  // Math.ceil 把一个数进行上舍入
  // Math.floor 把一个数进行下舍入
  if (!isFloor)
    return Math.ceil(n * 100);
  else
    return Math.floor(n * 100);
};
var to100DivideInt = function (n, isFloor) {
  return n / 100;
};
/**
 *
 * @param money
 * @param values
 * @returns {*}
 */
var checkAndTransValues = function (money, values) {
  //var sum = values.reduce(function(a,b){return a+b;});
  //
  //if (sum!=money){
  //  console.log("Error! Gen Hongbao Err: " , sum , money, values.length);
  //  return;
  //}
  //console.log("Before Check! : ", values);
  var trans =  values.map(function(d){
    var tmp = d * 0.01;
    return parseFloat(tmp.toFixed(2));
    });
  var sum = trans.reduce(function(a,b){
    var tmp = a + b;
    return parseFloat(tmp.toFixed(2))
  });
  //console.log("After Check! : ", trans);
  if (sum!=money){
    console.log("Error! Gen HongBao Err: " , sum , money, values.length);
    return;
  }
  return trans;
};
var _generate = function (money, size, max, min) {
  var result = [];
  var average = money / size;

  //var rangeA = average - min;
  //var rangeB = max - min;
  //var rangeC = Math.sqrt(average - min);
  //var rangeD = Math.sqrt(max - average);
  var temp;
  for (var i = 0; i < size; i++) {
    if (getRandomIntInclusive(min, max) > average) {
      // 在平均线上减钱
      temp = min + xRandom(min, average);
      result[i] = temp;
      money -= temp;
    } else {
      // 在平均线上加钱
      temp = max - xRandom(average, max);
      result[i] = temp;
      money -= temp;
    }
  }
  console.log("left money : " + money);
  if (money > 0) {// 如果还有余钱，则尝试加到第一个红包里
    result[0] += money;
  } else if (money < 0) {// 如果钱是负数了，还得从已生成的较大红包中抽取回来
    for (var j = 0; j < size; j++) {
      var tmp = result[j] + money;
      if (tmp >= min) {
        result[j] = tmp;
        break;
      }
    }
  }
  return result;
};

var getMin = function (m, n) {
  return m < n ? m : n;
};
var isMoneySizeOK = function (money, size) {
  // 所有的金额都以整数进行运算
  //if (money < 0.01 || size < 1 || money / size < 0.01 || money)
  if (money < 1) return false;
  if (size < 1) return false;
  if (size > 10000) return false;
  return true;
};
/**
 * 简单生成红包算法
 * @param money   红包总金额
 * @param size    红包个数
 * @param bucket  分组数量,越大越趋近于 y = (x-avg)^2 曲线
 * @returns {*}
 */
var genSimpleRandomMoney = function (money, size, bucket) {

  //bucket = 3;// TODO: 支持自定义分组
  console.log("gen simple random money");
  var oldMoney = money;
  money = to100MultiInt(money, true);
  size  = toNumberFixed(size);
  if (!isMoneySizeOK(money, size)) return;
  var leftMoney = money;// 剩余金额
  var leftSize = size;// 剩余红包个数
  var values = [];// 红包数组
  var averageValue = Math.floor(money / size);// 平均取小
  if (averageValue < CONS.MIN || averageValue > CONS.MAX) return;
  //if (averageValue == CONS.MAX || averageValue == CONS.MIN) return;
  console.log('averageValue:', averageValue);
  //
  //if (size == 1) return [money];
  //if (size == 2) return [];
  //var leftSum = money - size * 0.01;
  //var leftAvg = leftSum / size;
  //var bucket = [];

  var min = CONS.MIN, max;

  for (var i = 0; i < size; i++) {
    if (leftSize == 1){//at last
      leftSize = 0 ;
      values.push(Math.round(leftMoney));
    }else{
      max = getMin(CONS.MAX, (leftMoney/leftSize * 2));
      var cur = Math.random() * max;
      cur = (cur <= min)? min : cur;
      cur = Math.floor(cur);
      leftSize--;
      leftMoney -= cur;
      values.push(cur);
    }
  }
  // 检查并转换数据
  return checkAndTransValues(oldMoney,values);
};
// 生成随机数
var _genMoneyFenRandomArr = function (fen, size) {

  var leftMoney = fen;// 剩余金额
  var leftSize = size;// 剩余红包个数
  var values = [];// 红包数组
  var averageValue = Math.floor(fen / size);// 平均取小
  if (averageValue < CONS.MIN || averageValue > CONS.MAX) return;
  //if (averageValue == CONS.MAX || averageValue == CONS.MIN) return;
  console.log('averageValue:', averageValue);
  var min = CONS.MIN, max;

  for (var i = 0; i < size; i++) {
    if (leftSize == 1){//at last
      leftSize = 0 ;
      values.push(Math.round(leftMoney));
    }else{
      max = getMin(CONS.MAX, (leftMoney/leftSize * 2));
      var cur = Math.random() * max;
      cur = (cur <= min)? min : cur;
      cur = Math.floor(cur);
      leftSize--;
      leftMoney -= cur;
      values.push(cur);
    }
  }
  return values;
  // 检查并转换数据
  //return checkAndTransValues(oldMoney,values);
};
//var checkRatio = function (mRatio, sRatio) {
//  mRatio = to100MultiInt(mRatio, true);
//  sRatio = to100MultiInt(sRatio, true);
//  if (mRatio > 90 || mRatio < 10) return false;
//  if (sRatio > 90 || sRatio < 10) return false;
//  return true;
//};
/**
 * 按比例生成红包算法
 * @param money   红包总金额
 * @param size    红包个数
 * @param mRatio  钱比例
 * @param sRatio  人比例
 * @returns {*}
 */
var genRatioRandomMoney = function (money, size, mRatio, sRatio) {

  console.log("gen ratio random money");
  // 1. 数据验证阶段
  var oldMoney = money;
  var oldSize = size;
  money = to100MultiInt(money, true);
  size  = toNumberFixed(size);
  // 当一个人平均领取的金额 < 0.1 则切换为简单随机算法
  if (money < size * 10) {
    return genSimpleRandomMoney(oldMoney, oldSize);
  }
  mRatio = to100MultiInt(mRatio, true);
  sRatio = to100MultiInt(sRatio, true);
  if (mRatio > 90 || mRatio < 10) return;
  if (sRatio > 90 || sRatio < 10) return;

  var rMoney1 = Math.floor((mRatio / 100) * money);
  var rSize1  = Math.floor((sRatio / 100) * size);
  if (Math.floor(rMoney1/rSize1) >= CONS.MAX){
    rMoney1 = rSize1 * CONS.MAX;
  }
  var rMoney2 = money - rMoney1;
  var rSize2  = size - rSize1;

  console.log("ratios: " , rMoney1, rMoney2, rSize1, rSize2);
  // 切换算法
  if (!isMoneySizeOK(rMoney1, rSize1))
    return genSimpleRandomMoney(oldMoney, oldSize);
  if (!isMoneySizeOK(rMoney2, rSize2))
    return genSimpleRandomMoney(oldMoney, oldSize);

  // 2. 生成第一组数据
  var arr1 = _genMoneyFenRandomArr(rMoney1, rSize1);
  console.log("=========Gen arr1 ", rMoney1, rSize1);
  // 3. 生成第二组数据
  var arr2 = _genMoneyFenRandomArr(rMoney2, rSize2);
  console.log("=========Gen arr2 ", rMoney2, rSize2);
  // 4. 数组合并 & 打乱
  var a = 0, b = 0, ratio = sRatio/100, arr = [];
  for (var i = 0 ; i < size ; i++){
    //var random = Math.random();
    //console.log("rand: " , a, b, random, sRatio);
    if (arr1 && a == arr1.length){
      arr.push(arr2[b++]);
    }else if (arr1 && arr2 && b == arr2.length){
      arr.push(arr1[a++]);
    }else if (arr1 && Math.random() < 0.3) {
      arr.push(arr1[a++]);
    }else{
      arr.push(arr2[b++]);
    }
  }
  // 5. 验证数组正确性
  return checkAndTransValues(oldMoney, arr);
};
/**
 * 生成平均金额
 * @param money
 * @param size
 */
var genAverageMoney = function (money, size) {
  var oldMoney = money;
  money = to100MultiInt(money, true);
  size  = toNumberFixed(size);
  if (!isMoneySizeOK(money, size)) return;
  var leftMoney = 0;
  var values = [];
  var valueSum = 0;
  var averageValue = Math.floor(money / size);
  //averageValue = toNumberFixed(averageValue);
  if (averageValue < 1 || averageValue > 20000) return;
  if (averageValue == 20000 || averageValue == 1) return;
  console.log('averageValue:', averageValue);
  // 生成平均数组
  for (var i = 0; i < size; i++) {
    if (i == size - 1) {
      var last = money - valueSum;
      console.log("last: " , last, valueSum, money);
      if (last > CONS.MAX) {
        leftMoney = last - CONS.MAX;
        last = CONS.MAX;
      }
      values.push(last);
      continue;
    }
    valueSum += averageValue;
    values.push(averageValue);
  }
  // 处理余额
  for (var j = 0; (j < values.length) && (leftMoney > 0); j++) {
    var tmp = values[j] + leftMoney;
    if (tmp > CONS.MAX) {
      leftMoney = tmp - CONS.MAX;
      values[j] = CONS.MAX;
    } else {
      leftMoney = 0;
      values[j] = tmp;
    }
  }
  // 检查并转换数据
  return checkAndTransValues(oldMoney,values);
};

// FIXME: 待完善,生成正态分布随机数组
//exports.genNormalDisRandMoney  = _generate;
// FIXME: 待完善,生成反正态分布
//exports.genNormalDisRandMoney  = _generate;
// 生成简单随机数组
exports.genRandomMoneyByRatio = genRatioRandomMoney;
// 生成简单随机数组
exports.genSimpleRandomMoney = genSimpleRandomMoney;
// 生成平均数组
exports.genAverageMoney = genAverageMoney;