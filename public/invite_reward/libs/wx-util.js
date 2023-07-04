/**
 *
 *  Juliye-Web
 *  Created by Jacky.L on 11/30/15.
 *  Copyright (c) 2014 ZLYCare. All rights reserved.
 */
/*
 * 注意：
 * 1. 所有的JS接口只能在公众号绑定的域名下调用，公众号开发者需要先登录微信公众平台进入“公众号设置”的“功能设置”里填写“JS接口安全域名”。
 * 2. 如果发现在 Android 不能分享自定义内容，请到官网下载最新的包覆盖安装，Android 自定义分享接口需升级至 6.0.2.58 版本及以上。
 * 3. 常见问题及完整 JS-SDK 文档地址：http://mp.weixin.qq.com/wiki/7/aaa137b55fb2e0456bf8dd9148dd613f.html
 *
 * 开发中遇到问题详见文档“附录5-常见错误及解决办法”解决，如仍未能解决可通过以下渠道反馈：
 * 邮箱地址：weixin-open@qq.com
 * 邮件主题：【微信JS-SDK反馈】具体问题
 * 邮件内容说明：用简明的语言描述问题所在，并交代清楚遇到该问题的场景，可附上截屏图片，微信团队会尽快处理你的反馈。   */
var _share_config = {
    appId: 'wx0ed82f5ad3bde437',
    timestamp: 1448870800,
    nonceStr: 'UF4ppVwGvZXIiKdQ',
    signature: 'ff87229d353941becfcf26f1a22723454293a808',
    //titleTL1: '10元红包抢抢抢！',
    //titleTL2: '邀请您参加专属医生 "免费送送送"活动', // 分享标题
    title: '10元红包抢抢抢！"', // 分享标题
    desc: "你的好盆友叫你粗来领取10元红包啦，你领大家得，你有Ta也有～", // 分享描述
    link: '', // 分享链接
    imgUrl: 'http://7j1ztl.com1.z0.glb.clouddn.com/share_baobao.png' // 分享图标
};
var WX_UTIL = {
    "loadConfig": function () {
        var url = encodeURIComponent(window.location.href);
        // var url = "http://web-test.zlycare.com/share/lalala/?inviter=" + inviter;
        //配置微信jssdk
        $.ajax({
            url: 'https://pro.mtxhcare.com/1/wxConfig?url=' + url,
            type: 'GET',
            success: function (result) {
                console.log("result: " + JSON.stringify(result));
                wx.config(result);
            }
        });
    },
    "init": function (appId,timestamp,nonceStr,signature,title,desc,link,imgUrl) {

        if(appId) _share_config.appId = appId;
        if(timestamp) _share_config.timestamp = timestamp;
        if(nonceStr) _share_config.nonceStr = nonceStr;
        if(signature) _share_config.signature = signature;
        if(title) _share_config.title = title;
        if(desc) _share_config.desc = desc;
        if(link) _share_config.link = link;
        if(imgUrl) _share_config.link = imgUrl;

        that = this;
        that._config();
        that._ready();

    },
    "_config": function (){
        wx.config({
            debug: false,
            appId: _share_config.appId,
            timestamp: _share_config.timestamp,
            nonceStr: _share_config.nonceStr,
            signature: _share_config.signature,
            jsApiList: [
                // 所有要调用的 API 都要加到这个列表中
                'checkJsApi',
                'onMenuShareTimeline',
                'onMenuShareAppMessage'
            ]
        });
    },
    "_ready": function (){
        wx.ready(function () {
            wx.onMenuShareTimeline({
                title: _share_config.titleTL1 + _share_config.titleTL2, // 分享标题
                link: _share_config.link, // 分享链接
                imgUrl: _share_config.imgUrl, // 分享图标
                success: function () {
                    // 用户确认分享后执行的回调函数
                    alert('已分享');
                },
                cancel: function () {
                    alert('已取消');
                    // 用户取消分享后执行的回调函数
                }
            });
            wx.onMenuShareAppMessage({
                title: _share_config.title, // 分享标题
                desc: _share_config.desc, // 分享描述
                link: _share_config.link, // 分享链接
                imgUrl: _share_config.imgUrl, // 分享图标
                type: '', // 分享类型,music、video或link，不填默认为link
                dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
                success: function () {
                    // 用户确认分享后执行的回调函数
                    alert('已分享');
                },
                cancel: function () {
                    alert('已取消');
                    // 用户取消分享后执行的回调函数
                }
            });
        });
    }

};