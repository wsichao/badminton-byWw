/**
 * type == 1 的 mc_order 订单将serivceManId存如表之中
 */
const mc_order_model = Backend.model('mc_weapp', undefined,'mc_order');
const _ = require('underscore');

module.exports = {
    __beforeAction: function () {
        let ip = getClientIp(this.req);
        let whiteIP = ['127.0.0.1'];
        console.log('请求的ip地址', ip);
        if (whiteIP.indexOf(ip) == -1) {
            return this.fail("必须白名单内的IP才可以访问");
        }
    },
    async getAction() {
        let pre_do_orders = await mc_order_model.find({
            type: 1 ,
            isDeleted:false,
            serviceManId : {$exists : false}
         })
        let order_ids = pre_do_orders.map(item =>{
            return item._id;
        })
        let type_zero_orders = await mc_order_model.find({
            type:0,
            isDeleted:false,
            serviceOrderId : {$in : order_ids}
        })
        let type_zero_orders_index = _.indexBy(type_zero_orders,'serviceOrderId');
        for(let i = 0; i< pre_do_orders.length; i++){
            let item = pre_do_orders[i];
            if(type_zero_orders_index[item._id]){
                let cond={
                    isDeleted:false,
                    _id : item._id
                }
                let update = {
                    $set:{
                        serviceManId : type_zero_orders_index[item._id].serviceManId
                    }
                }
                await mc_order_model.findOneAndUpdate(cond,update,{new:true});
                console.log('第' + i + '条完成')
            }
        }

        return this.success({
            code: '200',
            msg: '',
            data : '总共修改了' + pre_do_orders.length + '条数据' 
        });
    }
}