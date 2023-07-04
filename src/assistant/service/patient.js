const patient_model = Backend.model('service_package', undefined, 'patient_info');
module.exports = {
    /**
     * 查询到复查时间的用户
     */
    async getNeedReviewUsers() {
        //todo:v5.28.0 
        let now = Date.now();
        let times = 35 * 24 * 60 * 60 * 1000;
        let start = getDateBeginTS(now) - times;
        let end = getDateEndTS(now)-times;
        let cond = {
            isDeleted : false,
            babyBirth: {
                $exists: true,
                $gte: start,
                $lte: end
            }
        }
        let patients = await patient_model.find(cond,'phoneNum');
        let numbers = '';
        patients.forEach(element => {
            numbers += element.phoneNum + ',';
        });
        return numbers;
    }
}