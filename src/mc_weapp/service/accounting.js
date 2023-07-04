const mc_grants_log_service = Backend.model("mc_weapp", undefined, 'mc_grants_log');
const boss_wallet_service = Backend.service("mc_weapp", 'boss/wallet');
const mc_user_info_service = Backend.model("mc_weapp", undefined, 'mc_user_info');

module.exports = {
  /**
   * 获取用户账户信息
   * @param {*} user_id 
   * @return 
   * {
   *   grant_price, 总补助金
   *   withdrawal_price ,可提现额度
   * }
   */
  async getUserAccount(user_id) {
    const res = await boss_wallet_service.apiWalletFind(user_id);
    const result = res.result;
    const all_cash = result.allCash;
    const withdraw_cash = result.withdrawCash;
    return {
      grant_price: all_cash,
      withdrawal_price: withdraw_cash
    }
  },
  /**
   * 获取用户可用的折扣金额
   * @param {String} user_id 用户唯一标识
   * @param {Number} discount_price  折扣金额
   * @return {Number} 可用折扣
   */
  async getUserUseAccount(user_id, discount_price) {
    const res = await this.getUserAccount(user_id);
    const grant_price = res.grant_price;
    if (grant_price >= discount_price) {
      return discount_price;
    }
    return grant_price;
  },
  /**
   * 变更用户账务
   * @param {*} user_id 用户唯一标识
   * @param {*} amount 金额
   * @param {*} type 0:首次登录;1:分享;
   */
  async recordUserAccount(user_id, amount, type) {
    console.log(user_id, "在", Date.now(), '变更账务：', amount / 100, ",类型为:", type);

    let name = '';
    let sub_type = '';
    switch (type) {
      case 0:
        name = '新用户注册';
        sub_type = 'NewRegister';
        break;
      case 1:
        name = '分享奖励';
        sub_type = 'Share';
        break;
      case 2:
        name = '用户一级奖励金';
        sub_type = 'FirstBounty';
        break;
      case 3:
        name = '用户二级奖励金';
        sub_type = 'SecondBounty';
        break;
    }

    await boss_wallet_service.apiWalletChangeBill(user_id, amount, 'Income', sub_type);

    await mc_grants_log_service.create({
      userId: user_id,
      amount,
      detail: name,
      type: "入账"
    })
  },
  /**
   * 主管支出
   * @param {*} user_id 
   * @param {*} price 
   */
  async directorSpending(user_id, amount) {
    await boss_wallet_service.apiWalletChangeBill(user_id, amount, 'Pay', 'WithdrawLimit');
    await mc_user_info_service.update({
      userId: user_id,
      isDeleted: false
    }, {
      role: "director"
    })
    await mc_grants_log_service.create({
      userId: user_id,
      amount,
      detail: "用户成为主管支出",
      type: "出账"
    })
  },
  /**
   * 商品抵扣
   * @param {*} user_id 
   * @param {*} price 
   */
  async productDiscount(user_id, price) {
    await boss_wallet_service.apiWalletChangeBill(user_id, price, 'Pay', 'OrderDeduction');
    await mc_grants_log_service.create({
      userId: user_id,
      amount: price,
      detail: "商品抵扣支出",
      type: "出账"
    })
  },
  /**
   * 用户提现
   * @param {*} user_id 用户唯一标识
   * @param {*} price 提现金额
   */
  async withdrawal(user_id, price, withdrar_id) {
    await boss_wallet_service.apiWalletChangeBill(user_id, price, 'Pay', 'Withdraw', withdrar_id);
    await mc_grants_log_service.create({
      userId: user_id,
      amount: price,
      detail: "提现",
      type: "出账"
    })
  },

  /**
   * 
   * @param {*} user_id 用户唯一标识
   * @param {*} price 活动推荐奖励金
   */
  async recommendAward(user_id, price, withdrar_id) {
    console.log(`recommendAward : ${user_id},${price},Income,OrderRecommendAward,${withdrar_id}`);
    await boss_wallet_service.apiWalletChangeBill(user_id, price, 'Income', 'OrderRecommendAward', withdrar_id);
    await mc_grants_log_service.create({
      userId: user_id,
      amount: price,
      detail: "奖励金",
      type: "入账"
    })
  },
  /**
   * 二级推荐人分账
   * @param {*} user_id 用户唯一标识
   * @param {*} price 活动推荐奖励金
   */
  async OrderRecommendSecondAward(user_id, price, withdrar_id) {
    console.log(`OrderRecommendSecondAward : ${user_id},${price},Income,OrderRecommendSecondAward,${withdrar_id}`);
    await boss_wallet_service.apiWalletChangeBill(user_id, price, 'Income', 'OrderRecommendSecondAward', withdrar_id);
    await mc_grants_log_service.create({
      userId: user_id,
      amount: price,
      detail: "奖励金",
      type: "入账"
    })
  },
  /**
   * 子订单给供应商分账
   */
  async subOrderAward(user_id, price, withdrar_id) {
    await boss_wallet_service.apiWalletChangeBill(user_id, price, 'Income', 'OrderOneAward', withdrar_id);
    await mc_grants_log_service.create({
      userId: user_id,
      amount: price,
      detail: "子订单供应商分账",
      type: "入账"
    })
  },

  /**
   * 
   * @param {*} user_id 用户唯一标识
   * @param {*} price 优选订单货款
   */
  async orderOwnerAward(user_id, price, withdrar_id) {
    await boss_wallet_service.apiWalletChangeBill(user_id, price, 'Income', 'OrderOwnerAward', withdrar_id);
    await mc_grants_log_service.create({
      userId: user_id,
      amount: price,
      detail: "收入货款",
      type: "入账"
    })
  },
  /**
   * 获取用户账户明细
   * @param {*} user_id 
   * @return [{ name:明细名称 , time: 明细时间戳, amount: 金额 , type:0入账,1出账 }]
   */
  async getRecords(user_id) {
    const res = await boss_wallet_service.apiWalletUserList(user_id);
    let result = res.result;
    result = result.map(item => {
      const name = item.title;
      const time = item.createdAt;
      const amount = item.cash;
      const sub_type = item.subType;
      let type = 0;
      if (item.type == 'Pay') {
        type = 1;
      } else if (item.type == 'Income') {
        type = 0;
      }
      return {
        name,
        time,
        amount,
        type,
        sub_type
      };
    })
    return result;
  },

  /***
   * 更新用户提现信息 包括个人和对公
   * @param user_id  用户唯一标识
   * @param draw_msg 更新的提现信息
   */
  async updateDrawMsg(user_id, draw_msg) {
    let withdrawMessage = draw_msg
    let user = await mc_user_info_service.findOne({userId: user_id})

    //如果有值就去把两个对象组合
    let old = user.withdrawMessage
    if (old) {
        for (let key in withdrawMessage) {
            old[key] = withdrawMessage[key]
        }
        withdrawMessage = old
    }

    await mc_user_info_service.update({userId: user_id},{
            withdrawMessage })

    return withdrawMessage
  },

  async getUserDrawMsg(user_id) {
    let res =  await mc_user_info_service.findOne({userId: user_id})
    return res.withdrawMessage 
  }
}