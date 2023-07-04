const mc_service_model = Backend.model('mc_weapp', undefined, 'mc_service');
module.exports = {
    /**
     * 查询首页服务列表
     */
    async get_home_page_service_list() {
        let result = {
            code: '200',
            msg: '',
            items: []
        };
        let services = await mc_service_model.find({ sericeNumber: 0, isDeleted: false });
        services.forEach(item => {
            let data = {
                name: item.name,
                avatar: item.avatar,
                service_id: item._id
            };
            result.items.push(data);
        });
        return result;
    },
    /**
     * 商品服务唯一标识
     * @param {*} service_id 
     */
    async get_service_detail(service_id){
        let result = {
            code: '200',
            msg: '',
            data: {}
        };
        let service_info = await mc_service_model.findOne({ _id:service_id,sericeNumber: 0, isDeleted: false });
        if(!service_info){
            return {
                code: '8005',
                msg: '服务不存在'
            }
        }
        result.data.name = service_info.name;
        result.data.price = service_info.price;
        result.data.originalPrice = service_info.originalPrice;
        result.data.desc = service_info.desc;
        result.data.avatar = service_info.avatar;
        return result;
    }
}