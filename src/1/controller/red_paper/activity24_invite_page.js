/**
 * Created by dell on 2017/7/10.
 */
"use strict";
module.exports = {
    getAction: function () {
        let that = this;
        let service = Backend.service('1/red_paper', 'red_paper');
        var userId = this.req.identity.userId || this.query.userId;
        let result = service.getInviteList(userId)
            .then(res=>{
                let data =JSON.parse(JSON.stringify(res));
                data.forEach(function (item) {
                    item._id = item._id + '';
                });
                var resData = {
                  userId : userId
                }
                resData.items = data
            return {data : JSON.stringify(resData)};
        })
        return this.display('new_activity/activity_invite',result);
    }
}