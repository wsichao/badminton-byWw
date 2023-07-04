const mc_figure = Backend.model("mc_weapp", undefined, 'mc_figure');
module.exports = {
    async updateData() {
        let data = await mc_figure.findOne({ isDeleted: false });
        if (!data) {
            let new_data = {
                coDoctorsNum: 2864,
                serviceMemberNum: 18328,
                userSavings: 2100
            }
            return await mc_figure.create(new_data);
        } else {
            //合作医生累计增长方式：随机数1-8 累加增长
            //会员数：每天随机64-120个 累加增长
            //用户节省数: 每天增长之前的增长会员数*（1000-1500）的随机数 累加增长 以万位进位
            let co_doctors_random = await this.getRandomData(1, 8);
            let co_member_random = await this.getRandomData(64, 120);
            let saving_random = await this.getRandomData(1000, 1500);
            let saving_num = Math.round(co_member_random * saving_random / 10000);
            console.log('co_doctors_random:' + co_doctors_random + '  ' + 'co_member_random:' + co_member_random + '  ' + 'saving_random:' + saving_random + '  ' + 'saving_num:' + saving_num);
            let cond = {
                _id: data._id,
                isDeleted: false
            }
            let updates = { $inc: { coDoctorsNum: co_doctors_random, serviceMemberNum: co_member_random, userSavings: saving_num } };
            return await mc_figure.findOneAndUpdate(cond, updates, { new: true });
        }
    },
    /**
     * 获取某个区间的随机数
     * @param {*} lowerValue 区间左边数
     * @param {*} upperValue 区间右边数
     */
    async getRandomData(lowerValue, upperValue) {
        return Math.floor(Math.random() * (upperValue - lowerValue + 1) + lowerValue);
    }
}