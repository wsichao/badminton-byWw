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

$(".jump_download").click(function(){
    window.location.href="http://a.app.qq.com/o/simple.jsp?pkgname=com.zlycare.zlycare"
});

$(".go_download").click(function(){
    window.location.href="http://a.app.qq.com/o/simple.jsp?pkgname=com.zlycare.docchat.c"
});





