/**
 * Created by lijinxia on 2017/10/23.
 */
//    （1）今天发布的时间显示：今天 13:57
//    （2）昨天及之前发布的时间显示：09-18
//    （3）去年及之前年份发布的时间显示：2016-08-07
function formatDate(dateTime) {
    var retDate = dateTime;
    var now = (new Date((new Date()).Format("yyyy/MM/dd 00:00:00"))).getTime();
    var year = (new Date()).Format('yyyy');
    var dateYear = (new Date(dateTime)).Format('yyyy');
    if (dateTime > now) {
        retDate = (new Date(dateTime)).Format('hh:mm');
    } else if (dateYear < year) {
        retDate = (new Date(dateTime)).Format('yyyy/MM/dd');
    } else {
        retDate = (new Date(dateTime)).Format('MM/dd');
    }
    return retDate.replace(/\//g, "-");
}
Date.prototype.Format = function (fmt) { //
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}


//用于文章详情页（展示评论和发布评论使用的时间） 11.6创建
// 当天的显示：19:23
// 昨天及之前的显示：10-20 19:23
// 去年的显示：2016-10-20 19:23
function formatDate1(dateTime) {
    var retDate = dateTime;
    var now = (new Date((new Date()).Format("yyyy/MM/dd 00:00:00"))).getTime();
    var year = (new Date()).Format('yyyy');
    var dateYear = (new Date(dateTime)).Format('yyyy');
    if (dateTime > now) {
        retDate = (new Date(dateTime)).Format('hh:mm');
    } else if (dateYear < year) {
        retDate = (new Date(dateTime)).Format('yyyy/MM/dd hh:mm');
    } else {
        retDate = (new Date(dateTime)).Format('MM/dd hh:mm');
    }
    return retDate.replace(/\//g, "-");
}

//获取url中的参数
function getUrlQueryObject() {
    var query = decodeURIComponent(window.location.search.substring(1));
    var urlArray = query.split('&'), queryObj = {};
    urlArray.forEach(function (item) {
        var itemArray = item.split('=');
        queryObj[itemArray[0]] = itemArray[1];
    });
    return queryObj;
};

/**
 * 验证手机号
 * @param phone
 * @returns {boolean}
 */
function isValidPhone(phone) {
    var mobileReg = /^(13|14|15|18|17|16|19)[0-9]{9}$/;
    return mobileReg.test(phone);
};

function download() {
    var ua = navigator.userAgent.toLowerCase();
    if (/android/.test(ua)) {
        window.location.href = "http://app.mi.com/details?id=com.zlycare.zlycare&ref=search";
    } else {
        window.location.href = "http://a.app.qq.com/o/simple.jsp?pkgname=com.zlycare.zlycare";
    }
}

function wxShare(shareTitle, shareDes, shareImg, url) {
    var url = encodeURIComponent(url);
    $.get("/1/zlycare/wxConfig?url=" + url, function (data, status) {
        wx.config({
            debug: data.debug, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
            appId: data.appId, // 必填，公众号的唯一标识
            timestamp: data.timestamp, // 必填，生成签名的时间戳
            nonceStr: data.nonceStr, // 必填，生成签名的随机串
            signature: data.signature,// 必填，签名，见附录1
            jsApiList: data.jsApiList// 必填，需要使用的JS接口列表，所有JS接口列表见附录2
        });

        wx.ready(function () {
//                alert(shareTitle);
            // config信息验证后会执行ready方法，所有接口调用都必须在config接口获得结果之后，config是一个客户端的异步操作，所以如果需要在页面加载时就调用相关接口，则须把相关接口放在ready函数中调用来确保正确执行。对于用户触发时才调用的接口，则可以直接调用，不需要放在ready函数中。
            wx.onMenuShareTimeline({
                title: shareTitle, // 分享标题
                link: '', // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
//                    imgUrl: serverUri + '/audio/images/logoalways186@3x.png', // 分享图标
                imgUrl: shareImg, // 分享图标
                success: function () {
                    // 用户确认分享后执行的回调函数
//                        alert('分享朋友圈成功');
                },
                cancel: function () {
                    // 用户取消分享后执行的回调函数
//                        alert('分享朋友圈取消');

                }
            });
            wx.onMenuShareAppMessage({
                title: shareTitle, // 分享标题
                desc: shareDes, // 分享描述
                link: '', // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
//                    imgUrl: serverUri + '/audio/images/logoalways186@3x.png', // 分享图标
                imgUrl: shareImg, // 分享图标
                type: '', // 分享类型,music、video或link，不填默认为link
                dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
                success: function () {
                    // 用户确认分享后执行的回调函数\
//                        alert('分享给朋友成功');
                },
                cancel: function () {
                    // 用户取消分享后执行的回调函数
//                        alert('分享给朋友取消');
                }
            });
        });

    });
}


//格式化source，最多显示12个字，多的用“…”代替
function formatSource(source) {
    if (source.length > 12) {
        source = source.substr(0, 11) + '...';
    }
    return source;
}
//homePage和homePageH5列表页中的source限制
//作者来源最多显示8个字，多余8个字显示为"7个字+..."
function formatSourceList(source) {
    if (source.length > 8) {
        source = source.substr(0, 7) + '...';
    }
    return source;
}
//格式化title，只显示两行，多余的用...代替
function formatTitle(title) {
    WIDTH = window.screen.width;
    var type = 38;
//alert(WIDTH);
    if (WIDTH > 370) {
        type = 39;
    }
    else if (WIDTH >= 360) {
        type = 35;
    } else if (WIDTH >= 320) {
        type = 40;
    }
    var Length = window.screen.width / type;
    if (title.length > Length) {
        title = title.substr(0, Length * 2) + '...';
    }
    return title;
}
//关注时的样式
function favoriteStyle(isFavorited) {
    var valueBtn, cssBtn, imgBtn;
    if (isFavorited) {
        valueBtn = '已关注';
        cssBtn = {
            'color': '#B9B9B9',
            'border': '1px solid #E0E0E0',
            'background-color': 'white'
        };
        imgBtn = 'images/successFavorite@3x.png';

    } else {
        valueBtn = '关注';
        cssBtn = {
            'color': '#FFFFFF',
            'border': '0px',
            'background': '#4892FF'
        };

        imgBtn = 'images/cancelFavorite@3x.png';
    }
    $('#favorite').attr('value', valueBtn);
    $('#favorite').css(cssBtn);
    $('#focusImg').attr('src', imgBtn);

}
function favoriteStyleAction() {
    $('#focusImg').css('visibility', 'visible');
    setTimeout(function () {
        $('#focusImg').css('visibility', 'hidden');
    }, 1000);
}

//格式化主题数据
function pageMainBodyData(title, viewNum, mainBody) {
//    $('#source').html(formatSource(source));
    //   $('#normal').css('display', 'block');
    $('#title').html(title);
    $('#viewNum').html('浏览数 ' + viewNum);
    $('#view').css('visibility', 'visible');
    var mainBodyDom = $('#mainBody');
    mainBodyDom.html(mainBody);
    $('#mainBody img').css({
        'width': window.screen.width - 24,
        'height': 'auto',
        'float': 'left',
        'margin-top': 15
    });
    // $('#mainBody p').css({'padding-left': 0, "padding-top": 10});
    $('#mainBody p').css({'padding-left': 0});
}

//获取mainBody的div的 ID
function getEventId(target) {
    if (target.id.indexOf('_') > -1) {
        return target.id;
    } else {
        return getEventId(target.parentNode);
    }
}
//修改title点击时候的样式
function modifyTouchTitle(id,formatType) {
    $('#' + id+'_'+formatType).css('background', '#F0F0F0');
    $('#'+id+'_'+formatType+'_titleLengthCss').removeClass('titleLengthCss').addClass('titleLengthCssTouch');
}
//恢复title点击后的样式
function resumeTouchTitle(id,formatType) {
    $('#' + id+'_'+formatType).css('background', '#FFFFFF');
    $('#'+id+'_'+formatType+'_titleLengthCss').removeClass('titleLengthCssTouch').addClass('titleLengthCss');
}