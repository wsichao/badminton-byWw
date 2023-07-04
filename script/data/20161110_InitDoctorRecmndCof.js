var cond = {
    //docChatNum: {$nin: ["00120","11111","10086", "12345","60000"]},
    source: "docChat", 
    isDeleted: false
};
var upd = {
    recommendConf: [
        {
            item: "bak",  
            isVisiable: true,
            disabled: true, 
            type: "doctor",  // 该条目首推类型
            title: "暂无",    // 该条目首推标题
            docChatNum: "",  // 类型为doctor该条目为医疗号
            link: "",
            more: { // 更多
                disabled: false,
                type: "doctor_list",
                title: "备用联系人",
                url: "https://pro.mtxhcare.com/1/customer/doctor/recommendList/bakContact"
            }
        },{
            item: "ass",
            isVisiable: true,// 是否显示该推荐条目
            disabled: true,
            type: "doctor",
            title: "暂无",
            docChatNum: "",
            link: "",
            more: { // 更多
                type: "doctor_list",
                title: "服务助理",
                url: "https://pro.mtxhcare.com/1/customer/doctor/recommendList/assistant",
                disabled: false
            }
        },{
            item: "ad",
            isVisiable: true,// 是否显示该推荐条目
            disabled: true,
            type: "doctor",
            title: "暂无",
            docChatNum: "",
            link: "",
            //},
            more: { // 更多
                type: "doctor_list",
                title: "猜你喜欢",
                url: "https://pro.mtxhcare.com/1/customer/doctor/recommendList/ad",
                disabled: false
            }
        }
    ]
};
//db.doctors.find(cond).count();
db.doctors.update(cond, {$set: upd}, {multi:true})