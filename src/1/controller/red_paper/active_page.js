/**
 * Created by dell on 2017/7/10.
 */
"use strict";
module.exports = {
    getAction: function () {
        var data = {
            userId : this.query.userId
        }
        return this.display('new_activity/activity_out',{data : JSON.stringify(data)});


    }
}