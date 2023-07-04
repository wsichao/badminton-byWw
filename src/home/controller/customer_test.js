/**
 * Created by Mr.Carry on 2017/5/18.
 */
"use strict";
module.exports = {
    __beforeAction: ()=> {},

    getAction: (req, res)=> {
        let service =  Backend.service("home",undefined,"ClassMembers");
        return this.success("Object || Array || Promise");
        return this.fail(10001);
    },

    postAction : (req,res)=>{}
};