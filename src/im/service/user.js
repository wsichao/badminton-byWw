/**
 * 用户相关 service 方法
 */
const sys_user_model = Backend.model('assistant', undefined, 'sys_user');
const user_model = Backend.model('common', undefined, 'customer');
const mongoose = require('mongoose');
const _ = require('underscore');

module.exports = {
  /**
   * 
   * @param user_ids 用户唯一标识（普通用户与助理用户）
   */
  async getUser(user_ids) {
    if (!user_ids) return {};
    // 获取普通用户信息
    const app_users = await this.getAppUser(user_ids);
    // 获取助理用户信息
    const assistant_users = await this.getAssistant(user_ids);

    const new_arr = app_users.concat(assistant_users);
    console.log(_.indexBy(new_arr, '_id'))
    // return _.indexBy(new_arr, '_id');
    return _.indexBy(new_arr, '_id')
  },
  /**
   * 获取助理信息
   * @param {*} user_ids 
   */
  async getAssistant(user_ids) {
    user_ids = user_ids.map(item => { return mongoose.Types.ObjectId(item) });
    const users = await sys_user_model.aggregate([
      {
        '$match': {
          _id: { $in: user_ids },
          role: 'assistant',
          isDeleted: false
        }
      },
      {
        '$lookup':
        {
          'from': "servicePackageAssistant",
          'localField': "assistantId",
          'foreignField': "_id",
          'as': 'assistant'
        }
      },
    ]).exec();
    return users.map(item => {
      const _id = item._id;
      let user_name = item.userName;
      let avatar = '';
      if (item.assistant && item.assistant.length > 0) {
        const assistant = item.assistant[0];
        user_name = assistant.name || '';
        avatar = assistant.avatar || '';
      }
      return {
        _id,
        user_name,
        avatar
      }
    })
  },

  /**
   * 获取APP用户信息
   * @param {*} user_ids 
   */
  async getAppUser(user_ids) {
    const users = await user_model.find({
      _id: { $in: user_ids },
      isDeleted: false
    });

    return users.map(item => {
      const _id = item._id;
      const user_name = item.name;
      const avatar = item.avatar;
      return {
        _id,
        user_name,
        avatar
      }
    });
  }
}