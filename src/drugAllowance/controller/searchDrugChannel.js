'user strict';
let commonUtil = require('../../../lib/common-util'),
    TagCodeService = require('./../../../app/services/TagCodeService'),
    co = require('co');


module.exports = {
    __rule: function (valid) {
        return valid.object({
            type: valid.string(),
            name: valid.string()
        });
    },
    mockAction: function () {
        let resObj = {
            code: '200',
            msg: '',
            data: [{
                name: '发烧',
                namePinYin: 'FaShao',
                _id: '5a41f6af15f2f0253d85ff11'
            }]
        };
        return this.success(resObj);
    },
    getAction: function () {
        let self = this;
        let query = self.query;
        let type = query.type || '';
        let name = query.name || '';

        let result = co(function* () {
            let resObj = {code: '200', msg: '', data: []};
            let cond = {};
            if (type && name) {
                switch (type) {
                    case 'province':
                        cond.province = new RegExp(name, 'i');
                        break;
                    case 'city':
                        cond.city = new RegExp(name, 'i');
                        break;
                    case 'county':
                        cond.district = new RegExp(name, 'i');
                        type='district';
                        break;
                }
            }else{
                cond.provinceId= {$exists: true};
                cond.province={$exists: true};
                cond.cityId={$exists: true};
                cond.city={$exists: true};
                cond.districtId={$exists: true};
                cond.district={$exists: true};
            }
            let channels=yield TagCodeService.getTagCode(cond);
            console.log('得到的渠道信息',channels);
            for(let key in channels){
                resObj.data.push({_id:channels[key]._id,name:channels[key].title,namePinYin:commonUtil.toPinYin(channels[key].title)});
            }

            return self.success(resObj);
        }).catch(function (err) {
            console.log(err);
        });

        return result;
    }
};