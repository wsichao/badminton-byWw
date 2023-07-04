/**
 * Created by yichen on 2017/5/31.
 */

"use strict";
let model = Backend.model("1/city_buy", undefined, "city_buy_region");



module.exports = {
  /**
   * 获取全国所有市、县、直辖市信息
   * @param
   * @return []
   */
  getAllRegions: function () {
    var cond = {
      isDeleted : false,
      provinceId : {$gt: 1000}
    }
    var fields = "name"
    return model.find(cond,fields)
      .then(function(_regions){
        var regions = _regions.map(function(_region){
          return _region.name;
        });
        regions = regions.concat(specialCities);
        regions = regions.map(function(region){
          return {
            city: region,
            regionPinyin: toPinYin(region)
          };
        });
        console.log(regions.length)
        return regions;
      })
  }

};
