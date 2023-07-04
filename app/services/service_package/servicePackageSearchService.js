/**
 * 搜索服务 service
 * Created by Mr.Carry on 2017/12/11.
 */
"use strict";
let servicePackageArea = require('./servicePackageArea');
let servicePackageHospital = require('./servicePackageHospital');
let _ = require('underscore');
let ServicePackageSearchService = function () {
};


/**
 * 处理医院数据
 * @param dt
 * @return {{hospital: Array, department: Array}}
 */
let hospitalHandler = function (dt) {
  let hospital = [];
  let department = [];
  dt.forEach(item => {
    hospital.push({
      _id: item._id,
      name: item.name,
      type: 'hospital'
    });
    department = department.concat(item.department)
  });

  department = _.uniq(department);
  hospital = _.uniq(hospital);
  if (department) {
    department = department.map(item => {
      return {
        name: item,
        type: 'department',
        _id: ''
      }
    })
  }

  return {
    hospital: hospital,
    department: department
  };
};
/**
 * 获取省市县\医院\科室默认信息
 */
ServicePackageSearchService.prototype.getSearchDefData = function () {
  return servicePackageArea
    .getSearchDefData()
    .then((res) => {
      let result = {area: {}};
      let hospitals = [];
      result.area = res.map((item) => {
        let province = {};
        province.name = item.provinceName;
        province.type = 'province';
        province._id = item._id;
        province.city = [];
        hospitals = hospitals.concat(item.hospitals);
        if (!item.city || item.city.length == 0) {
          return;
        }
        province.city = item.city.map((cityItem) => {
          let city = {};
          city.name = cityItem.cityName;
          city._id = cityItem._id;
          city.type = 'city';
          city.county = [];
          if (!cityItem.town || cityItem.town.length == 0) {
            return;
          }
          city.county = cityItem.town.map((townItem) => {
            let town = {};
            town.name = townItem.townName;
            town._id = townItem._id;
            town.type = 'county';
            return town;
          })
          return city;
        });
        return {province: province};
      });
      hospitals = _.uniq(hospitals);
      result.hospitals = hospitals;
      return result;
    })
    .then((res) => {
      return servicePackageHospital
        .findByIds(res.hospitals)
        .then((dt) => {
          let newDt = hospitalHandler(dt);
          res.hospital = newDt.hospital;
          res.department = newDt.department;
          delete res.hospitals;
          return res;
        });
    });
};

/**
 * 根据类型过滤获取的数据
 * @param dt
 * @param type
 * @param value
 * @return {{dt: *, hospitals: Array}}
 */
let areaHandler = function (dt, type, value) {
  let hospitals = [];
  switch (type) {
    case 'province':
      if (dt && dt.length > 0) {
        hospitals = dt[0].hospitals;
      }
      break;
    case 'city':
      if (dt && dt.length > 0 && dt[0].city && dt[0].city.length > 0) {
        hospitals = dt[0].city[0].hospitals;
      }
      break;
    case 'county':
      if (dt.length > 0 && dt[0].city.length > 0 && dt[0].city[0].town.length) {
        let item_town = dt[0].city[0].town;
        let town = _.find(item_town, function (item) {
          return item._id == value;
        });
        if (town) {
          dt[0].city[0].town = [town];
          hospitals = town.hospitals;
        } else {
          dt[0].city[0].town = [];
        }
      }
      break;
  }
  return {dt: dt, hospitals: hospitals};
};

/**
 * 根据类型与值查询相关检索信息 筛选过的数据处理
 * @param areas 省市县数据
 * @param hospitals 医生及科室数据
 * @return {{province: Array, city: Array, county: Array, hospital: Array, department: Array}}
 */
let getSearchByIdDtConvert = function (areas, hospitals) {
  let province_val = [];
  let city_val = [];
  let county_val = [];
  let hospitals_val = [];
  let department_val = [];
  if (areas && areas.length > 0 && areas[0].city && areas[0].city.length > 0) {
    let citys = areas[0].city;
    citys.forEach(cityItem => {
      city_val.push({
        _id: cityItem._id,
        type: 'city',
        name: cityItem.cityName
      });

      if (cityItem.town && cityItem.town.length > 0) {
        cityItem.town.forEach(townItem => {
          county_val.push({
            _id: townItem._id,
            type: 'county',
            name: townItem.townName
          });
        })
      }
    })
  }


  if (hospitals && hospitals.length > 0) {
    hospitals.forEach(item => {
      hospitals_val.push({
        _id: item._id + '',
        type: 'hospital',
        name: item.name
      });
      if (item.department && item.department.length > 0) {
        item.department.forEach(item_1 => {
          department_val.push({
            _id: '',
            type: 'department',
            name: item_1
          })
        })
      }

    })
  }
  let func = function (obj) {
    return obj._id;
  };
  city_val = _.uniq(city_val, true, func);
  county_val = _.uniq(county_val, true, func);
  hospitals_val = _.uniq(hospitals_val, true, func);

  department_val = _.uniq(department_val);

  return {
    province: province_val,
    city: city_val,
    county: county_val,
    hospital: hospitals_val,
    department: department_val
  }
};


/*
 * 根据类型与值查询相关检索信息
 * if type = 省  search -> 市、县、医院、科室
 * if type = 市  search -> 县、医院、科室
 * if type = 县  search -> 医院、科室
 * if type = 医院  search -> 科室
 */
ServicePackageSearchService.prototype.getSearchById = function (type, value) {
  let areaCond = {
    isDeleted: false
  };
  let param = {};
  let areaHospitalIds = [];
  let resultValue = {};
  switch (type) {
    case 'province':
      // 根据类型查询城市及医院信息
      areaCond['_id'] = value;
      break;
    case 'city':
      areaCond['city._id'] = value;
      param['city.$'] = 1;
      break;
    case 'county':
      areaCond['city.town._id'] = value;
      param['city.$'] = 1;
      param['city.hospitals'] = 1;
      break;
    case 'hospital':
      areaHospitalIds.push(value);
      break;
  }
  let pobj;
  if (type == 'hospital') {
    pobj = servicePackageHospital.findByIds(areaHospitalIds);
  }
  else {
    pobj = servicePackageArea
      .getByCond(areaCond, param)
      .then(dt => {
        let cdata = areaHandler(dt, type, value);
        resultValue = cdata.dt;
        areaHospitalIds = areaHospitalIds.concat(cdata.hospitals);
        return servicePackageHospital.findByIds(areaHospitalIds);
      })
  }
  return pobj
    .then(dt => {
      return getSearchByIdDtConvert(resultValue, dt);
    })
};

module.exports = new ServicePackageSearchService();