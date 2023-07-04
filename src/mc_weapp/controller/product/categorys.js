const mcSceneModel = Backend.model('mc_weapp', undefined, 'mc_scene');
const _ = require("underscore");
const mongoose = require('mongoose');
const mc_scene_goods_info_model = Backend.model("mc_weapp", undefined, "mc_scene_goods_info");
const mcSceneGoodsModel = Backend.model('mc_weapp', undefined, 'mc_scene_goods');

module.exports = {
    __rule: function (valid) {
    return valid.object({
            scene_id: valid.string().required(),
            type: valid.required()
        });
    },
    async getAction() {
        const scene_id = this.query.scene_id;
        const type = this.query.type || 0;

        const scene = await mcSceneModel.findOne({
            _id: scene_id,
            isDeleted: false
        })

        if (scene) {
            let categorys = scene.categorys;
            let res = _.filter(categorys, function (item) {
                if (item.isDeleted == true || item.type != type) {
                return false;
                }
                return true;
            })
    
            res = JSON.parse(JSON.stringify(res))
            for (let i = 0; i < res.length; i++) {
                const item = res[i];
                let goods = await mc_scene_goods_info_model.find({
                    sceneId: scene_id,
                    categoryId: item.categoryId,
                    isRelevance: true,
                    isDeleted: false
                })
                let good_ids = goods.map((item)=>{
                    return item.goodsId;
                })
                let cond = {
                    _id: {
                        $in: good_ids
                    },
                    isDeleted: false,
                    isShow: true
                }
                let goodsinfo = await mcSceneGoodsModel.find(cond);   
                item.goodsCount = goodsinfo.length
            }
        
             
            return this.success({
                code: "200",
                msg: "",
                data: res
            })
        }else {
            return this.success({
                msg: "查询不到相关清单"
            })
        }
       
    },
    async postAction() {
        const scene_id = this.post.scene_id;
        const type = this.post.type || 0;
        const categoryName = this.post.name;
        const categoryId = this.post.categoryId;
        const isDelete = this.post.isDelete;

        const scene = await mcSceneModel.findOne({
            _id: scene_id,
            isDeleted: false
        });

        let categorys = scene.categorys;
             //如果传了分类id 就是修改或删除
            if (categoryId) {
                //如果是isDelete 就是删除分组
                if (isDelete == true) {
                    //把分组标记成删除
                    categorys.forEach((item)=>{
                        if(item.categoryId == categoryId) {
                            item.isDeleted = true
                        }
                    })
                    //这个分组下的商品全部进入默认分组
                    let def;
                    for (let i = 0; i < categorys.length; i++) {
                        const cate = categorys[i];
                        if (cate.type == type && cate.isDefault == true) {
                            def = cate.categoryId
                        }
                    }
                    await mc_scene_goods_info_model.update({
                        categoryId: categoryId,
                        isRelevance: true,
                        isDeleted: false
                    },{$set:{categoryId:def}})

                }else {
                    if (categoryName == undefined) {
                        return this.success({
                            msg: "缺少name字段"
                        })
                    }
                    categorys.forEach((item)=>{
                        if(item.categoryId == categoryId) {
                            item.categoryName = categoryName
                        }
                    })
                }
            }else{
                if (categoryName == undefined) {
                    return this.success({
                        msg: "缺少name字段"
                    })
                }
                categorys.push({
                    categoryId: mongoose.Types.ObjectId(),
                    type,
                    categoryName,
                    isDefault: false,
                    isDeleted: false,
                    createdAt: Date.now()
                })
            }
        
       
        await mcSceneModel.update({
            _id: scene_id,
            isDeleted: false
        },{$set:{categorys}})

        categorys = _.filter(categorys, function (item) {
            if (item.isDeleted == true || item.type != type) {
            return false;
            }
            return true;
        })

        categorys = JSON.parse(JSON.stringify(categorys))
        for (let i = 0; i < categorys.length; i++) {
            const item = categorys[i];
            let goods = await mc_scene_goods_info_model.find({
                sceneId: scene_id,
                categoryId: item.categoryId,
                isRelevance: true,
                isDeleted: false
            })
            let good_ids = goods.map((item)=>{
                return item.goodsId;
            })
            let cond = {
                _id: {
                    $in: good_ids
                },
                isDeleted: false,
                isShow: true
            }
            let goodsinfo = await mcSceneGoodsModel.find(cond);   
            item.goodsCount = goodsinfo.length
        }
        
        return this.success({
            code: "200",
            msg: "",
            data: categorys
        })
    }
}