
//时间格式处理成  2016-1-24 14:09
function addZero(addData){
 if(addData<10){
 return "0"+addData;
 }else{
 return addData;
 }

 }
function getTime(timeData){
    var getTime=new Date(timeData);
    var year=getTime.getFullYear();
    var month=getTime.getMonth()+1;
    //  month=addZero(month);
    var date=getTime.getDate();
    // date=addZero(date);
    var hour=getTime.getHours();
      hour=addZero(hour);
    var minutes=getTime.getMinutes();
      minutes=addZero(minutes);
    var timeString=year+"-"+month+"-"+date+" "+hour+":"+minutes;
    //console.log( getTime);
    //console.log( timeString);
    return timeString;
}


//强制保留两位小数
function getMoney(money){
    money=money.toString();
    var floatFlag=money.indexOf(".");
    if(floatFlag<0){
        return money+".00";
    }else{
        var moneyArray=money.split(".");
        var floatMoney=moneyArray[1];
        if(floatMoney.length==2){
            return money;
        }else{
            return money+"0";
        }
    }

}

function newGetMoney(money){
    money=money.toString();
    var floatFlag=money.indexOf(".");
    if(floatFlag<0){
        return money;
    }else{
        var moneyArray=money.split(".");
        var floatMoney=moneyArray[1];
        if(floatMoney.length>2){
            floatMoney=floatMoney.split('');
            floatMoney=floatMoney[0]+floatMoney[1];
            return moneyArray[0]+'.'+floatMoney;
        }else{
            return money;
        }
    }
}

function getDotTwoMoney(money){
    money=Number(money);
    return Math.round(money*100)/100;
}



//热线号加上“-”
function getDocChatNum(number){
    var docchatnumber=number.split("");
    var arrayLength=docchatnumber.length;
  //  console.log(arrayLength);
    if(arrayLength>7){
        var totalNumber=arrayLength/3;
        var finalNumber='';
        var totalLength=0;
        for(var i=0;i<totalNumber;i++){
            var j=0;
            var subNumber='';
            for(var n=0;n<3;n++){
                if(totalLength<arrayLength){
                    subNumber=subNumber+docchatnumber[0];
                    docchatnumber.shift();
                    totalLength++;
                }else{
                    break;
                }
                //console.log(subNumber);
            }
            if(totalLength<arrayLength){
                finalNumber=finalNumber+subNumber+'-';
            }else{
                finalNumber=finalNumber+subNumber;
            }


        }
        //console.log(finalNumber);
        return finalNumber;
    }else{
        return number;
    }
}


//判断有多少个为字母
function getLengthL(str){
    if(/[a-z]/i.test(str)){
        return str.match(/[a-z]/ig).length;
    }
    return 0;
}

//判断有多少个数字
function getLengthN(str){
    if(/[0-9]/i.test(str)){
        return str.match(/[0-9]/ig).length;
    }
    return 0;
}
//获取url信息
function getUrlQueryObject(){
    var query = decodeURIComponent(window.location.search.substring(1));
    var urlArray = query.split('&'),queryObj = {};
    urlArray.forEach(function(item){
        var itemArray =  item.split('=');
        queryObj[itemArray[0]] = itemArray[1];
    })
    return queryObj;
}

//处理alert使其不显示页面链接
window.alert = function(name){
    var iframe = document.createElement("IFRAME");
    iframe.style.display="none";
    iframe.setAttribute("src", 'data:text/plain,');
    document.documentElement.appendChild(iframe);
    window.frames[0].window.alert(name);
    iframe.parentNode.removeChild(iframe);
}