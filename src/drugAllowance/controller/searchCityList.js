'user strict';
let commonUtil = require('../../../lib/common-util'),
    // regions = Backend.model('drugAllowance', undefined, 'regions'),
    FactoryDrugRelService = require('./../../../app/services/FactoryDrugRelService'),
    drug_activity_service = Backend.service('activity','drug_activity');
    _ = require('underscore'),
    co = require('co');


module.exports = {
    mockAction: function () {
        let resObj = {
            code: '200',
            msg: '',
            data: [{
                province: {
                    _id: '5509080d8faee0fbe0c4a6d8',
                    name: '河南省',
                    type: 'province',
                    city: [{
                        _id: '579ffa7fedd015ed05edeaaa',
                        name: '济源市',
                        type: 'city',
                        county: [{
                            _id: '579ffa7fedd015ed05edeaaa',
                            name: '济水街道',
                            type: 'county'
                        }]
                    }]
                }

            }]
        };
        return this.success(resObj);
    },
    getAction: function () {
        let self = this;
        let result = co(function* () {
                let resObj = {code: '200', msg: '', data: []};
                let factoryRegions = yield FactoryDrugRelService.regionCount();
                let activity_regions = yield drug_activity_service.get_activity_area();
                factoryRegions = factoryRegions.concat(activity_regions);
                factoryRegions = _.uniq(factoryRegions);
                console.log('getFactoryRegions', factoryRegions);
                let provinceRegions = [], cityRegions = [], countyRegions = [];
                for (let key in factoryRegions) {
                    let p = _.find(provinceRegions, {
                        _id: factoryRegions[key].provinceId.toString(),
                        name: factoryRegions[key].province
                    });
                    if (!p) {
                        console.log('未找到，添加');
                        provinceRegions.push({
                            _id: factoryRegions[key].provinceId.toString(),
                            name: factoryRegions[key].province
                        });
                    }


                    let c = _.find(cityRegions, {
                        parentId: factoryRegions[key].provinceId.toString(),
                        _id: factoryRegions[key].cityId.toString(),
                        name: factoryRegions[key].city
                    });
                    if (!c) {
                        console.log('未找到，添加');
                        cityRegions.push({
                            parentId: factoryRegions[key].provinceId.toString(),
                            _id: factoryRegions[key].cityId.toString(),
                            name: factoryRegions[key].city
                        });
                    }

                    let d = _.find(countyRegions, {
                        parentId: factoryRegions[key].cityId.toString(),
                        _id: factoryRegions[key].districtId.toString(),
                        name: factoryRegions[key].district
                    });
                    if (!d) {
                        console.log('未找到，添加');
                        countyRegions.push({
                            parentId: factoryRegions[key].cityId.toString(),
                            _id: factoryRegions[key].districtId.toString(),
                            name: factoryRegions[key].district
                        });
                    }
                }


                for (let i = 0; i < cityRegions.length; i++) {
                    cityRegions[i].county = [];
                    for (let j = 0; j < countyRegions.length; j++) {
                        if (cityRegions[i]._id + '' == countyRegions[j].parentId) {

                            cityRegions[i].county.push({
                                _id: countyRegions[j]._id + '',
                                name: countyRegions[j].name,
                                type: 'county'
                            });
                        }
                    }
                }
                console.log('市集合', cityRegions);
                let items = [];
                provinceRegions.forEach(function (item) {
                    items.push({_id: item._id, name: item.name, type: 'province'});
                });

                for (let i = 0; i < items.length; i++) {
                    items[i].city = [];
                    for (let j = 0; j < cityRegions.length; j++) {
                        if (items[i]._id + '' == cityRegions[j].parentId) {

                            items[i].city.push({
                                _id: cityRegions[j]._id,
                                name: cityRegions[j].name,
                                type: 'city',
                                county: cityRegions[j].county
                            });
                        }
                    }
                    resObj.data.push({province:items[i]})
                }


                return self.success(resObj);
            }
        ).catch(function (err) {
            console.log(err);
        });
        return result;
    }
};