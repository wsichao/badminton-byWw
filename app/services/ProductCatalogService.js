/**
 * Created by lijinxia on 2017/9/5.
 */
var
    ProductCatalog = require('../models/ProductCatalog');
function ProductCatalogService() {
}
ProductCatalogService.prototype.constructor = ProductCatalog;

ProductCatalogService.prototype.getProductCatalogByCon = function (con, params) {
    console.log('con', con);
    con.isDeleted = false;
    return ProductCatalog.find(con, params).sort({sort: -1}).exec();
};
/**
 * 通过子id获取父层ID
 * @param childIds
 * @returns {Query|*}
 */
ProductCatalogService.prototype.getParentIds = function (childIds) {
    var condition = {isDeleted: false};

    condition._id = {$in: childIds};
    return ProductCatalog.distinct('parentId', condition, '_id name');
};

/**
 * 通过商品ID，查找商品目录中的ID
 * @param thirdType
 * @returns {Query|*}
 */
ProductCatalogService.prototype.getParentIdByThirdType = function (thirdType) {
    var condition = {isDeleted: false};

    condition._id = thirdType;
    return ProductCatalog.findOne(condition, '_id name parentId').exec();
};



/**
 * 通过服务的第三层分类获取二层分类名称
 * @param thirdType 第三层分类id
 * @returns {Promise|Promise.<T>}
 */
ProductCatalogService.prototype.getSubTypeByThirdType = function (thirdType) {
    var cond = {
        _id: thirdType
    }
    return ProductCatalog.findOne(cond).exec()
        .then(function (_item) {
            if (!_item) {
                return '';
            }
            cond._id = _item.parentId;
            return ProductCatalog.findOne(cond).exec()
                .then(function (_catalog) {
                    return _catalog && _catalog.name || '';
                })
        })
};




module.exports = new ProductCatalogService();