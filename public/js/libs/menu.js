/**
 * Created by menzhongxin on 15/9/10.
 */
/**
 *
 * @param data json格式数据
 * @subName json子菜单的key值,该值可以为字符串或数组，若为字符串，则表示所有的子列表的key都为该值，如果为数组则表示每级列表都有对应的值
 *         并且列表的长度应该跟菜单的等级相对应,json数据的列表格式不能跨级跳跃,
 * @keyName 菜单列表中要展示出的内容的key
 * @method 当单击该菜单时要触发的事件,menu会给该方法传3个参数传入的id,currentLayer,currentData.
 *        (currentLayer表示该值是属于第几级列表，从0开始,currentData为json格式需自行转为对象后使用)
 * @param layer 菜单最多有几级.设置0，则只有一级.
 * @param id 要将该菜单赋值到哪个dom上
 */
var Menu = {};
Menu.init = function(data,subName,keyName,method,layer,id){
    if(layer){
        layer = 10;
    }
    var html = fitHTML('',data,subName,keyName,method,layer,0,id);
    $('#'+id+' ul').replaceWith('');
    $('#'+id).append(html);
};
Menu.init_css = function(data,subName,keyName,method,layer,clazz){
    if(layer){
        layer = 10;
    }
    var html = fitHTML('',data,subName,keyName,method,layer,0,clazz);
    $('.'+clazz+' ul').replaceWith('');
    $('.'+clazz).append(html);
};


function fitHTML(html,data,subName,keyName,method,layer,currentLayer,id){
    var realSubName = '';
    if(typeof(subName) === 'string')
        realSubName = subName;
    else
        realSubName = subName[currentLayer];
   html += '<ul class="dropdown-menu">';
    for(var i = 0,len = data.length; i<len;i++){
        if((currentLayer < layer) && data[i][realSubName]&& data[i][realSubName].length >0){
            html += '<li class="dropdown-submenu"><a onclick="'+method+'(\''+id+'\',\''+currentLayer+'\',\''+JSON.stringify(data[i]).replace(/\"/g,'\\\'')+'\', this)">'+data[i][keyName]+'</a>';
            currentLayer ++;
            html += fitHTML('',data[i][realSubName],subName,keyName,method,layer,currentLayer,id);
            html += '</li>';
            currentLayer --;
        }else{
            html += '<li><a onclick="'+method+'(\''+id+'\',\''+currentLayer+'\',\''+JSON.stringify(data[i]).replace(/\"/g,'\\\'')+'\', this)">'+data[i][keyName]+'</a></li>';
        }
    }
    html += '</ul>';
    return html;
}