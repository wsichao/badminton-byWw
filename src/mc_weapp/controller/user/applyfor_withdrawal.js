/**
 *
 * 200053 申请提现
 *
 */
const mcAccountingService = Backend.service('mc_weapp', 'accounting');
const mcSceneWithdraw = Backend.model('mc_weapp', undefined, 'mc_scene_withdraw');

module.exports = {
    __rule: function (valid) {
        return valid.object({
            amount: valid.number().required(),
            type: valid.number().required()
        });
    },
    async postAction() {
        const userId = this.req.identity.userId;
        var amount = this.post.amount;
        amount = amount * 100;
        amount = parseInt(amount);
        const type = this.post.type;  //0为个人提现 1为对公提现
      
        const accounting = await mcAccountingService.getUserAccount(userId);
        
        if (accounting.withdrawal_price >= amount && accounting.grant_price >= amount) {
            const id = getNewObjectId();
            await mcAccountingService.withdrawal(userId,amount,id);
            //插入到提现表
            const accounting = await mcAccountingService.getUserAccount(userId);
            //获取用户提现信息
            const drawMssage = await mcAccountingService.getUserDrawMsg(userId);
            let obj = JSON.parse(JSON.stringify(drawMssage));
            await mcSceneWithdraw.create({
                _id: id,
                userId: userId,
                cash: amount,
                status: 0,
                allCash: accounting.grant_price,
                withdrawCash: accounting.withdrawal_price,
                withdrawMessage: obj,
                type: type,
            })
            return this.success({
                code : '200',
                msg : '已收到您的提现申请',
            });
        }else{
            return this.success({
                code: '1000',
                msg: '超过最大提现金额'
            })
        }
  }
}