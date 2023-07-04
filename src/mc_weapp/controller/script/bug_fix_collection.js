const mc_scene_collection_model = Backend.model("mc_weapp", undefined, "mc_scene_collection");
const mc_scene_collection_t_model = Backend.model("mc_weapp", undefined, "mc_scene_collection_t");

const _ = require("underscore");
module.exports = {
  __rule: function (valid) {
    return valid.object({
      id: valid.string().empty("")
    });
  },
  // 去重
  async uniq(list) {
    let u_m = {};
    let new_list = [];
    list.forEach(item => {
      const u_id = item.userId;
      if (u_m[u_id]) {
        return;
      }
      u_m[u_id] = 1;
      new_list.push(item);
    })

    return _.sortBy(new_list, "createdAt");
  },
  async getAction() {
    let cond = {
      isDeleted: false
    };
    let list = await mc_scene_collection_model.find(cond);
    let map = {};
    list.forEach(item => {
      const userId = item.userId;
      if (!map[userId]) {
        map[userId] = [];
      }
      map[userId] = map[userId].concat(item.sceneRecommend);
    })
    for (let p in map) {
      const arr = await this.uniq(map[p]);
      await mc_scene_collection_t_model.create({
        userId: p,
        sceneRecommend: arr
      });
    }
    return this.success(map);
  }
}