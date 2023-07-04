const mc_scene_collection_model = Backend.model("mc_weapp", undefined, "mc_scene_collection");
const mc_scene_user_info_model = Backend.model("mc_weapp", undefined, "mc_user_info");

module.exports = {
  __rule: function (valid) {
    return valid.object({
      share_user_id: valid.string().required(),
      is_collection: valid.boolean()
    });
  },
  async getUserId(user_id) {
    const user_info = await mc_scene_user_info_model.findOne({
      preRefUserId: user_id,
      isDeleted: false
    })
    if (!user_info) return user_id;
    return user_info.userId;
  },
  async save(user_id, share_user_id, is_collection) {
    let obj = {}
    let cond = {
      userId: user_id,
      isDeleted: false
    }

    if (is_collection) {
      obj["$push"] = {
        "sceneRecommend": {
          "userId": share_user_id,
          "createdAt": Date.now()
        }
      }
      const count = await mc_scene_collection_model.count({
        userId: user_id,
        isDeleted: false,
        "sceneRecommend.userId": share_user_id
      })
      if (count > 0) return;
    } else {
      obj["$pull"] = {
        "sceneRecommend": {
          "userId": share_user_id
        }
      }
    }

    await mc_scene_collection_model.update(cond, obj, {
      upsert: true,
      multi: true
    })
  },
  async postAction() {
    let user_id = this.req.identity.userId;
    let share_user_id = this.post.share_user_id;
    share_user_id = await this.getUserId(share_user_id);
    const is_collection = this.post.is_collection;
    await this.save(user_id, share_user_id, is_collection);

    return this.success({
      code: "200",
      msg: "",
      data: {
        is_collection
      }
    });

  }
}