/**
 * 公共方法
 * Created by Mr.Carry on 2017/5/17.
 */
'use strict';
const path = require('path');
const config = path.join(__dirname, '../src');

const getBaseUrl = ()=> {
  return config;
}

/**
 * 解析 mongoDB url
 * @param {config object}
 */
const parsingMongoDBURL = (url)=> {
  url = url.replace("mongodb://", '');
  const user_pwd = url.split("@")[0];
  const db_url = url.split("@")[1];
  const connect = db_url.split('/')[0];
  const database = db_url.split('/')[1].split('?')[0];
  const options = db_url.split('/')[1].split('?')[1];

  return {
    user: user_pwd.split(':')[0],
    pwd: user_pwd.split(':')[1],
    connect: connect,
    db: database,
    options: options
  };
}

module.exports = {
  getBaseUrl: getBaseUrl,
  parsingMongoDBURL: parsingMongoDBURL
}

