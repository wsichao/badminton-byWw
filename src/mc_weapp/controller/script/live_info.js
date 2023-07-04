/**
 * 1. 定时脚本：每隔3分钟执行一次
 * 2. 该脚本拉取微信小程序的列表并缓存
 * 3. 55 23 * * * curl http://localhost:9050/mc_weapp/script/live_info
 */

const mcLiveService = Backend.service('mc_weapp', 'live_accounts');

module.exports = {
  async getAction() {
   let res = await mcLiveService.saveLives()
    return this.success({
      data: res
    })
  }
}