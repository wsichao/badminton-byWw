/**
 * Created by fly on 2017－07－25.
 */
'use strict';
// let _model = Backend.model('1/zlycare', undefined, 'productCatalog');


let _model = require('../../../../app/models/ProductCatalog');
let _ = require('underscore');
module.exports = {
    /**
     * 通过服务的第三层分类获取二层分类名称
     * @param thirdType 第三层分类id
     * @returns {Promise|Promise.<T>}
     */
    getSubTypeByThirdType: function (thirdType) {
        let cond = {
            _id: thirdType
        }
        return _model.findOne(cond).exec()
            .then(function (_item) {
                if (!_item) {
                    return '';
                }
                cond._id = _item.parentId
                return _model.findOne(cond).exec()
                    .then(function (_catalog) {
                        return _catalog && _catalog.name || '';
                    })
            })
    },
    /**
     * 获取会员专区目录
     * @param vipType 高级会员专区 | vip会员专区
     * @returns {Promise|Promise.<T>}
     */
    getCatalogs: function (vipType) {
        let cond = {
            isDeleted: false,
            show: 1,
            vipType: vipType
        };
        let typeMap = {};
        let subTypeMap = {};
        //let
        return _model.find(cond)
            .sort({sort: -1}).exec()
            .then(function (_items) {
                console.log('_items:', _items);
                _items = _items || [];
                /*let idInfoMap = _.indexBy(_items, '_id');
                 let type_items = [];
                 for(var i = 0; i < _items.length; i++){
                 let _item = _items[i];
                 let parentIds = _item.parentIds.split(';');
                 let length = parentIds.length;
                 if(length == 3){
                 let third_type = {
                 third_type_id: _item._id + '',
                 third_type_name: _item.name || ''
                 };
                 if(!subTypeMap[_item.parentId]){
                 subTypeMap[_item.parentId] = [third_type];
                 }else{
                 subTypeMap[_item.parentId].push(third_type);
                 }
                 }else if(length == 2){
                 let sub_type = {
                 sub_type_id: _item._id + '',
                 sub_type_name: _item.name || ''
                 }
                 if(!typeMap[_item.parentId]){
                 typeMap[_item.parentId] = [sub_type];
                 }else{
                 typeMap[_item.parentId].push(sub_type);
                 }
                 }else if(length == 1){
                 type_items.push(_item);
                 }
                 };

                 Object.keys(subTypeMap).forEach(function(key){
                 let subType = subTypeMap[key];
                 subType = {
                 sub_type_id: idInfoMap[key]._id + '',
                 sub_type_name: idInfoMap[key].name || '',
                 third_types: subType
                 }
                 })
                 type_items.forEach(function(_item){
                 let type = {
                 type_id: _item._id + '',
                 type_name: _item.name || '',
                 sub_types: ''
                 }
                 })*/

                let item_group_map = _.groupBy(_items, function (_item) {
                    return _item.parentId;
                });
                let items = item_group_map['1'];
                if (!items) {
                    return [];
                }
                let res_items = [];
                items.forEach(function (item) {
                    let sub_types = item_group_map['' + item._id];
                    if (!sub_types) {
                        return;
                    }
                    let sub_items = [];
                    for (let i = 0; i < sub_types.length; i++) {
                        let sub_type = sub_types[i];
                        if (!item_group_map[sub_type._id + '']) {
                            continue;
                        }
                        let third_types = item_group_map[sub_type._id + ''].map(function (third_type) {
                            return {
                                third_type_id: third_type._id + '',
                                third_type_name: third_type.name || '',
                            }
                        })
                        let sub_item = {
                            sub_type_id: sub_type._id + '',
                            sub_type_name: sub_type.name || '',
                            third_types: third_types
                        }
                        sub_items.push(sub_item);
                    }
                    item = {
                        type_id: item._id + '',
                        type_name: item.name + '',
                        sub_types: sub_items
                    }
                    res_items.push(item);
                })
                return res_items;
            })
    }
}