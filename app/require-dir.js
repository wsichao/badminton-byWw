/**
 * 根据文件夹读取相关文件
 * Created by Mr.Carry on 2018/4/24.
 */
"use strict";
const path = require('path');
const fs = require('fs');


const findDirFiles = function (path_url) {
  const fs_path = path.join(__dirname, path_url);
  const files = fs.readdirSync(fs_path);
  return files.map(item => {
    return require(fs_path + '/' + item);
  });
};

module.exports = function (path_url) {
  return findDirFiles(path_url);
};