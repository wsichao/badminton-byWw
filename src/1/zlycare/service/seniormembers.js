/**
 * Created by fly on 2017－05－22.
 */
'use strict';
module.exports = {
  getSeniorMembers: function () {
    let seniorMemberModel = Backend.model('1/zlycare', undefined, 'seniormembers');
    let cond = {
      isDeleted: {$ne: true}
    };
    let fields = '';
    let options = {
      sort: {createdAt: 1},
    }
    let seniorMembers = [];
    let typeProductMap = {};
    return seniorMemberModel.find(cond, fields, options).exec()
      .then((_items) => {
        _items = _items.map(function (item) {
          return {
            "type_name": item.typeName,
            "product_name": item.productName,
            "product_detail": item.productDetail,
            "product_pics": item.productPics,
            "service_people_id": item.servicePeopleId,
            "service_people_call": item.servicePeopleCall,
            "service_people_name": item.servicePeopleName,
            "zly_people_chat_num": item.zlyPeopleChatNum
          };
        });
        //console.log('_items:',_items);
        _items.forEach(function (_item) {
          let _prods = typeProductMap[_item.type_name];
          if (!_prods) {
            typeProductMap[_item.type_name] = [_item];
          } else {
            typeProductMap[_item.type_name].push(_item);
          }
        });
        Object.keys(typeProductMap).forEach((key) => {
          seniorMembers.push({
            type_name: key,
            products: typeProductMap[key]
          });
        });
        return seniorMembers;
      });
  }
}