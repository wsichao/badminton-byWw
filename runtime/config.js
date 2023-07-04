/**
 * 读取config配置信息
 * Created by Mr.Carry on 2017/5/17.
 */

'use strict';
const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
const util = require('./util');
let mongoose_pool = {};

const getConfig = (type) => {
    let base_url = util.getBaseUrl();
    type = type ? type : 'dev'
    if (type == 'pro' || type == 'production') {
        base_url += '/config/env/pro.js'
    } else if (type == 'dev') {
        base_url += '/config/env/dev.js'
    } else if (type == 'test') {
        base_url += '/config/env/test.js'
    }
    return require(base_url);
}

const connect = (mongo_db, db_name) => {
    if (mongoose_pool[db_name]) return mongoose_pool[db_name];
    let mongo_connection = 'mongodb://'
        + mongo_db.user + ':'
        + mongo_db.pwd + '@'
        + mongo_db.connect
        + '/' + mongo_db.db
        + '?' + mongo_db.options;
    mongoose.connect(mongo_connection);
    let connection = mongoose.connection;
    connection.on('error', function (err) {
        // console.log('error', err);
    });

    connection.once('open', function () {
        // console.log('open', mongo_connection);
    });
    if (mongo_db.log) {
        // mongoose.set('debug', true);
    }
    mongoose_pool[db_name] = mongoose;
    return mongoose;
}

const db = (type, db_name) => {
    db_name = db_name ? db_name : 'mongo';
    let mongo_db = getConfig(type)[db_name];
    connect(mongo_db, db_name)

    return mongoose;
}



module.exports = {
    getConfig: getConfig,
    getDB: db
}
