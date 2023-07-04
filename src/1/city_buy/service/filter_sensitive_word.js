/**
 * Created by dell on 2017/6/14.
 */
let fs = require('fs');

module.exports = {
    filterWords : function (obj) {
        var value = 'tmd ===';
        fs.readFile('../src/1/city_buy/service/key.txt','utf-8',function(err,data){
            if(err){
                console.error(err);
            }
            else{
                arrMg = data.split("|");

                for(var i=0;i< arrMg.length;i++){
                    var reg = new RegExp(arrMg[i],"g");

                    if(value.indexOf(arrMg[i])!=-1){
                        var result = value.replace(reg,"**");
                        value = result;
                    }
                }
                console.log(value)
            }
        });
    }
};