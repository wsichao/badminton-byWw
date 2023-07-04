/**
 * Created by guoyichen on 2016/11/3.
 */
window.alert = function(name){
    var iframe = document.createElement("IFRAME");
    iframe.style.display="none";
    iframe.setAttribute("src", 'data:text/plain,');
    document.documentElement.appendChild(iframe);
    window.frames[0].window.alert(name);
    iframe.parentNode.removeChild(iframe);
}
var webBridge ;
var pageStatus ; //1 第一页 2第二页 3 第三页 0 其他
var common = {
    initData : function(bridge,status) {
        webBridge = bridge;
        pageStatus = status;
    },
    webBridgeInit: function (fn) {
        webBridge.bridgeInit(fn);
    },
    /** Native Call WebView 关闭webview**/
    backButton: function (data,responseCallback,info){
        var result = {};
        if(pageStatus==0){
            result.isClose = true;
            responseCallback(JSON.stringify(result));
        }else{
            result.isClose = false;
            responseCallback(JSON.stringify(result));
            if(pageStatus==1){
                var name = localStorage.getItem("name",urlItem.name),

                phoneNum = localStorage.getItem("phoneNum",urlItem.phoneNum),
                userId = localStorage.getItem("userId",urlItem.userId);
                token = localStorage.getItem("token",urlItem.token);
                window.location="adviserWel.html?userId="+userId+"&token="+token+"&name="+name +"&phoneNum="+phoneNum;
            }else if(pageStatus == 2){
                $("#view1").show();
                $("#view3").hide();
                $("#view2").hide();
                pageStatus = 1 ;
                $("#firstLine").removeClass("blue-back");
                $(".second-dot").removeClass("blue-back");
                $("#secondFont").removeClass("blue-font")
            }else if(pageStatus == 3){
                $("#view1").hide();
                $("#view3").hide();
                $("#view2").show();
                pageStatus = 2 ;
                $("#lastLine").removeClass("blue-back");
                $(".dot:last-child").removeClass("blue-back");
                $("#lastFont").removeClass("blue-font")
            }

        }
    },

    /*webview call native 完成：关闭webview*/
    complete : function(){
        webBridge.upload("login");
    },
    becomeBroker : function(docChatNum){
        var data = {}
        data.docChatNum = docChatNum
        if(webBridge){
            webBridge.upload("becomeBroker",JSON.stringify(data));
        }
    }

}