const mcSceneModel = Backend.model('mc_weapp', undefined, 'mc_scene');
const _ = require("underscore");
const categoryService = Backend.service('mc_weapp', 'category');

module.exports = {
    __rule: function (valid) {
    return valid.object({
            categoryId: valid.string().required(),
            scene_id: valid.string().required(),
            type: valid.required()
        });
    },
    async getAction() {
        const categoryId = this.query.categoryId; 
        const scene_id = this.query.scene_id;
        const type = this.query.type || 0;
        const scene = await mcSceneModel.findOne({
            _id: scene_id,
            isDeleted: false
        })

        let categorys = scene.categorys;
        let res = _.filter(categorys, function (item) {
            if (item.categoryId != categoryId && item.isDeleted == false && item.type == type) {
                return true;
            }
            return false;
        })

        return this.success({
            code: "200",
            msg: "",
            data: {
                goods: await categoryService.getCategoryGoods(categoryId),
                other_categorys: res
            }
        })
    }
}