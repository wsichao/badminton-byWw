/**
 * Created by fly on 2017－12－06.
 */
'use strict'

module.exports = {
  /**
   * 检查数据类型是否全部符合要求
   * @param data_obj 数据对象,eg: {"momentInfo": {"_id": "5a27637425075d495a9fd920"}}
   * @param type_obj 要求的数据类型 eg:{"momentInfo._id": String}
   * @returns {boolean}
   */
  checkTypes: function (data_obj, type_obj){
    return Object.keys(type_obj).every(function(key){
      let value = data_obj[key];
      if(key.indexOf('.') > -1){
        let key_array = key.split('.');
        value = data_obj[key_array[0]]
        for(let i = 1; i < key_array.length; i++){
          value = value[key_array[i]]
        }
      }
      if(value === undefined ){
        if(type_obj[key] === 'undefined')
          return true;
        return false;
      }
      if(value === null ){
        if(type_obj[key] === null)
          return true;
        return false;
      }
      //console.log(typeof data_obj[key] == type_obj[key], data_obj[key].constructor == type_obj[key], typeof data_obj[key], type_obj[key], data_obj[key].constructor);
      return value.constructor == type_obj[key]
    })
  }
}


