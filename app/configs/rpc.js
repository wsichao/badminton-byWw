/**
 * Created by lijinxia on 2017/9/30.
 * 连接信息流服务
 */
var bsonRpc = require('bson-rpc'),
    serverConfigs = require('../configs/server');
// var proxy = new bsonRpc.client('10.174.89.71', 8181);
// var proxy = new bsonRpc.client('10.30.49.170', '10.174.89.71', 8181);

// var proxy = new bsonRpc.client('10.80.236.161', '10.30.49.170', 8181);//10.80.236.161,10.30.49.170   正式地址
// var proxy = new bsonRpc.client('10.30.49.170', 8181);//10.80.236.161,10.30.49.170   //测试使用TODO 正式要确认一下

var proxy; //10.80.236.161,10.30.49.170   正式地址
// var proxy = new bsonRpc.client('10.30.49.170', 8181);//10.80.236.161,10.30.49.170   //测试使用TODO 正式要确认一下

if (serverConfigs.env) {
    proxy = new bsonRpc.client('172.31.1.31', '172.31.1.32', 8181);
}else{
    proxy = new bsonRpc.client('172.31.1.31', 8181);//10.80.236.161,10.30.49.170   //测试使用TODO 正式要确认一下
}

proxy.use_service(['get_categories', 'get_article_list', 'get_article', 'lookup_article', 'get_hotkeywords','useraction_like_article',
    'useraction_remove_like_article','get_article_comments','get_article_extra_info','add_comment_toarticle',
'useraction_collect_article','get_user_collected_articles','useraction_remove_collect_article',
'useraction_dislike_article',
'get_keywordgroups','upsert_keywordgroup','remove_keywordgroup','update_user_keywords_with_keywordgroup',
'get_user_identifier_with_keywords','get_persona_with_user_identifier','reset_persona','create_factory_user','get_article_list_with_author',
    'get_latest_article_with_authors','remove_comment','get_related_article_list']);
proxy.connect(function () {
    console.log('connected');
});


exports.proxy = proxy;